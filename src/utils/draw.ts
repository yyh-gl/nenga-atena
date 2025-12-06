import { PDFDocument } from 'pdf-lib';
import { consistentAddress, Family, Sender } from './family';
import { drawPath, loadFont } from './font';
import { FontSizes, LineHeights, Positions } from './style';

const dpi = 350;
const width = 100;
const height = 148;

const mmToPt = (mm: number) => mm / (25.4 / 72);

export const mmToCanvasPx = (mm: number) => {
  const canvasScale = dpi * 0.03937;
  return mm * canvasScale;
};

const getNameScaleFactor = (nameCount: number): number => {
  switch (nameCount) {
    case 1:
      return 1.0;
    case 2:
      return 0.95;
    case 3:
      return 0.9;
    case 4:
      return 0.85;
    case 5:
      return 0.8;
    default:
      return 1.0;
  }
};

export const drawLineChars = (
  text: string,
  position: [number, number],
  fontName: string,
  fontSize: number,
  advance: number,
  isVertical: boolean,
  context: CanvasRenderingContext2D,
) => {
  const ascender = 880 / 1000;
  for (let chari = 0; chari < text.length; chari++) {
    const x = isVertical ? position[0] - fontSize : position[0] + advance * chari;
    const y = (isVertical ? position[1] + advance * chari : position[1]) + fontSize * ascender;
    drawPath(text[chari], mmToCanvasPx(fontSize), mmToCanvasPx(x), mmToCanvasPx(y), context);
  }
};

export const drawFamilyImage = async (
  family: Family,
  sender: Sender | null,
  positions: Positions,
  fontSizes: FontSizes,
  lineHeights: LineHeights,
  addressMaxChars: number,
  postalCodeAdvance: number,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) => {
  await loadFont();
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000';

  const fontName = 'shipporiMedium';

  // postal code
  drawLineChars(
    family.postalCode,
    positions.postalCode,
    fontName,
    fontSizes.postalCode,
    postalCodeAdvance,
    false,
    context,
  );

  // address
  const address0 = consistentAddress(family.prefecture + family.municipalities);
  const address1 = consistentAddress(family.address);
  const address2 = consistentAddress(family.building);

  const addressLines: string[] = [address0];
  if (addressLines.at(-1)!.length + address1.length > addressMaxChars) {
    addressLines.push('');
  }
  addressLines[addressLines.length - 1] += address1;
  if (addressLines.at(-1)!.length + address2.length > addressMaxChars) {
    addressLines.push('');
  } else {
  }
  addressLines[addressLines.length - 1] += address2;

  for (let linei = 0; linei < addressLines.length; linei++) {
    drawLineChars(
      addressLines[linei],
      [
        positions.address[0] - lineHeights.address * linei,
        positions.address[1] + fontSizes.address * linei,
      ],
      fontName,
      fontSizes.address,
      fontSizes.address,
      true,
      context,
    );
  }

  // name
  const names = [
    family.personalName,
    family.consecutiveName1,
    family.consecutiveName2,
    family.consecutiveName3,
    family.consecutiveName4,
  ].filter((name) => name.length > 0);
  const maxPersonalNameLength = Math.max(...names.map((name) => name.length));
  const familyName =
    family.familyName + ' ' + (family.familyName.length + maxPersonalNameLength < 4 ? '　' : '');

  const nameScaleFactor = getNameScaleFactor(names.length);
  const scaledNameFontSize = fontSizes.name * nameScaleFactor;
  const scaledNameLineHeight = lineHeights.name * nameScaleFactor;

  for (let namei = 0; namei < names.length; namei++) {
    const x = positions.name[0] - namei * scaledNameLineHeight;
    const name = consistentAddress(
      (namei === 0 ? familyName : '　'.repeat(familyName.length)) + names[namei],
    );
    drawLineChars(
      name,
      [x, positions.name[1]],
      fontName,
      scaledNameFontSize,
      scaledNameFontSize,
      true,
      context,
    );
    const suffixRatio = 0.7;
    const suffixY =
      positions.name[1] + scaledNameFontSize * (familyName.length + maxPersonalNameLength) + 4;
    drawLineChars(
      '様',
      [x - (scaledNameFontSize * (1.0 - suffixRatio)) / 2, suffixY],
      fontName,
      scaledNameFontSize * suffixRatio,
      0,
      true,
      context,
    );
  }

  // sender info
  if (sender) {
    // sender postal code
    drawLineChars(
      sender.postalCode,
      positions.senderPostalCode,
      fontName,
      fontSizes.senderPostalCode,
      fontSizes.senderPostalCode * 0.85,
      false,
      context,
    );

    // sender address
    const senderAddress0 = consistentAddress(sender.prefecture + sender.municipalities);
    const senderAddress1 = consistentAddress(sender.address);
    const senderAddress2 = consistentAddress(sender.building);

    const senderAddressLines: string[] = [senderAddress0];
    if (senderAddressLines.at(-1)!.length + senderAddress1.length > addressMaxChars) {
      senderAddressLines.push('');
    }
    senderAddressLines[senderAddressLines.length - 1] += senderAddress1;
    if (senderAddressLines.at(-1)!.length + senderAddress2.length > addressMaxChars) {
      senderAddressLines.push('');
    }
    senderAddressLines[senderAddressLines.length - 1] += senderAddress2;

    for (let linei = 0; linei < senderAddressLines.length; linei++) {
      drawLineChars(
        senderAddressLines[linei],
        [
          positions.senderAddress[0] - lineHeights.senderAddress * linei,
          positions.senderAddress[1] + fontSizes.senderAddress * linei,
        ],
        fontName,
        fontSizes.senderAddress,
        fontSizes.senderAddress,
        true,
        context,
      );
    }

    // sender name
    const senderNames = [
      sender.personalName,
      sender.consecutiveName1,
      sender.consecutiveName2,
      sender.consecutiveName3,
      sender.consecutiveName4,
    ].filter((name) => name.length > 0);
    const maxSenderNameLength = Math.max(...senderNames.map((name) => name.length));
    const senderFamilyName =
      sender.familyName + ' ' + (sender.familyName.length + maxSenderNameLength < 4 ? '　' : '');

    const senderNameScaleFactor = getNameScaleFactor(senderNames.length);
    const scaledSenderNameFontSize = fontSizes.senderName * senderNameScaleFactor;
    const scaledSenderNameLineHeight = lineHeights.senderName * senderNameScaleFactor;

    for (let namei = 0; namei < senderNames.length; namei++) {
      const x = positions.senderName[0] - namei * scaledSenderNameLineHeight;
      const name = consistentAddress(
        (namei === 0 ? senderFamilyName : '　'.repeat(senderFamilyName.length)) +
          senderNames[namei],
      );
      drawLineChars(
        name,
        [x, positions.senderName[1]],
        fontName,
        scaledSenderNameFontSize,
        scaledSenderNameFontSize,
        true,
        context,
      );
    }
  }
};

export const outputPdf = async (
  families: Family[],
  sender: Sender | null,
  positions: Positions,
  fontSizes: FontSizes,
  lineHeights: LineHeights,
  addressMaxChars: number,
  postalCodeAdvance: number,
) => {
  const widthPt = mmToPt(width);
  const heightPt = mmToPt(height);

  // generate images on canvas
  const canvas = document.createElement('canvas');
  canvas.width = mmToCanvasPx(width);
  canvas.height = mmToCanvasPx(height);
  const context = canvas.getContext('2d');
  if (context == null) {
    return;
  }

  const base64s: string[] = [];
  for (const family of families) {
    await drawFamilyImage(
      family,
      sender,
      positions,
      fontSizes,
      lineHeights,
      addressMaxChars,
      postalCodeAdvance,
      canvas,
      context,
    );
    base64s.push(canvas.toDataURL('image/png'));
  }

  const pdfDoc = await PDFDocument.create();
  const pages = families.map(() => pdfDoc.addPage([widthPt, heightPt]));

  const pngImages = base64s.map((base64) => pdfDoc.embedPng(base64));
  Promise.all(pngImages).then((resolved) => {
    for (let i = 0; i < resolved.length; i++) {
      console.log(pdfDoc.getPageCount());
      pages[i].drawImage(resolved[i], { x: 0, y: 0, width: widthPt, height: heightPt });
    }
  });

  const thisYear = new Date().getFullYear();
  const blobUrl = URL.createObjectURL(new Blob([await pdfDoc.save()]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `nenga${thisYear}.pdf`);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
};
