# Design Guidelines: AI Repository Generator

## Design Approach
**Reference-Based:** Drawing inspiration from Linear (clean, developer-focused), GitHub (trusted developer tool), and modern AI tools like Cursor. Focus on clarity, trust-building, and showcasing intelligent automation.

## Typography
- **Primary Font:** Inter (Google Fonts) - modern, readable, developer-friendly
- **Headings:** Font weights 700-800, sizes: Hero (text-6xl), H2 (text-4xl), H3 (text-2xl)
- **Body:** Font weight 400-500, sizes: text-lg for main content, text-base for descriptions
- **Code/Technical:** JetBrains Mono for code snippets and repository names

## Layout System
**Spacing Units:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Section padding: py-20 to py-32 (desktop), py-12 to py-16 (mobile)
- Component spacing: gap-8 for grids, gap-6 for cards
- Container: max-w-7xl for full sections, max-w-4xl for content areas

## Page Structure

### Hero Section (80vh)
Large hero image showing a beautiful code repository visualization or AI-generated repository structure with glowing connections/nodes. Image should convey intelligence and automation.

Primary headline emphasizing "AI-Powered" and "Flawless Repositories"
Subheadline explaining instant repository creation
Two CTAs: "Generate Repository" (primary) and "See Example" (secondary) with blurred backgrounds over image

### How It Works (3-column grid)
Three feature cards in grid layout:
1. "Describe Your Project" - AI input interface
2. "AI Generates Structure" - Visualization of generation
3. "Deploy to GitHub" - One-click integration

Each card: icon at top, bold title, 2-line description, minimal animation on scroll

### Live Demo Section
Split layout (60/40):
- Left: Interactive input form showing AI prompt interface
- Right: Animated preview of generated repository structure (file tree, README preview)

### Features Showcase (2-column alternating)
Alternating image-text layout for 4 key features:
- Smart file organization
- Automatic README generation
- Best practice enforcement
- GitHub integration

### Pricing/Plans (3-column)
Simple pricing cards: Free, Pro, Enterprise
Each with clear feature lists, monthly/annual toggle

### Trust Section (4-column stats grid)
Repository count, developers using, time saved, success rate
Large numbers with subtle icons

### Footer
Rich footer with: Quick links, Documentation, GitHub integration badge, newsletter signup, social links

## Component Library

**Navigation:** Sticky header, logo left, nav links center, GitHub integration status + CTA right

**Buttons:** Rounded (rounded-lg), generous padding (px-8 py-3), clear hover states with subtle scale

**Cards:** Rounded corners (rounded-xl), subtle borders, hover lift effect, padding p-8

**Form Inputs:** Clean borders (border-2), focus ring states, placeholder text with instructions

**Code Display:** Dark background containers with syntax highlighting preview, copy button

**Progress Indicators:** For AI generation process - step indicators with connecting lines

## Icons
**Heroicons** via CDN - outline style for general UI, solid for emphasis

## Images
1. **Hero Image:** Abstract visualization of AI-generated code structure - nodes, connections, glowing elements suggesting intelligence. Full-width, 80vh height
2. **Feature Images:** Screenshots/mockups of:
   - AI prompt interface with suggested templates
   - Generated repository file structure
   - Beautiful README preview
   - GitHub integration dashboard
3. **Background Elements:** Subtle grid patterns in sections for depth without distraction

## Animations
Minimal and purposeful:
- Hero: Gentle fade-in on load
- Feature cards: Subtle slide-up on scroll into view
- Live demo: Smooth typing effect for AI generation simulation
- Stats: Count-up animation when visible

## Key Principles
- **Trust First:** Showcase real examples, clear pricing, GitHub official integration
- **Developer-Centric:** Fast, efficient, no fluff - respect developer's time
- **AI Transparency:** Show the "magic" happening - visualize the generation process
- **Professional Polish:** Every detail reinforces quality and reliability