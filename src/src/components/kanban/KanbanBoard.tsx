"use client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column } from "./Column";
import { useState } from "react";
import { Task as TaskType, TaskStatus } from "@/types/todoType";
import { useTaskStore } from "@/store/tasks";
import { Task } from "./Task";
import { AddTaskDialog } from "./AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export const KanbanBoard = () => {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [addingToStatus, setAddingToStatus] = useState<TaskStatus | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const tasks = useTaskStore((state) => state.tasks);
  const columns = useTaskStore((state) => state.columns);
  const moveTask = useTaskStore((state) => state.moveTask);
  const addColumn = useTaskStore((state) => state.addColumn);
  const deleteColumn = useTaskStore((state) => state.deleteColumn);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newStatus = over.id as TaskStatus;
      moveTask(active.id as string, newStatus);
    }
    setActiveTask(null);
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
      addColumn(title);
      setNewColumnTitle("");
      setError("");
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    const tasksInColumn = tasks.filter(
      (task) => task.status === columnId
    ).length;
    if (tasksInColumn > 0) {
      setError("タスクが存在するカラムは削除できません");
      return;
    }
    deleteColumn(columnId);
  };

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="relative">
              <Column
                column={column}
                tasks={tasks.filter((task) => task.status === column.id)}
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
