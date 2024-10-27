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
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="w-80 bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddTask}
          className="h-8 w-8"
        >
          <Plus size={16} />
        </Button>
      </div>
      <div ref={setNodeRef} className="min-h-[200px]">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
