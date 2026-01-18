# Responsive Centered Layout Pattern

This document explains the layout pattern used in the landing page UI to achieve perfect centering across all device sizes with responsive scaling.

## Core Layout Principles

### 1. Always-Centered Container
The entire content block remains vertically and horizontally centered regardless of screen size.

```tsx
<div className="min-h-screen w-full flex flex-col items-center justify-center">
  <main className="relative z-20 w-full max-w-3xl flex flex-col items-center my-auto">
    {/* Content */}
  </main>
</div>
```

**Key CSS Properties:**
- `min-h-screen` - Full viewport height
- `flex flex-col items-center justify-center` - Centers content both horizontally and vertically
- `my-auto` - Additional vertical centering for the main content
- `max-w-3xl` - Constrains maximum width for larger screens

---

## Responsive Sizing Strategy

### 2. Viewport-Based Image Sizing
Instead of fixed pixel values, use viewport units with min/max constraints.

```tsx
<div className="w-[28vw] max-w-[160px] min-w-[120px] aspect-square">
  <Image src="/path" fill className="object-contain" />
</div>
```

**Why this works:**
- `w-[28vw]` - Scales with viewport width (28% of screen width)
- `max-w-[160px]` - Prevents being too large on big screens
- `min-w-[120px]` - Prevents being too small on tiny screens
- `aspect-square` - Maintains 1:1 ratio without fixed height
- `fill` + `object-contain` - Image fills container while preserving aspect ratio

---

### 3. Global Scale Transform
Apply consistent scaling across all screen sizes.

```tsx
<main className="scale-110 md:scale-125">
  {/* All content */}
</main>
```

**Scaling approach:**
- Mobile: `scale-110` (110% of original size)
- Desktop: `md:scale-125` (125% of original size)
- Scales entire component uniformly, including spacing

---

## Responsive Spacing System

### 4. Mobile-First Spacing
Use smaller spacing on mobile, increase on larger screens.

```tsx
{/* Tight spacing on mobile, more generous on desktop */}
<div className="mb-6 md:mb-8">
  
<div className="mb-10 md:mb-12">
  
<div className="px-6 py-12 md:p-6">
```

**Pattern:**
- Start with mobile values (e.g., `mb-6`, `px-6`)
- Add desktop breakpoint values (e.g., `md:mb-8`, `md:p-6`)
- Uses Tailwind's spacing scale (4px increments)

---

## Typography Responsiveness

### 5. Fluid Typography Scaling

```tsx
{/* Progressive text sizing */}
<span className="text-[10px] md:text-[11px]">Label</span>
<h1 className="text-6xl md:text-7xl lg:text-9xl">Heading</h1>
<span className="text-sm md:text-base">Button</span>
```

**Breakpoint strategy:**
- Mobile: Smallest readable size
- Tablet (`md:`): Medium size
- Desktop (`lg:`): Largest, most impactful size

---

## Z-Index Layering

### 6. Proper Layer Stacking

```tsx
{/* Background layers */}
<div className="absolute inset-0 z-0">Ambient glows</div>

{/* Texture overlay */}
<div className="absolute inset-0 z-10">Grain texture</div>

{/* Content on top */}
<main className="relative z-20">Content</main>
```

**Layer order (bottom to top):**
1. `z-0` - Background effects (blur circles)
2. `z-10` - Grain texture overlay
3. `z-20` - Main content

---

## Complete Implementation Example

```tsx
export default function ResponsivePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFCFB] px-6 py-12 md:p-6 overflow-hidden relative">
      
      {/* Background Layer - z-0 */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#F5F5F0] blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#F0F0EB] blur-[120px] opacity-40" />
      </div>

      {/* Texture Layer - z-10 */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none z-10">
        {/* SVG noise filter */}
      </div>

      {/* Content Layer - z-20 */}
      <main className="relative z-20 w-full max-w-3xl flex flex-col items-center my-auto scale-110 md:scale-125">
        
        {/* Mascot - Viewport-based sizing */}
        <div className="mb-6 md:mb-8 relative group w-[28vw] max-w-[160px] min-w-[120px] aspect-square">
          <Image 
            src="/images/mascot.png" 
            fill 
            className="object-contain"
            priority
          />
        </div>

        {/* Label - Responsive spacing and text */}
        <div className="mb-6 md:mb-8 flex items-center gap-3 md:gap-4">
          <div className="h-[1px] w-8 md:w-10 bg-[#E5E5E0]" />
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em]">
            Label Text
          </span>
          <div className="h-[1px] w-8 md:w-10 bg-[#E5E5E0]" />
        </div>

        {/* Heading - Progressive text scaling */}
        <h1 className="text-6xl md:text-7xl lg:text-9xl font-extralight text-center leading-[0.9] mb-10 md:mb-12">
          Main Heading
        </h1>

        {/* CTA Button - Responsive padding */}
        <button className="px-12 md:px-14 py-4 md:py-5 bg-[#1A1A1A] text-white rounded-full">
          <span className="text-sm md:text-base tracking-widest uppercase">
            Button Text
          </span>
        </button>

      </main>
    </div>
  );
}
```

---

## Key Takeaways

### ✅ Do's:
1. Use `min-h-screen` + `flex` + `justify-center` for vertical centering
2. Use viewport units (`vw`) with `min-w` and `max-w` constraints for images
3. Apply `scale` transforms for uniform content scaling
4. Use mobile-first responsive spacing (`mb-6 md:mb-8`)
5. Layer with proper z-index (`z-0`, `z-10`, `z-20`)
6. Use `aspect-square` instead of fixed height for images
7. Use `fill` + `object-contain` for Next.js Image components

### ❌ Don'ts:
1. Don't use fixed pixel heights for containers
2. Don't use fixed pixel sizes for images without constraints
3. Don't forget `relative` on parent when using z-index
4. Don't use `object-cover` if you need to preserve aspect ratio
5. Don't skip the `my-auto` on the main content container
6. Don't forget `overflow-hidden` on the parent to prevent scroll

---

## Responsive Breakpoints Reference

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## Testing Checklist

- [ ] Test on iPhone SE (375px width)
- [ ] Test on iPhone 14 Pro Max (430px width)
- [ ] Test on iPad (768px width)
- [ ] Test on Desktop (1920px width)
- [ ] Verify vertical centering on all sizes
- [ ] Verify no horizontal scroll
- [ ] Verify image maintains aspect ratio
- [ ] Verify text remains readable on all sizes
- [ ] Verify spacing feels balanced on all sizes

---

## Additional Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Viewport Units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths)
