import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "site.db");
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY,
    date TEXT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY,
    date TEXT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    content TEXT,
    data TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
  CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
`);

export default db;
