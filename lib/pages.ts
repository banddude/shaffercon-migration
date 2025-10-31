import type { WordPressPage, WordPressPost } from "@/types";
import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

function getDb() {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "site.db");
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}

export function getAllPages(): WordPressPage[] {
  const database = getDb();
  const rows = database.prepare("SELECT data FROM pages").all() as { data: string }[];
  return rows.map(row => JSON.parse(row.data) as WordPressPage);
}

export function getAllPosts(): WordPressPost[] {
  const database = getDb();
  const rows = database.prepare("SELECT data FROM posts").all() as { data: string }[];
  return rows.map(row => JSON.parse(row.data) as WordPressPost);
}

export function getPageBySlug(slug: string): WordPressPage | undefined {
  const database = getDb();
  const row = database.prepare("SELECT data FROM pages WHERE slug = ?").get(slug) as { data: string } | undefined;
  return row ? JSON.parse(row.data) as WordPressPage : undefined;
}

export function getPostBySlug(slug: string): WordPressPost | undefined {
  const database = getDb();
  const row = database.prepare("SELECT data FROM posts WHERE slug = ?").get(slug) as { data: string } | undefined;
  return row ? JSON.parse(row.data) as WordPressPost : undefined;
}

export function getAllPageSlugs(): string[] {
  const database = getDb();
  const rows = database.prepare("SELECT slug FROM pages").all() as { slug: string }[];
  return rows.map(row => row.slug);
}

export function getAllPostSlugs(): string[] {
  const database = getDb();
  const rows = database.prepare("SELECT slug FROM posts").all() as { slug: string }[];
  return rows.map(row => row.slug);
}

// Get page by path (handles nested paths like "service-areas/hollywood")
export function getPageByPath(path: string): WordPressPage | undefined {
  const segments = path.split("/").filter(Boolean);
  const slug = segments[segments.length - 1];
  return getPageBySlug(slug);
}

// Get service area pages for a specific location and type
export function getServiceAreaPages(location: string, serviceType: 'residential' | 'commercial'): WordPressPage[] {
  const database = getDb();
  const pattern = `${location}/${serviceType}-%`;
  const rows = database.prepare("SELECT data FROM pages WHERE slug LIKE ?").all(pattern) as { data: string }[];
  return rows.map(row => JSON.parse(row.data) as WordPressPage);
}

// Get all service area pages for a location (both residential and commercial)
export function getAllServiceAreaPages(location: string): { residential: WordPressPage[], commercial: WordPressPage[] } {
  return {
    residential: getServiceAreaPages(location, 'residential'),
    commercial: getServiceAreaPages(location, 'commercial')
  };
}
