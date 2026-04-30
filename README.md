# reversi-next-js-app

Next.js を使って実装した 1 人用リバーシアプリケーションです。
プレイヤーは黒石、NPC は白石を担当し、フロントエンドだけで対局が完結します。

## 技術スタック

- **Next.js 16.2.4** - React フレームワーク（App Router を使用）
- **React 19.2.4** - ユーザーインターフェース構築
- **TypeScript** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **Jest + React Testing Library** - ユニットテスト / UI テスト
- **ESLint** - コード品質管理

## 機能

- 8x8 固定盤面のリバーシをプレイ可能
- 合法手のみクリック可能で、候補位置を視覚的に表示
- NPC は 1 手先読みの簡易ミニマックスで着手
- 人間は合法手がない場合のみ手動パス可能
- NPC は合法手がない場合に自動パス
- 対局の終了 / リセット操作に対応
- レスポンシブデザイン対応
- ダークモード対応（手動切替機能付き）
    - ライトモードとダークモードの2つのモードを手動で切り替え可能
    - ユーザーの選択はローカルストレージに保存され、ページ再読み込み時も維持されます
- TypeScript による型安全性

## 始め方

### 前提条件

- Node.js 20.x以上
- npm、yarn、またはpnpm

### インストール

1. リポジトリをクローン：
    ```bash
    git clone https://github.com/TakuyaFukumura/reversi-next-js-app.git
    ```
    ```bash
    cd reversi-next-js-app
    ```

2. 依存関係をインストール：
    ```bash
    npm install
    ```
   または
    ```bash
    yarn install
    ```
   または
    ```bash
    pnpm install
    ```

### 開発サーバーの起動

```bash
npm run dev
```

または

```bash
yarn dev
```

または

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて
アプリケーションを確認してください。

### ビルドと本番デプロイ

本番用にアプリケーションをビルドする：

```bash
npm run build
```

```bash
npm start
```

または

```bash
yarn build
```

```bash
yarn start
```

または

```bash
pnpm build
```

```bash
pnpm start
```

## プロジェクト構造

```
├── lib/
│   ├── database.ts          # テンプレート由来のSQLiteサンプル
│   └── reversi.ts           # リバーシのゲームロジック
├── src/
│   └── app/
│       ├── api/
│       │   └── message/
│       │       └── route.ts         # テンプレート由来のAPIサンプル
│       ├── components/      # Reactコンポーネント
│       │   ├── DarkModeProvider.tsx  # ダークモードProvider
│       │   └── Header.tsx   # ヘッダーコンポーネント
│       ├── globals.css      # グローバルスタイル
│       ├── layout.tsx       # アプリケーションレイアウト
│       └── page.tsx         # リバーシ画面
├── __tests__/
│   ├── lib/reversi.test.ts  # リバーシロジックのテスト
│   └── src/app/page.test.tsx # リバーシ画面のテスト
├── package.json
├── next.config.ts
└── tsconfig.json
```

## ゲーム仕様

- 先手は人間（黒）、後手は NPC（白）
- 石数は盤面から都度集計
- 双方とも合法手がなくなった時点で終局
- 手動終了時は勝敗判定を行わず、「終了済み」を表示
- 状態はメモリ上のみで保持し、リロードで初期状態に戻る

## カスタマイズ

### スタイルの変更

スタイルは Tailwind CSS を使用しています。
`src/app/page.tsx` ファイル内のクラス名を変更することで、外観をカスタマイズできます。

## 開発

### テスト

このプロジェクトはJestを使用したテストが設定されています。

#### テストの実行

```bash
npm test
```

または

```bash
yarn test
```

または

```bash
pnpm test
```

#### テストの監視モード

```bash
npm run test:watch
```

#### カバレッジレポートの生成

```bash
npm run test:coverage
```

#### テストファイルの構成

- `__tests__/lib/database.test.ts`: データベース機能のテスト
- `__tests__/lib/reversi.test.ts`: リバーシロジックのテスト
- `__tests__/src/app/components/DarkModeProvider.test.tsx`: ダークモードProvider のテスト
- `__tests__/src/app/components/Header.test.tsx`: ヘッダーコンポーネントのテスト
- `__tests__/src/app/page.test.tsx`: リバーシ画面のテスト

#### テストの特徴

- **ゲームロジックテスト**: 合法手、反転、NPC の着手選択を検証
- **Reactコンポーネントテスト**: React Testing Library を使用した画面表示とインタラクションのテスト
- **モッキング**: localStorage や外部依存関係のモック
- **カバレッジ**: コードカバレッジの測定と報告

### リンティング

```bash
npm run lint
```

または

```bash
yarn lint
```

または

```bash
pnpm lint
```

### 型チェック

TypeScriptの型チェックは、ビルド時またはIDEで自動的に実行されます。

## CI/CD

このプロジェクトはGitHub Actionsを使用した継続的インテグレーション（CI）を設定しています。

### 自動テスト

以下の条件でCIが実行されます：

- `main`ブランチへのプッシュ時
- プルリクエストの作成・更新時

CIでは以下のチェックが行われます：

- ESLintによる静的解析
- TypeScriptの型チェック
- Jestを使用したユニットテストとインテグレーションテスト
- アプリケーションのビルド検証
- Node.js 20.x での動作確認

## 自動依存関係更新（Dependabot）

このプロジェクトでは、依存関係の安全性と最新化のために[Dependabot](https://docs.github.com/ja/code-security/dependabot)
を利用しています。

- GitHub Actionsおよびnpmパッケージの依存関係は**月次（月曜日 09:00 JST）**で自動チェック・更新されます。
- 更新内容は自動でプルリクエストとして作成されます。
- 詳細な設定は `.github/dependabot.yml` を参照してください。

## トラブルシューティング

### データベース関連のエラー

- `data/` フォルダが存在しない場合、自動的に作成されます
- データベースファイルが破損した場合は、`data/app.db` を削除して再起動してください

### ポート競合

デフォルトのポート3000が使用中の場合：

```bash
npm run dev -- --port 3001
```
