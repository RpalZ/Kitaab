# Kitaab

A modern learning platform that bridges the gap between teachers and students. Built with React Native and powered by AI.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

## Development Setup

### Prerequisites
- Node.js 16+
- Expo Go app (iOS/Android)
- Firebase account
- DeepSeek API key

### Environment Variables
Create a `.env` file:
```
FIREBASE_API_KEY=xxx
FIREBASE_AUTH_DOMAIN=xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_STORAGE_BUCKET=xxx
FIREBASE_MESSAGING_SENDER_ID=xxx
FIREBASE_APP_ID=xxx
FIREBASE_MEASUREMENT_ID=xxx
DEEPSEEK_API_KEY=xxx
```

## Core Features

- 🔐 Role-based authentication (Teacher/Student)
- 💬 AI-powered chat assistance
- 📚 Resource sharing & management  
- 👥 Student progress tracking
- 📱 Cross-platform (iOS & Android)

## Tech Stack

- React Native + Expo Router
- Firebase (Auth & Firestore)
- DeepSeek AI
- TypeScript
- Secure Storage

## Project Structure
```
app/
├── components/     # Shared components
├── styles/        # Theme & styles
├── teacher/       # Teacher screens
├── student/       # Student screens
└── utils/         # Helpers & utils
```


## License

MIT

---
Built with ❤️ by Desi Boyz
