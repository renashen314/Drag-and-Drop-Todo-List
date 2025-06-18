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
  todos: TodoProps[];
  title: string;
  handleDeleteTodo: (id: string) => void;
}

const Column = ({ id, todos, title, handleDeleteTodo }: ColumnProps) => {
  const {isOver, setNodeRef} = useDroppable({id})
  return (
    <>
        <div className="todo-col" ref={setNodeRef} style={{backgroundColor: isOver? "rgba(91, 120, 160, 0.5)" : "rgba(31, 41, 55, 0.5)"}}>
          <div>
            <h2 className="todo-column-title">{title}</h2>
              <SortableContext
                items={todos.map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
            <ul>
                {todos
                  .map((todo: TodoProps) => (
                    <Task
                      id={todo.id}
                      key={todo.id}
                      text={todo.text}
                      handleDeleteTodo={handleDeleteTodo}
                    />
                  ))}
            </ul>
              </SortableContext>
          </div>
        </div>
    </>
  );
};
  
// function ColumnsDroppables(cols: TodoStatus[]) {
//     return (
//       <section>
//         {cols.map((id) => (
//           <Droppable id={id} key={id}>
//             Droppable container id: ${id}
//           </Droppable>
//         ))}
//       </section>
//     );
//   }

export default Column;
