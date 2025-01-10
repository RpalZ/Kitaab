# Kitaab - Educational Platform

A React Native mobile application built with Expo, designed to connect teachers and students in an educational environment.

## Features

- Dark mode professional UI
- Separate interfaces for teachers and students
- Dashboard with statistics and quick actions
- Class management system
- Resource sharing capabilities

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your mobile device (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kitaab
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the App

1. Start the development server:
   ```bash
   npx expo start
   ```

2. You can run the app in multiple ways:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator
   - Press 'w' for web browser

## Testing the App

1. Test Teacher Flow:
   - Launch the app
   - Click "I'm a Teacher"
   - Login with any email/password
   - Explore the teacher dashboard

2. Test Student Flow:
   - Launch the app
   - Click "I'm a Student"
   - Login with any student ID/password
   - Explore the student dashboard

## Project Structure

```
app/
├── components/         # Reusable components
├── styles/            # Styling and theme files
│   ├── components/    # Component-specific styles
│   └── theme.ts       # Global theme configuration
├── types/             # TypeScript type definitions
├── student/           # Student-specific screens
├── teacher/           # Teacher-specific screens
└── index.tsx          # Entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Learn More

To learn more about the technologies used in this project:

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)

## License

This project is licensed under the MIT License - see the LICENSE file for details
