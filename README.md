# DevBoard

Eine Full-Stack-Anwendung zur Verwaltung von Aufgaben im Kanban-Stil.

## Features

- Aufgaben erstellen, bearbeiten und löschen
- Aufgaben nach Statis und Prioritiät verwalten
- Drap & Drop
- Persistente Speicherung der Aufgaben

## Tech Stack

- Frontend: TypeScript
- Backend: Node.js, Express
- API: REST
- Datenbank: SQLite

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
