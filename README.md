# lifeplan

家族のライフプランを可視化するWebアプリ。収入・支出・資産の推移をキャッシュフロー表とグラフで確認できる。

**作成AI: Claude Sonnet 4.6**

## 機能

- **キャッシュフロー表** — 収入・支出・資産を年別に一覧表示。西暦行は常時固定、年齢行はトグルで開閉
- **資産推移グラフ** — 口座残高・運用額・総資産の推移をエリアチャートで表示
- **ライフイベント管理** — イベントの追加・編集・削除。カテゴリ別の変化内容を色付きバッジで表示
- **住宅ローン控除** — 開始年齢・終了年齢・金額を設定し、期間内に自動計算
- **設定メニュー** — 家族の名前変更、給与・生活費の年率上昇率を設定

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| DB | PostgreSQL (Neon) |
| ORM | Prisma 7 (`prisma-client-js`) |
| UIコンポーネント | shadcn/ui + Tailwind CSS v4 |
| グラフ | Recharts |

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` に Neon の接続文字列を設定:

```env
DATABASE_URL="postgresql://..."
```

### 3. DBマイグレーション & Prismaクライアント生成

```bash
DATABASE_URL="..." npx prisma migrate dev
DATABASE_URL="..." npx prisma generate
```

### 4. シードデータ投入（任意）

```bash
DATABASE_URL="..." npx dotenv-cli -e .env -- npx tsx prisma/seed.ts
```

### 5. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認。

## スクリプト

| コマンド | 内容 |
|----------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint実行 |

## ディレクトリ構成

```
src/
├── app/
│   ├── api/plans/          # REST API（プラン・イベント・設定）
│   └── page.tsx            # トップページ
├── components/
│   ├── CashflowTable.tsx   # キャッシュフロー表
│   ├── EventDialog.tsx     # イベント追加・編集ダイアログ
│   ├── PlanView.tsx        # メイン画面
│   └── SettingsDialog.tsx  # 設定ダイアログ
├── lib/
│   ├── calc-cashflow.ts    # キャッシュフロー計算ロジック
│   └── prisma.ts           # Prismaクライアント（Neonアダプタ）
├── types/
│   └── cashflow.ts         # 型定義
└── generated/prisma/       # Prisma生成ファイル（コミット不要）
prisma/
├── schema.prisma           # DBスキーマ
├── migrations/             # マイグレーション履歴
└── seed.ts                 # シードデータ
```
