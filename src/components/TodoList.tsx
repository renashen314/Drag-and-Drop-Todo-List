import { useState, useCallback, useMemo } from "react";
import type { TodoProps, TodoStatus } from "../utils/types";
import "../index.css";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "../hooks/useLocalStorage";
import Column from "./Column";

const TodoList = ({ tasks }: { tasks: TodoProps[] }) => {
  const [todos, setTodos] = useLocalStorage("to-do list", tasks);
  const [newTodo, setNewTodo] = useState<string>("");

  const handleAddTodo = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTodos(prev => [...prev, { id: uuidv4(), text: newTodo, status: "to-do" }]);
    setNewTodo("");
  }, [newTodo, setTodos]);

  const handleTodoStatus = useCallback((todo: TodoProps, status: TodoStatus) => {
    setTodos(prev =>
      prev.map(t => (t.id === todo.id ? { ...t, status } : t))
    );
  }, [setTodos]);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, [setTodos]);

  const getTodoPos = (id) => {
    return todos.findIndex((todo) => todo.id === id);
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id === over.id) return;

    setTodos(tasks => {
      const originalPos = getTodoPos(active.id);
      const newPos = getTodoPos(over.id);
      return arrayMove(tasks, originalPos, newPos);
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTodos = useMemo(() => ({
    todo: todos.filter(t => t.status === "to-do"),
    inProgress: todos.filter(t => t.status === "in-progress"),
    done: todos.filter(t => t.status === "done")
  }), [todos]);

  return (
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

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Column
          id="to-do"
          title="To Do"
          status="to-do"
          todos={filteredTodos.todo}
          handleDeleteTodo={handleDeleteTodo}
        />

        <Column
          id="in-progress"
          title="In Progress"
          status="in-progress"
          todos={filteredTodos.inProgress}
          handleDeleteTodo={handleDeleteTodo}
        />

        <Column
          id="done"
          title="Done"
          status="done"
          todos={filteredTodos.done}
          handleDeleteTodo={handleDeleteTodo}
        />
      </DndContext>
    </div>
  );
};

export default TodoList;
