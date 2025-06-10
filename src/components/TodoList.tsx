import { useState } from "react";
import type { TodoProps, TodoStatus } from "../utils/types";
import { DndContext } from "@dnd-kit/core";
import { Draggable } from "./Draggable";
import { Droppable } from "./Droppable";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "../hooks/useLocalStorage";

const TodoList = ({ tasks }: { tasks: TodoProps[] }) => {
  const [todos, setTodos] = useLocalStorage("to-do list", tasks);
  const [newTodo, setNewTodo] = useState<string>("");

  function handleAddTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTodos([...todos, { id: uuidv4(), text: newTodo, status: "to-do" }]);
    setNewTodo("");
  }

  function handleTodoStatus(todo: TodoProps, status: TodoStatus) {
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, status: status } : t))
    );
  }

  function handleDeleteTodo(todo: TodoProps) {
    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
  }

  //set-up for drag and drop
  const containers = ["to-do", "in-progress", "done"];
  const [parent, setParent] = useState(null);
  const draggableMarkup = <Draggable id="draggable">Drag me</Draggable>;
  const [isDropped, setIsDropped] = useState(false);

  function handleDragEnd(event) {
    const { over } = event;
    if (over && over.id === "droppable") {
      setIsDropped(true);
    }
    setParent(over ? over.id : null);
  }
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Todo List</h1>

        {/* Form to add new todo */}
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="border px-3 py-2 flex-1 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add To-Do
          </button>
        </form>

        {/* Columns for each status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* To-Do Column */}
          <div>
            <h2 className="text-lg font-semibold mb-2">To Do</h2>
            <ul className="space-y-2">
              {todos
                .filter((t) => t.status === "to-do")
                .map((todo) => (
                  <li key={todo.id} className="border p-2 rounded">
                    {todo.text}
                    <button
                      onClick={()=>handleDeleteTodo(todo)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      X
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* In Progress Column */}
          <div>
            <h2 className="text-lg font-semibold mb-2">In Progress</h2>
            <ul className="space-y-2">
              {todos
                .filter((t) => t.status === "in-progress")
                .map((todo) => (
                  <li key={todo.id} className="border p-2 rounded">
                    {todo.text}
                  </li>
                ))}
            </ul>
          </div>

          {/* Done Column */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Done</h2>
            <ul className="space-y-2">
              {todos
                .filter((t) => t.status === "done")
                .map((todo) => (
                  <li
                    key={todo.id}
                    className="border p-2 rounded line-through text-gray-500"
                  >
                    {todo.text}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        {parent === null ? draggableMarkup : null}

        {containers.map((id) => (
          // We updated the Droppable component so it would accept an `id`
          // prop and pass it to `useDroppable`
          <Droppable key={id} id={id}>
            {parent === id ? draggableMarkup : "Drop here"}
          </Droppable>
        ))}
      </DndContext>
    </>
  );
};

export default TodoList;
