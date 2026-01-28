# 🐝 Spelling Bee Practice

A simple web application to help my kids practice spelling words for their school spelling bee activities. The app reads words aloud and lets them practice spelling with immediate feedback. Progress is tracked and saved locally for each user.

Complete project is Agentic AI generated using [Kiro IDE](https://kiro.dev).

**Live Demo:** http://kids-spellbee-practice.s3-website-us-east-1.amazonaws.com/

## Features

- 👤 **Multi-user support** - Each family member can have their own profile
- 📚 **Multiple grade levels** (3-4, 5-6, 7-8)
- 🔊 **Audio pronunciation** of words (normal and slow speed)
- ✅ **Instant feedback** on spelling attempts
- 📊 **Progress tracking** - Scores and attempts saved automatically
- 📅 **7-day history** - View past performance and misspelled words
- 🔄 **Retry failed words** - Practice words you got wrong
- 💾 **Local storage** - All data saved in browser (no server needed)
- 📱 **Mobile-friendly** responsive design
- ⏮️ **Navigate** between previous and next words

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spellbee-practice
```

2. Install dependencies:
```bash
npm install
```

### Running Locally

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Build the project:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

The built files will be in the `dist` folder, ready to deploy.

## Using the App

1. **Select or create a user** - Enter your name when you first open the app
2. **Choose a grade level** - Select 3-4, 5-6, or 7-8
3. **Start practicing** - Click "Start Practice" to begin
4. **Listen and spell** - Hear the word and type your answer
5. **View history** - Click "📊 History" to see past 7 days of practice
6. **Retry mistakes** - Click on any day to see misspelled words and retry them

## Progress Tracking

The app automatically saves:
- ✅ Every word attempt (correct or incorrect)
- 📊 Daily scores and percentages
- 📝 Your exact answers for review
- 📅 Last 7 days of practice history

All data is stored locally in your browser using localStorage, so your progress persists between sessions.

## Generating Audio Files

The project uses Google Cloud Text-to-Speech API to generate audio pronunciations for spelling words.

### Prerequisites for Audio Generation

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Authenticate with Google Cloud:
```bash
gcloud auth login
```
3. Set your project ID in the script (already set to `spell-bee-practice`)

### Running the Text-to-Speech Script

The `text-to-speech.sh` script generates MP3 audio files for words.

**Configuration:**
- Edit the `GRADE` variable in the script to match your grade level (e.g., `3_4`, `5_6`, `7_8`)
- Audio files will be saved to `audio/{GRADE}/` folder

**Generate audio for a single word:**
```bash
./text-to-speech.sh accommodation
```

**Generate audio from a word list file:**
```bash
./text-to-speech.sh 3_4_inputwords.txt
```

**Example word list files:**
- `3_4_inputwords.txt` - Grade 3-4 words
- `5_6_inputwords.txt` - Grade 5-6 words
- `7_8_inputwords.txt` - Grade 7-8 words

The script will:
- Create audio files in MP3 format
- Use a female voice (en-US-Standard-C)
- Speak at 0.75x speed for clearer pronunciation
- Show progress for each word processed

### Uploading to S3

After generating audio files and building the project:

1. Build the project:
```bash
npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://kids-spellbee-practice/public/ --delete
aws s3 sync audio/ s3://kids-spellbee-practice/public/audio/ --delete
```

3. Ensure your S3 bucket is configured for static website hosting.

## Project Structure

```
spellbee-practice/
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Styles including mobile responsive
│   ├── UserSelector.tsx     # User login/selection component
│   ├── ProgressHistory.tsx  # History and retry component
│   ├── storage.ts           # LocalStorage utilities
│   └── main.tsx             # Entry point
├── audio/                   # Generated audio files by grade
│   ├── 3_4/
│   ├── 5_6/
│   └── 7_8/
├── text-to-speech.sh        # Script to generate audio files
├── *_inputwords.txt         # Word lists for each grade
└── dist/                    # Production build output
```

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **LocalStorage** - Client-side data persistence
- **Google Cloud Text-to-Speech** - Audio generation
- **AWS S3** - Static website hosting

## Data Privacy

All user data and progress is stored locally in your browser. No data is sent to any server. If you clear your browser data, your progress will be lost.

## Notes

This is a quick sample project built to help my kids practice for their school spelling bee. It's not meant to be a production-grade application, but rather a practical tool for learning and practice.

## License

This is a personal project for educational purposes.
