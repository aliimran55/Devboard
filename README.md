# DevBoard

Eine Full-Stack-Anwendung zur Verwaltung von Aufgaben im Kanban-Stil.

## Features

- Aufgaben erstellen, bearbeiten und löschen
- Aufgaben nach Status und Prioritiät verwalten
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

### Option 1: Run with Docker (Recommended)

#### Start the application

Clone the repository:

```bash
git clone https://github.com/aliimran55/Devboard.git
cd Devboard
```

Build the Docker images and start the containers:

```bash
docker compose up --build
```

Access the application

- Frontend: http://localhost:8080
- Backend: http://localhost:3000

### Option 2: Run Locally

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
