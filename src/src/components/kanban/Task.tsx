import { Task as TaskType } from "@/types/todoType";
import { Card } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { useTaskStore } from "@/store/tasks";

interface TaskProps {
  task: TaskType;
}

export const Task = ({ task }: TaskProps) => {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 mb-2 cursor-move bg-white hover:shadow-md transition-shadow"
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm">{task.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
        </div>
        <button
          onClick={() => deleteTask(task.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
};
