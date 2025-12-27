# コードスタイルと規約

## 言語とフレームワーク

- **TypeScript**: 厳密な型チェック（strict mode）
- **Next.js 16**: App Routerを使用
- **React 19**: Server ComponentsとClient Componentsを適切に使い分け

## ディレクトリ構造

### クリーンアーキテクチャに基づく構造

```
src/
├── app/                    # Next.js App Router
├── features/               # 機能別モジュール（bulletproof-reactパターン）
│   ├── editor/            # エディタ機能
│   ├── git/               # Git操作機能
│   ├── repository/        # リポジトリ管理機能
│   └── shared/            # 共有機能
│       ├── domain/        # ドメイン層
│       ├── application/   # アプリケーション層
│       ├── infrastructure/ # インフラストラクチャ層
│       └── presentation/  # プレゼンテーション層
├── components/            # 共通UIコンポーネント
├── lib/                   # 共通ライブラリ
├── hooks/                 # カスタムフック
└── types/                 # 共通型定義
```

## 命名規則

### ファイル名
- コンポーネント: PascalCase（例: `EditorContainer.tsx`）
- ユーティリティ: kebab-case（例: `utils.ts`）
- ディレクトリ: kebab-case（例: `editor-container/`）

### 変数・関数名
- camelCase（例: `handleClick`, `userName`）
- コンポーネント: PascalCase（例: `EditorContainer`）

### 型・インターフェース
- PascalCase（例: `UserData`, `EditorProps`）

## インポート規則

### パスエイリアス
- `@/*` エイリアスを使用（`tsconfig.json`で設定）
- 相対パスではなく絶対パスを使用
- 例: `import { cn } from '@/lib/utils'`

### バレルインポート禁止
- `@/` aliasを使用した個別インポートを推奨
- バレルインポート（`export *`）は使用しない

## 型安全性

- `any`型の使用を避ける
- 厳密な型定義を記述
- `fp-ts`の型（Either, Option, TaskEither）を活用

## 関数型プログラミング

- `fp-ts`ライブラリを使用
- 純粋関数によるビジネスロジック実装
- 副作用の分離（Infrastructure Layerに集約）

## コメント

- 日本語コメントで意図を明確に
- 複雑なロジックには説明を追加

## テスト

- Vitest + React Testing Libraryを使用
- テストファイルは`__tests__`ディレクトリに配置
- 命名: `*.browser.spec.tsx`（React Component）、`*.node.spec.ts`（非React Component）

## ESLint設定

- Next.jsのESLint設定を使用（`eslint-config-next`）
- TypeScript対応（`eslint-config-next/typescript`）