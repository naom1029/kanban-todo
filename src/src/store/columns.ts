import { Column } from "@/types/todoType";
import { create } from "zustand";
import { TaskStatus } from "@/types/todoType";

interface ColumnStore {
  columns: Column[];
  setColumns: (columns: Column[]) => void;
  addColumn: (title: string) => void;
  deleteColumn: (id: TaskStatus) => void;
}

export const useColumnStore = create<ColumnStore>((set) => ({
  columns: [],
  setColumns: (columns: Column[]) => set({ columns }),
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
    })),
}));
