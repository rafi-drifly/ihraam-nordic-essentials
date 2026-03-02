

## Update 2-Pack Price to €40

Change the 2-Pack bundle price from €38 to €40, making the delivered total €49 (€40 + €9 shipping).

### Changes

1. **`src/lib/bundles.ts`** -- Update 2-Pack `totalPrice` from 38 to **40**

2. **Localization files** (`en.json`, `sv.json`, `no.json`) -- Update `save2Pack` savings copy from "Save €9" to "Save €0" or adjust to reflect the new math:
   - 2 singles = 2 x €20 = €40, so 2-Pack at €40 has **no product savings** but saves on shipping (1 delivery vs 2)
   - Update copy to: "Save on shipping -- one delivery instead of two." (or similar)

3. **Verify** -- The savings field in the bundle config should be updated from 9 to **0** since 2-Pack now equals 2x single price.

