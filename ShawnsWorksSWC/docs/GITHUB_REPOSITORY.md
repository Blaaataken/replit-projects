# GitHub Repository Guide

This guide provides comprehensive instructions for setting up the SHAWNSWORKS project on GitHub, including repository structure, CI/CD workflows, release management, and contribution guidelines.

## Table of Contents

1. [Repository Setup](#repository-setup)
2. [Repository Structure](#repository-structure)
3. [GitHub Actions (CI/CD)](#github-actions-cicd)
4. [Release Management](#release-management)
5. [Contributing Guidelines](#contributing-guidelines)

---

## Repository Setup

### Initializing the Git Repository

If starting fresh or pushing to a new GitHub repository:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SHAWNSWORKS multi-chain AI trading platform"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/shawnsworks.git

# Push to main branch
git push -u origin main
```

### Recommended .gitignore

Create a `.gitignore` file with the following entries:

```gitignore
# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.local

# IDE and editor files
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# TypeScript cache
*.tsbuildinfo

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Testing
coverage/
.nyc_output/

# Android specific
android/.gradle/
android/.idea/
android/app/build/
android/build/
android/captures/
android/local.properties
android/*.iml
android/app/*.iml
android/keystore.properties
*.keystore
*.jks

# Capacitor
capacitor-cordova-android-plugins/build/

# Database
*.sqlite
*.sqlite3
*.db

# Secrets (never commit these)
*.pem
*.key
secrets/
.secrets

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db

# Replit specific
.replit
replit.nix
.cache/
.config/
```

### Branch Naming Conventions

Use descriptive branch names following this pattern:

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/short-description` | `feature/add-staking-rewards` |
| Bug Fix | `fix/issue-description` | `fix/wallet-connection-error` |
| Hotfix | `hotfix/critical-issue` | `hotfix/security-patch` |
| Release | `release/version` | `release/v1.2.0` |
| Documentation | `docs/topic` | `docs/api-reference` |
| Refactor | `refactor/component` | `refactor/trading-signals` |

**Protected Branches:**
- `main` - Production-ready code, requires PR approval
- `develop` - Integration branch for features (optional)

---

## Repository Structure

### Folder Overview

```
shawnsworks/
├── android/                 # Capacitor Android native project
│   ├── app/                 # Main Android app module
│   │   ├── src/main/        # Android source code
│   │   │   ├── assets/      # Built web assets (generated)
│   │   │   ├── java/        # Native Android code
│   │   │   └── res/         # Android resources (icons, layouts)
│   │   └── build.gradle     # App-level Gradle config
│   ├── gradle/              # Gradle wrapper
│   ├── build.gradle         # Project-level Gradle config
│   └── variables.gradle     # SDK version variables
│
├── client/                  # React frontend application
│   ├── public/              # Static assets
│   │   ├── icons/           # PWA and app icons
│   │   ├── manifest.json    # PWA manifest
│   │   └── sw.js            # Service worker
│   └── src/                 # React source code
│       ├── components/      # Reusable UI components
│       │   └── ui/          # shadcn/ui components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utility functions
│       ├── pages/           # Route page components
│       ├── App.tsx          # Main application component
│       ├── main.tsx         # Entry point
│       └── index.css        # Global styles
│
├── contracts/               # Smart contracts (Hardhat)
│   ├── scripts/             # Deployment scripts
│   ├── SWCToken.sol         # SWC token contract
│   └── hardhat.config.ts    # Hardhat configuration
│
├── docs/                    # Documentation
│   ├── APP_STORE_SUBMISSION.md
│   └── GITHUB_REPOSITORY.md # This file
│
├── scripts/                 # Build and utility scripts
│   └── generate-icons.js    # Icon generation script
│
├── server/                  # Express.js backend
│   ├── ai.ts                # OpenAI integration
│   ├── db.ts                # Database connection
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API endpoints
│   ├── seed.ts              # Database seeding
│   ├── storage.ts           # Storage interface
│   └── vite.ts              # Vite dev server integration
│
├── shared/                  # Shared code (frontend + backend)
│   └── schema.ts            # Drizzle ORM schemas + Zod types
│
├── capacitor.config.ts      # Capacitor configuration
├── components.json          # shadcn/ui configuration
├── design_guidelines.md     # UI/UX design specifications
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Node.js dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build configuration
```

### Key Files and Their Purposes

#### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies, scripts, and metadata |
| `tsconfig.json` | TypeScript compiler configuration with path aliases |
| `vite.config.ts` | Vite build tool configuration for frontend |
| `tailwind.config.ts` | Tailwind CSS theme and plugin configuration |
| `capacitor.config.ts` | Capacitor mobile app configuration |
| `drizzle.config.ts` | Database ORM configuration |
| `components.json` | shadcn/ui component configuration |

#### Source Code Entry Points

| File | Purpose |
|------|---------|
| `client/src/main.tsx` | Frontend React application entry |
| `client/src/App.tsx` | Main React component with routing |
| `server/index.ts` | Backend Express server entry |
| `server/routes.ts` | All API endpoint definitions |
| `shared/schema.ts` | Shared database schemas and types |

#### Build Outputs

| Directory | Generated By | Purpose |
|-----------|--------------|---------|
| `dist/public/` | `npm run build` | Production frontend build |
| `dist/index.js` | `npm run build` | Production server bundle |
| `android/app/src/main/assets/public/` | `npx cap sync` | Web assets for Android |

---

## GitHub Actions (CI/CD)

> **⚠️ REQUIRED SECRETS WARNING**
>
> **CI/CD workflows will fail without properly configured secrets!**
>
> Before running any GitHub Actions workflows, you **must** configure the following secrets in your repository. Without these, builds will fail with authentication or connection errors.
>
> ### How to Add Secrets in GitHub
>
> 1. Go to your repository on GitHub
> 2. Click **Settings** (top menu bar)
> 3. In the left sidebar, click **Secrets and variables** → **Actions**
> 4. Click **New repository secret**
> 5. Add each required secret (see tables below)
>
> ### Minimum Required Secrets for CI
>
> | Secret | Required For | What Happens Without It |
> |--------|--------------|------------------------|
> | `DATABASE_URL` | Build step | Build fails - cannot connect to database |
>
> ### Required Secrets for Android Builds
>
> | Secret | Required For | What Happens Without It |
> |--------|--------------|------------------------|
> | `DATABASE_URL` | Build step | Build fails |
> | `ANDROID_KEYSTORE_BASE64` | Release signing | Release APK/AAB cannot be signed |
> | `KEYSTORE_PASSWORD` | Release signing | Keystore cannot be unlocked |
> | `KEY_PASSWORD` | Release signing | Key cannot be accessed |
> | `KEY_ALIAS` | Release signing | Key cannot be identified |
>
> **Note:** Debug builds can run without Android signing secrets, but release builds require all of them.
>
> See the [Environment Secrets Needed](#environment-secrets-needed) section below for detailed instructions on obtaining each secret.

---

### Workflow for Building and Testing

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run check

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7
```

### Workflow for Android APK Generation

Create `.github/workflows/android-build.yml`:

```yaml
name: Android Build

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Build type (debug/release)'
        required: true
        default: 'release'
        type: choice
        options:
          - debug
          - release

jobs:
  build-android:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Install dependencies
        run: npm ci

      - name: Build web application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Sync Capacitor
        run: npx cap sync android

      - name: Decode keystore
        if: github.event_name == 'push' || github.event.inputs.build_type == 'release'
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/shawnsworks-release.keystore

      - name: Create keystore.properties
        if: github.event_name == 'push' || github.event.inputs.build_type == 'release'
        run: |
          cat > android/keystore.properties << EOF
          storePassword=${{ secrets.KEYSTORE_PASSWORD }}
          keyPassword=${{ secrets.KEY_PASSWORD }}
          keyAlias=${{ secrets.KEY_ALIAS }}
          storeFile=../shawnsworks-release.keystore
          EOF

      - name: Build Debug APK
        if: github.event.inputs.build_type == 'debug'
        run: |
          cd android
          ./gradlew assembleDebug

      - name: Build Release APK
        if: github.event_name == 'push' || github.event.inputs.build_type == 'release'
        run: |
          cd android
          ./gradlew assembleRelease

      - name: Build Release AAB
        if: github.event_name == 'push'
        run: |
          cd android
          ./gradlew bundleRelease

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: |
            android/app/build/outputs/apk/debug/*.apk
            android/app/build/outputs/apk/release/*.apk
          retention-days: 30

      - name: Upload AAB
        if: github.event_name == 'push'
        uses: actions/upload-artifact@v4
        with:
          name: android-aab
          path: android/app/build/outputs/bundle/release/*.aab
          retention-days: 30

      - name: Upload to GitHub Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            android/app/build/outputs/apk/release/*.apk
            android/app/build/outputs/bundle/release/*.aab
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Environment Secrets Needed

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Required Secrets

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | From Neon or your database provider |
| `OPENAI_API_KEY` | OpenAI API key for AI features | From OpenAI dashboard |
| `SESSION_SECRET` | Express session secret | Generate: `openssl rand -base64 32` |

#### Android Build Secrets

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded keystore file | `base64 -w 0 shawnsworks-release.keystore` |
| `KEYSTORE_PASSWORD` | Keystore password | Set during keystore creation |
| `KEY_PASSWORD` | Key password | Set during keystore creation |
| `KEY_ALIAS` | Key alias (e.g., `shawnsworks`) | Set during keystore creation |

#### Optional Secrets

| Secret Name | Description | When Needed |
|-------------|-------------|-------------|
| `GOOGLE_SERVICES_JSON` | Firebase config (Base64) | For push notifications |
| `SENTRY_DSN` | Sentry error tracking | For error monitoring |

---

## Release Management

### Git Tagging Conventions

Use semantic versioning (SemVer) for all releases:

```
v{MAJOR}.{MINOR}.{PATCH}[-{PRERELEASE}]
```

| Version Type | When to Increment | Example |
|--------------|-------------------|---------|
| MAJOR | Breaking changes | `v2.0.0` |
| MINOR | New features (backward compatible) | `v1.1.0` |
| PATCH | Bug fixes | `v1.0.1` |
| PRERELEASE | Beta/alpha releases | `v1.0.0-beta.1` |

**Creating a Release Tag:**

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial production release"

# Push tag to remote
git push origin v1.0.0

# Push all tags
git push origin --tags
```

### CHANGELOG.md Format

Create and maintain a `CHANGELOG.md` file in the repository root:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Features in development

### Changed
- Changes in development

### Fixed
- Fixes in development

---

## [1.0.0] - 2025-12-05

### Added
- Multi-chain portfolio dashboard with real-time balance tracking
- AI-powered trading signals with GPT-5 analysis
- Cross-chain bridge interface for token transfers
- Multi-chain staking with APY comparison
- Network status monitoring for supported chains
- Dark/light theme toggle
- Mobile-responsive design
- PWA support with offline capabilities
- Android app via Capacitor

### Supported Networks
- Ethereum Mainnet
- Polygon
- Base
- Arbitrum One
- Optimism
- Avalanche C-Chain

---

## [0.1.0] - 2025-11-15

### Added
- Initial project setup
- Basic React frontend with Vite
- Express.js backend
- PostgreSQL database with Drizzle ORM
- shadcn/ui component library integration

[Unreleased]: https://github.com/YOUR_USERNAME/shawnsworks/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/YOUR_USERNAME/shawnsworks/releases/tag/v1.0.0
[0.1.0]: https://github.com/YOUR_USERNAME/shawnsworks/releases/tag/v0.1.0
```

### GitHub Releases Process

1. **Prepare the Release**
   ```bash
   # Ensure all changes are committed
   git status
   
   # Update CHANGELOG.md with release notes
   # Update version in android/app/build.gradle (versionName and versionCode)
   # Commit version changes
   git add CHANGELOG.md android/app/build.gradle
   git commit -m "chore: prepare release v1.0.0"
   ```

2. **Create and Push Tag**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin main
   git push origin v1.0.0
   ```

3. **GitHub Actions Automation**
   - Pushing a tag triggers the Android build workflow
   - APK and AAB are automatically uploaded to the release

4. **Create GitHub Release**
   - Go to `Releases > Draft a new release`
   - Select the tag `v1.0.0`
   - Title: `SHAWNSWORKS v1.0.0`
   - Description: Copy from CHANGELOG.md
   - Attach additional assets if needed
   - Publish release

---

## Contributing Guidelines

### Code Style Expectations

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow existing code patterns in the repository
- Use ES modules (`import`/`export`)
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names

#### React Components
- Use functional components with hooks
- Co-locate related components in the same file when small
- Use shadcn/ui components from `@/components/ui`
- Follow the design guidelines in `design_guidelines.md`

#### Styling
- Use Tailwind CSS utility classes
- Follow the spacing and color conventions in `design_guidelines.md`
- Use CSS variables for theme colors (defined in `index.css`)

#### File Naming
- React components: PascalCase (`Dashboard.tsx`)
- Utilities and hooks: camelCase (`useToast.ts`)
- Configuration: kebab-case or standard names (`tailwind.config.ts`)

### PR Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clear, focused commits
   - Follow commit message conventions (see below)

3. **Test Locally**
   ```bash
   # Type check
   npm run check
   
   # Build
   npm run build
   
   # Run locally
   npm run dev
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a Pull Request on GitHub
   - Fill out the PR template
   - Request review from maintainers

5. **PR Checklist**
   - [ ] Code follows project style guidelines
   - [ ] Changes are tested locally
   - [ ] CHANGELOG.md updated (for features/fixes)
   - [ ] No console errors or warnings
   - [ ] Mobile responsive (if UI changes)
   - [ ] Dark mode works correctly (if UI changes)

#### Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(bridge): add support for Avalanche network
fix(wallet): resolve connection timeout on mobile
docs(readme): update installation instructions
refactor(api): consolidate trading signal endpoints
```

### Issue and PR Templates

This repository includes ready-to-use GitHub templates for issues and pull requests. These templates are automatically used when creating new issues or PRs on GitHub.

#### Available Templates

| Template | Location | Purpose |
|----------|----------|---------|
| Bug Report | [`.github/ISSUE_TEMPLATE/bug_report.md`](../.github/ISSUE_TEMPLATE/bug_report.md) | Report bugs with environment and reproduction steps |
| Feature Request | [`.github/ISSUE_TEMPLATE/feature_request.md`](../.github/ISSUE_TEMPLATE/feature_request.md) | Suggest new features or improvements |
| Pull Request | [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md) | Standardized PR format with checklist |

#### Contributing Guide

For detailed contribution guidelines, including code style, commit conventions, and the full PR process, see:

📖 **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Comprehensive contribution guidelines

#### Template Highlights

**Bug Report Template includes:**
- Bug description and reproduction steps
- Expected vs actual behavior
- Environment details (device, OS, browser, app version)
- Network and wallet information for blockchain-related issues
- Space for console errors and screenshots

**Feature Request Template includes:**
- Problem statement
- Proposed and alternative solutions
- Use cases
- Network/chain considerations for blockchain features
- Space for mockups and examples

**Pull Request Template includes:**
- Change type classification
- Related issues linking
- Testing checklist (local, mobile, dark mode, wallet, networks)
- Code style and documentation checklist
- Before/after screenshot comparison table

---

## Quick Start Checklist

When pushing to a new GitHub repository:

- [ ] Initialize git repository
- [ ] Create `.gitignore` with recommended entries
- [ ] Create `.github/workflows/ci.yml` for CI
- [ ] Create `.github/workflows/android-build.yml` for Android builds
- [ ] **Configure repository secrets in GitHub Settings** (see [Required Secrets Warning](#github-actions-cicd))
- [ ] Verify issue and PR templates exist in `.github/` (already included in this repo)
- [ ] Verify `CONTRIBUTING.md` exists (already included in this repo)
- [ ] Create initial `CHANGELOG.md`
- [ ] Add LICENSE file (MIT, Apache 2.0, etc.)
- [ ] Push initial commit with tag `v0.1.0`

### Files Already Included

This repository already includes the following contribution templates:

```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md        # Bug report template
│   └── feature_request.md   # Feature request template
└── PULL_REQUEST_TEMPLATE.md # PR template

CONTRIBUTING.md              # Contribution guidelines
```

---

## Support

For questions about the GitHub setup:
- GitHub Actions: https://docs.github.com/en/actions
- GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github
- Conventional Commits: https://www.conventionalcommits.org/
