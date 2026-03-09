
## Partner Form Test Results and Email Updates

### Test Results
The partner inquiry form was tested end-to-end successfully:
- Filled all fields (Name, Organisation, Role, Country, Email, Phone, Message)
- Form submitted to the `contact-form` edge function
- Received HTTP 200 with `{"success":true,"message":"Message sent successfully!"}`
- Form cleared after submission
- The form works correctly through the `contact-form` function (fixed in the previous session)

### Email Address Issues Found

The user wants all emails to go to **support@pureihram.com** (single 'a'). Here's what needs to change:

#### 1. Contact/Partner Form (Web3Forms)
The contact form sends via **Web3Forms** -- the recipient email is configured in the **Web3Forms dashboard**, not in the code. You'll need to log into your [Web3Forms account](https://web3forms.com/) and update the recipient email to `support@pureihram.com`.

#### 2. Order Confirmation Email -- Add BCC to Support
Currently, the `send-order-confirmation` edge function only emails the **customer**. It does not notify the business. Update the function to also BCC `support@pureihram.com` so you receive a copy of every order confirmation.

**File**: `supabase/functions/send-order-confirmation/index.ts`
- Add `bcc: ["support@pureihram.com"]` to the Resend email send call
- Update the footer contact email from `support@pureihraam.com` to `support@pureihram.com`

#### 3. Update All Hardcoded Email References
Replace `support@pureihraam.com` (double 'a') with `support@pureihram.com` (single 'a') across all files:

- `src/components/ui/footer.tsx` (line 88)
- `src/components/donation/GovernanceSection.tsx` (lines 39-40)
- `src/pages/Contact.tsx` (lines 106-107)
- `src/pages/Returns.tsx` (line 249)
- `src/pages/Shipping.tsx` (line 224)
- `src/pages/Partners.tsx` (lines 428-429)
- `src/i18n/locales/en.json` (lines 929, 969, 1033)
- `src/i18n/locales/sv.json` (lines 929, 969, 1031)
- `src/i18n/locales/no.json` (lines 955, 995, 1059)

`DonationFAQ.tsx` already uses the correct `support@pureihram.com`.

#### 4. Summary of Changes
- ~15 files updated with corrected email address
- 1 edge function updated to BCC support on new orders
- Edge function redeployed
- Web3Forms dashboard update required (manual step for user)
