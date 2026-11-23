# Design Guidelines: AI Coding Unity Assistant

## Brand Identity

**Purpose**: An AI-driven coding companion that helps developers design efficient, versatile algorithms while fostering collaborative learning across diverse communities.

**Aesthetic Direction**: **Editorial/Sophisticated** with subtle tech accents. Think MIT Technology Review meets Notion - clean typographic hierarchy, breathing room, intelligent use of whitespace. The app should feel like a trusted research partner, not a flashy consumer app.

**Memorable Element**: Constellation network pattern - subtle connecting dots/lines that appear in backgrounds and transitions, symbolizing unity and interconnected systems. This motif appears subtly throughout (splash screen, empty states, loading animations).

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs with FAB)
- **Home** (house icon): Conversation history and quick actions
- **Library** (book icon): Saved algorithms and code snippets
- **Floating Action Button** (plus icon): Start new AI session (core action)
- **Learn** (lightbulb icon): Tutorials, patterns, resources
- **Profile** (user icon): Account settings, preferences

**Authentication**: Required
- Apple Sign-In (primary for iOS)
- Google Sign-In (secondary/Android)
- Mock auth flow with local state persistence
- Includes Privacy Policy & Terms links

## Screen-by-Screen Specifications

### 1. Splash Screen
- **Purpose**: App launch experience
- **Layout**: Full-screen centered logo with constellation animation
- **Components**: App icon, constellation network pattern (animated), app name in display font
- **Asset**: splash-icon.png (constellation network design)

### 2. Login/Signup
- **Purpose**: Authentication entry
- **Layout**: Centered form, no header
- **Components**: 
  - App logo + tagline
  - "Continue with Apple" button (rounded, elevated)
  - "Continue with Google" button (outlined)
  - Footer links (Privacy, Terms)
- **Safe Area**: top: insets.top + Spacing.xl, bottom: insets.bottom + Spacing.xl

### 3. Home (Conversation Hub)
- **Purpose**: Access recent AI sessions and start new ones
- **Layout**: 
  - Header: Transparent with greeting text ("Good morning, [Name]"), settings icon (right)
  - Main: ScrollView with section headers
- **Components**:
  - Quick action cards (3 shortcuts: "Algorithm Design", "Code Review", "Debug Help")
  - Recent sessions list (cards with timestamp, preview)
  - Empty state: "Start Your First Session" with illustration
- **Safe Area**: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl
- **Asset**: empty-sessions.png (constellation with single bright star)

### 4. AI Chat Session (Modal)
- **Purpose**: Interactive coding conversation with AI
- **Layout**:
  - Header: Custom with session title (editable), close button (left), share icon (right)
  - Main: Message list (inverted FlatList)
  - Footer: Input bar with text field, send button (floating above keyboard)
- **Components**:
  - Message bubbles (user: right-aligned, AI: left-aligned with avatar)
  - Code blocks with syntax highlighting (dark theme)
  - Typing indicator (animated dots)
- **Safe Area**: Input bar above keyboard, messages list: top: Spacing.xl

### 5. Library
- **Purpose**: Browse and organize saved algorithms/code
- **Layout**:
  - Header: Default with "Library" title, search icon (right)
  - Main: Segmented control (Algorithms | Snippets | Favorites), grid of cards below
- **Components**:
  - Filter chips (Language, Complexity, Date)
  - Algorithm cards (title, language tag, date, complexity badge)
  - Empty state for each segment
- **Safe Area**: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl
- **Assets**: empty-library.png (open book with constellation), empty-favorites.png (star constellation)

### 6. Algorithm Detail (Stack)
- **Purpose**: View and edit saved algorithm with AI insights
- **Layout**:
  - Header: Default with algorithm name, edit icon (right)
  - Main: ScrollView
- **Components**:
  - Metadata row (language, complexity, date)
  - Code viewer (syntax highlighted, scrollable horizontally)
  - AI explanation section (expandable)
  - Related algorithms section (horizontal scroll)
- **Safe Area**: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

### 7. Learn
- **Purpose**: Educational resources and patterns
- **Layout**:
  - Header: Transparent, "Learn" title, filter icon (right)
  - Main: ScrollView with category sections
- **Components**:
  - Featured tutorial card (hero image, title, duration)
  - Category tabs (Data Structures, Algorithms, Design Patterns)
  - Tutorial list items (thumbnail, title, progress bar)
- **Safe Area**: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl
- **Asset**: learn-hero.png (abstract geometric shapes forming unity symbol)

### 8. Profile
- **Purpose**: Account management and preferences
- **Layout**:
  - Header: Default, "Profile" title
  - Main: ScrollView
- **Components**:
  - Avatar (customizable) + name + email
  - Settings sections: Preferences, AI Behavior, Privacy, Account
  - Theme toggle (Light/Dark/Auto)
  - Language selection
  - Log out button (bottom, destructive style)
- **Safe Area**: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl
- **Asset**: default-avatar.png (abstract developer portrait)

## Color Palette

**Primary**: #2D3748 (Deep slate - intelligent, grounded)
**Accent**: #4FD1C5 (Teal - unity, connection, tech-forward)
**Background**: #F7FAFC (Cool white)
**Surface**: #FFFFFF
**Text Primary**: #1A202C
**Text Secondary**: #718096
**Success**: #48BB78
**Warning**: #ED8936
**Error**: #F56565
**Code Background**: #1A202C (for syntax blocks)

## Typography

**Display Font**: Montserrat (Google Font) - Bold, confident
**Body Font**: Inter (Google Font) - Highly legible, professional

**Type Scale**:
- Display: Montserrat Bold 28px
- Title: Montserrat SemiBold 20px
- Headline: Inter SemiBold 16px
- Body: Inter Regular 15px
- Caption: Inter Regular 13px
- Code: Menlo/Monaco 14px (monospace)

## Visual Design

- Icons: Feather icon set (@expo/vector-icons)
- Corner Radius: 12px (cards), 8px (buttons), 6px (inputs)
- Floating buttons: shadowOffset (0, 2), shadowOpacity 0.10, shadowRadius 2
- All touchable elements have 50% opacity press feedback
- Transitions: 200ms ease-out for most interactions

## Assets to Generate

1. **icon.png** - App icon with constellation network motif (rounded square)
   - WHERE USED: Device home screen

2. **splash-icon.png** - Constellation network with central bright node
   - WHERE USED: Splash screen

3. **empty-sessions.png** - Single bright star in constellation network
   - WHERE USED: Home screen empty state

4. **empty-library.png** - Open book with constellation emerging
   - WHERE USED: Library screen (no algorithms saved)

5. **empty-favorites.png** - Star constellation forming heart shape
   - WHERE USED: Library favorites tab empty state

6. **learn-hero.png** - Abstract geometric shapes forming unity symbol
   - WHERE USED: Learn screen featured section

7. **default-avatar.png** - Abstract developer portrait (geometric, teal accent)
   - WHERE USED: Profile screen, chat AI avatar