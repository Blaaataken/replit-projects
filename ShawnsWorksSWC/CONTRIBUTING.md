# Contributing to SHAWNSWORKS

Thank you for your interest in contributing to SHAWNSWORKS! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Contributions](#making-contributions)
5. [Code Style Guidelines](#code-style-guidelines)
6. [Commit Message Guidelines](#commit-message-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility for your mistakes and learn from them

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 20.x or higher
- npm 9.x or higher
- Git
- A code editor (VS Code recommended)
- Basic understanding of TypeScript, React, and Express.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/shawnsworks.git
   cd shawnsworks
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/shawnsworks.git
   ```

---

## Development Setup

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file based on the required environment variables. See the main documentation for details on required secrets.

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push database schema changes |

---

## Making Contributions

### Branch Naming

Use descriptive branch names following this pattern:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/add-staking-rewards` |
| Bug Fix | `fix/description` | `fix/wallet-connection-error` |
| Hotfix | `hotfix/description` | `hotfix/security-patch` |
| Documentation | `docs/description` | `docs/api-reference` |
| Refactor | `refactor/description` | `refactor/trading-signals` |

### Creating a Branch

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull upstream main

# Create your feature branch
git checkout -b feature/your-feature-name
```

---

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing code patterns in the repository
- Use ES modules (`import`/`export`)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add JSDoc comments for public functions

### React Components

- Use functional components with hooks
- Co-locate related components in the same file when small
- Use shadcn/ui components from `@/components/ui`
- Follow the design guidelines in `design_guidelines.md`
- Add `data-testid` attributes for testing

### Styling

- Use Tailwind CSS utility classes
- Follow the spacing and color conventions in `design_guidelines.md`
- Use CSS variables for theme colors (defined in `index.css`)
- Ensure dark mode compatibility

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `Dashboard.tsx` |
| Utilities/Hooks | camelCase | `useToast.ts` |
| Configuration | kebab-case | `tailwind.config.ts` |

---

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(bridge): add support for Avalanche network
fix(wallet): resolve connection timeout on mobile
docs(readme): update installation instructions
refactor(api): consolidate trading signal endpoints
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest changes from upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes locally**:
   ```bash
   npm run check    # Type checking
   npm run build    # Build verification
   npm run dev      # Manual testing
   ```

3. **Ensure no console errors or warnings**

4. **Update documentation** if needed (including CHANGELOG.md for features/fixes)

### Submitting the PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template completely

4. Request review from maintainers

### PR Checklist

Before requesting review, ensure:

- [ ] Code follows project style guidelines
- [ ] All changes are tested locally
- [ ] CHANGELOG.md is updated (for features/fixes)
- [ ] No console errors or warnings
- [ ] Mobile responsive (if UI changes)
- [ ] Dark mode works correctly (if UI changes)
- [ ] All CI checks pass

### After Review

- Address any feedback from reviewers
- Make requested changes in new commits
- Re-request review after making changes
- Squash commits if requested before merge

---

## Issue Guidelines

### Reporting Bugs

When reporting a bug, please use the bug report template and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (device, OS, browser)
- Network/wallet information if applicable
- Screenshots or console errors

### Requesting Features

When requesting a feature, please use the feature request template and include:

- Problem statement
- Proposed solution
- Alternative solutions considered
- Use cases
- Any mockups or examples

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority: high` | High priority issue |
| `wontfix` | Will not be addressed |

---

## Questions?

If you have questions about contributing:

1. Check existing issues and documentation
2. Open a new issue with the question label
3. Join our community channels (Discord, Telegram)

Thank you for contributing to SHAWNSWORKS!
