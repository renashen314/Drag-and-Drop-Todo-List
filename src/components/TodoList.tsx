import { useState, useCallback, useMemo, useEffect } from "react";
import type { TodoProps, TodoStatus, ColumnTypes } from "../utils/types";
import "../index.css";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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

const TodoList = () => {
  const [todos, setTodos] = useLocalStorage("to-do list", []);
  const [newTodo, setNewTodo] = useState<string>("");
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [cols, setCols] = useState<ColumnTypes[]>([
    {
      id: "to-do",
      title: "To Do",
      items: [],
    },
    {
      id: "in-progress",
      title: "In Progress",
      items: [],
    },
    {
      id: "done",
      title: "Done",
      items: [],
    },
  ]);

  // Sync cols with todos whenever todos change
  useEffect(() => {
    setCols(prevCols => 
      prevCols.map(col => ({
        ...col,
        items: todos.filter(todo => todo.status === col.id)
      }))
    );
  }, [todos]);

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

  const handleDeleteTodo = useCallback(
    (id: string) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
    [setTodos]
  );

  const handleDragEnd = ({ active, over }:DragEndEvent) => {
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainerId = findContainerId(active.id);
    const overContainerId = findContainerId(over.id);

    if (!activeContainerId || !overContainerId) {
      setActiveId(null);
      return;
    }

    setTodos(
      todos.map((todo) => {
        if (todo.id === active.id) {
          return {
            ...todo,
            status: overContainerId,
          };
        } else {
          return todo;
        }
      })
    );

    if (active.id !== over.id) {
      setTodos((todos) => {
        const originalPos = todos.findIndex(t => t.id === active.id)
        const newPos = todos.findIndex(t => t.id === over.id)
        return arrayMove(todos, originalPos, newPos);
      })
    }

  };

  // const handleDragEnd = (event: DragEndEvent) => {
  //   const { active, over } = event;
  //   if (!over) {
  //     setActiveId(null);
  //     return;
  //   }
    
  //   const activeContainerId = findContainerId(active.id);
  //   const overContainerId = findContainerId(over.id);

  //   if (!activeContainerId || !overContainerId) {
  //     setActiveId(null);
  //     return;
  //   }

  //   // Handle same container reordering
  //   if (activeContainerId === overContainerId && active.id !== over.id) {
  //     const containerIndex = cols.findIndex((c) => c.id === activeContainerId);
  //     if (containerIndex === -1) {
  //       setActiveId(null);
  //       return;
  //     }

  //     const container = cols[containerIndex];
  //     const activeIndex = container.items.findIndex(
  //       (item) => item.id === active.id
  //     );
  //     const overIndex = container.items.findIndex(
  //       (item) => item.id === over.id
  //     );
  //     if (activeIndex !== -1 && overIndex !== -1) {
  //       const newItems = arrayMove(container.items, activeIndex, overIndex);
  //       setCols((cols) => {
  //         return cols.map((c, i) => {
  //           if (i === containerIndex) {
  //             return { ...c, items: newItems };
  //           }
  //           return c;
  //         });
  //       });
  //     }
  //   }
  
    
  //   setActiveId(null);
  // };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeContainerId = findContainerId(active.id);
    const overContainerId = findContainerId(over.id);

    if (!activeContainerId || !overContainerId) return;
    if (activeContainerId === overContainerId && active.id !== over.id) return;
    if (activeContainerId === overContainerId) return;

    setCols((prev) => {
      const activeContainer = prev.find((c) => c.id === activeContainerId);
      if (!activeContainer) return prev;
      
      // Find active item
      const activeItem = activeContainer.items.find(
        (item) => item.id === activeId
      );
      if (!activeItem) return prev;

      const newContainers = prev.map((container) => {
        if (container.id === activeContainerId) {
          return {
            ...container,
            items: container.items.filter((item) => item.id !== activeId),
          };
        }

        if (container.id === overContainerId) {
          if (over.id === overContainerId) {
            return {
              ...container,
              items: [...container.items, activeItem],
            };
          }
          const overItemIndex = container.items.findIndex(
            (item) => item.id === over.id
          );

          if (overItemIndex !== -1) {
            return {
              ...container,
              items: [
                ...container.items.slice(0, overItemIndex + 1),
                activeItem,
                ...container.items.slice(overItemIndex + 1),
              ],
            };
          }
        }
        return container;
      });
      return newContainers;
    });
  };

  // This function prevents item from picking up the over item's id as its new status
  const findContainerId = (itemId) => {
    if (cols.some((col) => col.id === itemId)) {
      return itemId;
    }
    return cols.find((col) => col.items.some((item) => item.id === itemId))?.id;
  };

const getActiveItem = () => {
  for (const col of cols) {
    const item = col.items.find((item) => item.id === activeId)
    if (item) return item
  }
  return null
}

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


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
      <h2 className="todo-title">Todo List</h2>

      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <button type="submit" className="add-todo-button">
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
        <div className="todo-columns">
          {cols.map((col) => (
            <div key={col.id}>
              <Column
                id={col.id}
                title={col.title}
                todos={
                  filteredTodos[
                    col.id === "to-do"
                      ? "todo"
                      : col.id === "in-progress"
                      ? "inProgress"
                      : "done"
                  ]
                }
                handleDeleteTodo={handleDeleteTodo}
              />
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <ItemOverlay>
              {getActiveItem()?.text}
            </ItemOverlay>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

const ItemOverlay = ({children}:{children: React.ReactNode}) => {
  return (
    <div>
      <div className="todo-item-overlay">
        <span className="icon">⋮</span>
        <span>{children}</span>
        <button>
          X
        </button>
      </div>
    </div>
  )
}

export default TodoList;
