

## Plan: Complete Donation Experience Overhaul

### Overview
This is a comprehensive overhaul of the donation system to maximize trust, transparency, and ethical UX. The changes span global navigation, a complete rebuild of the donation page, new transparency and mosque support pages, enhanced Stripe integration for recurring donations, and database schema updates.

---

## A. Global Header/Navigation Improvements

### A1. Sticky Header with Scroll Effects
**Update: `src/components/ui/navbar.tsx`**

| Change | Implementation |
|--------|----------------|
| Sticky header | Already has `sticky top-0 z-50` |
| Scroll detection | Add `useState` for scroll position, apply subtle border/shadow after scrolling past 10px |
| Border on scroll | `border-b border-transparent` becomes `border-b border-border shadow-sm` when scrolled |

### A2. Donate CTA Button (Desktop + Mobile)
**Update: `src/components/ui/navbar.tsx`**

Add a primary "Donate" button to the far right of the header:
- Desktop: Visible next to cart icon
- Mobile: Visible in header bar
- Style: Primary gradient button with Heart icon
- Target: `/support-our-mission`

### A3. Transparency Link
**Update: `src/components/ui/navbar.tsx`**

Add "Transparency" link in navigation array:
- Position: After "Support Our Mission"
- Target: `/transparency`

### A4. Mobile Fixed Bottom Donation Bar
**Create: `src/components/MobileDonationBar.tsx`**

| Feature | Implementation |
|---------|----------------|
| Visibility | Only below 768px (`md:hidden`) |
| Position | Fixed at bottom, full width |
| Content | Single "Donate Now" button with Heart icon |
| Styling | White background, border-t, shadow-lg, safe-area-inset-bottom padding |
| Z-index | z-40 (below navbar z-50) |

**Update: `src/App.tsx`**
- Add `MobileDonationBar` component
- Add `pb-20 md:pb-0` to main content wrapper to prevent content being hidden

---

## B. Rebuild `/support-our-mission` (Trust-First, Amanah Design)

**Complete Rewrite: `src/pages/SupportOurMission.tsx`**

### Section Order:

#### B1. Hero Section (Above the Fold)
- Headline: "Support Our Mission (Amanah)"
- Subtext: "We keep Ihrams affordable, support mosques, and fund needy projects globally. This is people's money, and we are answerable to Allah."
- Buttons:
  - Primary: "Donate now" (scrolls to form)
  - Secondary: "See transparency reports" -> `/transparency`

#### B2. Our 3 Commitments (Cards)
| Card | Title | Description |
|------|-------|-------------|
| 1 | Keep Ihrams Affordable | Donations help us keep prices accessible and reduce barriers for worship |
| 2 | Free Ihrams to Mosques | We provide Ihrams to mosques. Mosques can sell them and keep the money for mosque needs |
| 3 | Needy Projects Worldwide | Donations support verified projects where people are suffering across the globe |

#### B3. Where Your Donation Goes (Honest Clarity)
- Amanah + Transparency box explaining:
  - "Your donation supports our mission and may also cover essential delivery costs like shipping/packaging and Stripe payment processing fees."
  - "We publish monthly reports with a breakdown."
- Simple breakdown UI with placeholder percentages:
  - Needy Projects
  - Mosque Support Program  
  - Shipping/Packaging
  - Stripe Payment Fees
  - Operations (minimal)
- Note: "Percentages vary month to month; see transparency reports."

#### B4. Donation Form (Enhanced Stripe Integration)
**State Management:**
```typescript
interface DonationFormState {
  frequency: 'one-time' | 'monthly';
  amount: number;
  customAmount: string;
  direction: 'mosque' | 'needy' | 'where-needed';
  anonymous: boolean;
  wantsReceipt: boolean;
  receiptEmail: string;
  coverFees: boolean;
}
```

**Form Elements:**
- Frequency toggle: One-time / Monthly (recurring)
- Amount buttons: €5, €10, €25, €50 + Custom input
- Direction radio group with 1-line explanations:
  - "Mosque Support Program"
  - "Needy Projects"  
  - "Where most needed"
- Checkboxes:
  - "Donate anonymously"
  - "Email me a receipt" (shows email input if checked)
  - "Cover Stripe fees so more reaches the mission" (shows calculated fee)
- Submit button: "Donate securely with Stripe"
- Microcopy below button:
  - "Donations are voluntary. We do not pressure anyone to donate."
  - "Stripe may charge payment processing fees; we report these transparently."

#### B5. Mosque Support Program Section
- Headline: "Mosque Support Program"
- Explanation of the program
- CTA: "Mosque: Request Ihrams" -> `/mosque-support`

#### B6. Needy Projects Section
- Headline: "Needy Projects (Global)"
- Examples: Food/hunger relief, Winter support/shelter, Medical support, Emergency/crisis support
- "How we choose projects" explanation

#### B7. Transparency Preview
- "Latest Update" card pulling latest month's data
- Button: "View full transparency dashboard" -> `/transparency`

#### B8. FAQ Accordion
| Question | Answer Summary |
|----------|----------------|
| Are donations required to buy Ihram? | No |
| Do donations cover shipping and fees? | Yes, may cover shipping/packaging and Stripe fees; we publish breakdowns |
| Is this Zakat? | Treated as Sadaqah unless separate Zakat option offered |
| Can I donate anonymously? | Yes |
| Do I get a receipt? | Yes, via Stripe or our email |
| Refunds/mistakes? | Simple policy + contact email |

#### B9. Contact & Governance Box
- Support email
- Organization name + country
- Statement: "We welcome feedback and accountability."

---

## C. Create `/transparency` (Transparency Dashboard)

**Create: `src/pages/Transparency.tsx`**

### Page Structure:
- Hero: "Transparency Dashboard" with trust messaging
- Filter controls: Month/Year dropdown
- Reports grid/table showing newest first:

| Column | Description |
|--------|-------------|
| Month | e.g., "January 2026" |
| Donations Received (Gross) | Total €amount |
| Stripe Fees | €amount |
| Shipping/Packaging | €amount |
| Mosque Program Funded | €amount |
| Needy Projects Funded | €amount |
| Notes | Short description |
| Proof Links | Optional download links |

**Data Source:**
For now, create a static data structure that can be easily updated:
```typescript
const TRANSPARENCY_REPORTS = [
  {
    month: "January 2026",
    donationsReceived: 1250.00,
    stripeFees: 45.50,
    shippingPackaging: 180.00,
    mosqueProgram: 400.00,
    needyProjects: 500.00,
    operations: 124.50,
    notes: "Supported 3 mosques in Sweden and funded winter relief in Syria.",
    proofLinks: []
  }
];
```

---

## D. Create `/mosque-support` (Mosque Request Page)

**Create: `src/pages/MosqueSupport.tsx`**

### Form Fields:
| Field | Type | Required |
|-------|------|----------|
| Mosque/Islamic Center Name | text | Yes |
| Country/City | text | Yes |
| Contact Person | text | Yes |
| Email | email | Yes |
| Phone | tel | Yes |
| Website/Social Link | url | No |
| Estimated Need | dropdown (10, 25, 50, 100+ sets) | Yes |
| Notes | textarea | No |

### On Submit:
- Use existing `contact-form` edge function or create new `mosque-support-form` function
- Show confirmation message with du'a

---

## E. Update Success/Cancel Pages

### E1. Update `/donation-success`
**Update: `src/pages/DonationSuccess.tsx`**

Enhanced content:
- Gratitude with du'a tone
- "What happens next" section
- Link to transparency page
- Quote about sadaqah

### E2. Create `/donation-cancel`
**Create: `src/pages/DonationCancel.tsx`**

- Gentle message: "Your donation was cancelled"
- "No worries" messaging
- Option to try again -> `/support-our-mission`
- Link to contact if issues

---

## F. Backend/Stripe Enhancements

### F1. Update Edge Function for Recurring Donations
**Update: `supabase/functions/create-donation-checkout/index.ts`**

Enhanced parameters:
```typescript
interface DonationRequest {
  amount: number;
  frequency: 'one-time' | 'monthly';
  direction: 'mosque' | 'needy' | 'where-needed';
  anonymous: boolean;
  wantsReceipt: boolean;
  receiptEmail?: string;
  coverFees: boolean;
}
```

**Implementation:**
- If `frequency === 'monthly'`: use `mode: "subscription"` with recurring price
- If `frequency === 'one-time'`: use `mode: "payment"` (current behavior)
- Add all metadata for tracking
- If `coverFees`: add ~2.9% + €0.25 to amount

### F2. Database Schema Updates

**Create Migration:**
```sql
-- Donations table for standalone donation records
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  amount numeric NOT NULL,
  frequency text CHECK (frequency IN ('one-time', 'monthly')),
  direction text CHECK (direction IN ('mosque', 'needy', 'where-needed')),
  anonymous boolean DEFAULT false,
  donor_email text,
  stripe_session_id text,
  stripe_subscription_id text,
  status text DEFAULT 'pending',
  covered_fees boolean DEFAULT false,
  fee_amount numeric DEFAULT 0
);

-- Transparency reports table
CREATE TABLE public.transparency_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year text UNIQUE NOT NULL,
  donations_received numeric DEFAULT 0,
  stripe_fees numeric DEFAULT 0,
  shipping_packaging numeric DEFAULT 0,
  mosque_program numeric DEFAULT 0,
  needy_projects numeric DEFAULT 0,
  operations numeric DEFAULT 0,
  notes text,
  proof_links jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mosque support requests table
CREATE TABLE public.mosque_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  mosque_name text NOT NULL,
  country_city text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  website text,
  estimated_need text NOT NULL,
  notes text,
  status text DEFAULT 'pending'
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mosque_requests ENABLE ROW LEVEL SECURITY;

-- Public read for transparency reports
CREATE POLICY "Anyone can read transparency reports" ON public.transparency_reports
  FOR SELECT USING (true);

-- Service role insert for donations and requests
CREATE POLICY "Service role can insert donations" ON public.donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can insert mosque requests" ON public.mosque_requests
  FOR INSERT WITH CHECK (true);
```

### F3. Create Mosque Support Form Edge Function
**Create: `supabase/functions/mosque-support-form/index.ts`**

- Receives form data
- Validates inputs
- Inserts into `mosque_requests` table
- Optionally sends email notification

---

## G. Routing Updates

**Update: `src/App.tsx`**

Add new routes:
```typescript
<Route path="/transparency" element={<Transparency />} />
<Route path="/mosque-support" element={<MosqueSupport />} />
<Route path="/donation-cancel" element={<DonationCancel />} />
// + Swedish and Norwegian variants
<Route path="/sv/transparency" element={<Transparency />} />
<Route path="/sv/mosque-support" element={<MosqueSupport />} />
<Route path="/sv/donation-cancel" element={<DonationCancel />} />
<Route path="/no/transparency" element={<Transparency />} />
<Route path="/no/mosque-support" element={<MosqueSupport />} />
<Route path="/no/donation-cancel" element={<DonationCancel />} />
```

---

## H. Translations (i18n)

**Update all locale files with new keys:**

Major translation sections to add:
- `donation.hero.*` (updated)
- `donation.commitments.*`
- `donation.breakdown.*`
- `donation.form.*`
- `donation.mosqueProgram.*`
- `donation.needyProjects.*`
- `donation.faq.*`
- `donation.governance.*`
- `transparency.*`
- `mosqueSupport.*`
- `nav.transparency`

---

## Technical Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/MobileDonationBar.tsx` | Fixed bottom donation bar for mobile |
| `src/pages/Transparency.tsx` | Transparency dashboard |
| `src/pages/MosqueSupport.tsx` | Mosque request form |
| `src/pages/DonationCancel.tsx` | Donation cancellation page |
| `supabase/functions/mosque-support-form/index.ts` | Handle mosque requests |
| `supabase/migrations/[timestamp]_donation_improvements.sql` | New tables |

### Files to Update

| File | Changes |
|------|---------|
| `src/components/ui/navbar.tsx` | Scroll effect, Donate CTA, Transparency link |
| `src/pages/SupportOurMission.tsx` | Complete rebuild |
| `src/pages/DonationSuccess.tsx` | Enhanced content |
| `src/App.tsx` | New routes, MobileDonationBar, bottom padding |
| `supabase/functions/create-donation-checkout/index.ts` | Recurring support, enhanced metadata |
| `supabase/config.toml` | New function config |
| `src/i18n/locales/en.json` | Extensive new translations |
| `src/i18n/locales/sv.json` | Swedish translations |
| `src/i18n/locales/no.json` | Norwegian translations |
| `public/sitemap.xml` | New pages |

---

## Implementation Phases

Given the scope, I recommend implementing in this order:

**Phase 1: Navigation & Structure**
- Sticky header with scroll effect
- Donate CTA button
- Mobile bottom bar
- Add routing for new pages

**Phase 2: Support Our Mission Rebuild**
- Complete page rebuild with all sections
- Enhanced donation form (one-time first)
- FAQ accordion

**Phase 3: New Pages**
- Transparency dashboard
- Mosque support form
- Donation cancel page
- Update donation success page

**Phase 4: Backend Enhancements**
- Database migrations
- Recurring donation support
- Mosque support form edge function

**Phase 5: Polish**
- Complete i18n translations
- Sitemap updates
- Testing and refinement

