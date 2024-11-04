import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "./Task";
import { Column as ColumnType, Task as TaskType } from "@/types/todoType";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ColumnProps {
  column: ColumnType;
  tasks: TaskType[];
  onAddTask: () => void;
}

export const Column = ({ column, tasks, onAddTask }: ColumnProps) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      columnId: column.id,
    },
  });

  return (
    <div
      ref={setDroppableNodeRef}
      className="w-80 bg-gray-50 rounded-lg p-4 min-h-full"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
      </div>
      <div className="min-h-[400px] relative">
        <SortableContext
          id={column.id}
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onAddTask}
        className="h-8 w-8 absolute bottom-2 left-2"
      >
        <Plus size={16} />
      </Button>
    </div>
  );
};
