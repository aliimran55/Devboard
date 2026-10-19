const cards = document.querySelectorAll<HTMLElement>(".card");
const lists = document.querySelectorAll<HTMLElement>(".list");

const addButton = document.getElementById("add-btn") as HTMLButtonElement;
const itemButton = document.getElementById("item-btn") as HTMLButtonElement;
const screen1 = document.getElementById("screen1") as HTMLElement;
const screen2 = document.getElementById("screen2") as HTMLElement;
const textField = document.getElementById("lname") as HTMLInputElement;
const selectField = document.getElementById("label-select") as HTMLSelectElement;
const errorText = document.getElementById("error-message") as HTMLElement;
const list1 = document.getElementById("list1")!;
const list2 = document.getElementById("list2")!;
const list3 = document.getElementById("list3")!;
const priorityField = document.getElementById("priority") as HTMLSelectElement;
// ID der Task, die gerade bearbeitet wird.
// null bedeutet: Wir erstellen eine neue Task.
let editingTaskId: number | null = null;
const backButton = document.getElementById("back-btn") as HTMLButtonElement;

type Status = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: number,
  title: string,
  priority: "high" | "medium" | "low",
  status: Status
};

document.addEventListener("dragstart", dragStart);
document.addEventListener("dragend", dragEnd);

for (const list of lists) {
  list.addEventListener("dragover", dragOver);
  list.addEventListener("dragenter", dragEnter);
  list.addEventListener("dragleave", dragLeave);
  list.addEventListener("drop", dragDrop);
}

backButton.addEventListener("click", () =>{
  editingTaskId = null;

  screen2.classList.remove("active");
  screen1.classList.add("active");

  textField.value = "";
  priorityField.value = "";
  selectField.value = "";
  errorText.textContent = "";
  itemButton.textContent = "Add Item";
});

function dragStart(event: DragEvent): void {
  const target = event.target as HTMLElement;

  if (!target.classList.contains("card") || !event.dataTransfer) return;

  event.dataTransfer.setData("text/plain", target.id);

  target.dataset.originalList = target.parentElement?.id;
}

function dragEnd(): void {
  console.log("Drag ended");
}

function dragOver(event: DragEvent): void {
  event.preventDefault();
}

function dragEnter(this: HTMLElement, event: DragEvent): void {
  event.preventDefault();
  this.classList.add("over");
}

function dragLeave(this: HTMLElement): void {
  this.classList.remove("over");
}

async function dragDrop(this: HTMLElement,event: DragEvent): Promise<void> {
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
  let status: Status;

  if (this.id === "list1") {
    status = "TODO";
  } else if (this.id === "list2") {
    status = "IN_PROGRESS";
  } else {
    status = "DONE";
  }

  console.log("Neuer Status:", status);

  try {
    const response = await fetch(
      `http://localhost:8080/api/tasks/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: card.querySelector("span")?.textContent ?? "",
          priority: card.querySelector(".task-priority")?.getAttribute("data-priority") ?? "medium",
          status: status
        })
      }
    );

    if (!response.ok) {
      throw new Error("Task konnte nicht aktualisiert werden");
    }

    const updatedTask: Task = await response.json();

    console.log("Task aktualisiert:", updatedTask);

  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren der Task:",
      error
    );

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

function changeWindow(): void {
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

function createTaskCard(task: Task): HTMLElement {
  const card = document.createElement("div");
  card.classList.add("card");
  card.id = String(task.id);
  card.draggable = true;

  const title = document.createElement("span");
  title.classList.add("task-title");
  title.textContent = task.title;

  const priority = document.createElement("span");
  priority.classList.add(
    "task-priority",
    `priority-${task.priority}`
  );
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

function editTask(task: Task): void {
  editingTaskId = task.id;

  textField.value = task.title;
  priorityField.value = task.priority;

  const labelMap: Record<Status, string> = {
    TODO: "ToDo",
    IN_PROGRESS: "In Progress",
    DONE: "Done"
  };
  selectField.value = labelMap[task.status];

  itemButton.textContent = "Save Changes";
  screen1.classList.remove("active");
  screen2.classList.add("active");
}

async function addItem(): Promise<void> {
  const label = selectField.value;

  if (label === "") {
    errorText.textContent = "Select a label";
    console.error("Select a label");
    return;
  }

  const statusMap: Record<string, Status> = {
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
      ? "http://localhost:8080/api/tasks"
      : `http://localhost:8080/api/tasks/${editingTaskId}`;

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

    const savedTask: Task = await response.json();

    console.log("Task gespeichert:", savedTask);

    screen1.classList.add("active");
    screen2.classList.remove("active");

  // Beim Bearbeiten wird die alte Karte ersetzt.
  // Beim Erstellen einer neuen Task wird dagegen eine neue Karte angehängt.
  if (editingTaskId !== null) {
    const oldCard = document.getElementById(String(editingTaskId));

    if (oldCard) {
     const newCard = createTaskCard(savedTask);

     const listId: Record<string, string> = {
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

    const listId: Record<string, string> = {
      ToDo: "list1",
      "In Progress": "list2",
      Done: "list3",
    };

    const list = document.getElementById(listId[label]);

    if (list) {
      list.appendChild(card);
    }

  } catch (error) {
     console.error("Fehler beim Speichern der Task:", error);
  }
}

// Beim Start werden alle gespeicherten Tasks aus der Datenbank geladen
// und anhand ihres Status auf die drei Kanban-Listen verteilt.
async function loadTasks(): Promise<void> {
  try {
    const response = await fetch("http://localhost:8080/api/tasks");
    if (!response.ok) {
      throw new Error("Tasks konnten nicht geladen werden");
    }
    const tasks: Task[] = await response.json();
    console.log(tasks);
    for (const task of tasks) {
      let targetList;
      if (task.status === "TODO") {
        targetList = list1;
      } else if (task.status === "IN_PROGRESS") {
        targetList = list2;
      } else {
        targetList = list3;
      }
      const card = createTaskCard(task);
      targetList.appendChild(card);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Tasks:", error);
  }
}

loadTasks();

async function deleteTask(taskId: number): Promise<void> {
  try {
    const response = await fetch(
      `http://localhost:8080/api/tasks/${taskId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Task konnte nicht gelöscht werden");
    }

    const card = document.getElementById(String(taskId));

    if (card) {
      card.remove();
    }

    console.log("Task gelöscht:", taskId);

  } catch (error) {
    console.error("Fehler beim Löschen der Task:", error);
  }
}