import Database from "@tauri-apps/plugin-sql";
import { v7 as uuidv7 } from "uuid";
import { Column } from "../types/todoType";

// データベース接続を保持する変数
let db: Database | null = null;

async function initializeDatabase(): Promise<Database> {
  if (!db) {
    try {
      db = await Database.load("sqlite:sqlite.db");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS columns (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      `);
    } catch (error) {
      console.error("データベース接続エラー:", error);
      throw new Error("データベース接続中にエラーが発生しました。");
    }
  }
  return db;
}

export async function addColumnToDatabase(title: string): Promise<Column> {
  try {
    const db = await initializeDatabase();
    const id = uuidv7();
    const createdAt = new Date().toISOString();

    await db.execute(
      `INSERT INTO columns (id, title, createdAt) VALUES (?, ?, ?)`,
      [id, title, createdAt]
    );
    console.log("カラムを追加しました:", { id, title, createdAt });
    return { id, title };
  } catch (error) {
    console.error("カラムの追加に失敗しました:", error);
    throw new Error("カラムの追加中にエラーが発生しました。");
  }
}

export async function getColumns(): Promise<Column[]> {
  try {
    const db = await initializeDatabase();
    const result = await db.select<Column[]>(`SELECT * FROM columns`);
    console.log("カラムを取得しました:", result);
    return result;
  } catch (error) {
    console.error("カラムの取得に失敗しました:", error);
    throw new Error("カラムの取得中にエラーが発生しました。");
  }
}

export async function deleteColumnFromDatabase(id: string): Promise<void> {
  try {
    const db = await initializeDatabase();
    await db.execute(`DELETE FROM columns WHERE id = ?`, [id]);
    console.log("カラムを削除しました:", id);
  } catch (error) {
    console.error("カラムの削除に失敗しました:", error);
    throw new Error("カラムの削除中にエラーが発生しました。");
  }
}
