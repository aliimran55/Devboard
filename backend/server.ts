import express from "express";
import cors from "cors";
import db from "./database";

const app = express();

app.use(express.json());
app.use(cors());

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT NOT NULL
  )
`);
try {
    db.exec(`
        ALTER TABLE tasks
        ADD COLUMN status TEXT NOT NULL DEFAULT 'TODO'
    `);
} catch {
    // Spalte existiert bereits
}

app.get("/", (req, res) => {
  res.send("Hello from DevBoard Backend!");
});

app.get("/api/tasks", (req, res) =>{
    const tasks = db.prepare("SELECT * FROM tasks").all();
    res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
    const { title, priority, status } = req.body;

    if (!title || typeof title !== "string") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    if (!["high", "medium", "low"].includes(priority)) {
        return res.status(400).json({
            error: "Priority not valid"
        });
    }
    
    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
    return res.status(400).json({
        error: "Status not valid"
    });
    }

    const result = db
         .prepare('INSERT INTO tasks (title, priority, "status") VALUES (?, ?, ?)')
        .run(title, priority, status);

    res.status(201).json({
        id: result.lastInsertRowid,
        title,
        priority,
        status
    });
});

app.put("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title, priority, status } = req.body;

    if (!title || typeof title !== "string") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    if (!["high", "medium", "low"].includes(priority)) {
        return res.status(400).json({
            error: "Priority not valid"
        });
    }
    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        return res.status(400).json({
            error: "Status not valid"
            });
    }

    const result = db
        .prepare('UPDATE tasks SET title = ?, priority = ?, "status" = ? WHERE id = ?')
        .run(title, priority, status, id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json({
        id: Number(id),
        title,
        priority,
        status
    });
});

app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;

    const result = db
        .prepare("DELETE FROM tasks WHERE id = ?")
        .run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.status(204).send();
});


app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});