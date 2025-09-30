import type { Station } from "./types"
import { STORAGE_KEY } from "./data"

// Progress is a flat map of taskId -> true if completed
type Progress = Record<string, boolean>

/**
 * Read saved progress from localStorage
 */
export function readProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

/**
 * Write progress back to localStorage
 */
export function writeProgress(progress: Progress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

/**
 * Check if a task is marked as completed
 */
export function isDone(taskId: string): boolean {
  const progress = readProgress()
  return !!progress[taskId]
}

/**
 * Mark a task as completed
 */
export function setDone(taskId: string): void {
  const progress = readProgress()
  progress[taskId] = true
  writeProgress(progress)
}

/**
 * Check if all tasks in a station are completed
 */
export function stationFinished(station: Station): boolean {
  const progress = readProgress()
  return station.tasks.every(task => progress[task.id])
}

/**
 * Count how many tasks in a station are completed
 */
export function stationProgress(station: Station): { done: number, total: number } {
  const progress = readProgress()
  let completedCount = 0
  for (const task of station.tasks) {
    if (progress[task.id]) completedCount++
  }
  return { done: completedCount, total: station.tasks.length }
}
