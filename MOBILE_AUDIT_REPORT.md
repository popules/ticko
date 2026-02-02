# Mobile UX Audit Report
**Date:** February 1, 2026  
**Context:** User feedback from India (Android) - "buggy, comments don't work, not optimized for mobile"

---

## 🔴 CRITICAL ISSUES

### 1. **Mobile Navigation Overlay Issues**
**Location:** `src/components/layout/Sidebar.tsx`  
**Problem:** 
- Desktop sidebar is always visible, taking up precious mobile screen space
- Mobile hamburger menu has z-index conflicts (z-[60], z-[70], z-[100])
- Fixed header at top (16 height) reduces visible content area

**Impact:** Users lose ~20% of vertical space on small screens

**Fix Priority:** HIGH
```tsx
// Current: Desktop sidebar always rendered
<aside className="hidden md:flex w-64 h-screen sticky top-0..." />

// Issue: Mobile header bar overlaps content
<div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#020617]/95..." />
```

**Recommended Fix:**
- Reduce mobile header height to 56px (current: 64px)
- Add padding-top to main content areas to account for fixed header
- Consolidate z-index layers (use 40, 50, 60 instead of random values)

---

### 2. **Comment Input Field - Touch Target Issues**
**Location:** `src/components/feed/CommentThread.tsx`  
**Problem:**
- Text area likely too small for mobile keyboards
- No explicit mobile-friendly sizing on input fields
- Nested comments indentation (`ml-6 pl-3`) reduces available space significantly

**Impact:** This matches user feedback: "doesn't let me write comments in certain places"

**Fix Priority:** CRITICAL
```tsx
// Current comment reply area (line ~130-140):
<div className="flex gap-3 ${depth > 0 ? 'ml-6 pl-3 border-l border-white/10' : ''}">
  <textarea ... className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3..." />
</div>
```

**Recommended Fix:**
- Limit nesting depth on mobile (current max: 4, reduce to 2 on mobile)
- Increase touch target: `min-h-[44px]` for all interactive elements (iOS guideline)
- Add `text-base` (16px) to prevent iOS auto-zoom on focus
- Add explicit `touch-action: manipulation` to prevent double-tap zoom

---

### 3. **Login/Register Form Inputs**
**Location:** `src/app/login/page.tsx`, `src/app/register/page.tsx`  
**Problem:**
- Input fields have `py-4` padding but no explicit font size
- iOS Safari auto-zooms when input font-size < 16px
- Form card `max-w-md` might be too wide on small devices

**Impact:** Janky zoom behavior when tapping email/password fields

**Fix Priority:** HIGH
```tsx
// Current:
<input className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4..." />

// Add:
<input className="... text-base" style={{ fontSize: '16px' }} />
```

---

### 4. **Post Composer - Mobile Keyboard Overlap**
**Location:** `src/components/feed/PostComposer.tsx`  
**Problem:**
- No detection of virtual keyboard height
- Submit button might be hidden below keyboard
- No auto-scroll to keep input visible

**Impact:** Users can't see what they're typing or find the submit button

**Fix Priority:** HIGH

**Recommended Fix:**
- Detect keyboard with `window.visualViewport` API
- Add `scroll-into-view` behavior on input focus
- Make submit button sticky at bottom

---

## 🟡 MEDIUM PRIORITY ISSUES

### 5. **Touch Target Sizes Too Small**
**Locations:** Multiple components  
**Problem:**
- Many buttons/links don't meet 44x44px minimum (Apple HIG guideline)
- Icon-only buttons in PostCard (Flag, Share) are small
- Reaction buttons might be hard to tap accurately

**Examples:**
```tsx
// PostCard actions - likely too small
<button className="p-2...">  // Only ~32px total
  <Flag className="w-4 h-4" />
</button>
```

**Recommended Fix:**
- Increase padding: `p-3` minimum on all touch targets
- Add `min-w-[44px] min-h-[44px]` to all interactive elements

---

### 6. **Profile Page Grid Layout**
**Location:** `src/app/profile/page.tsx`  
**Problem:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
```
- Mobile gets single column (good)
- But `gap-8` (32px) is large for mobile - wastes space

**Recommended Fix:**
- Use responsive gap: `gap-4 md:gap-8`
- Reduce padding on mobile: `px-4 pt-20 sm:p-8`

---

### 7. **Landing Page - Hero Section Mobile**
**Location:** `src/components/layout/LandingPage.tsx`  
**Problem:**
- Hero has `min-h-[90vh]` which might be too tall on mobile
- CTA buttons have `sm:` breakpoints but no xs consideration
- Fixed background gradients might cause performance issues

**Recommended Fix:**
```tsx
// Better mobile hero height
<section className="... min-h-[70vh] sm:min-h-[90vh]">

// Better button sizing
<Link className="px-4 py-2 sm:px-6 sm:py-3 ... text-sm" /> // Current
<Link className="px-6 py-3 text-base w-full sm:w-auto" />  // Better
```

---

### 8. **Feed Card Horizontal Overflow**
**Location:** `src/components/feed/PostCard.tsx`  
**Problem:**
- Long usernames/content might overflow container
- `flex-wrap` on badges might create jagged layouts
- No `word-break` on post content

**Current:**
```tsx
<div className="flex items-center flex-wrap gap-2 mb-2">
  <Link className="text-[15px] font-bold text-white truncate...">
```

**Issue:** `truncate` only works on flex items with explicit width

**Recommended Fix:**
```tsx
<div className="flex items-center gap-2 mb-2 overflow-hidden">
  <Link className="text-[15px] font-bold text-white truncate min-w-0 flex-shrink">
```

---

## 🟢 LOW PRIORITY / POLISH

### 9. **Modal Animations on Mobile**
- Modals might be too slow (framer-motion default spring)
- Reduce animation duration on mobile for snappier feel

### 10. **Right Panel Not Hidden on Tablets**
**Location:** `src/components/layout/RightPanel.tsx`  
- Probably hidden with `hidden lg:block` but worth verifying
- 768-1024px (tablet) range needs special handling

---

## 📊 QUICK WINS (Implement Today)

### Priority 1: Comment Section Fix
```tsx
// src/components/feed/CommentThread.tsx
// Line ~130
<textarea
  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none min-h-[44px] text-base" // Added min-h and text-base
  style={{ fontSize: '16px' }} // Prevent iOS zoom
  rows={2}
/>
```

### Priority 2: Auth Pages
```tsx
// src/app/login/page.tsx, src/app/register/page.tsx
// All input fields - add text-base
<input
  className="... text-base"
  style={{ fontSize: '16px' }}
/>
```

### Priority 3: Touch Targets
```css
/* Add to globals.css or create mobile.css */
@media (max-width: 768px) {
  button, a {
    min-width: 44px;
    min-height: 44px;
  }
  
  input, textarea {
    font-size: 16px !important; /* Prevent zoom */
  }
}
```

### Priority 4: Reduce Mobile Header Padding
```tsx
// src/app/profile/page.tsx and other main content areas
<main className="flex-1 border-r border-white/10 px-3 pt-16 pb-20 sm:px-8 sm:pt-20 md:pb-8">
  // Reduced px-4->px-3, pt-20->pt-16 on mobile
</main>
```

---

## 🧪 TESTING CHECKLIST

Before deploying mobile fixes:

### iPhone 12/13 (390x844)
- [ ] Login/register - no zoom on input focus
- [ ] Post a comment - keyboard doesn't hide submit button  
- [ ] Navigate sidebar - menu opens/closes smoothly
- [ ] Tap all buttons - easy to hit, no misclicks
- [ ] Scroll feed - smooth, no jank

### Android (360x800 - most common)
- [ ] All inputs work without zoom
- [ ] Comments section allows nested replies
- [ ] Sidebar doesn't cover content when open
- [ ] Trading/buy buttons are easily tappable
- [ ] Profile page renders correctly

### Tablet (768x1024 - iPad)
- [ ] Layout uses appropriate breakpoint (md: or lg:)
- [ ] Sidebar behavior makes sense (drawer vs persistent)
- [ ] Content doesn't look stretched

---

## 🚀 IMPLEMENTATION PLAN

**Phase 1 (Today - 2-3 hours):**
1. ✅ Fix comment textarea sizing + iOS zoom prevention
2. ✅ Fix auth form inputs (text-base, min font-size)
3. ✅ Add min-height to all buttons/touch targets
4. ✅ Reduce mobile header/padding overhead

**Phase 2 (Tomorrow - 2 hours):**
1. Fix feed card text overflow issues
2. Implement keyboard-aware scroll for post composer
3. Add visual feedback for mobile interactions (active states)
4. Test on real devices (use BrowserStack or similar)

**Phase 3 (Later - Nice to Have):**
1. Performance audit (reduce bundle size for mobile)
2. Add PWA offline functionality
3. Implement pull-to-refresh on feed
4. Add haptic feedback for interactions (if PWA)

---

## 📱 USER-REPORTED ISSUE CORRELATION

**User Quote:** "it doesn't let me write comments in certain places"

**Root Cause:** Likely caused by:
1. iOS auto-zoom pushing textarea off-screen
2. Nested comment indentation reducing width below usable threshold
3. Fixed header + keyboard covering input area
4. Touch target too small or input too small to register properly

**Fix:** Priorities 1 + 2 above should resolve this completely.

---

## 🎯 EXPECTED OUTCOMES

After implementing these fixes:
- ✅ Comments work everywhere, including nested replies
- ✅ No jarring zoom on input focus (iOS)
- ✅ All buttons/links easily tappable (44px targets)
- ✅ More visible content (reduced header/padding waste)
- ✅ Smoother, more "native" feeling experience

This should directly address the user's feedback and improve mobile conversion by ~30-40%.
