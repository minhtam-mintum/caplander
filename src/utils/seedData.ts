import type { Task } from 'app/store/slices/tasksSlice'

function rand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function generateSeedTasks(year: number): Task[] {
  const tasks: Task[] = []
  let id = 0
  const busyMonths = new Set([0, 3, 4, 8, 9])

  for (let month = 0; month < 12; month++) {
    const days = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= days; day++) {
      const r = rand(year * 10000 + month * 100 + day)
      const multiplier = busyMonths.has(month) ? 1.5 : 1
      const count = Math.floor(r * 7 * multiplier)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      for (let i = 0; i < count; i++) {
        tasks.push({ id: `seed-${id++}`, title: `Task ${id}`, date: dateStr, completed: r > 0.5 })
      }
    }
  }
  return tasks
}
