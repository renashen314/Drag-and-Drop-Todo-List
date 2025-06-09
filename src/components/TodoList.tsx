import { useState } from "react"
import type { TodoProps } from "../utils/types"

const TodoList = ({todos}: {todos: TodoProps[]}) => {
    const [todos, setTodos] = useState<TodoProps>()
    
  return (
    <div>TodoList</div>
  )
}

export default TodoList