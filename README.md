# Focus Loop - Task Management and Pomodoro Application

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/dannielnavas/focus-loop)
[![Angular Version](https://img.shields.io/badge/angular-20.0.3-blue)](https://angular.io/)
[![Electron](https://img.shields.io/badge/electron-vite-3-blue)](https://electron-vite.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

A modern desktop application for task management and Pomodoro technique, built with Angular 20 and Electron (electron-vite).

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
- **Desktop**: Electron + electron-vite
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

### Desktop Application (Electron)

#### Development

```bash
# Start Angular dev server and Electron (waits for http://localhost:4200)
npm run electron:dev
```

#### Production

```bash
# Build Angular then Electron (output: out/main, out/preload; load from dist/focus-loop/browser)
npm run electron:build
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
├── electron/                    # Electron main process and preload
├── public/                      # Public files
└── dist/                        # Production build
```

## 🔧 Configuration

### Environment Variables

```bash
# Backend API
API_URL=http://localhost:3000
```

### Build Configuration

The project includes optimized configurations for:

- **Web**: Angular CLI with production optimizations
- **Desktop**: Electron (electron-vite) with main and preload
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
# Build Angular + Electron (output in out/)
npm run electron:build
```

To produce installers (e.g. .dmg, .exe, .AppImage):

```bash
npm run dist
```

Los artefactos se generan en `release/`. El workflow de GitHub Actions (rama `release` o tags `v*`) construye los instalables para macOS, Windows y Linux.

### Firma de instalables (opciones gratuitas)

Se puede firmar los instalables de forma gratuita donde el sistema lo permita:

| Plataforma | Opción gratuita | Cómo activarla |
|------------|------------------|----------------|
| **Linux**  | GPG (firma detached) | Añadir secretos en el repo: `GPG_PRIVATE_KEY` (clave privada exportada) y opcionalmente `GPG_KEY_ID` (ID de la clave). Los usuarios verifican con `gpg --verify archivo.AppImage.asc archivo.AppImage`. |
| **Windows** | Certificado auto-firmado | En **Windows**, ejecutar `npm run electron:create-cert` para generar un `.pfx`. Codificar en base64, guardar como secreto `WIN_CSC_LINK`, y la contraseña en `WIN_CSC_KEY_PASSWORD`. Reduce el aviso "publicador desconocido" (para confianza total hace falta certificado de pago). |
| **macOS** | Sin opción gratuita oficial | Apple exige cuenta de desarrollador (de pago) para notarización. Si tienes certificado, usa secretos `CSC_LINK` (base64 del .p12) y `CSC_KEY_PASSWORD`. |

Crear certificado auto-firmado para Windows (solo en máquina Windows):

```bash
npm run electron:create-cert
```

Se genera un `.pfx` en el proyecto. Para usarlo en CI: `base64 -i nombre.pfx -o pfx.txt` (o en PowerShell equivalente) y el contenido de `pfx.txt` como valor de `WIN_CSC_LINK`; la contraseña que hayas puesto como `WIN_CSC_KEY_PASSWORD`.

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

2. **Electron / Permission Error**

```bash
# If electron-vite fails with "Permission denied", run:
chmod +x node_modules/.bin/electron-vite
# Or use: node node_modules/electron-vite/bin/electron-vite.js dev
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
- [Electron](https://www.electronjs.org/) and [electron-vite](https://electron-vite.org/) for the desktop platform
- [Tailwind CSS](https://tailwindcss.com/) for the design system
- [Vercel](https://vercel.com/) for backend hosting

---

**Last updated:** December 2024
**Version:** 0.0.0
