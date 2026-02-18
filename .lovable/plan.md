

## Update Email Address and Add WhatsApp Floating Button

### 1. Replace Email Address Everywhere

Change `pureihraam@gmail.com` to `support@pureihraam.com` in these 5 files:

- **src/components/ui/footer.tsx** (line 87) -- Footer contact section
- **src/pages/Contact.tsx** (lines 106-107) -- Contact methods card
- **src/pages/Shipping.tsx** (line 224) -- Support email link
- **src/pages/Partners.tsx** (lines 422-424) -- Partnership contact email
- **supabase/functions/send-order-confirmation/index.ts** (line 112) -- Order confirmation email footer

Also update `src/components/donation/GovernanceSection.tsx` (line 39-40) which already shows `support@pureihram.com` -- will standardize to `support@pureihraam.com` to match.

### 2. Add Floating WhatsApp Button

Create a new component `src/components/WhatsAppButton.tsx` -- a fixed floating green WhatsApp icon in the bottom-right corner of the screen. It will:

- Use the WhatsApp brand green color (#25D366)
- Link to `https://wa.me/46720131476` with a pre-filled message like "Hi, I have a question about my order"
- Be visible on all pages (added to `App.tsx`)
- Have a subtle hover animation and shadow
- Be responsive (slightly smaller on mobile)
- Include proper accessibility (`aria-label`)

### Technical Summary

| File | Change |
|---|---|
| `src/components/ui/footer.tsx` | Update email |
| `src/pages/Contact.tsx` | Update email |
| `src/pages/Shipping.tsx` | Update email |
| `src/pages/Partners.tsx` | Update email |
| `src/components/donation/GovernanceSection.tsx` | Standardize email |
| `supabase/functions/send-order-confirmation/index.ts` | Update email in HTML template |
| `src/components/WhatsAppButton.tsx` | New floating button component |
| `src/App.tsx` | Import and render WhatsAppButton |

