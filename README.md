# AFネメシス コア獲得シミュレータ

ShadowVerseのAFネメシスでコアギミックをシミュレーションするツールです。10,000回のランダムシミュレーションを行い、各ターンでのコア獲得確率分布を計算します。

## 機能

- **デッキ構築**: 8種類のカード（1コスト1コア〜5コスト2コア）を組み合わせてデッキを構築
- **プレイ方針**: 貪欲方（コストあたりのコア獲得数が高い順）とコストが高い順を選択可能
- **マリガン方針**: マリガンなしとコアのないカードを戻すを選択可能
- **表示方法**: 通常表示（ちょうどnコア）と累積表示（nコア以上）を切り替え可能
- **ヒートマップ**: 確率が高いほど赤く表示される視覚的な結果表示

## シミュレーション設定

- 初期手札: 3枚
- ドロー: 1ターン1枚（合計13枚まで）
- マナ: ターン数と同じ
- シミュレーション回数: 10,000回
- ターン数: 10ターンまで

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp env.example .env.local
# .env.localファイルを編集してGoogle AnalyticsのトラッキングIDを設定

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## Google Analytics設定

1. [Google Analytics](https://analytics.google.com/)で新しいプロパティを作成
2. 測定ID（G-XXXXXXXXXX形式）を取得
3. `.env.local`ファイルに`NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`を設定
4. アプリケーションを再起動

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [Google Analytics 4](https://analytics.google.com/) - ウェブサイト分析

## ライセンス

このプロジェクトはプライベートプロジェクトです。
