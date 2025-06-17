import { useState, useCallback, useMemo } from "react";
import type { TodoProps, TodoStatus, ColumnTypes } from "../utils/types";
import "../index.css";
import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "../hooks/useLocalStorage";
import Column from "./Column";



const TodoList = ({ tasks }: { tasks: TodoProps[] }) => {
  const [todos, setTodos] = useLocalStorage("to-do list", tasks);
  const [newTodo, setNewTodo] = useState<string>("");
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [cols, setCols] = useState<ColumnTypes[]>([])

  const handleAddTodo = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setTodos((prev) => [
        ...prev,
        { id: uuidv4(), text: newTodo, status: "to-do" },
      ]);
      setNewTodo("");
    },
    [newTodo, setTodos]
  );

  const handleTodoStatus = useCallback(
    (todo: TodoProps, status: TodoStatus) => {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, status } : t))
      );
    },
    [setTodos]
  );

  const handleDeleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
    [setTodos]
  );

  const getTodoPos = (id) => {
    return todos.findIndex((todo) => todo.id === id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setTodos((tasks) => {
        const originalPos = getTodoPos(active.id);
        const newPos = getTodoPos(over.id);
        return arrayMove(tasks, originalPos, newPos);
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activeContainerId = findContainerId(active.id)
    const overContainerId = findContainerId(over.id)

    if (!activeContainerId || !overContainerId) return
    if (activeContainerId === overContainerId && active.id !== over.id) return
    if (activeContainerId === overContainerId) return

  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainerId = (id) => {

  }

  const filteredTodos = useMemo(
    () => ({
      todo: todos.filter((t) => t.status === "to-do"),
      inProgress: todos.filter((t) => t.status === "in-progress"),
      done: todos.filter((t) => t.status === "done"),
    }),
    [todos]
  );

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        sensors={sensors}
      >
        {cols.map((col) => (
          <div key={col.id} className="todo-columns"> 
            <Column 
              id={col.id}
              title={col.title}
              status={col.id}
              todos={filteredTodos.todo}
              handleDeleteTodo={handleDeleteTodo}
            />
            {col.items.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/30">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drop items here
                </p>
              </div>
            )}
          </div>
        ))}
      </DndContext>
    </div>
  );
};

// const DroppableContainer = ({
//   id,
//   title,
//   items,
// }: {
//   id: string;
//   title: string;
//   items: TodoProps[];
// }) => {
//   const { setNodeRef } = useDroppable({id});
// };
export default TodoList;
