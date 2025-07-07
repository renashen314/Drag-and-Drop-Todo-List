import { useDroppable } from "@dnd-kit/core"

const DropToDelete = () => {
    const { isOver: isOverDeleteArea, setNodeRef: setNodeRefDeleteArea } = useDroppable({
        id: "delete-area",
    })
  return (
    <div
        ref={setNodeRefDeleteArea}
        className="delete-area-style"
        style={{backgroundColor: isOverDeleteArea? "rgba(144, 35, 35, 0.5)" : "#272727"}}
    >Drop Here to Delete</div>
  )
}

export default DropToDelete