"use client";

import React from "react";
import { useParams } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

const GroupTasks = () => {
  const params = useParams();
  const { groupId } = params;

  return (
    <div>
      <h1>Group {groupId} Tasks</h1>
      <KanbanBoard groupId={groupId} />
    </div>
  );
};

export default GroupTasks;
