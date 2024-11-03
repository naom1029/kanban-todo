import Database from "@tauri-apps/plugin-sql";
import { v7 as uuidv7 } from "uuid";
import { Task, TaskStatus } from "../types/todoType";

// データベース接続を保持する変数
let db: Database | null = null;

async function initializeDatabase(): Promise<Database> {
  if (!db) {
    try {
      db = await Database.load("sqlite:sqlite.db");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          completedAt TEXT,
          reminderAt TEXT
        )
      `);
    } catch (error) {
      console.error("データベース接続エラー:", error);
      throw new Error("データベース接続中にエラーが発生しました。");
    }
  }
  return db;
}

// タスクをデータベースからロードする関数
export const loadTasksFromDatabase = async (): Promise<Task[]> => {
  if (!db) {
    db = await initializeDatabase();
  }
  try {
    const results = await db.select<any[]>(`
      SELECT id, title, description, status, createdAt, completedAt, reminderAt
      FROM tasks
    `);

    return results.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdAt: new Date(row.createdAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      reminderAt: row.reminderAt ? new Date(row.reminderAt) : undefined,
    }));
  } catch (error) {
    console.error("タスクのデータベース読み込みに失敗しました:", error);
    throw new Error("タスクの読み込み中にエラーが発生しました。");
  }
};

// 新しいタスクをデータベースに追加する関数
export const addTaskToDatabase = async (
  taskTitle: string,
  description: string,
  status: TaskStatus,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);

  if (taskTitle !== "") {
    const newTask: Task = {
      id: uuidv7(),
      title: taskTitle,
      description,
      status,
      createdAt: new Date(),
      completedAt: undefined,
      reminderAt: undefined,
    };

    try {
      const db = await initializeDatabase();
      await db.execute(
        `
        INSERT INTO tasks (id, title, description, status, createdAt, completedAt, reminderAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          newTask.id,
          newTask.title,
          newTask.description,
          newTask.status,
          newTask.createdAt.toISOString(),
          null,
          null,
        ]
      );
      console.log("データベースにタスクを追加しました:", newTask);
    } catch (error) {
      console.error(
        "データベースにタスクを追加中にエラーが発生しました:",
        error
      );
      setError("タスクの追加中にエラーが発生しました");
    }
  }
};

// タスクを更新する関数
export const updateTaskInDatabase = async (
  id: string,
  updates: Partial<Task>,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);
  if (!db) {
    db = await initializeDatabase();
  }
  try {
    // 更新するフィールドを抽出
    const entries = Object.entries(updates).filter(
      ([, value]) => value !== undefined
    );
    // フィールド名と値をそれぞれの配列に分離
    const fields = entries.map(([key]) => `${key} = ?`);
    const values = entries.map(([key, value]) =>
      value instanceof Date ? value.toISOString() : value
    );

    if (fields.length > 0) {
      values.push(id);
      await db.execute(
        `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
        values
      );
      console.log("タスクの更新に成功しました");
    } else {
      console.error("更新するフィールドがありません");
    }
  } catch (error) {
    console.error("タスクの更新中にエラーが発生しました:", error);
    setError("タスクの更新中にエラーが発生しました");
  }
};

// タスクを削除する関数
export const deleteTaskFromDatabase = async (
  id: string,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);

  try {
    if (!db) {
      db = await initializeDatabase();
    }
    await db.execute(`DELETE FROM tasks WHERE id = ?`, [id]);
    console.log("タスクを削除しました:", id);
  } catch (error) {
    console.error("タスクの削除中にエラーが発生しました:", error);
    setError("タスクの削除中にエラーが発生しました");
  }
};
