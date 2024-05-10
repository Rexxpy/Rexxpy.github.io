const items = [];
const RENDER_EVENT = 'render-item';
const SAVED_EVENT = 'saved-item';
const STORAGE_KEY = 'ITEM_APPS';

function generateId() {
  return +new Date();
}

function generateItemObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

function findItem(itemId) {
  for (const bookItem of items) {
    if (bookItem.id === itemId) {
      return bookItem;
    }
  }
  return null;
}

function findItemIndex(itemId) {
  for (const index in items) {
    if (items[index].id === itemId) {
      return index;
    }
  }
  return -1;
}

 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}


function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const item of data) {
      items.push(item);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeItem(itemObject) {

  const {id, title, author, year, isComplete} = itemObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = "Penulis: " + author;

  const textYear = document.createElement('p');
  textYear.innerText = "Tahun: " + year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('item');
  textContainer.append(textTitle, textAuthor, textYear);
  
  const textContainerButton = document.createElement('div');
  textContainerButton.classList.add('button');

  if (isComplete) {

    const undoButton = document.createElement('button');
    undoButton.classList.add('belumselesai-button');
    undoButton.innerHTML = 'Belum Selesai Dibaca';
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });
    
    const trashButton = document.createElement('button');
    trashButton.classList.add('hapus-button');
    trashButton.innerHTML = 'Hapus Buku';
    trashButton.addEventListener('click', function () {
        removeTaskFromCompleted(id);
    });
    
    textContainerButton.append(undoButton, trashButton);
  } else {
    const selesaiButton = document.createElement('button');
    selesaiButton.classList.add('selesai-button');
    selesaiButton.innerHTML = 'Selesai Dibaca';
    selesaiButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });
    
    const trashButton = document.createElement('button');
    trashButton.classList.add('hapus-button');
    trashButton.innerHTML = 'Hapus Buku';
    trashButton.addEventListener('click', function () {
        removeTaskFromCompleted(id);
    });

    textContainerButton.append(selesaiButton, trashButton);
  }

  const container = document.createElement('div');
  container.classList.add('inner')
  container.append(textContainer, textContainerButton);
  container.setAttribute('id', `item-${id}`);

  return container;
}

function addItem() {
  const textTitle = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const year = document.getElementById('year').value;
  const checkbox = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const itemObject = generateItemObject(generatedID, textTitle, author, Number(year), checkbox);
  items.push(itemObject);
  document.forms['input-book'].reset()

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  // console.log(checkbox);
}

function findBook(){
  const input = document.getElementById('find-book').value;
  const searchQuery = input.trim();
  const item = document.getElementsByClassName('inner');

  for (i = 0; i < item.length; i++) {
    if (item[i].children[0].children[0].innerText.toLowerCase().includes(searchQuery)) {
      item[i].style.display = '';
    } else {
      item[i].style.display = "none";
    }
  }
}

function addTaskToCompleted(itemId) {
  const itemTarget = findItem(itemId);
  
  if (itemTarget == null) return;
  
  itemTarget.isComplete = true;
  
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

}

function removeTaskFromCompleted(itemId) {
  const yesButton = document.getElementById('yes-delete');
  
  document.getElementById('dialog').showModal();  
  
  yesButton.addEventListener('click', function () {
    document.getElementById('dialog').close();
    const itemTarget = findItemIndex(itemId);
    if (itemTarget === -1) return;
    items.splice(itemTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  });
   
}

function closeModal(){
  window.location.reload();

}

function undoTaskFromCompleted(itemId) {

  const itemTarget = findItem(itemId);
  if (itemTarget == null) return;

  itemTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
  

document.addEventListener('DOMContentLoaded', function () {

  const submitForm = document.getElementById('input-book');
  const cariForm = document.getElementById('find-book');  
  
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addItem();
  });

  cariForm.addEventListener('keyup', function (event) {
    event.preventDefault();
    findBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  var x = document.getElementById("toast-dialog");

  x.className = "show";

  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 2000);
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedITEMList = document.getElementById('belumselesai');
  const listCompleted = document.getElementById('selesai');

  uncompletedITEMList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of items) {
    const itemElement = makeItem(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(itemElement);
    } else {
      uncompletedITEMList.append(itemElement);
    }
  }
});

