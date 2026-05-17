---
name: daily-bonus-cat
description: Daily bonus cat (nicky.webp) feature — hidden clickable cat that awards 20 Emporium Points once per day
metadata:
  type: project
---

Hidden daily bonus cat (nicky.webp from `src/assets/images/daily/nicky.webp`) appears on one random page per session when bonus is available.

**Files:**
- `src/stores/dailyBonus.ts` — Pinia store; fetches `/api/bonus/daily/status`, picks a random page from ['home','shop','rules','profile','counsel'], `claim()` calls POST `/api/bonus/daily/claim` then refreshes balance
- `src/components/ui/DailyBonusCat.vue` — fixed-position cat with `page` prop; only shows when `bonusStore.randomPage === props.page`; uses Teleport to body
- Registered in `App.vue` via `useDailyBonusWatcher()`
- Added to: HomeView, ProfileView, RulesView, ShopView, CounselDetailView

**Why:** Rewards exploration, increases site traffic. Backend endpoints already existed when implemented.
**How to apply:** Adding new pages — just add `<DailyBonusCat page="newpage"/>` and add `'newpage'` to PAGES array in the store.
