import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { generateSeedTasks } from 'app/utils/seedData'

export interface Task {
  id: string
  title: string
  date: string
  completed: boolean
}

interface TasksState {
  items: Task[]
}

const initialState: TasksState = {
  items: generateSeedTasks(new Date().getFullYear()),
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.push(action.payload)
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((task) => task.id !== action.payload)
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.items.findIndex((task) => task.id === action.payload.id)
      if (index !== -1) state.items[index] = action.payload
    },
  },
})

export const { addTask, removeTask, updateTask } = tasksSlice.actions
export default tasksSlice.reducer
