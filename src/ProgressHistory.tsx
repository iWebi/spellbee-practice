import { useState, useEffect } from 'react'
import type { DayProgress, WordAttempt } from './storage'
import { getLast7DaysProgress } from './storage'

interface ProgressHistoryProps {
  username: string
  onClose: () => void
  onRetryWords: (words: string[]) => void
}

export default function ProgressHistory({ username, onClose, onRetryWords }: ProgressHistoryProps) {
  const [history, setHistory] = useState<DayProgress[]>([])
  const [selectedDay, setSelectedDay] = useState<DayProgress | null>(null)

  useEffect(() => {
    const last7Days = getLast7DaysProgress(username)
    setHistory(last7Days)
  }, [username])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today'
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  const getMisspelledWords = (day: DayProgress): WordAttempt[] => {
    return day.attempts.filter(attempt => !attempt.correct)
  }

  const handleRetryMisspelled = (day: DayProgress) => {
    const misspelled = getMisspelledWords(day)
    const words = misspelled.map(attempt => attempt.word)
    onRetryWords(words)
  }

  if (selectedDay) {
    const misspelled = getMisspelledWords(selectedDay)
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>📅 {formatDate(selectedDay.date)}</h2>
            <button
              onClick={() => setSelectedDay(null)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Grade:</strong> {selectedDay.gradeLevel}
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <strong>Score:</strong> {selectedDay.score} / {selectedDay.totalAttempts} ({Math.round((selectedDay.score / selectedDay.totalAttempts) * 100)}%)
            </p>
          </div>

          {misspelled.length > 0 ? (
            <>
              <h3 style={{ marginBottom: '1rem' }}>❌ Misspelled Words ({misspelled.length})</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                {misspelled.map((attempt, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: '#ffebee',
                      borderRadius: '6px',
                      borderLeft: '4px solid #f44336'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ color: '#d32f2f' }}>Correct:</strong> {attempt.word}
                      </div>
                      <div>
                        <strong>Your answer:</strong> {attempt.userAnswer || '(skipped)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleRetryMisspelled(selectedDay)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🔄 Retry These Words
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#4CAF50' }}>
              <h3>🎉 Perfect Score!</h3>
              <p>No misspelled words on this day.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>📊 Progress History</h2>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Close
          </button>
        </div>

        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          Viewing last 7 days for <strong>{username}</strong>
        </p>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <p>No practice history yet. Start practicing to see your progress!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {history.map((day, index) => {
              const misspelledCount = getMisspelledWords(day).length
              const percentage = Math.round((day.score / day.totalAttempts) * 100)
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4CAF50'
                    e.currentTarget.style.backgroundColor = '#e8f5e9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{formatDate(day.date)}</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                        Grade {day.gradeLevel}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: percentage >= 80 ? '#4CAF50' : percentage >= 60 ? '#FF9800' : '#f44336' }}>
                        {day.score} / {day.totalAttempts} ({percentage}%)
                      </div>
                      {misspelledCount > 0 && (
                        <div style={{ fontSize: '0.9rem', color: '#f44336', marginTop: '0.25rem' }}>
                          ❌ {misspelledCount} misspelled
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
