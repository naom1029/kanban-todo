import { Task as TaskType } from "@/types/todoType";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Menu, Clock2, Edit2 } from "lucide-react";
import { useTaskStore } from "@/store/tasks";
import { deleteTaskFromDatabase } from "@/services/taskService";
import { useState } from "react";
import EditTaskDialog from "@/components/kanban/EditTaskDialog";

interface TaskProps {
  task: TaskType;
}

export const Task = ({ task }: TaskProps) => {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteButton = () => {
    deleteTask(task.id);
    deleteTaskFromDatabase(task.id, setError);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      parent: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <EditTaskDialog task={task}>
      <Card
        ref={setNodeRef}
        style={style}
        className="mb-2 cursor-move bg-white hover:shadow-md transition-shadow"
        {...attributes}
        {...listeners}
      >
        <CardHeader className="flex-row flex justify-between items-start">
          <div>
            <CardTitle>{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter>
          {task.reminderAt && (
            <div className="text-gray-400">
              <Clock2 />
              <span className="ml-1">{task.reminderAt.toLocaleString()}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </EditTaskDialog>
  );
};
