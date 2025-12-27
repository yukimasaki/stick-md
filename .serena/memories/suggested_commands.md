# 開発コマンド一覧

## プロジェクトのエントリーポイント

### 開発サーバー起動
```bash
cd src
yarn dev
# または
npm run dev
```
- Next.js開発サーバーを起動（デフォルト: http://localhost:3000）

### プロダクションビルド
```bash
cd src
yarn build
```
- Next.jsアプリケーションをビルド

### プロダクションサーバー起動
```bash
cd src
yarn start
```
- ビルド済みアプリケーションを起動

## 品質チェックコマンド

### Lintチェック
```bash
cd src
yarn lint
```
- ESLintでコード品質をチェック
- Next.jsのESLint設定を使用

### 型チェック
```bash
cd src
yarn tsc --noEmit
```
- TypeScriptの型チェックを実行（ビルドなし）

### テスト実行
```bash
cd src
yarn vitest run
# またはウォッチモード
yarn vitest
```
- Vitestでテストを実行
- jsdom環境でReactコンポーネントをテスト

## システムユーティリティコマンド

### ファイル操作
- `ls` - ディレクトリ一覧表示
- `cd` - ディレクトリ移動
- `find` - ファイル検索
- `grep` - テキスト検索

### Git操作
- `git status` - 変更状態確認
- `git add` - ステージング
- `git commit` - コミット
- `git push` - リモートにプッシュ

## 注意事項

- すべてのコマンドは`src`ディレクトリ内で実行すること
- プロジェクトルートは`/home/yuki/repos/stick-md`
- ソースコードは`src`ディレクトリ内に配置されている