import TodoList from "./components/TodoList"
import {DndContext} from '@dnd-kit/core';

import {Draggable} from './Draggable';
import {Droppable} from './Droppable';

function App() {
  return (
    <DndContext>
      <Draggable />
      <Droppable />
      <TodoList
  todos={[
	{ id: 1, text: "buy milk", status: "to-do" },
	{ id: 2, text: "wash bike", status: "in-progress" },
	{ id: 3, text: "do the budget", status: "done" },
	{ id: 4, text: "call jane", status: "to-do" },
  ]}
/>
    </DndContext>
  )


}

export default App
