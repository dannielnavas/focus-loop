# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Complete project documentation
- Detailed contributing guide
- Performance optimizations for Pomodoro timer
- CommonJS dependencies configuration
- Error handling improvements

### Changed

- Audio system optimization with AudioContext
- Timer change detection improvement
- README documentation update

### Fixed

- Build configuration for CommonJS dependencies
- Error handling in Timer component
- Resource cleanup in ngOnDestroy

## [0.0.0] - 2024-12-19

### Added

- Task management application with Angular 20
- Electron integration for desktop application
- JWT authentication system
- Kanban board with drag & drop
- Pomodoro timer with floating window
- Sprint and task management
- Audio notification system
- Responsive interface with Tailwind CSS
- Global state system with Signals
- Testing with Jasmine and Karma

### Features

- **Task Management**: Create, edit, move and complete tasks
- **Sprint System**: Organize tasks in sprints with dates
- **Pomodoro Timer**: Productivity technique with floating window
- **Authentication**: Secure login with session persistence
- **Responsive Design**: Adaptive interface for different devices
- **Dark Theme**: Modern design with gradients and visual effects

### Technical

- Angular 20 with standalone components
- Electron 32 for desktop application
- TypeScript with strict configuration
- Tailwind CSS for styling
- RxJS for reactive programming
- Signals for reactive state
- HTTP Client for API communication
- Drag & Drop with Angular CDK

### Architecture

- Modular architecture with separation of concerns
- Injectable services for business logic
- Standalone components for better tree-shaking
- Centralized store for global state
- Lazy loading for performance optimization
- Optimized build configuration

---

## Release Notes

### Versioning Conventions

- **MAJOR**: Incompatible changes with previous versions
- **MINOR**: New backward-compatible functionality
- **PATCH**: Backward-compatible bug fixes

### Release Dates

- Dates follow YYYY-MM-DD format
- Releases are made when there are significant changes
- Minor changes can be grouped in a single release

### Contributing to Changelog

- Add entries under [Unreleased] for pending changes
- Move entries from [Unreleased] to new version when releasing
- Follow established format for consistency

---

**For more information about specific changes, check Git commits.**
