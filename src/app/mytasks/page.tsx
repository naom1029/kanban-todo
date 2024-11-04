"use client";

import React from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

const MyTasks = () => {
  return (
    <div>
      <h1>My Tasks</h1>
      <KanbanBoard />
    </div>
  );
};

export default MyTasks;
