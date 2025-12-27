# プロジェクト概要: stick-md

## プロジェクトの目的

stick-mdは、Markdownエディタを中心としたWebアプリケーションです。以下の主要機能を提供します：

- **エディタ機能**: BlockNoteやTipTapを使用したリッチテキストエディタ
- **Git操作機能**: isomorphic-gitを使用したGit操作
- **リポジトリ管理**: リポジトリの管理と操作
- **認証機能**: NextAuthを使用した認証

## 技術スタック

### フロントエンド
- **Next.js 16.1.0**: App Routerを使用
- **React 19.2.3**: Server ComponentsとClient Components
- **TypeScript 5**: 厳密な型チェック
- **Tailwind CSS 4**: スタイリング
- **Radix UI**: アクセシブルなUIコンポーネント
- **Mantine 8.3.10**: UIコンポーネントライブラリ

### エディタ
- **BlockNote 0.45.0**: ブロックベースエディタ
- **TipTap 3.14.0**: リッチテキストエディタ

### 状態管理・関数型プログラミング
- **fp-ts 2.16.11**: 関数型プログラミングライブラリ（Either, Option, TaskEither）

### Git操作
- **isomorphic-git 1.36.1**: ブラウザ内Git操作

### 認証
- **NextAuth 5.0.0-beta.30**: 認証ライブラリ

### テスト
- **Vitest 4.0.16**: テストランナー
- **React Testing Library 16.3.1**: Reactコンポーネントテスト
- **jsdom 27.3.0**: ブラウザ環境シミュレーション

## アーキテクチャパターン

### クリーンアーキテクチャ
4層のアーキテクチャで依存関係を管理：
- **Presentation Layer**: UI表示とユーザーインタラクション
- **Application Layer**: ユースケース実装とフロー制御
- **Domain Layer**: ビジネスロジックとドメインモデル（純粋関数）
- **Infrastructure Layer**: 外部サービス連携

### DDD（ドメイン駆動設計）
- 値オブジェクト、エンティティ、ドメインモデル、ドメインサービスを分離

### 関数型ドメインモデリング（FDM）
- 純粋関数によるビジネスロジック実装
- 副作用の分離

### bulletproof-react
- 機能別モジュール構成
- 各機能は独立したモジュールとして管理

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── _actions/          # Server Actions
│   ├── api/               # API Routes
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # ホームページ
├── features/              # 機能別モジュール
│   ├── editor/           # エディタ機能
│   ├── git/              # Git操作機能
│   ├── repository/       # リポジトリ管理機能
│   └── shared/           # 共有機能
├── components/            # 共通UIコンポーネント
├── lib/                   # 共通ライブラリ
├── hooks/                 # カスタムフック
└── types/                 # 共通型定義
```

## 開発環境

- **OS**: Linux (WSL2)
- **Node.js**: 20以上
- **パッケージマネージャー**: Yarn
- **エディタ**: TypeScript対応エディタ推奨

## 重要な設計原則

1. **型安全性の重視**: TypeScriptの型システムを最大限活用
2. **純粋関数**: ドメイン層のロジックは純粋関数として実装
3. **依存性注入**: tsyringeを使用（必要に応じて）
4. **環境変数管理**: `lib/env/env.ts`経由でのみアクセス
5. **バレルインポート禁止**: 個別インポートを推奨

## 開発ワークフロー

詳細な開発ワークフローは`.agent/workflows/`ディレクトリ内のルールファイルを参照してください。

主要フェーズ：
1. Investigation & Research（調査）
2. Architecture Design（アーキテクチャ設計）
3. UI/UX Design（デザイン設計）
4. Planning（計画立案）
5. Implementation（実装）
6. Testing & Stories（テスト・ストーリー作成）
7. Code Review（コードレビュー）
8. Quality Checks（品質チェック）
9. Change Log（チェンジログ作成）