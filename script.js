// DOM ELEMENTS
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const sidebar = document.getElementById("sidebar");
const dragHandle = document.getElementById("dragHandle");
const folderList = document.getElementById("folderList");
const taskDate = document.getElementById("taskDate");
const taskSubject = document.getElementById("taskSubject");
const taskLink = document.getElementById("taskLink");
const taskList = document.getElementById("taskList");
const questTitle = document.getElementById("questTitle");

// GLOBAL VARIABLES
let isPlaying = false;
let isDragging = false;
let folders = JSON.parse(localStorage.getItem("folders")) || [];
let globalLists = JSON.parse(localStorage.getItem("globalLists")) || [];
let currentFolder = null;

// INIT
renderFolders();
renderTasks();

// MUSIC TOGGLE
musicToggle.addEventListener("click", () => {
  isPlaying = !isPlaying;
  isPlaying ? bgMusic.play() : bgMusic.pause();
  musicToggle.textContent = isPlaying ? "🔊" : "🔇";
});

// ENTER KEY TO ADD TASK
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTaskBtn.click();
  }
});

// SIDEBAR RESIZE
dragHandle.addEventListener("mousedown", () => {
  isDragging = true;
  document.body.style.cursor = "ew-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const newWidth = e.clientX;
  if (newWidth > 150 && newWidth < 500) sidebar.style.width = `${newWidth}px`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.cursor = "default";
});

// FOLDER SYSTEM
function saveData() {
  localStorage.setItem("folders", JSON.stringify(folders));
  localStorage.setItem("globalLists", JSON.stringify(globalLists));
}

function renderFolders() {
  folderList.innerHTML = "";
  folders.forEach((folder, fIndex) => {
    const folderEl = createFolderElement(folder, fIndex);
    folderList.appendChild(folderEl);

    folder.lists.forEach((list, lIndex) => {
      const listEl = createListElement(list, fIndex, lIndex);
      folderList.appendChild(listEl);
    });
  });
}

function createFolderElement(folder, fIndex) {
  const li = document.createElement("li");
  li.className = currentFolder?.fIndex === fIndex && currentFolder?.lIndex === null ? "active" : "";
  li.style.display = "flex";
  li.style.gap = "5px";

  const span = document.createElement("span");
  span.textContent = `📁 ${folder.name}`;
  span.onclick = () => selectFolder(fIndex, null);

  const addBtn = document.createElement("button");
  addBtn.textContent = "+";
  addBtn.style.fontSize = "10px";
  addBtn.onclick = (e) => {
    e.stopPropagation();
    createList(fIndex);
  };

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.style.fontSize = "10px";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    if (confirm(`Delete folder '${folder.name}'?`)) {
      folders.splice(fIndex, 1);
      if (currentFolder?.fIndex === fIndex) currentFolder = null;
      saveData();
      renderFolders();
      renderTasks();
    }
  };

  li.append(span, addBtn, delBtn);
  return li;
}

function createListElement(list, fIndex, lIndex) {
  const li = document.createElement("li");
  li.className = currentFolder?.fIndex === fIndex && currentFolder?.lIndex === lIndex ? "active" : "";
  li.style.marginLeft = "20px";
  li.style.display = "flex";
  li.style.gap = "5px";

  const span = document.createElement("span");
  span.textContent = `📝 ${list.name}`;
  span.onclick = () => selectFolder(fIndex, lIndex);

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.style.cssText = "font-size:10px;padding:0;margin:0;border:none;background:transparent;cursor:pointer;width:16px;height:16px";
  delBtn.onclick = (e) => {
    e.stopPropagation();
    if (confirm(`Delete list '${list.name}'?`)) {
      folders[fIndex].lists.splice(lIndex, 1);
      if (currentFolder?.fIndex === fIndex && currentFolder?.lIndex === lIndex) currentFolder = null;
      saveData();
      renderFolders();
      renderTasks();
    }
  };

  li.append(span, delBtn);
  return li;
}

function createFolder() {
  document.getElementById("folderNameInput").value = "";
  document.getElementById("folderModal").style.display = "flex";
}

function closeFolderModal() {
  document.getElementById("folderModal").style.display = "none";
}

function confirmCreateFolder() {
  const name = document.getElementById("folderNameInput").value.trim();
  if (!name) return alert("Folder name cannot be empty.");

  const exists = folders.some(f => f.name.toLowerCase() === name.toLowerCase());
  if (exists) return alert("Folder name already exists!");

  folders.push({ name, lists: [] });
  saveData();
  renderFolders();
  closeFolderModal();
}

function createList(folderIndex) {
  currentFolder = { fIndex: folderIndex, lIndex: null };
  taskInput.value = taskDate.value = taskSubject.value = "";
  renderFolders();
  renderTasks();
}

function selectFolder(fIndex, lIndex) {
  currentFolder = { fIndex, lIndex };
  taskSubject.style.display = lIndex !== null ? "none" : "";
  questTitle.textContent = lIndex !== null ? `📝 ${folders[fIndex].lists[lIndex].name}` : `📁 ${folders[fIndex].name}`;
  questTitle.style.transition = "opacity 0.3s ease";
  questTitle.style.opacity = 0.3;
  setTimeout(() => (questTitle.style.opacity = 1), 100);
  fadeInPanel();
  renderFolders();
  renderTasks();
}

function fadeInPanel() {
  const panel = document.getElementById("questTrackerPanel");
  panel.style.opacity = 0;
  panel.style.transition = "opacity 0.3s ease-in-out";
  requestAnimationFrame(() => (panel.style.opacity = 1));
}

addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const date = taskDate.value;
  const subject = taskSubject.value.trim();
  const link = taskLink.value.trim();
  if (!text) return alert("Please enter a task!");
  if (!currentFolder) return alert("Select a folder or list first!");

  const folder = folders[currentFolder.fIndex];
  let listIndex = currentFolder.lIndex;

  if (listIndex === null) {
    if (!subject) return alert("Please enter a subject (this becomes your list name)");
    listIndex = folder.lists.findIndex(l => l.name.toLowerCase() === subject.toLowerCase());
    if (listIndex === -1) {
      folder.lists.push({ name: subject, tasks: [] });
      listIndex = folder.lists.length - 1;
    }
    currentFolder.lIndex = listIndex;
  }

  folder.lists[listIndex].tasks.push({ text, date, subject, link, completed: false });
  taskInput.value = taskDate.value = taskSubject.value = taskLink.value = "";
  saveData();
  renderFolders();
  renderTasks();
});

function renderTasks() {
  fadeInPanel();
  taskList.innerHTML = "";
  if (!currentFolder) return;

  const folder = folders[currentFolder.fIndex];
  const list = currentFolder.lIndex !== null ? folder.lists[currentFolder.lIndex] : null;
  const tasks = list?.tasks || [];

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => {
      task.completed = !task.completed;
      saveData();
      renderTasks();
    };

    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(task.text));

    if (task.link) {
      const link = document.createElement("a");
      link.href = task.link;
      link.target = "_blank";
      link.textContent = " 🔗";
      link.style.marginLeft = "5px";
      li.appendChild(link);
    }

    if (task.date) {
  const dueDateEl = document.createElement("div");
  dueDateEl.className = "task-date";
  dueDateEl.textContent = "📅 Due: " + task.date;
  li.appendChild(dueDateEl); // <- betul: append ke li

  const statusLabel = document.createElement("div");
  statusLabel.className = "task-status";

  const due = new Date(task.date);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);

  if (due < today) {
    statusLabel.textContent = "🔴 Overdue";
    statusLabel.classList.add("overdue");
  } else if (due.getTime() === today.getTime()) {
    statusLabel.textContent = "🟡 Due Today";
    statusLabel.classList.add("due-today");
  } else if (due.getTime() === tomorrow.getTime()) {
    statusLabel.textContent = "🟢 Due Tomorrow";
    statusLabel.classList.add("due-tomorrow");
  }

  li.appendChild(statusLabel); // <- betul: append ke li
}

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = () => {
      tasks.splice(index, 1);
      saveData();
      renderTasks();
    };

    li.appendChild(delBtn);
    taskList.appendChild(li);
  });

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("activeCount").textContent = tasks.filter(t => !t.completed).length;
  document.getElementById("completedCount").textContent = tasks.filter(t => t.completed).length;
}


renderFolders();
renderTasks();
