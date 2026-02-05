

## Remove Donate Button from Header

### Overview
Remove the "Donate" CTA button from the header navigation. The "Support" link in the main navigation and the mobile donation bar at the bottom will still provide access to the donation page.

---

### Change

**File: `src/components/ui/navbar.tsx`**

**Remove lines 137-147** (the Donate CTA Button section):
```jsx
{/* Donate CTA Button - Desktop */}
<Button
  asChild
  size="sm"
  className="hidden sm:flex bg-gradient-primary hover:opacity-90 text-white"
>
  <Link to={getLocalizedHref("/support-our-mission")}>
    <Heart className="h-4 w-4 mr-1" />
    {t('nav.donate')}
  </Link>
</Button>
```

**Optional cleanup:** Remove the unused `Heart` import from lucide-react if no longer needed (line 5).

---

### What Remains

| Item | Status |
|------|--------|
| "Support" link in main nav | Kept (links to /support-our-mission) |
| Mobile donation bar at bottom | Kept |
| Cart drawer | Kept |
| Language switcher | Kept |

