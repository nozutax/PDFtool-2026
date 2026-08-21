# PDF Tools 改善修正ログ（圧縮・Drive分離・GAS化）

## 概要
静的 GitHub Pages 版の PDF Tools に **圧縮機能** と推定UX改善を追加したうえで、Google Drive 参照は通帳くん等と同じ **GAS `USER_ACCESSING` 方式** に分離した。Pages 版はローカル Upload のみ、Drive 対応は新リポジトリ `pdftool-GAS-2026` に移管。

## 作業日
2026-08-20 〜 2026-08-21（Cursor Cloud Agent）

---

## 1. 開発環境セットアップ
- 対象: `nozutax/PDFtool-2026`（単一 `index.html` の静的アプリ）
- 依存なし（CDN: Bootstrap / pdf-lib / JSZip → 後に PDF.js 追加）
- 開発実行: `python3 -m http.server 8000`
- GitHub Pages: https://nozutax.github.io/PDFtool-2026/

---

## 2. 圧縮機能の追加（方針 A）
### 方式
- **PDF.js** で各ページを Canvas 描画 → **JPEG 再エンコード** → **pdf-lib** で再組み立て
- タブ「圧縮」を追加
- 設定はスライダー:
  - 画質（JPEG）20–95%
  - 解像度 50–150%

### 推定サイズUX（C + X + Z）
当初は本番と同じ全ページ描画で推定していたため重い → 次に変更。

| 記号 | 内容 |
|------|------|
| **Z** | 数式による即時「粗い目安」 |
| **C** | 最大3ページ・約55%解像度のサンプル推定に更新 |
| **X** | 推定完了を待たずダウンロード可能（本番は常にフル品質） |

検証例（画像多め 1.13MB PDF）: 画質40%で推定≈227KB / 実DL≈259KB 程度。

---

## 3. Google Drive 対応（通帳くん開発ログ踏襲）
参照ノート: `2026-08-12_GAS利用者Drive参照とファイル追加UI統合.md`

### 採用方針
- Google Picker API キー方式は使わない
- GAS Webアプリ + `DriveApp`
- **`executeAs: USER_ACCESSING`**（利用者本人のマイドライブ）
- **`access: ANYONE`**（Google ログイン可能な利用者が対象）
- UI: 点線枠の「＋」→ `Google Drive` / `ファイルをアップロード`（DnD 維持）
- サーバー: `listDriveFolder` / `getFileFromDrive`

> [!important]
> `USER_DEPLOYING` だとデプロイ者 Drive 固定になる。他利用者利用を想定するため **必ず `USER_ACCESSING`**。`webapp` 変更は push だけでは反映されず、**バージョン作成＋既存 deploymentId 指定の再デプロイ**が必要。

### GAS プロジェクト
| 項目 | 値 |
|------|-----|
| scriptId | `1gakhF3xf3vs_sl3CC6K297j-qhhVbqWmbQE0PEW8i8farqowTU4IeVt1` |
| WebアプリURL | https://script.google.com/macros/s/AKfycby8vRyOoaDgL4hGR9k3xQwWpKjkkdTLEs3XXnIi17XmdgYJssaHMvwih9mW1ac9I9X9/exec |
| deploymentId | `AKfycby8vRyOoaDgL4hGR9k3xQwWpKjkkdTLEs3XXnIi17XmdgYJssaHMvwih9mW1ac9I9X9` |
| エディタ | https://script.google.com/d/1gakhF3xf3vs_sl3CC6K297j-qhhVbqWmbQE0PEW8i8farqowTU4IeVt1/edit |

確認: ログイン利用者の「マイドライブ」フォルダ一覧が表示されることを確認済み。

---

## 4. リポジトリ分離
### GitHub Pages 版（元リポ）
- リポ: https://github.com/nozutax/PDFtool-2026
- URL: https://nozutax.github.io/PDFtool-2026/
- **Google Drive メニュー削除**（ローカル Upload / DnD のみ）
- GAS 関連ファイル（`Code.gs` / `appsscript.json` 等）を削除

### GAS 版（新リポ）
- リポ名希望: `pdftool(GAS)-2026` → GitHub 制約により **`pdftool-GAS-2026`**
- URL: https://github.com/nozutax/pdftool-GAS-2026
- 含むもの: `index.html`（Drive UI あり）, `Code.gs`, `appsscript.json`, `README.md`, `GAS-DEPLOY.md`, `.clasp.json`, `.claspignore`, `.gitignore`
- Cloud Agent の短命トークンは元リポのみ書込可だったため、初回投入はローカル Upload で実施

### ソース取得用（元リポ上の一時配布）
- ZIP: https://github.com/nozutax/PDFtool-2026/raw/main/downloads/pdftool-GAS-2026-files.zip
- フォルダ: https://github.com/nozutax/PDFtool-2026/tree/main/downloads/pdftool-GAS-2026-files

---

## 5. 運用メモ
- Pages = 手軽・ローカル完結
- GAS = Drive 連携（利用者ごとのマイドライブ）。初回 OAuth 同意あり。未検証アプリは「詳細 → 安全ではないページへ」
- iframe 埋め込みより **別タブ起動** 推奨（`USER_ACCESSING` × サードパーティ Cookie）
- clasp 再デプロイ例:

```bash
npx clasp push -f
npx clasp version "変更内容"
npx clasp deploy -i AKfycby8vRyOoaDgL4hGR9k3xQwWpKjkkdTLEs3XXnIi17XmdgYJssaHMvwih9mW1ac9I9X9 -V <新バージョン>
```

---

## 関連コミット／ブランチ（主なもの）
- 圧縮機能: `cursor/pdf-compress-7848`
- 推定高速化: `cursor/compress-estimate-fast-7848`
- Drive UI + GAS: `cursor/google-drive-upload-7848`
- Pages から Drive 削除: `cursor/split-pages-and-gas-repos-7848`
- ダウンロード用 ZIP 配置: `main`（`downloads/`）

## Obsidian 保存先（推奨）
`Obsidian Vault/開発ログCursor/2026-08-21_PDFTools圧縮とDrive分離_GAS化.md`
