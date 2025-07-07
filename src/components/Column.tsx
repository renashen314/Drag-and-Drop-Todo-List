import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TodoProps, TodoStatus } from "../utils/types";
import "../index.css";
import Task from "./Task";
import { useDroppable } from "@dnd-kit/core";

interface ColumnProps {
  id: TodoStatus;
  tasks: TodoProps[];
  title: string;
  handleDeleteTodo: (id: string) => void;
}

const Column = ({ id, tasks, title, handleDeleteTodo }: ColumnProps) => {
  const {isOver, setNodeRef} = useDroppable({id})
  return (
    <>
        <div className="task-container" ref={setNodeRef} style={{backgroundColor: isOver? "rgba(91, 120, 160, 0.5)" : "rgba(31, 41, 55, 0.5)"}}>
            <h2 className="task-column-title">{title}</h2>
              <SortableContext
                items={tasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
            <ul className="task-list">
                {tasks
                  .map((task: TodoProps) => (
                    <Task
                      id={task.id}
                      key={task.id}
                      text={task.text}
                      handleDeleteTodo={handleDeleteTodo}
                    />
                  ))}
            </ul>
              </SortableContext>
          
        </div>
    </>
  );
};

export default Column;
