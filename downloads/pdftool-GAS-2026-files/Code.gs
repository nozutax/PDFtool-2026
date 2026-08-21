/**
 * PDF Tools — GAS Web アプリ入口
 * executeAs: USER_ACCESSING で「開いた利用者自身」のマイドライブを参照する。
 * （appsscript.json の webapp 変更は clasp push だけでは反映されない。
 *  バージョン作成 + 既存 deploymentId 指定の再デプロイが必要）
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('PDF Tools')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * フォルダ一覧（マイドライブ起点）。パンくず用に path も返す。
 * @param {string|null} folderId
 * @return {{id:string,name:string,path:Array<{id:string,name:string}>,folders:Array,files:Array}}
 */
function listDriveFolder(folderId) {
  const folder = folderId
    ? DriveApp.getFolderById(folderId)
    : DriveApp.getRootFolder();

  const path = _buildDrivePath_(folder);

  const folders = [];
  const folderIt = folder.getFolders();
  while (folderIt.hasNext()) {
    const f = folderIt.next();
    folders.push({ id: f.getId(), name: f.getName() });
  }
  folders.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  const files = [];
  const fileIt = folder.getFiles();
  while (fileIt.hasNext()) {
    const file = fileIt.next();
    const mime = file.getMimeType() || '';
    if (!_isAllowedDriveMime_(mime)) continue;
    files.push({
      id: file.getId(),
      name: file.getName(),
      mimeType: mime,
      size: Number(file.getSize())
    });
  }
  files.sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  return {
    id: folder.getId(),
    name: folder.getName(),
    path: path,
    folders: folders,
    files: files
  };
}

/**
 * Drive ファイルを Base64 で返す（クライアントで File 化して既存処理へ渡す）
 * @param {string} fileId
 * @return {{id:string,name:string,mimeType:string,size:number,base64:string}}
 */
function getFileFromDrive(fileId) {
  if (!fileId) throw new Error('ファイルIDが指定されていません。');
  const file = DriveApp.getFileById(fileId);
  const mime = file.getMimeType() || '';
  if (!_isAllowedDriveMime_(mime)) {
    throw new Error('PDF または JPEG のみ選択できます。');
  }
  const blob = file.getBlob();
  return {
    id: file.getId(),
    name: file.getName(),
    mimeType: mime,
    size: Number(file.getSize()),
    base64: Utilities.base64Encode(blob.getBytes())
  };
}

function _isAllowedDriveMime_(mime) {
  if (!mime) return false;
  if (mime === 'application/pdf') return true;
  if (mime === 'image/jpeg' || mime === 'image/jpg') return true;
  return false;
}

function _buildDrivePath_(folder) {
  const path = [];
  let current = folder;
  // ルートまで遡る（深すぎる階層は打ち切り）
  for (let i = 0; i < 30; i++) {
    path.unshift({ id: current.getId(), name: current.getName() });
    const parents = current.getParents();
    if (!parents.hasNext()) break;
    current = parents.next();
  }
  // ルート表示名を「マイドライブ」に揃える
  if (path.length) {
    const root = DriveApp.getRootFolder();
    if (path[0].id === root.getId()) path[0].name = 'マイドライブ';
  }
  return path;
}
