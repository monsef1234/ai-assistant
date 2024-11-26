# AI Chat Assistant

A Vue.js-based chat interface that integrates with Azure OpenAI to provide an interactive AI assistant experience, Inspired from [Sonny Sangha](https://github.com/sonnysangha)

## Features

- 💬 Real-time chat interface
- 🤖 Integration with Azure OpenAI API
- ⚡ Loading states and animations
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 🔄 Message state management
- 🌐 Event-based communication system

## Technical Stack

- **Frontend Framework**: Vue.js 3 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Material Design Icons
- **AI Integration**: Azure OpenAI API
- **State Management**: Vue's Composition API + Event Emitter

## Component Structure

### Messages.vue
The main chat interface component that:
- Displays chat messages
- Handles message loading states
- Manages AI responses
- Implements message queue system

### Key Features
- Handles message loading states
- Manages AI responses
- Implements message queue system

## Environment Variables Required
- VITE_AZURE_OPENAI_API_KEY_CHAT = "your-api-key"
- VITE_AZURE_OPENAI_ENDPOINT_CHAT = "your-endpoint"
- VITE_AZURE_OPENAI_VERSION_CHAT = "your-version"
- VITE_AZURE_OPENAI_DEPLOYMENT_NAME_CHAT = "your-deployment-name"

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests.