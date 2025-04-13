let files = [];
const types = {
  music: [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a", ".wma"],
  image: [".jpg", ".jpeg", ".png", ".svg", ".gif", ".bmp", ".webp", ".ico", ".tiff"],
  video: [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm"],
  apps: [".exe", ".msi", ".apk", ".app", ".deb", ".rpm"],
  compressed: [".zip", ".rar", ".7z", ".tar", ".gz", ".pkg", ".xz", ".bz2", ".iso"],
  roms: [".gba", ".gb", ".gbc", ".nes", ".sfc", ".smc", ".n64", ".z64", ".v64", ".bin", ".iso", ".cue"],
  code: [".html", ".css", ".js", ".jsx", ".ts", ".tsx", ".json", ".xml", ".yml", ".yaml", ".sh", ".py", ".rb", ".php", ".c", ".cpp", ".h", ".hpp", ".java", ".cs", ".swift", ".go", ".rs", ".bat", ".cmd", ".ini", ".toml", ".log"],
  document: [".txt", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp", ".rtf", ".md"],
  fonts: [".ttf", ".otf", ".woff", ".woff2", ".eot"],
  audioProject: [".als", ".flp", ".logicx", ".proj", ".cpr"],
  imageProject: [".psd", ".ai", ".xd", ".fig", ".sketch"],
  other: [".db", ".bak", ".tmp"]
};

document.getElementById("clip").addEventListener("click", () => {
  var copyText = document.getElementById("b");
  if (copyText) {
    var range = document.createRange();
    range.selectNode(copyText);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    navigator.clipboard.writeText(copyText.innerText)
      .then(() => { console.log('Text successfully copied to clipboard!'); })
      .catch(err => { console.error('Failed to copy text: ', err); });
    selection.removeAllRanges();
  } else {
    console.error('Element with id "b" not found.');
  }
});

const extToType = {};
Object.entries(types).forEach(([type, exts]) => {
  exts.forEach(ext => extToType[ext] = type);
});

const inp = document.getElementById("inp");
const org = document.getElementById("org");
const textFolder = document.getElementById("textFolder");
const textDepth = document.getElementById("textDepth");
const depthSelected = document.getElementById("depthSelected");
const increaseDepthBtn = document.getElementById("incr");
const decreaseDepthBtn = document.getElementById("decr");
const a = document.getElementById("a");
const b = document.getElementById("b");

let selectedDepth = 1;
let totalDepth = 1;
let rootFolder = "";
let selectedFolderPath = "";

function updateDepthDisplay() {
  depthSelected.innerText = selectedDepth;
}

increaseDepthBtn.onclick = () => {
  if (selectedDepth < totalDepth) {
    selectedDepth++;
    updateDepthDisplay();
    if (files.length > 0) displayCategorizedFiles();
  }
};

decreaseDepthBtn.onclick = () => {
  if (selectedDepth > 1) {
    selectedDepth--;
    updateDepthDisplay();
    if (files.length > 0) displayCategorizedFiles();
  }
};

function displayCategorizedFiles() {
  if (files.length === 0) {
    a.innerText = "No files selected!";
    b.innerText = "";
    return;
  }
  const filteredFiles = files.filter(file => {
    const filePathParts = file.relativePath.split(/[\/\\]/);
    return filePathParts.length <= selectedDepth + 1;
  });
  const relPaths = filteredFiles.map(f => f.relativePath);
  const categorized = categorize(relPaths);
  a.innerText = `${filteredFiles.length} file(s) selected (showing depth ${selectedDepth})`;
  b.innerText = Object.entries(categorized)
    .map(([category, fileList]) => 
      `\n${category.charAt(0).toUpperCase() + category.slice(1)}:\n  ${fileList.join("\n  ")}`)
    .join("\n\n");
}

function categorize(filesToOrganize) {
  const categories = {};
  filesToOrganize.forEach(fileName => {
    const ext = "." + fileName.split(".").pop().toLowerCase();
    const category = extToType[ext] || "other";
    if (!categories[category]) categories[category] = [];
    categories[category].push(fileName);
  });
  return categories;
}

async function selectAndScanFolder() {
  try {
    selectedFolderPath = await window.electronAPI.selectFolder();
    if (!selectedFolderPath) {
      a.innerText = "No folder selected.";
      return;
    }
    const pathParts = selectedFolderPath.split(/[\/\\]/);
    rootFolder = pathParts[pathParts.length - 1];
    const folderContents = await window.electronAPI.scanFolder(selectedFolderPath);
    if (!folderContents.success) {
      a.innerText = `Error scanning folder: ${folderContents.error}`;
      return;
    }
    files = folderContents.files.map(file => {
      const relativePath = file.path.replace(selectedFolderPath, rootFolder);
      return { relativePath: relativePath, fullPath: file.path, name: file.name };
    });
    files = files.filter(file => 
      !file.name.toLowerCase().includes("desktop.ini") && 
      !file.name.toLowerCase().includes(".ds_store"));
    totalDepth = files.reduce((maxDepth, file) => {
      const depth = file.relativePath.split(/[\/\\]/).length - 1;
      return Math.max(maxDepth, depth);
    }, 1);
    textFolder.innerText = rootFolder;
    textDepth.innerText = totalDepth;
    selectedDepth = 1;
    updateDepthDisplay();
    a.innerText = `${files.length} files loaded successfully from ${rootFolder}`;
    displayCategorizedFiles();
  } catch (error) {
    console.error("Error selecting folder:", error);
    a.innerText = `Error selecting folder: ${error.message || "Unknown error"}`;
  }
}

inp.onclick = (e) => {
  e.preventDefault();
  selectAndScanFolder();
};

async function organizeFiles() {
  if (files.length === 0 || !selectedFolderPath) {
    a.innerText = "Please select a folder first!";
    return;
  }
  a.innerText = "Organizing files...";
  try {
    let organizedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    for (const file of files) {
      try {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        const category = extToType[ext] || "other";
        const filePath = file.fullPath;
        const lastSeparatorIndex = Math.max(
          filePath.lastIndexOf('/'), 
          filePath.lastIndexOf('\\')
        );
        const dirPath = filePath.substring(0, lastSeparatorIndex);
        const categoryPath = `${dirPath}${dirPath.endsWith('/') || dirPath.endsWith('\\') ? '' : '\\'}${category}`;
        const targetPath = `${categoryPath}${categoryPath.endsWith('/') || categoryPath.endsWith('\\') ? '' : '\\'}${file.name}`;
        const fileCheck = await window.electronAPI.verifyPath(file.fullPath);
        if (!fileCheck.exists || !fileCheck.success) {
          console.error(`File not found: ${file.fullPath}`);
          errorCount++;
          continue;
        }
        if (dirPath.endsWith(`\\${category}`) || dirPath.endsWith(`/${category}`)) {
          skippedCount++;
          continue;
        }
        const folderResult = await window.electronAPI.createFolder(categoryPath);
        if (!folderResult.success) {
          console.error(`Failed to create folder: ${categoryPath}`);
          errorCount++;
          continue;
        }
        const moveResult = await window.electronAPI.moveFile(file.fullPath, targetPath);
        if (moveResult.success) {
          organizedCount++;
        } else {
          console.error(`Failed to move file: ${file.fullPath} to ${targetPath}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing file: ${error.message}`);
        errorCount++;
      }
    }
    a.innerText = `Organization complete! ${organizedCount} files moved, ${skippedCount} already organized, ${errorCount} errors`;
    files = [];
    b.innerText = "";
    textFolder.innerText = "";
    textDepth.innerText = "";
    selectedFolderPath = "";
  } catch (error) {
    console.error("Organization error:", error);
    a.innerText = `Error: ${error.message || "Unknown error occurred"}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  org.addEventListener('click', organizeFiles);
});
