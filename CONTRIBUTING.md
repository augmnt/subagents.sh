# Contributing to subagents.sh

Thank you for your interest in contributing to subagents.sh! This project is a marketplace for Claude Code sub-agents, and we welcome contributions from the community.

## Ways to Contribute

- **Bug Reports**: Found a bug? Please report it
- **Feature Requests**: Have an idea? We'd love to hear it
- **Code Contributions**: Fix bugs, add features, or improve documentation
- **Documentation**: Help improve our docs and guides
- **Sub-agent Submissions**: Share your Claude Code sub-agents

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase CLI (for database development)
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/subagents.sh.git
   cd subagents.sh
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Database Setup**
   ```bash
   npm run db:setup
   npm run db:start
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development Workflow

### Branch Naming Convention

- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/changes

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add GitHub import for sub-agents
fix: resolve search pagination issue
docs: update API documentation
```

### Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Your Changes**
   - Write clear, concise code
   - Add tests for new features
   - Update documentation as needed

3. **Run Tests**
   ```bash
   npm run test:all
   npm run lint
   npm run type-check
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: your descriptive commit message"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feat/your-feature-name
   ```
   Then create a Pull Request on GitHub.

## Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# End-to-end tests
npm run test:e2e

# All tests
npm run test:all

# With coverage
npm run test:coverage
```

### Writing Tests

- **Unit Tests**: Test individual components/functions
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows

Place tests in:
- `src/__tests__/unit/` - Unit tests
- `src/__tests__/integration/` - Integration tests
- `e2e/` - End-to-end tests

## Code Style

We use ESLint and Prettier for code formatting:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Code Guidelines

- Use TypeScript for type safety
- Follow React best practices
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused
- Use custom hooks for reusable logic

## Database Changes

When making database changes:

1. **Create Migration**
   ```bash
   supabase migration new your_migration_name
   ```

2. **Apply Migration**
   ```bash
   supabase db reset
   ```

3. **Generate Types**
   ```bash
   npm run db:types
   ```

4. **Test Migration**
   Ensure your migration works on a fresh database.

## Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow security best practices for authentication
- Report security vulnerabilities privately to [security@augmnt.sh]

## Documentation

- Update README.md for major changes
- Add JSDoc comments for complex functions
- Update API documentation for endpoint changes
- Include examples in documentation

## Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, Node version
6. **Screenshots**: If applicable

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

## Feature Requests

For feature requests, please include:

1. **Problem**: What problem does this solve?
2. **Solution**: Proposed solution
3. **Alternatives**: Alternative solutions considered
4. **Use Cases**: How would this be used?

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── lib/                # Utility libraries
│   ├── supabase/       # Database utilities
│   └── github/         # GitHub integration
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── __tests__/          # Test files

supabase/
├── migrations/         # Database migrations
└── seed/              # Database seed data
```

## Questions?

- **Discord**: [Join our community](https://discord.gg/augmnt)
- **GitHub Discussions**: Use GitHub Discussions for questions
- **Email**: [hello@augmnt.sh](mailto:hello@augmnt.sh)

## License

By contributing to subagents.sh, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to subagents.sh!**