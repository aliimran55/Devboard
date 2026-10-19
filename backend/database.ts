import Database from "better-sqlite3";

const db: Database.Database = new Database(
  process.env.DB_PATH ?? "devboard.db"
);

export default db;