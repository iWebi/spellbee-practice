import { useState, useEffect } from 'react'
import './App.css'

interface WordEntry {
  spellings: string[]
  primary: string
}

type GradeLevel = '3-4' | '5-6' | '7-8'

function App() {
  const [word, setWord] = useState<WordEntry | null>(null)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [words, setWords] = useState<WordEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [wordHistory, setWordHistory] = useState<WordEntry[]>([])

  const getWordListUrl = (grade: GradeLevel): string => {
    const baseUrl = 'https://kids-spellbee-practice.s3.us-east-1.amazonaws.com/public'
    const gradeMap = {
      '3-4': '3_4_inputwords.txt',
      '5-6': '5_6_inputwords.txt',
      '7-8': '7_8_inputwords.txt'
    }
    return `${baseUrl}/${gradeMap[grade]}`
  }

  useEffect(() => {
    if (gradeLevel) {
      fetchWords()
    }
  }, [gradeLevel])

  const fetchWords = async () => {
    if (!gradeLevel) return
    
    setLoading(true)
    setError('')
    setWord(null)
    setUserInput('')
    setFeedback('')
    setScore(0)
    setTotalAttempts(0)
    setWordHistory([])
    try {
      const wordListUrl = getWordListUrl(gradeLevel)
      const response = await fetch(wordListUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch word list')
      }
      const text = await response.text()
      const wordList = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const spellings = line.split(',').map(w => w.trim()).filter(w => w.length > 0)
          return {
            spellings,
            primary: spellings[0]
          }
        })
        .sort((a, b) => a.primary.localeCompare(b.primary))
      if (wordList.length === 0) {
        throw new Error('Word list is empty')
      }
      setWords(wordList)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words')
      setLoading(false)
    }
  }

  const speakWord = (text: string, slow: boolean = false) => {
    if (!gradeLevel) return
    
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    
    const audioBaseUrl = 'https://kids-spellbee-practice.s3.us-east-1.amazonaws.com/public/audio'
    const audioFileName = `${text.toLowerCase()}.mp3`
    const audioUrl = `${audioBaseUrl}/${audioFileName}`
    
    const audio = new Audio(audioUrl)
    audio.playbackRate = slow ? 0.75 : 1.0
    
    setCurrentAudio(audio)
    setIsPlaying(true)
    
    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }
    
    audio.onerror = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
      console.error('Error playing audio:', audioUrl)
    }
    
    audio.play().catch(err => {
      setIsPlaying(false)
      setCurrentAudio(null)
      console.error('Error playing audio:', err)
    })
  }

  const getNewWord = () => {
    if (words.length === 0) return
    const randomWord = words[Math.floor(Math.random() * words.length)]
    
    // Add current word to history before moving to next
    if (word) {
      setWordHistory([...wordHistory, word])
    }
    
    setWord(randomWord)
    setUserInput('')
    setFeedback('')
    speakWord(randomWord.primary)
  }

  const getPreviousWord = () => {
    if (wordHistory.length === 0) return
    
    const previousWord = wordHistory[wordHistory.length - 1]
    const newHistory = wordHistory.slice(0, -1)
    
    setWordHistory(newHistory)
    setWord(previousWord)
    setUserInput('')
    setFeedback('')
    speakWord(previousWord.primary)
  }

  const checkSpelling = () => {
    if (!word) return
    const userAnswer = userInput.toLowerCase().trim()
    const isCorrect = word.spellings.some(spelling => spelling.toLowerCase() === userAnswer)
    
    setTotalAttempts(totalAttempts + 1)
    
    if (isCorrect) {
      setFeedback('✅ Correct! Well done!')
      setScore(score + 1)
      speakWord('Correct')
    } else {
      const allSpellings = word.spellings.join(' or ')
      setFeedback(`❌ Incorrect. The correct spelling is: ${allSpellings}`)
      speakWord('Incorrect')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userInput.trim()) {
      checkSpelling()
    }
  }

  return (
    <div className="app-container" style={{ padding: '1rem 2rem 2rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🐝 Spelling Bee Practice</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ marginBottom: '0.75rem', fontWeight: 'bold' }}>Select Grade Level:</p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {(['3-4', '5-6', '7-8'] as GradeLevel[]).map((grade) => (
            <label key={grade} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                name="grade"
                value={grade}
                checked={gradeLevel === grade}
                onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
              />
              <span>Grade {grade}</span>
            </label>
          ))}
        </div>
      </div>

      {!gradeLevel ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.1rem', color: '#856404' }}>Please select a grade level to begin</p>
        </div>
      ) : loading ? (
        <p>Loading words...</p>
      ) : error ? (
        <div>
          <p style={{ color: '#721c24', marginBottom: '1rem' }}>Error: {error}</p>
          <button onClick={fetchWords} style={{ 
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Retry
          </button>
        </div>
      ) : words.length > 0 && !word ? (
        <div>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
            <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Total Words: {words.length}
            </p>
            <p style={{ fontSize: '1rem', color: '#555' }}>
              Ready to practice Grade {gradeLevel} spelling words
            </p>
          </div>
          <button onClick={getNewWord} style={{ 
            fontSize: '1.2rem', 
            padding: '1rem 2rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Start Practice
          </button>
        </div>
      ) : word ? (
        <div>
          <div className="score-section" style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  Score: {score} / {totalAttempts}
                </p>
                <p className="score-detail" style={{ fontSize: '0.95rem', color: '#555' }}>
                  {totalAttempts > 0 ? `${Math.round((score / totalAttempts) * 100)}% correct` : 'No attempts yet'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  Total Words: {words.length}
                </p>
                <p className="score-detail" style={{ fontSize: '0.95rem', color: '#777' }}>
                  {words.length - totalAttempts} remaining
                </p>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => speakWord(word.primary)} 
              style={{ 
                padding: '0.75rem 1.5rem',
                flex: '1 1 auto',
                minWidth: '140px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🔊 Repeat Word
            </button>
            <button 
              onClick={() => speakWord(word.primary, true)} 
              style={{ 
                padding: '0.75rem 1.5rem',
                flex: '1 1 auto',
                minWidth: '140px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🐌 Slow Speed
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type the word here..."
              style={{ 
                fontSize: '1.2rem', 
                padding: '0.75rem', 
                width: '100%',
                marginBottom: '0.75rem',
                boxSizing: 'border-box'
              }}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <div style={{ marginBottom: '1rem' }}>
              <button 
                onClick={checkSpelling} 
                disabled={!userInput.trim()}
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '0.75rem 2rem',
                  width: '100%',
                  backgroundColor: !userInput.trim() ? '#cccccc' : '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !userInput.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Check Spelling
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={getPreviousWord}
                disabled={isPlaying || wordHistory.length === 0}
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '0.75rem 1rem',
                  flex: '1',
                  backgroundColor: (isPlaying || wordHistory.length === 0) ? '#cccccc' : '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (isPlaying || wordHistory.length === 0) ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                <span className="btn-text-mobile">◀</span>
                <span className="btn-text-desktop">◀ Previous</span>
              </button>
              <button 
                onClick={getNewWord}
                disabled={isPlaying}
                style={{ 
                  fontSize: '1.1rem', 
                  padding: '0.75rem 1rem',
                  flex: '1',
                  backgroundColor: isPlaying ? '#cccccc' : '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                <span className="btn-text-mobile">▶</span>
                <span className="btn-text-desktop">Next Word ▶</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div style={{ 
              fontSize: '1.3rem', 
              padding: '1rem', 
              borderRadius: '8px',
              backgroundColor: feedback.includes('✅') ? '#d4edda' : '#f8d7da',
              color: feedback.includes('✅') ? '#155724' : '#721c24',
              marginTop: '1rem'
            }}>
              {feedback}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default App