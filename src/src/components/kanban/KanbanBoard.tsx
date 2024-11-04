"use client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "./Column";
import { useState, useEffect, useMemo } from "react";
import { Task as TaskType, TaskStatus } from "@/types/todoType";
import { useTaskStore } from "@/store/tasks";
import { useColumnStore } from "@/store/columns";
import { Task } from "./Task";
import { AddTaskDialog } from "./AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  addColumnToDatabase,
  deleteColumnFromDatabase,
  getColumns,
} from "@/services/columnService";
import {
  loadTasksFromDatabase,
  updateTaskInDatabase,
} from "@/services/taskService";

export const KanbanBoard = () => {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [addingToStatus, setAddingToStatus] = useState<TaskStatus | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const tasks = useTaskStore((state) => state.tasks);
  const columns = useColumnStore((state) => state.columns);
  const moveTask = useTaskStore((state) => state.moveTask);
  const addColumn = useColumnStore((state) => state.addColumn);
  const deleteColumn = useColumnStore((state) => state.deleteColumn);
  const setTasks = useTaskStore((state) => state.setTasks);
  const setColumns = useColumnStore((state) => state.setColumns);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const fetchTasksAndColumns = async () => {
      try {
        const [loadedTasks, loadedColumns] = await Promise.all([
          loadTasksFromDatabase(),
          getColumns(),
        ]);
        setTasks(loadedTasks);
        setColumns(loadedColumns);
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchTasksAndColumns();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !active.id) {
      return;
    }
    let newStatus: TaskStatus | null = null;
    // ドロップ先がタスクの場合
    if (over.data.current?.type === "Task") {
      newStatus = over.data.current.parent;
    }
    // ドロップ先がカラムの場合
    else if (over.data.current?.type === "Column") {
      newStatus = over.data.current.columnId;
    }

    if (newStatus && active.id !== over.id) {
      // ステータスの更新
      moveTask(active.id as string, newStatus as TaskStatus);
      updateTaskInDatabase(
        active.id as string,
        { status: newStatus },
        setError
      );
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newColumnTitle.trim();
    if (title) {
      // 重複チェック
      const exists = columns.some(
        (col) => col.title.toLowerCase() === title.toLowerCase()
      );
      if (exists) {
        setError("同じ名前のカラムが既に存在します");
        return;
      }
      try {
        await addColumnToDatabase(title);
        addColumn(title);
        setNewColumnTitle("");
        setError("");
      } catch (error) {
        setError((error as Error).message);
      }
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const tasksInColumn = tasks.filter(
      (task) => task.status === columnId
    ).length;
    if (tasksInColumn > 0) {
      setError("タスクが存在するカラムは削除できません");
      return;
    }
    try {
      await deleteColumnFromDatabase(columnId);
      deleteColumn(columnId);
    } catch (error) {
      setError((error as Error).message);
    }
  };
  const tasksByColumn = useMemo(() => {
    return columns.reduce(
      (acc, column) => {
        acc[column.id] = tasks.filter((task) => task.status === column.id);
        return acc;
      },
      {} as Record<string, TaskType[]>
    );
  }, [tasks, columns]);
  return (
    <div className="p-8">
      <form onSubmit={handleAddColumn} className="mb-6">
        <div className="flex gap-2">
          <Input
            value={newColumnTitle}
            onChange={(e) => {
              setNewColumnTitle(e.target.value);
              setError(null);
            }}
            placeholder="新しいカラム名"
            className="max-w-xs"
          />
          <Button type="submit" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            カラムを追加
          </Button>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </form>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="relative">
              <Column
                column={column}
                tasks={tasksByColumn[column.id]}
                onAddTask={() => setAddingToStatus(column.id)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => handleDeleteColumn(column.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
        <DragOverlay>{activeTask && <Task task={activeTask} />}</DragOverlay>
      </DndContext>
      <AddTaskDialog
        status={addingToStatus || "todo"}
        isOpen={addingToStatus !== null}
        onClose={() => setAddingToStatus(null)}
      />
    </div>
  );
};
