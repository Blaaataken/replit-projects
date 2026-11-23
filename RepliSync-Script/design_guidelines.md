# Design Guidelines: Replit-to-GitHub Sync Tool

## Design Approach
**Selected Approach:** Design System (Material Design)
**Rationale:** This is a productivity/utility tool focused on efficiency and clear information architecture. Material Design provides excellent patterns for data-heavy applications with strong visual feedback for actions.

## Core Design Elements

### Typography
- **Primary Font:** Inter (via Google Fonts)
- **Headings:** 
  - H1: text-3xl font-semibold (Dashboard title)
  - H2: text-xl font-semibold (Section headers)
  - H3: text-lg font-medium (Card titles)
- **Body:** text-base font-normal
- **Labels/Meta:** text-sm font-medium
- **Captions:** text-xs

### Layout System
**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8
- Component padding: p-4, p-6
- Section margins: mb-6, mb-8
- Grid gaps: gap-4, gap-6
- Container: max-w-7xl mx-auto px-4

### Component Library

**Dashboard Structure:**
1. **Top Navigation Bar** (sticky)
   - Logo/app name (left)
   - Connection status indicators for Replit + GitHub (right)
   - User avatar/settings dropdown (right)

2. **Main Content Area** (3-column responsive grid)
   - Left sidebar (navigation): Projects, Settings, Sync History
   - Center panel: Project selection with checkboxes, search/filter
   - Right panel: Sync preview/configuration

3. **Project Cards:**
   - Project name (bold)
   - Last modified timestamp
   - File count badge
   - Sync status indicator (synced/pending/error icons)
   - Checkbox for batch selection

4. **Action Components:**
   - Primary button: "Sync Selected Projects" (prominent, full-width or fixed bottom on mobile)
   - Secondary actions: "Select All", "Refresh Projects"

5. **Sync Progress Modal:**
   - Overlay with progress indicators
   - List showing each project with status (in-progress spinner, success checkmark, error icon)
   - Overall progress bar
   - Cancel/close options

6. **Configuration Panel:**
   - API token inputs (masked password fields)
   - Connection test buttons with status feedback
   - Save configuration action

**Icons:** Font Awesome (via CDN) for consistent utility icons
- Checkmarks, spinners, error triangles, GitHub/Replit logos

**Form Elements:**
- Input fields: rounded-md border with focus:ring states
- Checkboxes: larger touch targets (w-5 h-5)
- All inputs with clear labels and helper text

### Responsive Behavior
- Desktop (lg+): 3-column layout
- Tablet (md): 2-column (hide sidebar, add hamburger menu)
- Mobile: Single column stack, sticky action button at bottom

### Feedback & States
- Loading: Subtle skeleton screens for project list
- Success: Toast notifications (top-right)
- Errors: Inline error messages with retry actions
- Empty states: Helpful illustrations + connection guidance

## Images
**No hero image required** - This is a utility dashboard focused on functionality. Use icon-based illustrations for empty states only.