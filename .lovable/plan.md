

## Plan: Add "New Stock Arrived" Banner

### Overview
Add a small, attractive promotional banner at the very top of the page (above the navbar) announcing new stock with fast delivery in Sweden.

### Changes

#### 1. Create New Component: `src/components/PromoBanner.tsx`

A simple, dismissible banner component that:
- Displays above the navbar
- Shows translated text for both English and Swedish
- Has a subtle gradient background matching the site theme
- Can be dismissed with a close button (stores preference in localStorage)

```text
+------------------------------------------------------------------+
| 🎉 New stock arrived! Delivered within a day in Sweden  |  ✕    |
+------------------------------------------------------------------+
```

**Features:**
- Primary/accent color gradient background
- White text with a sparkle/package icon
- Close button to dismiss (optional)
- Responsive design for mobile

#### 2. Update `src/App.tsx`

Add the PromoBanner component above the Navbar in the layout structure:

```text
<div className="min-h-screen flex flex-col">
  <PromoBanner />     ← NEW
  <Navbar />
  <main>...</main>
  <Footer />
</div>
```

#### 3. Update Translation Files

**`src/i18n/locales/en.json`** - Add new banner translations:
```json
"banner": {
  "newStock": "🎉 New stock has arrived! Delivered within a day in Sweden"
}
```

**`src/i18n/locales/sv.json`** - Add Swedish translations:
```json
"banner": {
  "newStock": "🎉 Nya lager har anlänt! Levereras inom en dag i Sverige"
}
```

### Design Details

| Aspect | Value |
|--------|-------|
| Background | Primary gradient or accent color |
| Text Color | White |
| Height | ~36-40px |
| Position | Fixed/sticky at very top, above navbar |
| Font Size | Small (text-sm) |
| Icon | Sparkle, Package, or party emoji |

### Result

Users visiting the site will see a subtle but noticeable banner at the very top announcing the new stock and fast Sweden delivery, creating urgency and highlighting fast fulfillment.

