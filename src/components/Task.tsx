import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import "../index.css";

interface TaskProps {
  id: string;
  text: string;
  handleDeleteTodo: (id: string) => void;
}

const Task = ({ id, text, handleDeleteTodo }: TaskProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div>
      <li className="todo-item" ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <span className="icon">⋮</span>
        <span>{text}</span>
        <button onClick={() => handleDeleteTodo(id)} className="delete-btn">
          X
        </button>
      </li>
    </div>
  );
};

export default Task;
