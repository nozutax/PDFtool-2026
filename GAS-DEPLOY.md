# GAS デプロイ手順（Google Drive 参照）

開発ログ（2026-08-12）と同じ方式です。`executeAs: USER_ACCESSING` により、**アクセスした利用者自身のマイドライブ**を参照します。

## 初回

```bash
npm i -g @google/clasp
clasp login
clasp create --type webapp --title "PDF Tools" --rootDir .
# 生成された .clasp.json をリポジトリに含めない場合は .gitignore へ
clasp push -f
```

## 再デプロイ（重要）

`appsscript.json` の `webapp`（特に `executeAs`）は **push だけでは反映されません**。

```bash
clasp push -f
clasp create-version "Drive参照と+メニュー追加"
clasp create-deployment -i <既存deploymentId> -V <新バージョン番号>
```

初回デプロイ後に出る Web アプリ URL を利用者に共有してください。

## 動作確認

1. GAS URL を別タブで開く（iframe 埋め込みはサードパーティ Cookie 制限で失敗しやすい）
2. 初回は OAuth 同意（未検証アプリは「詳細 → 安全ではないページに移動」）
3. 「＋」→ Google Drive → マイドライブ階層から PDF/JPEG を追加

## GitHub Pages との関係

- https://nozutax.github.io/PDFtool-2026/ は静的ホストのため `google.script.run` が無く、Drive メニューは案内アラートになります
- ローカル Upload / DnD / 分割・結合・圧縮は Pages でも動作します
- Drive 連携を使う場合は GAS Web アプリ URL を利用してください
