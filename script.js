document.addEventListener("DOMContentLoaded", startToDoList);
document.querySelector("form#add-new-item").addEventListener("submit", (e) => { formListener(e) });
const isLoading = false;

// ----------------------------------------------------
// start the list and load all results from database

function startToDoList() {
    fetch("https://frontend2019-b484.restdb.io/rest/to-do", {
        method: "get",
        headers: {
            "content-type": "application/json; charset=uft-8", 
            "x-apikey": "5d8895e0fd86cb75861e2639", 
            "cache-control": "no-cache"
        }
    })
    .then(res => res.json())
    .then(toDoItems => {
        document.querySelector("ul.uncompleted").innerHTML = "";
        document.querySelector("ul.completed").innerHTML = "";
        toDoItems.forEach(function (item) { addItemToDOM(item); });
    });  
}

// ----------------------------------------------------
// all functions where we update records in datatase

function addNewItemToDB(fieldInput) {
    
    const data = {
        task: fieldInput,
        isCompleted: false
    };
    const postData = JSON.stringify(data); 
    
    addItemToDOM(data); 
    toggleLoader("show");

    fetch("https://frontend2019-b484.restdb.io/rest/to-do", {
        method: "post",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": "5d8895e0fd86cb75861e2639",
            "cache-control": "no-cache"
        },
        body: postData       
    })
    .then(res => res.json())
    .then(data => {
        toggleLoader("hide");
        notifyUser("add");
    })
};

function deleteItemFromDB(id) {
    toggleLoader("show");
    fetch("https://frontend2019-b484.restdb.io/rest/to-do/" + id, {
        method: "delete",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": "5d8895e0fd86cb75861e2639",
            "cache-control": "no-cache"
        },
    })
    .then(res => res.json())
    .then(data => {
        toggleLoader("hide");
        notifyUser("remove");
    })
}

function updateItemInDB(id) {
    const item = document.getElementById(id);
    const isElementChecked = JSON.parse(item.getAttribute("data-checked"));
    toggleLoader("show");

    const data = {
        isCompleted: !isElementChecked
    };
    const postData = JSON.stringify(data); 

    fetch("https://frontend2019-b484.restdb.io/rest/to-do/" + id, {
        method: "put",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-apikey": "5d8895e0fd86cb75861e2639",
            "cache-control": "no-cache"
        },
        body: postData
    })
    .then(res => res.json())
    .then(data => {
        toggleLoader("hide");
        startToDoList();
        notifyUser("update")
    })
}

// ----------------------------------------------------
// all DOM manipulation functions

function addItemToDOM(item) {
    const toDoList = document.querySelector("#todolist");
    const template = document.querySelector("template").content; 
    const copy = template.cloneNode(true); 
    copy.querySelector(".task-name").textContent = item.task; 
    copy.querySelector(".todolist-item").setAttribute("id", item._id);
    copy.querySelector(".todolist-item").setAttribute("data-checked", item.isCompleted);
    
    if (item.isCompleted == false) {
        toDoList.querySelector("ul.uncompleted").prepend(copy); 
        createItemEventListeners(item._id) 
    }
    if (item.isCompleted == true) {
        toDoList.querySelector("ul.completed").prepend(copy); 
        createItemEventListeners(item._id) 
    }
}

function updateItemInDOM(item) {
    const isElementChecked = JSON.parse(item.getAttribute("data-checked"));
    if (isElementChecked) { item.setAttribute("data-checked", "false");
    } else { item.setAttribute("data-checked", "true"); }
}

function removeItemFromDOM(item) {
    item.classList.add("is-deleting");
    item.remove();
}

function toggleLoader(visibility) {
    const loader = document.getElementById("loader");
    if (visibility == "hide") { loader.style.display = "none"; }
    if (visibility == "show") { loader.style.display = "block"; }
}

// ----------------------------------------------------
// event listeners functions

function createItemEventListeners(id) {
    const item = document.getElementById(id);
    return item.addEventListener('click', function (event) {
        if (event.target.classList.contains('task-delete')) {
            deleteItemFromDB(id);
            removeItemFromDOM(item);
        }
        if (event.target.classList.contains('task-checkbox') || event.target.classList.contains('task-name')) {
            updateItemInDB(id)
            updateItemInDOM(item)                  
        }
    });
}

function formListener(e) {
    e.preventDefault();
    const fieldInput = e.target.taskName.value;
    if (fieldInput)  { addNewItemToDB(fieldInput); }
    if (!fieldInput) { notifyUser("warning"); }
}

// ----------------------------------------------------
// notify user

function notifyUser(type) {
    const alertList = document.querySelector("#alerts");
    if (type === "add") {
        alertList.insertAdjacentHTML("afterbegin", "<li class='alert success'>Item was successfully added</li>");
    }
    if (type === "remove") {
        alertList.insertAdjacentHTML("afterbegin", "<li class='alert error'>Item was deleted</li>");
    }
    if (type === "warning") {
        alertList.insertAdjacentHTML("afterbegin", "<li class='alert warning'>Whoops please add a value</li>");
    }
    if (type === "update") {
        alertList.insertAdjacentHTML("afterbegin", "<li class='alert success'>Item was updated</li>");
    }
}