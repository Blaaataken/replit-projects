# SecureTrack Design Guidelines

## Design Approach
**System Selected:** Material Design 3 + Linear-inspired dark interface  
**Rationale:** Enterprise security platforms require clarity, hierarchy, and professional polish. Material Design's elevation system works perfectly for dark themes, while Linear's restraint and typography excellence provide the modern professional aesthetic.

**Key Design Principles:**
- Command clarity over decoration
- Information density with breathing room  
- Instant action feedback for security-critical operations
- Professional restraint—no playful elements

## Core Design Elements

### Typography
- **Primary Font:** Inter via Google Fonts CDN
- **Headings:** 600 weight, tight tracking (-0.02em)
  - H1: text-2xl (Dashboard titles)
  - H2: text-xl (Section headers)
  - H3: text-lg (Card headers)
- **Body:** 400 weight, text-sm for data, text-base for descriptions
- **Mono:** JetBrains Mono for device IDs, IP addresses, serial numbers

### Layout System
**Spacing Units:** Tailwind 2, 4, 6, 8, 12 for consistency
- Component padding: p-6
- Section gaps: gap-4, gap-6
- Card spacing: space-y-6
- Icon margins: mr-2, mr-3

### Component Library

**Dashboard Structure:**
- **Sidebar (256px fixed):** Logo top, navigation items, user profile bottom
- **Main Content:** Full-width responsive grid with max-w-7xl container
- **Header Bar:** Device search, notifications, quick actions

**Navigation Items (Sidebar):**
- Dashboard overview
- Device list
- Remote controls  
- Security alerts
- Settings
- Activity logs

**Device Card Components:**
- Device thumbnail/icon, name, status badge
- Key metrics: Battery, location, last sync
- Quick action buttons (Lock, Locate, Alert)
- Expandable detailed view

**Remote Control Panel:**
Full-featured control center with grouped actions:
- **Critical Actions Section:** Lock Device, Factory Reset, Remote Shutdown (destructive red accent)
- **Security Features:** Trigger Alarm, Enable Lost Mode, Screenshot Capture
- **Tracking Controls:** GPS Tracking toggle, Geofencing, Movement alerts
- **Device Settings:** Brightness control, volume lock, app restrictions

**Data Tables:**
- Zebra striping for row differentiation
- Sortable column headers with icons (Heroicons)
- Inline action dropdowns
- Pagination controls

**Status System:**
- Active: Green accent
- Warning: Amber accent  
- Critical: Red accent
- Offline: Gray muted
- Use colored dots + text labels

**Cards & Surfaces:**
- Elevated cards with subtle borders
- Hover states with slight brightness increase
- Click states with scale transform (scale-[0.98])

**Forms & Inputs:**
- Dark input fields with light borders
- Focus rings with primary accent
- Inline validation messaging
- Toggle switches for binary controls
- Dropdown selects for mode switching

**Modals & Confirmations:**
For destructive actions (Factory Reset, Remote Shutdown):
- Dark overlay backdrop
- Centered modal with warning icon
- Action description + consequences
- Cancel (ghost) + Confirm (destructive) buttons

### Icons
**Library:** Heroicons (outline for navigation, solid for actions)
- Device types: Device-phone-mobile, Device-tablet, Computer-desktop
- Actions: Lock-closed, Bell-alert, Map-pin, Trash, Power
- Status: Check-circle, Exclamation-triangle, X-circle

### Animations
**Minimal, purposeful only:**
- Page transitions: 200ms fade
- Loading states: Pulsing skeleton screens
- Action feedback: Brief scale/color shift (150ms)
- No scroll-triggered or decorative animations

## Images

**Login/Onboarding Screen Only:**
- Abstract security visualization or device mockup grid
- Placement: Right-side panel (60% width) on desktop, top panel on mobile
- Style: Dark, tech-forward, professional photography with subtle gradient overlay

**No images needed for main dashboard** — icon-driven interface maintains focus on data and controls.

## Page-Specific Layouts

**Dashboard Overview:**
- Top: Summary cards row (Total Devices, Active, Alerts, Offline) - 4 columns
- Middle: Recent activity timeline (left 2/3) + Quick actions panel (right 1/3)
- Bottom: Device status map visualization

**Device List View:**
- Search/filter bar with status toggles
- Responsive grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card shows device preview, essential info, quick actions

**Remote Control Interface:**
- Device preview panel (top)
- Tabbed control sections: Security, Tracking, Settings, Advanced
- Each tab reveals relevant grouped controls with clear labels
- Real-time device status updates in fixed top bar

**Settings Page:**
- Two-column: Navigation tree (left 1/4) + Content area (right 3/4)
- Forms use consistent field sizing and spacing

This design balances enterprise-grade functionality with modern interface patterns, ensuring power users can access deep controls while maintaining an approachable, professional aesthetic.