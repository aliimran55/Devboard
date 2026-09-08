import Database from "better-sqlite3";

const db : Database.Database = new Database("devboard.db");

export default db;