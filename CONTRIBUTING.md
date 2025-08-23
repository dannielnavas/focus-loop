# Contributing Guide

Thank you for your interest in contributing to Focus Loop! This document will help you get started.

## 🚀 How to Contribute

### 1. Environment Setup

#### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Code editor (VS Code recommended)

#### Initial Setup

```bash
# Fork and clone the repository
git clone https://github.com/dannielnavas/focus-loop.git
cd focus-loop

# Install dependencies
npm install

# Verify everything works
npm run build
npm run test
```

### 2. Workflow

#### Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/feature-name
# or
git checkout -b fix/bug-fix-name
```

#### Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test improvements

#### Development

1. **Make changes** in your branch
2. **Run tests** locally
3. **Verify build** works
4. **Commit** with descriptive messages

#### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Examples
feat: add notification system
fix: fix error in pomodoro timer
docs: update README with new instructions
refactor: optimize task service
test: add tests for board component
```

### 3. Code Standards

#### TypeScript

- Use strict types
- Avoid `any` when possible
- Document complex interfaces
- Use `readonly` for immutable properties

#### Angular

- Use standalone components
- Implement OnDestroy for cleanup
- Use signals for reactive state
- Follow dependency injection pattern

#### Code Style

```typescript
// ✅ Good
export class TaskService {
  private readonly http = inject(HttpClient);

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>("/api/tasks");
  }
}

// ❌ Avoid
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks() {
    return this.http.get("/api/tasks");
  }
}
```

### 4. Testing

#### Run Tests

```bash
# All tests
npm run test

# Tests with coverage
npm run test -- --code-coverage

# Specific tests
npm run test -- --include="**/board.spec.ts"
```

#### Writing Tests

```typescript
// Example test for component
describe("BoardComponent", () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should add new task", () => {
    const initialCount = component.todo().length;
    component.addTodoTask();
    expect(component.todo().length).toBe(initialCount + 1);
  });
});
```

### 5. Pull Request

#### Before Creating PR

- [ ] Tests pass locally
- [ ] Build works without errors
- [ ] Code follows standards
- [ ] Documentation updated
- [ ] Commits follow conventions

#### Create PR

1. **Push** your branch to fork
2. **Create Pull Request** on GitHub
3. **Fill PR template**
4. **Assign reviewers** if needed

#### PR Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Checklist

- [ ] My code follows the project standards
- [ ] I have reviewed my own code
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to documentation
- [ ] My changes don't generate new warnings
- [ ] I have added tests that prove my fix or new feature
- [ ] All new and existing tests pass
```

### 6. Review Process

#### As Reviewer

- Review code for functionality
- Verify code standards
- Check test coverage
- Suggest constructive improvements

#### As Author

- Respond to comments
- Make requested changes
- Maintain professional conversation
- Thank for feedback

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
## Bug Description

Clear and concise description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll to '...'
4. See error

## Expected Behavior

Description of what should happen.

## Actual Behavior

Description of what actually happens.

## Additional Information

- OS: [e.g. macOS 14.0]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 0.0.0]

## Screenshots

If applicable, add screenshots.
```

## 💡 Requesting Features

### Feature Request Template

```markdown
## Problem

Description of the problem this feature would solve.

## Proposed Solution

Description of the solution you'd like to see.

## Alternatives Considered

Other solutions you considered.

## Additional Information

Additional context, screenshots, etc.
```

## 📚 Resources

### Documentation

- [Angular Documentation](https://angular.io/docs)
- [Electron Documentation](https://www.electronjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools

- [Angular CLI](https://angular.io/cli)
- [Electron Builder](https://www.electron.build/)
- [Jasmine Testing](https://jasmine.github.io/)

### Community

- [Angular Discord](https://discord.gg/angular)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/angular)
- [GitHub Issues](https://github.com/dannielnavas/focus-loop/issues)

## 🏆 Recognition

Contributors will be recognized in:

- Project README
- Release notes
- GitHub contributors

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

**Need help?** Don't hesitate to open an issue or contact the development team.
