import { useState, useEffect } from 'react'
import { getCurrentUser, setCurrentUser, getUsersList, createUser, deleteUser } from './storage'

interface UserSelectorProps {
  onUserSelected: (username: string) => void
}

export default function UserSelector({ onUserSelected }: UserSelectorProps) {
  const [username, setUsername] = useState('')
  const [existingUsers, setExistingUsers] = useState<string[]>([])
  const [showNewUser, setShowNewUser] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      onUserSelected(currentUser)
    }
    setExistingUsers(getUsersList())
  }, [])

  const handleSelectUser = (user: string) => {
    setCurrentUser(user)
    onUserSelected(user)
  }

  const handleCreateUser = () => {
    const trimmedName = username.trim()
    if (trimmedName) {
      createUser(trimmedName)
      setCurrentUser(trimmedName)
      onUserSelected(trimmedName)
    }
  }

  const handleDeleteUser = (user: string) => {
    if (deleteUser(user)) {
      setExistingUsers(getUsersList())
      setUserToDelete(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && username.trim()) {
      handleCreateUser()
    }
  }

  // Confirmation dialog for delete
  if (userToDelete) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '500px', 
        margin: '2rem auto',
        backgroundColor: '#fff3cd',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #ff9800'
      }}>
        <h2 style={{ marginBottom: '1rem', textAlign: 'center', color: '#856404' }}>⚠️ Confirm Delete</h2>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>
          Are you sure you want to delete <strong>{userToDelete}</strong>?
        </p>
        <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#721c24', fontSize: '0.95rem' }}>
          This will permanently delete all progress history and cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setUserToDelete(null)}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteUser(userToDelete)}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '500px', 
      margin: '2rem auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>👤 Who's Practicing?</h2>
      
      {existingUsers.length > 0 && !showNewUser && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginBottom: '1rem', fontWeight: '500' }}>Select your name:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {existingUsers.map(user => (
              <div key={user} style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSelectUser(user)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    textAlign: 'left'
                  }}
                >
                  {user}
                </button>
                <button
                  onClick={() => setUserToDelete(user)}
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                  title="Delete user"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowNewUser(true)}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            + Add New User
          </button>
        </div>
      )}

      {(existingUsers.length === 0 || showNewUser) && (
        <div>
          <p style={{ marginBottom: '1rem', fontWeight: '500' }}>Enter your name:</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Your name..."
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              border: '2px solid #ddd',
              boxSizing: 'border-box'
            }}
            autoFocus
          />
          <button
            onClick={handleCreateUser}
            disabled={!username.trim()}
            style={{
              width: '100%',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: username.trim() ? '#4CAF50' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: username.trim() ? 'pointer' : 'not-allowed',
              fontWeight: '600'
            }}
          >
            Start Practicing
          </button>
          {showNewUser && (
            <button
              onClick={() => setShowNewUser(false)}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.9rem',
                backgroundColor: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  )
}
