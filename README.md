# カレンダーつくったー

ブラウザからA4サイズのカレンダーPDFを生成するReact製Webアプリです。

Agent Codingの練習用に作成したので無駄に凝ってます。
年末に1回PDFを書き出すだけです。contextやhookをここまで盛り盛りにする必要はないのですが、欲張ってみました。

## 実装ポイント

- ブラウザ依存性回避のため、WASM (typst.ts) でSVG/PDFを生成
- typstには通常の方法でWebフォントを渡すことができないため、 [](https://www.npmjs.com/package/@fontsource/m-plus-2) でインストールしたWOFFファイルをTTFファイルに変換して使用 ~~(普通はこんなことやらないほうがいいと思います)~~

## 仕様

- 下記サイズのカレンダーPDFを出力します
  - 年間カレンダー：160mm x 135mm
  - 月間カレンダー：80mm x 135mm
- 祝日データは [date-holidays](https://github.com/commenthol/date-holidays) 由来データを元に生成・同梱しています。祝日法が改正された場合、当該ライブラリの更新を取り込むことで反映できます。

## 動作確認済ブラウザ

- Chrome, Firefox, Safari にて意図通り出力されることを確認済み

## 実行方法

```bash
npm install
npm run dev
```

ブラウザで <http://localhost:5173/> を開いてください

### ビルド／プレビュー

```bash
npm run build
npm run preview
```

`src/data/holidays-jp.json` は `date-holidays` のデータからビルド時に自動生成されます。

### テスト

```bash
npm run lint
npm run test
```
