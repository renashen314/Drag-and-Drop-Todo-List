import { useDroppable } from "@dnd-kit/core"

const DropToDelete = () => {
    const { isOver: isOverDeleteArea, setNodeRef: setNodeRefDeleteArea } = useDroppable({
        id: "droppable-delete",
    })
  return (
    <div
        ref={setNodeRefDeleteArea}
        className={`${isOverDeleteArea ? "red" : "floralwhite"}`}
    >Drop Here to Delete</div>
  )
}

export default DropToDelete