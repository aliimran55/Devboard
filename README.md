# DevBoard

DevBoard is a simple Kanban-style task management application.

## Features

- Create tasks
- Edit tasks
- Delete tasks
- Set task priority
- Change task status
- Drag & Drop between Kanban columns
- Persistent storage with SQLite
- REST API with Express

## Tech Stack

- TypeScript
- Node.js
- Express
- SQLite
- HTML
- CSS
- REST API

## Architecture

Frontend → REST API → Express → SQLite

## How to run

### Backend
```bash
cd backend
npm install
npx tsx server.ts

The backend runs on: 

http//localhost:3000
```

### Frontend

Open `frontend/index.html` with a local development server, for example with the VS Code Live Server extension.
