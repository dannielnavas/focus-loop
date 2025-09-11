# Focus Loop - Task Management and Pomodoro Application

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/dannielnavas/focus-loop)
[![Angular Version](https://img.shields.io/badge/angular-20.0.3-blue)](https://angular.io/)
[![Electron Version](https://img.shields.io/badge/electron-32.0.0-green)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

A modern desktop application for task management and Pomodoro technique, built with Angular 20 and Electron.

## 🚀 Features

### 📋 Task Management

- **Sprint System**: Organize your tasks in sprints with start and end dates
- **Kanban Board**: Drag & drop interface with columns: Pending, Today, Done
- **Task States**: Visual tracking of each task's progress
- **Positioning**: Reorganize tasks by dragging and dropping

### ⏱️ Pomodoro Timer

- **Pomodoro Technique**: 25 minutes of work, 5 minutes of break
- **Floating Window**: Independent timer that stays visible
- **Audio Notifications**: Sounds for work start and break
- **Time Tracking**: Record of total time worked

### 🎯 Advanced Features

- **Authentication**: Secure login system
- **Persistence**: Data saved in backend
- **Responsive**: Adaptive interface for different sizes
- **Dark Theme**: Modern design with gradients and visual effects

## 🛠️ Technologies

- **Frontend**: Angular 20, TypeScript, Tailwind CSS
- **Desktop**: Electron 32
- **Backend**: REST API (Vercel)
- **State**: Angular Signals
- **Testing**: Jasmine & Karma
- **Build**: Angular CLI

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/dannielnavas/focus-loop.git
cd focus-loop
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables** (optional)

```bash
# Create .env file if needed
cp .env.example .env
```

## 🚀 Usage

### Web Development

```bash
# Development server
npm start
# or
ng serve
```

Navigate to `http://localhost:4200` to view the application.

### Desktop Application

#### Development

```bash
# Run in development mode
npm run electron:dev
```

#### Production

```bash
# Build application
npm run electron:build

# Run built application
npm run electron:serve
```

### Other Commands

```bash
# Build for production
npm run build

# Run tests
npm run test

# Build with watch mode
npm run watch
```

## 📁 Project Structure

```
my-tracker/
├── src/
│   ├── app/
│   │   ├── core/                 # Business logic
│   │   │   ├── models/          # Interfaces and types
│   │   │   ├── services/        # HTTP services
│   │   │   └── store/           # Global state
│   │   ├── private/             # Authenticated pages
│   │   │   └── pages/
│   │   │       ├── board/       # Kanban board
│   │   │       ├── principal/   # Main dashboard
│   │   │       ├── timer/       # Pomodoro timer
│   │   │       ├── work/        # Work management
│   │   │       ├── settings/    # Settings
│   │   │       └── sprints/     # Sprint management
│   │   ├── public/              # Public pages
│   │   │   └── pages/
│   │   │       └── login/       # Authentication
│   │   └── shared/              # Shared components
│   │       └── components/
│   │           ├── header/      # Application header
│   │           └── layout/      # Main layout
│   ├── assets/                  # Static resources
│   └── types/                   # Type definitions
├── electron/                    # Electron configuration
├── public/                      # Public files
└── dist/                        # Production build
```

## 🔧 Configuration

### Environment Variables

```bash
# Backend API
API_URL=http://localhost:3000

# Electron configuration
ELECTRON_IS_DEV=true
```

### Build Configuration

The project includes optimized configurations for:

- **Web**: Angular CLI with production optimizations
- **Desktop**: Electron Builder with multi-platform configurations
- **Testing**: Karma with code coverage

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Tests with coverage
npm run test -- --code-coverage

# Tests in watch mode
npm run test -- --watch
```

### Test Structure

- **Unit**: Each component and service has its `.spec.ts` file
- **E2E**: Configured for end-to-end testing (requires additional setup)

## 📦 Build and Deployment

### Web

```bash
# Production build
npm run build

# Files are generated in dist/my-tracker/
```

### Desktop

```bash
# Build for all platforms
npm run electron:build

# Executables are generated in release/
```

### Supported Platforms

- **macOS**: `.dmg` (Apple Silicon + Intel)
- **Windows**: `.exe` (NSIS installer)
- **Linux**: `.AppImage` (AppImage format)

## 🔍 Implemented Optimizations

### Pomodoro Timer

- ✅ **AudioContext**: Better audio performance
- ✅ **Error Handling**: Try-catch in all operations
- ✅ **Cleanup**: Resource cleanup in ngOnDestroy
- ✅ **Change Detection**: Change detection optimization

### Build

- ✅ **CommonJS Dependencies**: Configuration for timer-for-pomodoro
- ✅ **Tree Shaking**: Unused code elimination
- ✅ **Code Splitting**: Lazy loading of components

## 🐛 Troubleshooting

### Common Errors

1. **Audio Error**

```bash
# AudioContext may not be available in some browsers
# The application has fallback to HTML5 Audio
```

2. **Electron Error**

```bash
# Make sure you have admin permissions on macOS
# On Windows, run as administrator if necessary
```

3. **Build Error**

```bash
# Clear cache
npm run clean
# Reinstall dependencies
rm -rf node_modules && npm install
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 👨‍💻 Author

**Danniel Navas**

- Email: me@danniel.dev
- GitHub: [@dannielnavas](https://github.com/dannielnavas)

## 🙏 Acknowledgments

- [Angular Team](https://angular.io/) for the framework
- [Electron Team](https://www.electronjs.org/) for the desktop platform
- [Tailwind CSS](https://tailwindcss.com/) for the design system
- [Vercel](https://vercel.com/) for backend hosting

---

**Last updated:** December 2024
**Version:** 0.0.0
