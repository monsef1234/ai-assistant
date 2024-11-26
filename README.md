# AI Chat Assistant

A Vue.js-based chat interface that integrates with Azure OpenAI for text and speech interactions, providing an interactive AI assistant experience.

## Features

- 💬 Real-time chat interface
- 🎙️ Voice recording and transcription
- 🔊 Text-to-Speech capability
- 🤖 Integration with Azure OpenAI API
- ⏳ Rate limit handling
- 🔍 Voice Activity Detection (VAD)

## Technical Stack

- **Frontend Framework**: Vue.js 3 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Material Design Icons
- **AI Integration**: 
  - Azure OpenAI API (Chat)
  - Azure OpenAI Whisper (Speech-to-Text)
  - Azure OpenAI TTS (Text-to-Speech)
- **State Management**: Vue's Composition API + Event Emitter
- **Voice Detection**: @ricky0123/vad-web
- **Notifications**: vue3-toastify

### Messages.vue
- Displays chat messages
- Handles message loading states
- Manages AI responses
- Implements real-time audio playback
- Auto-scrolling message list

### Recorder.vue
- Handles voice recording
- Implements Voice Activity Detection
- Manages audio transcription
- Provides recording cancel functionality
- Visual recording indicators


## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests.