# Design Guidelines: Multi-Modal AI Assistant

## Design Approach
**System:** Modern AI Chat Interface (ChatGPT/Claude-inspired) with Linear's typography precision
**Rationale:** Utility-focused productivity tool requiring clarity, efficiency, and trust. Clean, distraction-free interface that puts AI conversation at the center while supporting complex multi-modal interactions.

## Core Design Principles
1. Conversation-first: Everything serves the chat experience
2. Clear hierarchy: Distinguish user input, AI responses, and system feedback
3. Accessible multi-modality: Voice/video controls feel natural, not bolted-on
4. Trust through clarity: Transparent when AI is processing or using past context

---

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for code blocks in AI responses)

**Scale:**
- Headings: text-2xl font-semibold (page titles)
- AI Responses: text-base leading-relaxed (readable body text)
- User Messages: text-base
- Metadata/timestamps: text-sm text-gray-500
- Code blocks: text-sm font-mono

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8
- Component padding: p-4 to p-6
- Section gaps: gap-4 to gap-6
- Container margins: m-4 to m-8

**Structure:**
- Main chat area: max-w-3xl mx-auto (optimal reading width)
- Sidebar (history): w-64 fixed left
- Input controls: sticky bottom-0 with backdrop-blur-lg

---

## Component Library

### Chat Interface
**Message Bubbles:**
- User messages: Right-aligned, subtle background (bg-blue-50)
- AI responses: Left-aligned, clean white background with border
- Markdown rendering: Headings, lists, code blocks, inline code
- Streaming indicator: Subtle pulsing cursor during generation

**Multi-Modal Input Panel:**
- Text input: Large textarea (min-h-20) with auto-expand
- Voice recorder: Circular button with recording pulse animation (red when active)
- Video capture: Camera icon button, opens inline preview
- Send button: Prominent primary action (always visible)
- Layout: Flex row with input taking flex-1, controls on right

### Navigation & History
**Sidebar:**
- Conversation list: Grouped by date (Today, Yesterday, Last 7 Days)
- Each item: Title preview, timestamp, knowledge badge if contains learned info
- New chat button: Prominent at top
- Search conversations: Input at top of sidebar

**Header:**
- App title/logo: Left
- Current session indicator: Center
- Settings/profile: Right
- Clean separation with subtle bottom border

### System Feedback
**Processing States:**
- Loading: "Analyzing video..." or "Processing voice input..." with spinner
- Context usage: Small badge showing "Using 3 past conversations"
- Knowledge retrieval: Inline citation when AI references learned information

### Knowledge Base Indicators
- Pills/badges showing topic categories
- Timeline view of learning progress
- Visual distinction for AI responses that incorporate learned knowledge

---

## Interaction Patterns

**Voice Recording:**
- Click to start recording (button turns red)
- Visual waveform during recording
- Click again to stop and send
- Cancel option while recording

**Video Capture:**
- Click camera icon opens modal/inline preview
- Show live camera feed
- Capture button (snapshot) or record button (video)
- Confirm/retake options before sending

**Conversation Threading:**
- Linear conversation flow (no branches in MVP)
- Clear visual separation between messages
- Timestamp on hover for each message

---

## Visual Polish

**Elevations:**
- Input panel: shadow-lg
- Message bubbles: shadow-sm
- Modals: shadow-2xl

**Borders:**
- Subtle borders (border-gray-200) for separation
- Rounded corners: rounded-lg for panels, rounded-xl for modals

**Responsiveness:**
- Mobile: Sidebar becomes slide-out drawer
- Input controls stack vertically on small screens
- Messages maintain readability at all breakpoints

---

## Icons
**Library:** Heroicons (via CDN)
- Microphone, video camera, send, new chat, search, settings
- No custom SVG icons - use library consistently

---

## Accessibility
- High contrast text (text-gray-900 for body)
- Focus states on all interactive elements (ring-2 ring-blue-500)
- ARIA labels for voice/video controls
- Keyboard shortcuts: Ctrl+Enter to send, Esc to cancel recording

---

## Images
No hero images needed - this is a tool interface, not a marketing page. The conversation is the content. Optional: Small illustration in empty state ("Start a new conversation").