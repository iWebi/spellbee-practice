// Storage utilities for user progress tracking

export interface WordAttempt {
  word: string
  correct: boolean
  userAnswer: string
  timestamp: number
}

export interface DayProgress {
  date: string // YYYY-MM-DD format
  gradeLevel: string
  attempts: WordAttempt[]
  score: number
  totalAttempts: number
}

export interface UserData {
  username: string
  history: DayProgress[]
}

const STORAGE_KEY = 'spellbee_users'
const CURRENT_USER_KEY = 'spellbee_current_user'

// Get all users from localStorage
export const getAllUsers = (): Record<string, UserData> => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

// Save all users to localStorage
const saveAllUsers = (users: Record<string, UserData>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

// Get current user
export const getCurrentUser = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY)
}

// Set current user
export const setCurrentUser = (username: string) => {
  localStorage.setItem(CURRENT_USER_KEY, username)
}

// Clear current user
export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// Get user data
export const getUserData = (username: string): UserData | null => {
  const users = getAllUsers()
  return users[username] || null
}

// Create or get user
export const createUser = (username: string): UserData => {
  const users = getAllUsers()
  
  if (!users[username]) {
    users[username] = {
      username,
      history: []
    }
    saveAllUsers(users)
  }
  
  return users[username]
}

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Get today's progress for a user
export const getTodayProgress = (username: string, gradeLevel: string): DayProgress | null => {
  const userData = getUserData(username)
  if (!userData) return null
  
  const today = getTodayDate()
  return userData.history.find(
    day => day.date === today && day.gradeLevel === gradeLevel
  ) || null
}

// Save word attempt
export const saveWordAttempt = (
  username: string,
  gradeLevel: string,
  word: string,
  correct: boolean,
  userAnswer: string
) => {
  const users = getAllUsers()
  const userData = users[username] || createUser(username)
  const today = getTodayDate()
  
  // Find or create today's progress
  let todayProgress = userData.history.find(
    day => day.date === today && day.gradeLevel === gradeLevel
  )
  
  if (!todayProgress) {
    todayProgress = {
      date: today,
      gradeLevel,
      attempts: [],
      score: 0,
      totalAttempts: 0
    }
    userData.history.push(todayProgress)
  }
  
  // Check if this word was already attempted today
  const existingAttemptIndex = todayProgress.attempts.findIndex(
    attempt => attempt.word.toLowerCase() === word.toLowerCase()
  )
  
  if (existingAttemptIndex !== -1) {
    // Update existing attempt
    const oldAttempt = todayProgress.attempts[existingAttemptIndex]
    
    // Update score if status changed
    if (oldAttempt.correct && !correct) {
      todayProgress.score-- // Was correct, now incorrect
    } else if (!oldAttempt.correct && correct) {
      todayProgress.score++ // Was incorrect, now correct
    }
    
    // Update the attempt with new data
    todayProgress.attempts[existingAttemptIndex] = {
      word,
      correct,
      userAnswer,
      timestamp: Date.now()
    }
  } else {
    // Add new attempt
    todayProgress.attempts.push({
      word,
      correct,
      userAnswer,
      timestamp: Date.now()
    })
    
    todayProgress.totalAttempts++
    if (correct) {
      todayProgress.score++
    }
  }
  
  users[username] = userData
  saveAllUsers(users)
}

// Get last 7 days progress
export const getLast7DaysProgress = (username: string): DayProgress[] => {
  const userData = getUserData(username)
  if (!userData) return []
  
  const today = new Date()
  const last7Days: string[] = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    last7Days.push(date.toISOString().split('T')[0])
  }
  
  return userData.history
    .filter(day => last7Days.includes(day.date))
    .sort((a, b) => b.date.localeCompare(a.date)) // Most recent first
}

// Get misspelled words for a specific day
export const getMisspelledWords = (username: string, date: string, gradeLevel: string): WordAttempt[] => {
  const userData = getUserData(username)
  if (!userData) return []
  
  const dayProgress = userData.history.find(
    day => day.date === date && day.gradeLevel === gradeLevel
  )
  
  if (!dayProgress) return []
  
  return dayProgress.attempts.filter(attempt => !attempt.correct)
}

// Get all users list
export const getUsersList = (): string[] => {
  const users = getAllUsers()
  return Object.keys(users)
}

// Delete user data
export const deleteUser = (username: string): boolean => {
  const users = getAllUsers()
  
  if (users[username]) {
    delete users[username]
    saveAllUsers(users)
    
    // Clear current user if it's the one being deleted
    const currentUser = getCurrentUser()
    if (currentUser === username) {
      clearCurrentUser()
    }
    
    return true
  }
  
  return false
}

// Clear all data for a user (keep user but remove history)
export const clearUserHistory = (username: string): boolean => {
  const users = getAllUsers()
  
  if (users[username]) {
    users[username].history = []
    saveAllUsers(users)
    return true
  }
  
  return false
}
