# GAS デプロイ手順（Google Drive 参照）

## 多ユーザ前提（重要）

`appsscript.json` は次のとおりです。

```json
"webapp": {
  "executeAs": "USER_ACCESSING",
  "access": "ANYONE"
}
```

- **`USER_ACCESSING`**: スクリプトは「開いた人」の権限で動く → **利用者自身のマイドライブ**を参照
- **`USER_DEPLOYING` にはしない**: デプロイ者（オーナー）の Drive 固定になってしまう
- 利用者は初回に Google ログイン＋ Drive 同意が必要（あなた以外のアカウントでも可）

## 公開中のプロジェクト

| 項目 | 値 |
|------|-----|
| scriptId | `1gakhF3xf3vs_sl3CC6K297j-qhhVbqWmbQE0PEW8i8farqowTU4IeVt1` |
| エディタ | https://script.google.com/d/1gakhF3xf3vs_sl3CC6K297j-qhhVbqWmbQE0PEW8i8farqowTU4IeVt1/edit |
| WebアプリURL | https://script.google.com/macros/s/AKfycby8vRyOoaDgL4hGR9k3xQwWpKjkkdTLEs3XXnIi17XmdgYJssaHMvwih9mW1ac9I9X9/exec |
| deploymentId | `AKfycby8vRyOoaDgL4hGR9k3xQwWpKjkkdTLEs3XXnIi17XmdgYJssaHMvwih9mW1ac9I9X9` |

ローカルで clasp を使う場合は `.clasp.json.example` をコピーして `scriptId` を上記に設定。

## 再デプロイ

`webapp` 設定は push だけでは反映されない。バージョン作成＋既存 deploymentId 指定で再デプロイする。

```bash
npx clasp push -f
npx clasp version "変更内容"
npx clasp deploy -i AKfycby8vRyOoaDgL4hGR9k3xQwWpKjkkdTLEs3XXnIi17XmdgYJssaHMvwih9mW1ac9I9X9 -V <新バージョン番号>
```

## GitHub Pages との関係

- https://nozutax.github.io/PDFtool-2026/ … 静的ホスト（ローカル Upload のみ。Drive は案内アラート）
- 上記 GAS URL … Drive 連携あり（利用者ごとのマイドライブ）
