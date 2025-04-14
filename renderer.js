let files = [];
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
const types = {
  music: [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a", ".wma", ".aiff", ".alac", ".opus"],
  image: [".jpg", ".jpeg", ".png", ".svg", ".gif", ".bmp", ".webp", ".ico", ".tiff", ".tif", ".heic", ".avif"],
  video: [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mpeg", ".mpg", ".m4v", ".3gp"],
  apps: [".exe", ".msi", ".apk", ".app", ".deb", ".rpm", ".dmg", ".xapk", ".jar", ".bat", ".com"],
  compressed: [".zip", ".rar", ".7z", ".tar", ".gz", ".pkg", ".xz", ".bz2", ".iso", ".lz", ".lzma", ".zst", ".cab"],
  roms: [".gba", ".gb", ".gbc", ".nes", ".sfc", ".smc", ".n64", ".z64", ".v64", ".bin", ".iso", ".cue", ".nds", ".3ds", ".cso", ".pbp", ".gcm", ".wad"],
  code: [".html", ".css", ".js", ".jsx", ".ts", ".tsx", ".json", ".xml", ".yml", ".yaml", ".sh", ".py", ".rb", ".php", ".c", ".cpp", ".h", ".hpp", ".java", ".cs", ".swift", ".go", ".rs", ".bat", ".cmd", ".ini", ".toml", ".log", ".kt", ".dart", ".lua", ".pl", ".r", ".m", ".sql"],
  document: [".txt", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".ods", ".odp", ".rtf", ".md", ".tex", ".epub", ".csv", ".pages", ".key", ".numbers"],
  fonts: [".ttf", ".otf", ".woff", ".woff2", ".eot", ".pfb", ".afm"],
  audioProject: [".als", ".flp", ".logicx", ".proj", ".cpr", ".npr", ".ptx", ".rpp", ".sesx", ".omf"],
  imageProject: [".psd", ".ai", ".xd", ".fig", ".sketch", ".indd", ".cdr", ".afphoto", ".affinity"],
  videoProject: [".prproj", ".veg", ".drp", ".pproj", ".fcpxml", ".imovieproj"],
  model3d: [".obj", ".fbx", ".stl", ".blend", ".3ds", ".dae", ".gltf", ".glb", ".max", ".c4d"],
  data: [".csv", ".tsv", ".json", ".xml", ".db", ".sql", ".sav", ".dta", ".rds", ".parquet", ".feather"],
  config: [".env", ".ini", ".cfg", ".conf", ".toml", ".yaml", ".yml", ".jsonc"],
  script: [".sh", ".bat", ".cmd", ".ps1", ".py", ".js", ".ts", ".rb", ".pl", ".lua"],
  other: [".db", ".bak", ".tmp", ".swp", ".lock", ".cache", ".dat"]
};
set.onclick = () =>{
  settings.style.display ="block"
} 
x.onclick = () =>{
  settings.style.display = "none"
}
const popover = document.getElementById("add-ext-popover");
const input = document.getElementById("add-ext-input");
const label = document.getElementById("add-ext-label");
const confirmBtn = document.getElementById("add-ext-confirm");
const cancelBtn = document.getElementById("add-ext-cancel");

let currentCategory = null;

function openAddExtensionPopover(category) {
  currentCategory = category;
  label.textContent = `Add extension to "${category}"`;
  input.value = "";
  popover.classList.remove("hidden");
  input.focus();
}confirmBtn.onclick = () => {
  let newExt = input.value.trim().replaceAll(" ", "");
  const validExtPattern = /^[A-Za-z0-9_.]+$/;

  if (newExt && validExtPattern.test(newExt)) {
    // Ensure it starts with a dot
    if (!newExt.startsWith(".")) {
      newExt = "." + newExt;
    }

    let foundCategory = null;
    // Loop through all categories to check if extension exists
    Object.entries(types).forEach(([cat, extList]) => {
      if (extList.includes(newExt)) {
        foundCategory = cat;
      }
    });

    if (foundCategory === currentCategory) {
      // Already exists in the current category: do nothing but notify the user.
      showStatusMessage(`The extension "${newExt}" already exists in "${currentCategory}".`);
    } else if (foundCategory) {
      // Extension exists in a different category; move it to the current one.
      types[foundCategory] = types[foundCategory].filter(ext => ext !== newExt);
      types[currentCategory].push(newExt);
      showStatusMessage(`The extension "${newExt}" was moved from "${foundCategory}" to "${currentCategory}".`);
    } else {
      // Extension does not exist anywhere; add it to the current category.
      types[currentCategory].push(newExt);
      showStatusMessage(`The extension "${newExt}" was added to "${currentCategory}".`);
    }
    
    renderTypes();

    // Reset input field, focus it, and hide the popover.
    input.value = "";
    input.focus();
    popover.classList.add("hidden");
  } else {
    showStatusMessage("Invalid extension name. Use only letters, numbers, underscores, and dots.");
  }
};


// Show status message
function showStatusMessage(message) {
  const statusMessageElement = document.createElement('div');
  statusMessageElement.classList.add('status-message');
  statusMessageElement.textContent = message;
  
  document.body.appendChild(statusMessageElement);
  
  // Auto-hide the message after 3 seconds
  setTimeout(() => {
    statusMessageElement.remove();
  }, 3000);
}



cancelBtn.onclick = () => {
  popover.classList.add("hidden");
};

const container = document.getElementById("type-editor");

function renderTypes() {
  container.innerHTML = "";

  for (const [category, extensions] of Object.entries(types)) {
    const currentCategory = category; // lock in the current category for this iteration

    // Create editable label for the category
    const label = document.createElement("label");
    label.className = "type-editor-label";
    label.textContent = currentCategory;
    label.contentEditable = true;

    label.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        label.blur();
      }
    });

    label.addEventListener("blur", () => {
      const newCategory = label.textContent.trim();

      // Revert if no change or blank
      if (!newCategory || newCategory === currentCategory) {
        label.textContent = currentCategory;
        return;
      }

      // Check if this new category name already exists in the types object
      if (types.hasOwnProperty(newCategory)) {
        alert("This category already exists.");
        label.textContent = currentCategory;
        return;
      }

      // Update the types object: rename the key
      types[newCategory] = types[currentCategory];
      delete types[currentCategory];

      renderTypes();
      displayCategorizedFiles();
    });

    container.appendChild(label);

    // Create extension buttons container
    const extContainer = document.createElement("div");
    extContainer.className = "type-editor-ext-container";

    extensions.forEach((ext, index) => {
      const btn = document.createElement("button");
      btn.className = "ext-btn";
      btn.textContent = ext;
      btn.onclick = () => {
        showStatusMessage(`The extension "${ext}" was removed from "${currentCategory}".`);
        types[currentCategory].splice(index, 1);
        renderTypes();
      };

      extContainer.appendChild(btn);
    });

    // Create "Add Extension" button for this category
    const addBtn = document.createElement("button");
    addBtn.className = "add-ext-btn";
    addBtn.textContent = "➕ Add";
    addBtn.onclick = () => {
      openAddExtensionPopover(currentCategory);
    };

    extContainer.appendChild(addBtn);
    container.appendChild(extContainer);
  }

  const addCategoryBtn = document.createElement("button");
  addCategoryBtn.textContent = "+ Add Category";
  addCategoryBtn.className = "add-category-btn";
  addCategoryBtn.addEventListener("click", () => {
    openCategoryModal((newCategory) => {
      if (newCategory) {
        if (types.hasOwnProperty(newCategory)) {
          alert("That category already exists.");
        } else {
          types[newCategory] = [];
          renderTypes();
          displayCategorizedFiles();
        }
      }
    }
    
  );
  }
); addCategoryBtn.addEventListener("click", () => {
  console.log("Add Category button clicked"); // <-- Add this
  openCategoryModal((newCategory) => {
    console.log("Category entered:", newCategory); // <-- And this
    if (newCategory) {
      // ...
    }
  });
});

  container.appendChild(addCategoryBtn);
  

  displayCategorizedFiles();
}
renderTypes()

let status1 = false
open1.onclick = () => {
  const typeEditor = document.getElementById("type-editor");
  if (status1) {
    open1.style.transform = "rotate(0deg)";

    typeEditor.style.height = "0.5px";
  } else {
    typeEditor.style.height = typeEditor.scrollHeight + "px";
    open1.style.transform = "rotate(180deg)";



  }
  status1 = !status1;
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


function buildExtToType() {
  const mapping = {};
  Object.entries(types).forEach(([category, exts]) => {
    exts.forEach(ext => mapping[ext] = category);
  });
  return mapping;
}
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
  const currentExtToType = buildExtToType();
  const categories = {};
  filesToOrganize.forEach(fileName => {
    const ext = "." + fileName.split(".").pop().toLowerCase();
    const category = currentExtToType[ext] || "other";
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
      !file.name.toLowerCase().includes("file_changes") && 
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
    const changesLog = [];
    const now = new Date();
    changesLog.push(
      `Changes made by Tidyfier! at ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} — Check https://github.com/Dumxrg/tidyfier\n\n`
    );

    // Rebuild the mapping for organization:
    const currentExtToType = buildExtToType();

    for (const file of files) {
      try {
        const ext = "." + file.name.split(".").pop().toLowerCase();
        // Use the up-to-date mapping:
        const category = currentExtToType[ext] || "other";
        // (The rest of your code remains unchanged.)
        const filePath = file.fullPath;
        const lastSeparatorIndex = Math.max(
          filePath.lastIndexOf('/'),
          filePath.lastIndexOf('\\')
        );
        const dirPath = filePath.substring(0, lastSeparatorIndex);
        const categoryPath = `${dirPath}${(dirPath.endsWith('/') || dirPath.endsWith('\\')) ? '' : '\\'}${category}`;
        const targetPath = `${categoryPath}${(categoryPath.endsWith('/') || categoryPath.endsWith('\\')) ? '' : '\\'}${file.name}`;
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
          changesLog.push(`${file.fullPath} -> ${targetPath}`);
        } else {
          console.error(`Failed to move file: ${file.fullPath} to ${targetPath}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing file: ${error.message}`);
        errorCount++;
      }
    }

    // Write changes log to a file
    if (changesLog.length > 0) {
      const logFilePath = `${selectedFolderPath}${(selectedFolderPath.endsWith('\\') ? '' : '\\')}file_changes.txt`;
      const logContent = changesLog.join("\n");
      const writeResult = await window.electronAPI.writeFile(logFilePath, logContent);
      if (writeResult.success) {
        showStatusMessage(`Changes log saved to ${logFilePath}`);
      } else {
        console.error(`Failed to write log file: ${writeResult.error}`);
        showStatusMessage(`Error saving changes log: ${writeResult.error}`);
      }
    }

    a.innerText = `Organization complete! ${organizedCount} files moved, ${skippedCount} already organized, ${errorCount} errors`;
    // Reset variables
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
function openCategoryModal(callback) {
  const modal = document.getElementById("category-modal");
  const input = document.getElementById("category-input");
  const confirmBtn = document.getElementById("category-confirm");
  const cancelBtn = document.getElementById("category-cancel");

  modal.classList.remove("hidden");
  input.value = "";
  input.focus();

  const confirmHandler = () => {
    modal.classList.add("hidden");
    callback(input.value.trim());
    cleanup();
  };

  const cancelHandler = () => {
    modal.classList.add("hidden");
    callback(null);
    cleanup();
  };

  function cleanup() {
    confirmBtn.removeEventListener("click", confirmHandler);
    cancelBtn.removeEventListener("click", cancelHandler);
  }

  confirmBtn.addEventListener("click", confirmHandler);
  cancelBtn.addEventListener("click", cancelHandler);
}

document.addEventListener('DOMContentLoaded', () => {
  org.addEventListener('click', organizeFiles);
});
