import { useState } from "react";
import type { TodoProps, TodoStatus } from "../utils/types";
import "../index.css"
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "../hooks/useLocalStorage";
import Task from "./Task";

const TodoList = ({ tasks }: { tasks: TodoProps[] }) => {
  const [todos, setTodos] = useLocalStorage("to-do list", tasks);
  const [newTodo, setNewTodo] = useState<string>("");
  //set-up for drag and drop
  // const containers = ["to-do", "in-progress", "done"];
  const [parent, setParent] = useState(null);
  // const [isDropped, setIsDropped] = useState(false);

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

  function handleDeleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function getTodoPos(id) {
    return todos.findIndex((todo) => todo.id === id);
  }
  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id == over.id) return;
    setTodos((todos) => {
      const originalPos = getTodoPos(active.id);
      const newPos = getTodoPos(over.id);
      return arrayMove(todos, originalPos, newPos);
    });

    setParent(over ? over.id : null);
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <div className="todo-container">
        <h1 className="todo-title">Todo List</h1>

        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="todo-input"
          />
          <button type="submit" className="todo-button">
            Add To-Do
          </button>
        </form>
        {/* drag and drop feature avaliable and starts here */}
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          {/* Columns for each status */}
          <div className="todo-columns">
            {/* To-Do Column */}
            <div>
              <h2 className="todo-column-title">To Do</h2>
              <ul className="todo-list">
                <SortableContext
                  items={todos}
                  strategy={verticalListSortingStrategy}
                >
                  {todos
                    .filter((t: TodoProps) => t.status === "to-do")
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

            {/* In Progress Column */}
            <div>
            <h2 className="todo-column-title">In Progress</h2>
            <ul className="todo-list">
                {todos
                  .filter((t) => t.status === "in-progress")
                  .map((todo) => (
                    <Task
                        id={todo.id}
                        key={todo.id}
                        text={todo.text}
                        handleDeleteTodo={handleDeleteTodo}
                      />
                  ))}
              </ul>
            </div>

            {/* Done Column */}
            <div>
              <h2 className="todo-column-title">Done</h2>
              <ul className="todo-list">
                {todos
                  .filter((t) => t.status === "done")
                  .map((todo) => (
                    <Task
                        id={todo.id}
                        key={todo.id}
                        text={todo.text}
                        handleDeleteTodo={handleDeleteTodo}
                      />
                  ))}
              </ul>
            </div>
          </div>
        </DndContext>
      </div>
    </>
  );
};

export default TodoList;
