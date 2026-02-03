

## Plan: Voluntary Donation Feature

### Overview
Implement an ethical, transparent donation system that allows users to support Pure Ihram's mission through both a dedicated donation page and an optional checkout add-on. Donations are processed via Stripe with full tracking in order records and confirmation emails.

---

### A. Donation Page (`/support-our-mission`)

**New File: `src/pages/SupportOurMission.tsx`**

Create a dedicated donation page with:

| Section | Content |
|---------|---------|
| Hero | Mission statement with heart icon |
| Why Donate | Keep Ihram affordable, support masjids, Islamic education |
| Transparency Notice | Donations are voluntary, not required for purchase |
| Donation Options | €2, €5, €10, Custom amount buttons |
| CTA | "Support Now" button -> Stripe checkout |

**SEO Implementation:**
- Title: "Support Our Mission | Pure Ihram"
- Meta: "Support Pure Ihram's mission to serve pilgrims, support masjids, and provide affordable Ihram through voluntary donations."

---

### B. Checkout Donation Add-On

**Update: `src/pages/Cart.tsx`**

Add a new section below order summary:

```text
+------------------------------------------+
|  Support Our Mission (Optional)           |
|  Help us keep Ihram affordable for all   |
|                                           |
|  [ €2 ] [ €5 ] [ €10 ] [ Custom ]        |
|                                           |
|  [X] Remove donation                      |
+------------------------------------------+
```

**Key behaviors:**
- Nothing pre-selected by default
- Clicking amount adds/changes donation
- "Remove" button clears donation
- Donation visible in order summary as separate line
- Stored in React state, passed to checkout

---

### C. Backend Integration

#### Update: `supabase/functions/create-checkout/index.ts`

Accept optional `donation` parameter:

```text
interface CheckoutRequest {
  items: Array<{ id: string; quantity: number }>;
  donation?: number;  // Amount in EUR (e.g., 5)
}
```

When donation is provided:
- Add as separate Stripe line item:
  - Name: "Voluntary Donation – Support Our Mission"
  - Amount: donation value in cents
  - Quantity: 1
- Add metadata:
  - `donation: "true"`
  - `donation_amount: "5.00"`

#### Update: `supabase/functions/stripe-webhook/index.ts`

When processing completed checkout:
- Extract donation metadata
- Store `donation_amount` in order record (new column)
- Include donation in email data

#### Database Migration

Add column to orders table:

```sql
ALTER TABLE orders ADD COLUMN donation_amount numeric DEFAULT 0;
```

#### Update: `supabase/functions/send-order-confirmation/index.ts`

When donation exists, add section to email:

```text
Thank you for your donation of €X.XX to support our mission!
```

---

### D. Order Success Page Updates

**Update: `src/pages/OrderSuccess.tsx`**

If donation was included, show:

```text
+------------------------------------------+
|  Thank you for your support!              |
|  Your donation of €X helps keep Ihram    |
|  affordable and supports our mission.     |
+------------------------------------------+
```

---

### E. Standalone Donation Edge Function

**New File: `supabase/functions/create-donation-checkout/index.ts`**

For donations made from the /support-our-mission page:
- Create Stripe checkout with single line item
- Mode: "payment"
- Metadata: `donation: true`, `donation_amount: X`
- Success URL: `/donation-success`
- Cancel URL: `/support-our-mission`

---

### F. Translations (i18n)

Add new keys to all 3 locale files:

**English (`en.json`):**
```json
"donation": {
  "pageTitle": "Support Our Mission",
  "seoTitle": "Support Our Mission | Pure Ihram",
  "seoDescription": "Support Pure Ihram's mission to serve pilgrims...",
  "hero": {
    "title": "Support Our Mission",
    "subtitle": "Help us keep Ihram affordable and accessible for all pilgrims"
  },
  "why": {
    "affordable": "Keep Ihram affordable for everyone",
    "masjids": "Support masjids with educational materials",
    "education": "Provide Islamic educational content"
  },
  "transparency": "Donations are completely voluntary and not required to purchase",
  "amounts": {
    "custom": "Custom",
    "customPlaceholder": "Enter amount"
  },
  "checkout": {
    "title": "Support Our Mission (Optional)",
    "subtitle": "Help us keep Ihram affordable for all",
    "remove": "Remove donation",
    "lineItem": "Voluntary Donation – Support Our Mission"
  },
  "success": {
    "title": "Thank You for Your Support!",
    "message": "Your donation of €{{amount}} helps keep Ihram affordable."
  },
  "cta": "Donate Now"
}
```

Similar translations for Swedish and Norwegian.

---

### G. Routing Updates

**Update: `src/App.tsx`**

Add new routes:

```typescript
<Route path="/support-our-mission" element={<SupportOurMission />} />
<Route path="/donation-success" element={<DonationSuccess />} />
<Route path="/sv/support-our-mission" element={<SupportOurMission />} />
<Route path="/sv/donation-success" element={<DonationSuccess />} />
<Route path="/no/support-our-mission" element={<SupportOurMission />} />
<Route path="/no/donation-success" element={<DonationSuccess />} />
```

---

### Technical Details

#### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/SupportOurMission.tsx` | Donation landing page |
| `src/pages/DonationSuccess.tsx` | Thank you page after standalone donation |
| `supabase/functions/create-donation-checkout/index.ts` | Standalone donation checkout |

#### Files to Update

| File | Changes |
|------|---------|
| `src/pages/Cart.tsx` | Add optional donation section |
| `src/pages/Shop.tsx` | Pass donation to checkout if selected |
| `src/pages/OrderSuccess.tsx` | Show donation thank you if applicable |
| `supabase/functions/create-checkout/index.ts` | Accept donation param, add as line item |
| `supabase/functions/stripe-webhook/index.ts` | Store donation amount in order |
| `supabase/functions/send-order-confirmation/index.ts` | Include donation in email |
| `src/integrations/supabase/types.ts` | Add donation_amount to orders type |
| `src/App.tsx` | Add new routes |
| `src/i18n/locales/en.json` | Add donation translations |
| `src/i18n/locales/sv.json` | Add Swedish translations |
| `src/i18n/locales/no.json` | Add Norwegian translations |
| `public/sitemap.xml` | Add new pages |

#### Database Migration

```sql
ALTER TABLE public.orders 
ADD COLUMN donation_amount numeric DEFAULT 0;
```

#### Configuration Update

Add to `supabase/config.toml`:

```toml
[functions.create-donation-checkout]
verify_jwt = false
```

---

### UX & Ethics Compliance

| Requirement | Implementation |
|-------------|----------------|
| Never auto-add donation | Nothing pre-selected, user must click |
| Never block checkout | Donation section is clearly optional |
| Gentle language | "Support Our Mission (Optional)" |
| Removable at any time | Visible "Remove donation" button |
| Transparent in receipt | Separate line item in Stripe and email |
| Clear in order confirmation | Dedicated thank-you section |

---

### User Flow Diagram

```text
CHECKOUT FLOW:
Cart Page
    |
    +-- [Optional] Select donation (€2/€5/€10/Custom)
    |
    +-- Click "Proceed to Checkout"
    |
    v
create-checkout (Edge Function)
    |
    +-- Creates Stripe session with:
    |       - Product line items
    |       - Shipping line item
    |       - [Optional] Donation line item
    |       - Metadata: donation=true, donation_amount=X
    |
    v
Stripe Checkout
    |
    v
stripe-webhook (on success)
    |
    +-- Create order with donation_amount
    +-- Send email with donation section
    |
    v
Order Success Page
    |
    +-- [If donation] Show thank-you message

STANDALONE DONATION:
/support-our-mission
    |
    +-- Select amount (€2/€5/€10/Custom)
    +-- Click "Donate Now"
    |
    v
create-donation-checkout (Edge Function)
    |
    v
Stripe Checkout
    |
    v
/donation-success
    |
    +-- Thank you message
```

