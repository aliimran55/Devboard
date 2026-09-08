"use strict";
const cards = document.querySelectorAll(".card");
const lists = document.querySelectorAll(".list");
const addButton = document.getElementById("add-btn");
const itemButton = document.getElementById("item-btn");
const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const textField = document.getElementById("lname");
const selectField = document.getElementById("label-select");
const errorText = document.getElementById("error-message");
const list1 = document.getElementById("list1");
const list2 = document.getElementById("list2");
const list3 = document.getElementById("list3");
const priorityField = document.getElementById("priority");
// ID der Task, die gerade bearbeitet wird.
// null bedeutet: Wir erstellen eine neue Task.
let editingTaskId = null;
const backButton = document.getElementById("back-btn");
document.addEventListener("dragstart", dragStart);
document.addEventListener("dragend", dragEnd);
for (const list of lists) {
    list.addEventListener("dragover", dragOver);
    list.addEventListener("dragenter", dragEnter);
    list.addEventListener("dragleave", dragLeave);
    list.addEventListener("drop", dragDrop);
}
backButton.addEventListener("click", () => {
    editingTaskId = null;
    screen2.classList.remove("active");
    screen1.classList.add("active");
    textField.value = "";
    priorityField.value = "";
    selectField.value = "";
    errorText.textContent = "";
    itemButton.textContent = "Add Item";
});
function dragStart(event) {
    const target = event.target;
    if (!target.classList.contains("card") || !event.dataTransfer)
        return;
    event.dataTransfer.setData("text/plain", target.id);
    target.dataset.originalList = target.parentElement?.id;
}
function dragEnd() {
    console.log("Drag ended");
}
function dragOver(event) {
    event.preventDefault();
}
function dragEnter(event) {
    event.preventDefault();
    this.classList.add("over");
}
function dragLeave() {
    this.classList.remove("over");
}
async function dragDrop(event) {
    event.preventDefault();
    const id = event.dataTransfer?.getData("text/plain");
    const card = id ? document.getElementById(id) : null;
    if (!card) {
        this.classList.remove("over");
        return;
    }
    if (card.dataset.originalList === this.id) {
        this.classList.remove("over");
        return;
    }
    const originalListId = card.dataset.originalList;
    this.appendChild(card);
    // Der Status der Task hängt davon ab, in welche Liste sie gezogen wurde.
    let status;
    if (this.id === "list1") {
        status = "TODO";
    }
    else if (this.id === "list2") {
        status = "IN_PROGRESS";
    }
    else {
        status = "DONE";
    }
    console.log("Neuer Status:", status);
    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: card.querySelector("span")?.textContent ?? "",
                priority: card.querySelector(".task-priority")?.getAttribute("data-priority") ?? "medium",
                status: status
            })
        });
        if (!response.ok) {
            throw new Error("Task konnte nicht aktualisiert werden");
        }
        const updatedTask = await response.json();
        console.log("Task aktualisiert:", updatedTask);
    }
    catch (error) {
        console.error("Fehler beim Aktualisieren der Task:", error);
        const originalList = originalListId
            ? document.getElementById(originalListId)
            : null;
        if (originalList) {
            originalList.appendChild(card);
        }
    }
    this.classList.remove("over");
}
addButton.addEventListener("click", changeWindow);
function changeWindow() {
    editingTaskId = null;
    textField.value = "";
    priorityField.value = "";
    selectField.value = "";
    errorText.textContent = "";
    itemButton.textContent = "Add Item";
    screen1.classList.remove("active");
    screen2.classList.add("active");
}
itemButton.addEventListener("click", addItem);
function createTaskCard(task) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.id = String(task.id);
    card.draggable = true;
    const title = document.createElement("span");
    title.classList.add("task-title");
    title.textContent = task.title;
    const priority = document.createElement("span");
    priority.classList.add("task-priority", `priority-${task.priority}`);
    priority.dataset.priority = task.priority;
    priority.textContent = task.priority.toUpperCase();
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
        editTask(task);
    });
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
        deleteTask(task.id);
    });
    card.appendChild(title);
    card.appendChild(priority);
    card.appendChild(deleteButton);
    card.appendChild(editButton);
    return card;
}
function editTask(task) {
    editingTaskId = task.id;
    textField.value = task.title;
    priorityField.value = task.priority;
    const labelMap = {
        TODO: "ToDo",
        IN_PROGRESS: "In Progress",
        DONE: "Done"
    };
    selectField.value = labelMap[task.status];
    itemButton.textContent = "Save Changes";
    screen1.classList.remove("active");
    screen2.classList.add("active");
}
async function addItem() {
    const label = selectField.value;
    if (label === "") {
        errorText.textContent = "Select a label";
        console.error("Select a label");
        return;
    }
    const statusMap = {
        ToDo: "TODO",
        "In Progress": "IN_PROGRESS",
        Done: "DONE",
    };
    const status = statusMap[label];
    const priority = priorityField.value;
    if (priority === "") {
        errorText.textContent = "Select a priority";
        return;
    }
    if (!["high", "medium", "low"].includes(priority)) {
        errorText.textContent = "Priority not valid";
        return;
    }
    try {
        // POST für neue Tasks, PUT für bestehende Tasks.
        const url = editingTaskId === null
            ? "http://localhost:3000/api/tasks"
            : `http://localhost:3000/api/tasks/${editingTaskId}`;
        const method = editingTaskId === null ? "POST" : "PUT";
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: textField.value,
                priority: priority,
                status: status
            })
        });
        if (!response.ok) {
            throw new Error("Task konnte nicht gespeichert werden");
        }
        const savedTask = await response.json();
        console.log("Task gespeichert:", savedTask);
        screen1.classList.add("active");
        screen2.classList.remove("active");
        // Beim Bearbeiten wird die alte Karte ersetzt.
        // Beim Erstellen einer neuen Task wird dagegen eine neue Karte angehängt.
        if (editingTaskId !== null) {
            const oldCard = document.getElementById(String(editingTaskId));
            if (oldCard) {
                const newCard = createTaskCard(savedTask);
                const listId = {
                    ToDo: "list1",
                    "In Progress": "list2",
                    Done: "list3",
                };
                const newList = document.getElementById(listId[label]);
                if (newList) {
                    newList.appendChild(newCard);
                }
                oldCard.remove();
            }
            editingTaskId = null;
            return;
        }
        const card = createTaskCard(savedTask);
        const listId = {
            ToDo: "list1",
            "In Progress": "list2",
            Done: "list3",
        };
        const list = document.getElementById(listId[label]);
        if (list) {
            list.appendChild(card);
        }
    }
    catch (error) {
        console.error("Fehler beim Speichern der Task:", error);
    }
}
// Beim Start werden alle gespeicherten Tasks aus der Datenbank geladen
// und anhand ihres Status auf die drei Kanban-Listen verteilt.
async function loadTasks() {
    try {
        const response = await fetch("http://localhost:3000/api/tasks");
        if (!response.ok) {
            throw new Error("Tasks konnten nicht geladen werden");
        }
        const tasks = await response.json();
        console.log(tasks);
        for (const task of tasks) {
            let targetList;
            if (task.status === "TODO") {
                targetList = list1;
            }
            else if (task.status === "IN_PROGRESS") {
                targetList = list2;
            }
            else {
                targetList = list3;
            }
            const card = createTaskCard(task);
            targetList.appendChild(card);
        }
    }
    catch (error) {
        console.error("Fehler beim Laden der Tasks:", error);
    }
}
loadTasks();
async function deleteTask(taskId) {
    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error("Task konnte nicht gelöscht werden");
        }
        const card = document.getElementById(String(taskId));
        if (card) {
            card.remove();
        }
        console.log("Task gelöscht:", taskId);
    }
    catch (error) {
        console.error("Fehler beim Löschen der Task:", error);
    }
}
