import { useState, useEffect } from 'react'
import './App.css'

interface WordEntry {
  spellings: string[]
  primary: string
}

function App() {
  const [word, setWord] = useState<WordEntry | null>(null)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [words, setWords] = useState<WordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wordListUrl, setWordListUrl] = useState('https://dev-srmedtechsolutions-files.s3.ap-south-1.amazonaws.com/public/clearwords.txt')

  useEffect(() => {
    if (wordListUrl) {
      fetchWords()
    }
  }, [wordListUrl])

  const fetchWords = async () => {
    setLoading(true)
    setError('')
    try {
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = slow ? 0.7 : 1.0
      
      const voices = window.speechSynthesis.getVoices()
      const usVoice = voices.find(voice => voice.lang === 'en-US')
      if (usVoice) {
        utterance.voice = usVoice
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const getNewWord = () => {
    if (words.length === 0) return
    const randomWord = words[Math.floor(Math.random() * words.length)]
    setWord(randomWord)
    setUserInput('')
    setFeedback('')
    speakWord(randomWord.primary)
  }

  const checkSpelling = () => {
    if (!word) return
    const userAnswer = userInput.toLowerCase().trim()
    const isCorrect = word.spellings.some(spelling => spelling.toLowerCase() === userAnswer)
    
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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🐝 Spelling Bee Practice</h1>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '1.2rem' }}>Score: {score}</p>
      </div>

      {!wordListUrl ? (
        <div>
          <p style={{ marginBottom: '1rem' }}>Enter the URL to your word list (S3 or any public URL):</p>
          <input
            type="text"
            value={wordListUrl}
            onChange={(e) => setWordListUrl(e.target.value)}
            placeholder="https://dev-srmedtechsolutions-files.s3.ap-south-1.amazonaws.com/public/clearwords.txt"
            style={{ 
              fontSize: '1rem', 
              padding: '0.75rem', 
              width: '100%',
              marginBottom: '1rem'
            }}
          />
          <button 
            onClick={() => wordListUrl && fetchWords()} 
            disabled={!wordListUrl}
            style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}
          >
            Load Words
          </button>
        </div>
      ) : loading ? (
        <p>Loading words...</p>
      ) : error ? (
        <div>
          <p style={{ color: '#721c24', marginBottom: '1rem' }}>Error: {error}</p>
          <button onClick={() => setWordListUrl('')} style={{ padding: '0.75rem 1.5rem' }}>
            Try Different URL
          </button>
        </div>
      ) : !word ? (
        <div>
          <p style={{ marginBottom: '1rem' }}>Loaded {words.length} words</p>
          <button onClick={getNewWord} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            Start Practice
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <button onClick={() => speakWord(word.primary)} style={{ marginRight: '0.5rem', padding: '0.75rem 1.5rem' }}>
              🔊 Repeat Word
            </button>
            <button onClick={() => speakWord(word.primary, true)} style={{ padding: '0.75rem 1.5rem' }}>
              🐌 Slow Speed
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type the word here..."
              style={{ 
                fontSize: '1.2rem', 
                padding: '0.75rem', 
                width: '100%',
                marginBottom: '1rem'
              }}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button 
              onClick={checkSpelling} 
              disabled={!userInput.trim()}
              style={{ 
                fontSize: '1.1rem', 
                padding: '0.75rem 2rem',
                marginRight: '0.5rem'
              }}
            >
              Check Spelling
            </button>
            <button 
              onClick={getNewWord}
              style={{ 
                fontSize: '1.1rem', 
                padding: '0.75rem 2rem'
              }}
            >
              Next Word
            </button>
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
      )}
    </div>
  )
}

export default App
