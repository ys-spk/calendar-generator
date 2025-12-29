# カレンダーつくったー

ブラウザからA4印刷用のカレンダーを生成するReact製Webアプリです。

Agent Codingの練習用に作成したので無駄に凝ってます。
年末に1回印刷するだけです。contextやhookをここまで盛り盛りにする必要はないのですが、欲張ってみました。

## 実装ポイント

- [UnoCSS](https://unocss.dev/) の Compile class transformer を利用し、Tailwind由来のクラス名を一元化
- 各カレンダーを単一のCSS Grid要素 + subgridで管理 ~~（テーブルレイアウトの再来）~~

## 仕様

- 印刷時、下記サイズのカレンダーが出力されます（年選択用のUIは印刷対象外）
  - 年間カレンダー：160mm x 140mm
  - 月間カレンダー：80mm x 140mm
- 祝日データは [date-holidays](https://github.com/commenthol/date-holidays) から生成しています。祝日法が改正された場合、当該ライブラリの更新を取り込むことにより反映が行われます。

## 動作確認済ブラウザ

- Chrome, Firefox にて意図通り出力されることを確認済み
- **Safari** および **iOSの各種ブラウザ** では上記寸法にならないようです。手元環境ではデバッグが厳しいので一旦放置とします。

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
