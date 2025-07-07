export type TodoProps = {
    id: string
    text: string
    status: string
}
export type TodoStatus = "to-do" | "in-progress" | "done" ;
export type ColumnTypes = {
    id: TodoStatus
    title: string
    items: TodoProps[]
  }