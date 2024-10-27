import { create } from "zustand";
import { Task, TaskStatus } from "@/types/todoType";

interface TaskStore {
  tasks: Task[];
  columns: { id: TaskStatus; title: string }[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addColumn: (title: string) => void;
  deleteColumn: (id: TaskStatus) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  columns: [
    { id: "todo", title: "Todo" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ],
  addTask: (task) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        },
      ],
    })),
  updateTask: (id, updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    })),
  addColumn: (title) =>
    set((state) => ({
      columns: [
        ...state.columns,
        { id: title.toLowerCase().replace(/\s+/g, "-"), title },
      ],
    })),
  deleteColumn: (id) =>
    set((state) => ({
      columns: state.columns.filter((column) => column.id !== id),
      tasks: state.tasks.filter((task) => task.status !== id),
    })),
}));
