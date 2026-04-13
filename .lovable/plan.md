

## Replace all en dashes (–) with hyphens (-)

Run `sed -i 's/–/-/g'` across all `.tsx`, `.ts`, `.json`, and `.html` files in `src/`, `supabase/`, and `index.html`. Then verify with `grep -r '–'` that none remain.

Single-step find-and-replace, same approach as the previous em dash cleanup.

