---
applyTo: "**/*.tsx,**/*.jsx,**/*.ts,**/*.js,**/*.html,**/*.css,**/*.scss"
---

# Motif Design System — EY Engineering Standards

Motif is EY's enterprise design system built on Web Components. All UI code in this project **must** follow these standards.

## Package References

```bash
@ey-xd/motif-components      # Web Components core
@ey-xd/motif-wc-react        # React wrappers
@ey-xd/motif-wc-angular      # Angular wrappers
@ey-xd/motif-icon            # Iconoir-based icon library
```

Registry: `https://eyctpeu.jfrog.io/artifactory/api/npm/ey-npm/`

---

## Non-Negotiable Rules

1. **Never use custom CSS for colours** — always use Motif design tokens (`--color-*`, `--spacing-*`)
2. **Never build custom UI components** that duplicate existing Motif components — check the library first
3. **Never use `px` for typography** — use the Motif type scale classes or `rem`
4. **Always include ARIA labels** on icon-only buttons and interactive elements
5. **Always use the Motif grid system** for page layout — `motif-container > motif-row > motif-col-*`
6. **Support both light and dark themes** via `data-motif-theme` attribute — never hard-code colours

---

## React Usage

```jsx
import { MotifButton, MotifCard, MotifHeader } from '@ey-xd/motif-wc-react';
import '@ey-xd/motif-components/dist/motif-components.css';

function Page() {
  return (
    <div className="motif-container">
      <MotifHeader>
        <div slot="left"><h1 className="motif-heading-4">App Name</h1></div>
        <div slot="right"><MotifButton variant="primary">Action</MotifButton></div>
      </MotifHeader>
      <main className="motif-content">
        <MotifCard>
          <div className="motif-card-body">
            <h2 className="motif-heading-5">Title</h2>
            <p className="motif-body-1">Content.</p>
          </div>
        </MotifCard>
      </main>
    </div>
  );
}
```

## HTML Fallback (when Web Components unavailable)

Use standard HTML with Motif CSS classes — do **not** invent class names:

```html
<html lang="en" data-motif-theme="light">
<body class="motif-theme-light">
  <header class="motif-header" role="banner">
    <div class="motif-header-content">
      <div class="motif-header-left">
        <h1 class="motif-heading-4">App Name</h1>
      </div>
      <div class="motif-header-right">
        <button class="motif-button-primary">Action</button>
      </div>
    </div>
  </header>
  <main class="motif-content" role="main">
    <div class="motif-card">
      <div class="motif-card-body">
        <h2 class="motif-heading-5">Title</h2>
        <p class="motif-body-1">Content.</p>
      </div>
    </div>
  </main>
</body>
</html>
```

---

## Design Tokens — Approved Values Only

### Colours

| Token | Value | Use |
|---|---|---|
| `--color-primary-grey-500` | `#2E2E38` | Primary text, surfaces |
| `--color-primary-yellow` | `#FFE600` | EY brand accent |
| `--color-primary-white` | `#FFFFFF` | Backgrounds |
| `--color-primary-black` | `#1A1A24` | Dark theme base |
| `--color-success` | `#26A04B` | Success states |
| `--color-warning` | `#FF9831` | Warning states |
| `--color-error` | `#D92D20` | Error states |
| `--color-info` | `#1777CF` | Info states |
| `--color-blue-500` | `#1777CF` | Links, CTAs |
| `--color-text-primary` | `#2E2E38` | Body text |
| `--color-text-secondary` | `#656579` | Secondary text |
| `--color-border` | `#D7D7DC` | Borders |

### Spacing

| Token | Value |
|---|---|
| `--spacing-xs` | `4px` |
| `--spacing-small` | `8px` |
| `--spacing-medium` | `12px` |
| `--spacing-large` | `16px` |
| `--spacing-xl` | `24px` |
| `--spacing-xxl` | `32px` |
| `--spacing-xxxl` | `48px` |

### Border Radius

| Token | Value |
|---|---|
| `--radius-small` | `4px` |
| `--radius-medium` | `8px` |
| `--radius-large` | `12px` |
| `--radius-full` | `9999px` |

---

## Typography Classes

| Class | Size | Weight | Use |
|---|---|---|---|
| `motif-heading-4` | 28px | 400 | Page titles |
| `motif-heading-5` | 16px | 700 | Card/section titles |
| `motif-heading-6` | 14px | 700 | Sub-section titles |
| `motif-body-1` | 16px | 400 | Primary body text |
| `motif-body-2` | 14px | 300 | Secondary body text |
| `motif-body-3` | 12px | 400 | Fine print |
| `motif-caption` | 12px | 400 | Labels, captions |
| `motif-caption-bold` | 12px | 700 | Bold captions |

---

## Grid System

12-column responsive grid. Always wrap content:

```html
<div class="motif-container">         <!-- max-width: 1536px, auto margins -->
  <div class="motif-row">             <!-- 12-col grid, 24px gap -->
    <div class="motif-col-12 motif-col-md-6 motif-col-lg-4">...</div>
    <div class="motif-col-12 motif-col-md-6 motif-col-lg-4">...</div>
    <div class="motif-col-12 motif-col-md-12 motif-col-lg-4">...</div>
  </div>
</div>
```

Breakpoints: `md` = 768px+, `lg` = 1200px+

---

## Theming

```html
<!-- Light (default) -->
<html data-motif-theme="light">

<!-- Dark -->
<html data-motif-theme="dark">
```

```css
:root[data-motif-theme="light"] {
  --background-primary: #FFFFFF;
  --text-primary: #2E2E38;
}
:root[data-motif-theme="dark"] {
  --background-primary: #1A1A24;
  --text-primary: #F6F6FA;
}
```

---

## Accessibility Checklist (mandatory before PR)

- [ ] All interactive elements have `aria-label` or visible text
- [ ] Icon-only buttons have `aria-label="..."` and `aria-pressed` where relevant
- [ ] Color contrast passes WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] All form inputs have associated `<label>` elements
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader tested for critical flows

---

## Figma → Code Workflow

1. Get design context from Figma using the Figma MCP `get_design_context` tool
2. Map Figma components to their Motif equivalents — never recreate what already exists
3. Use extracted design tokens — do not hard-code values from Figma inspects
4. Implement using `@ey-xd/motif-wc-react` (React) or Motif CSS classes (HTML)

---

## Migration from Legacy Code

```html
<!-- ❌ Before -->
<div class="custom-button primary" onclick="handleClick()">Click</div>

<!-- ✅ After -->
<button class="motif-button-primary" onclick="handleClick()">Click</button>
```

Always audit: custom colours → tokens, custom spacing → tokens, custom components → Motif equivalents.

---

## Further Reference

- [Motif Web Components README](https://github.com/ey-org/motif-web-components/blob/develop/README.md)
- [Motif Copilot Instructions](https://github.com/ey-org/motif-web-components/blob/develop/.github/copilot-instructions.md)
- [Motif React Starter Kit](https://github.com/ey-org/starterkit-motif-wc-react/blob/master/.github/instructions/motif.instructions.md)
- [Motif Agents](https://github.com/ey-org/motif-web-components/tree/develop/.github/agents)
