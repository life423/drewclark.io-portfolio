# Drew Clark Portfolio (Under Construction)

A modern React + Vite + Tailwind CSS portfolio showcasing best practices in UI/UX, accessibility, and enterprise‐level code structure. Although this site is still in development, the foundation already demonstrates impressive features such as a custom mobile drawer, scroll‐based progress bar, and a well‐organized architecture.

---

## Key Highlights

### 1. **React + Vite + Tailwind Stack**
- **Vite** for fast development and optimized builds.
- **Tailwind CSS** for a utility‐first approach to styling, extended with custom color palettes and background plugins.
- **React** hooks and components for a modular, maintainable codebase.

### 2. **Custom InfinityDrawer**
- **Smooth Entrance & Exit Animations**: A left‐to‐right sliding panel for mobile navigation.
- **Backdrop Blur & Gradient**: Applies a frosted overlay with a subtle green gradient over the page content when open.
- **Accessibility**: Locks the background scroll, supports escape‐key closing, and restores focus to the previously active element.

### 3. **Scroll‐Based Progress Bar**
- Dynamically updates the width of a thin bar at the top of the page to indicate scroll progress.
- Uses a **requestAnimationFrame** approach (via a custom hook) for better performance and smooth updates.

### 4. **Custom Hook Architecture**
- **`useNavigationState`** centralizes drawer open/close logic for a cleaner “enterprise” approach.
- **`useScrollPosition`** provides efficient scroll state management for multiple components, enabling minimal re‐renders.

### 5. **Enterprise‐Ready Patterns**
- **Focus Management** in the drawer for better accessibility.
- **Conditional Rendering** of the navbar background based on scroll position.
- **Tailwind Config** extended with brand color palettes and custom background utilities.

---

## Getting Started

1. **Install Dependencies**  
   ```bash
   cd app
   npm install