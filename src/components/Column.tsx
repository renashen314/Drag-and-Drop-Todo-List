import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TodoProps, TodoStatus } from "../utils/types";
import {Droppable} from "./Droppable"
import "../index.css";
import Task from "./Task";
import { useState } from "react";

interface ColumnProps {
  id: string;
  status: TodoStatus;
  todos: TodoProps[];
  title: string;
  handleDeleteTodo: (id: string) => void;
}

const Column = ({ id, status, todos, title, handleDeleteTodo }: ColumnProps) => {
    const [parent, setParent] = useState<TodoStatus>(status);


  return (
    <>
        <div className="todo-columns">
          <div>
            <h2 className="todo-column-title">{title}</h2>
            <ul className="todo-list">
              <SortableContext
                items={todos}
                strategy={verticalListSortingStrategy}
              >
               
                {todos
                  .map((todo: TodoProps) => (
                    <Task
                      id={todo.id}
                      key={todo.id}
                      text={todo.text}
                      handleDeleteTodo={handleDeleteTodo}
                    />
                  ))}
              </SortableContext>
            </ul>
          </div>
        </div>
    </>
  );
};
  
function ColumnsDroppables(cols: TodoStatus[]) {
    return (
      <section>
        {cols.map((id) => (
          <Droppable id={id} key={id}>
            Droppable container id: ${id}
          </Droppable>
        ))}
      </section>
    );
  }

export default Column;
