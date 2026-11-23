# Design Guidelines for Alice AI Assistant

## Design Approach

**Selected Approach:** Design System + Reference Hybrid

Drawing inspiration from modern AI conversational interfaces (ChatGPT, Claude) combined with productivity dashboard patterns (Notion, Linear). This approach prioritizes:
- Clean, distraction-free conversation interface
- Clear information hierarchy for complex data (goals, tasks, suggestions)
- Responsive layouts optimized for extended reading and interaction
- Professional, trustworthy aesthetic that builds user confidence

## Typography System

**Font Families:**
- Primary: Inter (headings, UI elements, conversation)
- Monospace: JetBrains Mono (code snippets, technical data)

**Scale:**
- Page titles: text-4xl font-bold
- Section headers: text-2xl font-semibold
- Conversation messages: text-base leading-relaxed
- UI labels: text-sm font-medium
- Metadata/timestamps: text-xs

## Layout & Spacing

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16 consistently (e.g., p-4, gap-8, mb-12)

**Core Layout Structure:**
- Two-column desktop layout: Sidebar (w-64 fixed) + Main content (flex-1)
- Single column mobile: Stack sidebar as drawer/modal
- Main content max-width: max-w-4xl mx-auto for optimal reading
- Conversation area: max-w-3xl for comfortable message width

## Component Library

### Navigation & Structure

**Sidebar (Desktop):**
- Fixed left sidebar containing: User profile card, New conversation button, Conversation history list, Goals overview widget, Settings link
- Compact list items with icons and truncated text
- Active conversation highlighted with subtle indicator
- Collapsible sections for organization

**Mobile Navigation:**
- Top bar with hamburger menu, Alice logo/title, and voice toggle
- Slide-out drawer for full navigation
- Floating action button for new conversation

### Conversational Interface

**Chat Container:**
- Full-height conversation area with smooth scrolling
- Messages aligned: Alice (left), User (right)
- Clear visual distinction between speakers using layout positioning
- Generous message spacing (space-y-6)
- Timestamps in text-xs above message groups

**Message Bubbles:**
- Alice messages: Full-width blocks with subtle background, rounded-lg borders
- User messages: Compact blocks, rounded-lg, aligned right
- Code blocks: Syntax highlighting with copy button
- Loading states: Animated typing indicator for Alice responses

**Input Area:**
- Fixed bottom position with backdrop blur
- Multi-line textarea with auto-expand (max 6 lines)
- Send button, voice input button, attachment icon
- Suggestion chips above input for quick actions

### Dashboard & Data Visualization

**Goals Dashboard:**
- Card-based layout: grid grid-cols-1 md:grid-cols-2 gap-6
- Goal cards with progress bars (h-2 rounded-full), percentage, target date
- Quick-add goal button prominent at top
- Filter/sort controls as pill buttons

**Insights Panel:**
- Dedicated section for Alice's proactive suggestions
- Timeline view showing suggestion history
- Actionable cards with accept/dismiss controls
- Priority indicators for time-sensitive suggestions

**Profile & Learning Section:**
- Tabbed interface showing: Preferences, Interaction patterns, Goal history
- Data visualization using simple bar/line charts
- Editable preference cards with inline editing

### Forms & Inputs

**Text Inputs:**
- Consistent height (h-10 for standard, h-12 for prominent)
- Rounded corners (rounded-md)
- Clear focus states with ring emphasis
- Inline validation messages below inputs

**Buttons:**
- Primary actions: Prominent size (px-6 py-3), rounded-lg
- Secondary actions: Outline style, same sizing
- Icon buttons: Square (w-10 h-10), centered icon
- All buttons include blur backdrop when over images

### Voice & Media Controls

**Voice Interface:**
- Large circular voice button when active (w-16 h-16)
- Pulsing animation during listening
- Waveform visualization during speech
- Clear toggle between text/voice modes

**Status Indicators:**
- Microphone access indicator
- Connection status badge
- Processing/thinking indicators for Alice

## Page Structures

### Main Conversation View
- Sidebar (desktop only)
- Header: Conversation title, context actions
- Message area: Full conversation history with infinite scroll
- Input area: Fixed bottom with voice/text options

### Goals Dashboard
- Grid layout of active goals
- Quick stats header: Total goals, completion rate, streaks
- Add new goal prominent CTA
- Completed goals collapsible section

### Onboarding Flow
- Full-screen centered cards (max-w-lg)
- Step indicators at top
- Welcome to Alice, Set preferences, Voice calibration, First goal
- Progress indicator showing steps

## Images

**Profile/Avatar Images:**
- Alice avatar: Circular icon (w-10 h-10) in sidebar and messages - use geometric/abstract representation
- User avatar: Circular, same sizing, appears in user messages

**Hero/Welcome Screen:**
- First-time users see full-screen welcome: Large Alice wordmark/logo centered, animated greeting text, Begin conversation CTA
- No traditional hero image needed - focus on clean, welcoming interface

**Illustrations:**
- Empty states: Simple line illustrations for empty conversation history, no goals yet
- Success states: Celebratory micro-illustrations when goals completed

## Animations

**Essential Only:**
- Message appearance: Fade-in with subtle slide-up (100ms)
- Voice activation: Pulse animation on button
- Loading: Typing indicator dots
- Goal completion: Brief confetti or checkmark animation
- NO scroll-triggered animations, parallax, or decorative motion

## Accessibility

- Consistent focus indicators across all interactive elements
- ARIA labels for icon-only buttons
- Keyboard navigation: Tab through messages, inputs, goals
- Voice controls announced to screen readers
- High contrast mode support for text and borders

This design creates a professional, focused environment where users can engage with Alice naturally while maintaining clear access to their goals, history, and preferences.