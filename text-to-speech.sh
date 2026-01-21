#!/bin/bash

# Check if argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <word-or-file>"
  echo "  Single word: $0 accommodation"
  echo "  From file:   $0 words.txt"
  exit 1
fi

INPUT="$1"
PROJECT_ID="spell-bee-practice"

# Create audio directory if it doesn't exist
mkdir -p audio

# Set the project
gcloud config set project $PROJECT_ID 2>/dev/null

# Get access token once
echo "Getting access token..."
ACCESS_TOKEN=$(gcloud auth print-access-token)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Error: Failed to get access token. Please run: gcloud auth login"
  exit 1
fi

# Function to process a single word
process_word() {
  local WORD=$(echo "$1" | tr '[:upper:]' '[:lower:]' | xargs)
  
  # Skip empty words
  if [ -z "$WORD" ]; then
    return 0
  fi
  
  # Create the request JSON with slower speech rate for spell bee practice
  cat > request.json << EOF
{
  "input": {
    "text": "$WORD"
  },
  "voice": {
    "languageCode": "en-US",
    "name": "en-US-Standard-A",
    "ssmlGender": "FEMALE"
  },
  "audioConfig": {
    "audioEncoding": "MP3",
    "speakingRate": 0.75,
    "pitch": 0.0
  }
}
EOF

  # Call the Text-to-Speech API
  curl -s -X POST \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json; charset=utf-8" \
    -H "X-Goog-User-Project: $PROJECT_ID" \
    -d @request.json \
    "https://texttospeech.googleapis.com/v1/text:synthesize" > synthesize-output.json

  # Check if API call was successful
  if grep -q "error" synthesize-output.json; then
    echo "✗ Error for '$WORD':"
    cat synthesize-output.json
    return 1
  fi

  # Extract the audio content and decode it
  cat synthesize-output.json | jq -r '.audioContent' | base64 --decode > "audio/${WORD}.mp3"

  # Check if audio file was created successfully
  if [ -s "audio/${WORD}.mp3" ]; then
    echo "✓ Created: audio/${WORD}.mp3"
    return 0
  else
    echo "✗ Error: Audio file is empty for '$WORD'"
    return 1
  fi
}

# Check if input is a file or a single word
if [ -f "$INPUT" ]; then
  # Process file
  TOTAL=$(wc -l < "$INPUT" | tr -d ' ')
  CURRENT=0
  FAILED=0
  
  echo "Processing $TOTAL words from $INPUT..."
  echo ""
  
  while IFS= read -r word || [ -n "$word" ]; do
    # Skip empty lines
    if [ -z "$word" ]; then
      continue
    fi
    
    CURRENT=$((CURRENT + 1))
    echo "[$CURRENT/$TOTAL] Processing: $word"
    
    if process_word "$word"; then
      :
    else
      FAILED=$((FAILED + 1))
    fi
    
    # Small delay to avoid rate limiting
    sleep 0.5
  done < "$INPUT"
  
  echo ""
  echo "========================================="
  echo "Processing complete!"
  echo "Total: $TOTAL words"
  echo "Success: $((TOTAL - FAILED)) words"
  echo "Failed: $FAILED words"
  echo "========================================="
else
  # Process single word
  echo "Processing single word: $INPUT"
  process_word "$INPUT"
fi

# Clean up temporary files
rm -f request.json synthesize-output.json
