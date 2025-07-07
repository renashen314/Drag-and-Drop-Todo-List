import { useState, useCallback, useMemo, useEffect } from "react";
import type { ColumnTypes } from "../utils/types";
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
import DropToDelete from "./DropToDelete";

const TodoList = () => {
  const [tasks, setTodos] = useLocalStorage("to-do list", []);
  const [newTodo, setNewTodo] = useState<string>("");
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [containers, setContainers] = useState<ColumnTypes[]>([
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

  // Sync containers with tasks whenever tasks change
  useEffect(() => {
    setContainers(prev => 
      prev.map(con => ({
        ...con,
        items: tasks.filter(task => task.status === con.id)
      }))
    );
  }, [tasks]);

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
    (id: UniqueIdentifier) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    },
    [setTodos]
  );

const handleUpdateStatus = useCallback((activeId: UniqueIdentifier, overContainerId: UniqueIdentifier) => {
  setTodos(
    tasks.map((task) => {
      if (task.id === activeId) {
        return {
          ...task,
          status: overContainerId,
        };
      } else {
        return task;
      }
    })
  );
}, [setTodos, tasks]);

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

    if (active.id !== over.id) {
      setTodos((tasks) => {
        const originalPos = tasks.findIndex(t => t.id === active.id)
        const newPos = tasks.findIndex(t => t.id === over.id)
        return arrayMove(tasks, originalPos, newPos);
      })
    }
    if (overContainerId === "delete-area") {
      handleDeleteTodo(active.id);
      setActiveId(null);
      return
    } else {
      handleUpdateStatus(active.id, overContainerId);
    }

  };



  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    // const { active, over } = event;
    // if (!over) return;
    
    // const activeContainerId = findContainerId(active.id);
    // const overContainerId = findContainerId(over.id);

    // if (!activeContainerId || !overContainerId) return;
    // if (activeContainerId === overContainerId && active.id !== over.id) return;
    // if (activeContainerId === overContainerId) return;

    // setContainers((prev) => {
    //   const activeContainer = prev.find((c) => c.id === activeContainerId);
    //   if (!activeContainer) return prev;
      
    //   // Find active item
    //   const activeItem = activeContainer.items.find(
    //     (item) => item.id === active.id
    //   );
    //   if (!activeItem) return prev;

    //   const newContainers = prev.map((container) => {
    //     if (container.id === activeContainerId) {
    //       return {
    //         ...container,
    //         items: container.items.filter((item) => item.id !== active.id),
    //       };
    //     }

    //     if (container.id === overContainerId) {
    //       if (over.id === overContainerId) {
    //         return {
    //           ...container,
    //           items: [...container.items, activeItem],
    //         };
    //       }
    //       const overItemIndex = container.items.findIndex(
    //         (item) => item.id === over.id
    //       );

    //       if (overItemIndex !== -1) {
    //         return {
    //           ...container,
    //           items: [
    //             ...container.items.slice(0, overItemIndex + 1),
    //             activeItem,
    //             ...container.items.slice(overItemIndex + 1),
    //           ],
    //         };
    //       }
    //     }
    //     return container;
    //   });
    //   return newContainers;
    // });
  };

  const handleDragCancel = (event: DragEndEvent) => {
    void event
    setActiveId(null)
  }

  // This function prevents item from picking up the over item's id as its new status
  const findContainerId = (itemId) => {
    if (containers.some((container) => container.id === itemId)) {
      return itemId;
    }
    return containers.find((container) => container.items.some((item) => item.id === itemId))?.id;
  };

const getActiveItem = () => {
  for (const container of containers) {
    const item = container.items.find((item) => item.id === activeId)
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
      task: tasks.filter((t) => t.status === "to-do"),
      inProgress: tasks.filter((t) => t.status === "in-progress"),
      done: tasks.filter((t) => t.status === "done"),
    }),
    [tasks]
  );

  return (
    <div className="app-container">
      <h2 className="task-title">Todo List</h2>

      <form onSubmit={handleAddTodo} className="task-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="task-input"
        />
        <button type="submit" className="add-task-button">
          Add To-Do
        </button>
      </form>
      <div className="area-container">
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        sensors={sensors}
      >
       
        <div className="task-columns">
          {containers.map((container) => (
            <div key={container.id}>
              <Column
                id={container.id}
                title={container.title}
                tasks={
                  filteredTodos[
                    container.id === "to-do"
                      ? "task"
                      : container.id === "in-progress"
                      ? "inProgress"
                      : "done"
                  ]
                }
                handleDeleteTodo={handleDeleteTodo}
              />
            </div>
          ))}
        </div>
        <DropToDelete />
        <DragOverlay
        dropAnimation={{
          duration:150,
        }}>
          {activeId ? (
            <ItemOverlay>
              {getActiveItem()?.text}
            </ItemOverlay>
          ) : null}
        </DragOverlay>
      </DndContext>
        </div>
    </div>
  );
};

const ItemOverlay = ({children}:{children: React.ReactNode}) => {
  return (
    <div>
      <div className="task-item-overlay">
        <span className="icon">⋮</span>
        <span>{children}</span>
        <button className="delete-btn">
          X
        </button>
      </div>
    </div>
  )
}

export default TodoList;
