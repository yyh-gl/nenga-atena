# Claude Code - nenga-atena プロジェクトガイド

このドキュメントは、nenga-atena プロジェクトにおけるコーディング規則、プロジェクト構成、開発フローを記載しています。

## プロジェクト概要

年賀状の宛名面を Web 上で生成する React + TypeScript アプリケーション。PDF および PNG 形式での書き出しに対応し、縦書き表記をサポートしています。

## 技術スタック

- **フレームワーク**: React 18.2.0
- **言語**: TypeScript 4.7.4
- **ビルドツール**: Vite 4.5.0
- **スタイリング**: styled-components 5.3.6
- **パッケージマネージャー**: pnpm 10.24.0
- **主要ライブラリ**:
  - pdf-lib: PDF 生成
  - opentype.js: フォント処理
  - yubinbango-core-strict: 郵便番号から住所検索

## プロジェクト構成

```
src/
├── components/          # React コンポーネント
│   ├── App.tsx         # ルートコンポーネント
│   ├── Address.tsx     # 住所入力
│   ├── Description.tsx # 説明
│   ├── Header.tsx      # ヘッダー
│   ├── Left.tsx        # 左側パネル
│   ├── PostCard.tsx    # 年賀状プレビュー
│   ├── PostCardSettings.tsx # 年賀状設定
│   └── SwitchButton.tsx # スイッチボタン
├── const/              # 定数
│   ├── prefectures.ts  # 都道府県データ
│   └── style.ts        # スタイル定数
├── utils/              # ユーティリティ
│   ├── components.tsx  # コンポーネントユーティリティ
│   ├── draw.ts         # PDF 描画処理
│   ├── family.ts       # 家族データ処理
│   ├── font.ts         # フォント処理
│   └── style.ts        # スタイルユーティリティ
└── index.tsx           # エントリーポイント
```

## コーディング規則

### TypeScript

- **厳密な型チェック**: `strict: true`, `noImplicitAny: true` を使用
- **ターゲット**: ES5
- **モジュールシステム**: CommonJS
- **JSX**: React 形式

### ESLint

- **ベース設定**: `plugin:react/recommended`
- **パーサー**: `@typescript-eslint/parser`
- **主要ルール**:
  - React コンポーネントは arrow-function 形式で定義
  - JSX ファイル拡張子: `.tsx`, `.ts`
  - ループの `++` 演算子は許可

### Prettier

- **行幅**: 100 文字
- **クォート**: シングルクォート (`'`)
- **セミコロン**: 必須
- **末尾カンマ**: 必須 (`trailingComma: 'all'`)
- **インデント**: スペース 2 つ
- **タブ**: 使用しない

### React コンポーネント

- **関数コンポーネント**: Arrow function 形式を使用

```typescript
const ComponentName = () => {
  // ...
  return <div>...</div>;
};

export default ComponentName;
```

- **styled-components**: スタイリングに使用

```typescript
const StyledComponent = styled.div`
  property: value;
`;
```

- **State 管理**: useState を使用
- **副作用**: useEffect を使用
- **メモ化**: useMemo を使用

### 命名規則

- **コンポーネント**: PascalCase (`App.tsx`, `Header.tsx`)
- **ユーティリティ**: camelCase (`family.ts`, `draw.ts`)
- **定数**: camelCase (`style.ts`, `prefectures.ts`)
- **State 変数**: camelCase (`families`, `selectedFamilyIndex`)
- **styled-components**: PascalCase (`Page`, `HeaderWrapper`)

### インポート順序

1. React 関連
2. 外部ライブラリ
3. 内部コンポーネント
4. 定数
5. ユーティリティ

```typescript
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Description from './Description';
import { fontFamily } from '../const/style';
import { Family, fillFamilies } from '../utils/family';
```

## 開発フロー

### 開発環境のセットアップ

```bash
pnpm install
pnpm run dev
```

### ビルド

```bash
pnpm run build
```

TypeScript の型チェックとビルドを実行します。

### データの永続化

- **LocalStorage** を使用してデータを保存:
  - `families`: 住所録データ
  - `sender`: 送信者情報
  - `styles`: スタイル設定（位置、フォントサイズ、行送りなど）

### 主要な機能実装パターン

#### State の更新と永続化

```typescript
const updateFamilies = (families: Family[]) => {
  setFamilies(fillFamilies(families));
  saveFamiliesToLocalStorage(families);
};
```

#### CSV データの読み込み

```typescript
const updateCsvData = (csv: string) => {
  const families = readCsv(csv);
  const senderData = readSenderFromCsv(csv);
  updateFamilies(families);
  setSender(senderData);
};
```

## テスト

現在、テストは未実装です（`package.json` 参照）。

## ライセンス

MIT License - Copyright (c) 2022–2023 いなにわうどん

## 注意事項

- 住所録データは CSV 形式で読み込み可能
- PDF 出力には時間がかかる場合がある
- フォントには「しっぽり明朝」を使用（SIL Open Font License 1.1）
