# Frontend Handoff — Notifications & Commission Requests

Backend is implemented and merged. This is the API contract to build against. All endpoints below live on
`mysterria-api` and use the same Bearer JWT auth as the rest of the site (`Authorization: Bearer <token>`),
except where noted.

---

## 1. Notifications — "recent account activity" feed

A generic, persisted feed of things that happened to the player's account. Independent from anything posted
to Discord — this is purely for the website.

### 1.1 What creates a notification

| Type | Fires when | `metadata` keys | `actionable` |
|---|---|---|---|
| `PURCHASE` | Any store purchase completes (recipient's account, not the gifter's) | `serviceName` (string), `amount` (int) | `false` |
| `VERIFICATION` | Minecraft account gets linked (self-serve in-game code **or** staff `/verify`) | *(none)* | `false` |
| `UNVERIFICATION` | Minecraft account gets unlinked by staff | *(none)* | `false` |
| `PUNISHMENT_ISSUED` | A warn/mute/tempban/permban is issued | `punishmentType` (string), `reason` (string) | `false` |
| `PUNISHMENT_REMOVED` | A punishment is revoked by staff | `punishmentType` (string) | `false` |
| `COMMISSION_SLOT_AVAILABLE` | The commission store item is purchased (see §2) | *(none currently)* | `true`, `actionType: "CREATE_COMMISSION"` |
| `COMMISSION_STATUS_CHANGED` | Staff reviews a commission request | `previousStatus`, `status`, `staffNotes?`, `commissionsRequired?` | `true` only when `status == RESCOPE_REQUIRED`, `actionType: "RESUBMIT_COMMISSION"` |

`referenceId` is a generic pointer whose meaning depends on `type`:
- `PURCHASE` → the Purchase id
- `VERIFICATION` / `UNVERIFICATION` → the User id (itself)
- `PUNISHMENT_ISSUED` / `PUNISHMENT_REMOVED` → the Punishment id
- `COMMISSION_SLOT_AVAILABLE` → the **CommissionSlot** id — this is what you pass as one of the `slotIds`
  when submitting the commission form (§2.3)
- `COMMISSION_STATUS_CHANGED` → the CommissionRequest id

There is no localized message string from the backend — build the copy client-side from `type` (+ `metadata`),
same as you already do for other typed content on the site. This keeps i18n entirely on your side rather than
duplicating it in two places.

### 1.2 Endpoints

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/notifications?page=&size=&sort=` | — | `200` `Page<NotificationDto>` (default sort: `createdAt,desc`, size 20) |
| GET | `/api/notifications/unread-count` | — | `200` `long` |
| PATCH | `/api/notifications/{id}/read` | — | `204` |
| POST | `/api/notifications/read-all` | — | `204` |

`NotificationDto`:
```json
{
  "id": "uuid",
  "type": "COMMISSION_SLOT_AVAILABLE",
  "referenceId": "uuid",
  "metadata": { "...": "..." },
  "actionable": true,
  "actionType": "CREATE_COMMISSION",
  "read": false,
  "createdAt": "2026-07-24T10:15:00"
}
```

`Page<T>` is Spring's standard page wrapper (`content`, `totalElements`, `totalPages`, `number`, `size`, ...).

### 1.3 Suggested UX

- Bell icon + unread badge from `/unread-count`, polled or refreshed on page nav.
- Dropdown/page listing `GET /api/notifications`, newest first.
- Only `COMMISSION_SLOT_AVAILABLE` and `COMMISSION_STATUS_CHANGED` (when rescoped) render a button; everything
  else is a plain list item. Clicking the button:
  - `CREATE_COMMISSION` → open the commission form pre-selecting that notification's `referenceId` as one
    of the slots.
  - `RESUBMIT_COMMISSION` → open the commission form; call `GET /api/commissions/slots` to show the player
    which slots they currently have available to pick from (they may need to buy more first — see §2.4).
  - Mark the notification read (`PATCH /{id}/read`) when its CTA is used, or just on list scroll/open —
    your call.

---

## 2. Commission requests

### 2.1 The mental model: purchase = one "slot"

The $50 store item ([spell-rework](https://www.mysterria.net/services/spell-rework), service id `25`) does
**not** create a commission request directly. Buying it creates one `CommissionSlot` (status `AVAILABLE`) and
fires a `COMMISSION_SLOT_AVAILABLE` notification. The player then fills out the commission form, which submits
against one or more of their `AVAILABLE` slots. A slot is consumed permanently once its request is `APPROVED`
or `REJECTED`. If staff sends it back as `RESCOPE_REQUIRED`, the slot(s) return to `AVAILABLE` so the same
purchase can be resubmitted (see §2.4) — there is no "edit" endpoint, only resubmission.

Buying the item more than once (or gifting it) just produces more independent slots for the recipient.

### 2.2 `GET /api/commissions/slots`

Returns the authenticated player's unused slots — call this before showing the commission form so you know
how many they have to spend and can pass the right `slotIds` on submit.

```json
[
  { "id": "uuid", "status": "AVAILABLE", "purchaseId": "uuid", "linkedRequestId": null, "createdAt": "..." }
]
```

`status` is one of `AVAILABLE`, `LINKED`, `CONSUMED` — this endpoint only ever returns `AVAILABLE` ones.

### 2.3 `POST /api/commissions` — submit a request

Body is exactly one of two shapes, discriminated by `requestType`. **Do not send `playerIgn`, `discordId`, or
`discordUsername`** — those are derived server-side from the authenticated user, there's nothing to fill in
for them.

**MAJOR** (one target, one of three change types):
```json
{
  "requestType": "MAJOR",
  "majorTargetName": "Fireball",
  "majorType": "BALANCE_REWORK",
  "majorRequestedChange": "...",
  "majorMotivation": "...",
  "majorLoreReference": "...",
  "minorChanges": null,
  "slotIds": ["uuid"],
  "confirmLoreGrounded": true,
  "confirmNoFundamentalRework": true,
  "confirmNoNerfOtherCommission": true,
  "confirmUnderstandsScope": true
}
```
`majorType` is one of `LORE_ALIGNMENT`, `BALANCE_REWORK`, `NEW_SPELL`.

**MINOR_BUNDLE** (1–3 small entries, no major fields):
```json
{
  "requestType": "MINOR_BUNDLE",
  "majorTargetName": null,
  "majorType": null,
  "majorRequestedChange": null,
  "majorMotivation": null,
  "majorLoreReference": null,
  "minorChanges": [
    { "targetName": "Spark", "changeDescription": "...", "motivation": "..." }
  ],
  "slotIds": ["uuid"],
  "confirmLoreGrounded": true,
  "confirmNoFundamentalRework": true,
  "confirmNoNerfOtherCommission": true,
  "confirmUnderstandsScope": true
}
```

Field limits (enforced server-side, mirror them client-side for UX): `majorTargetName`/minor `targetName` ≤ 128
chars, `majorRequestedChange`/`majorMotivation` ≤ 900 chars, `majorLoreReference` ≤ 500 chars, minor
`changeDescription`/`motivation` ≤ 200 chars each, `minorChanges` 1–3 entries. All four `confirm*` booleans
must be `true` or the request is rejected. `slotIds` must be non-empty and reference slots the player actually
owns in `AVAILABLE` status (normally just 1 — more than one only matters for the rescope-with-more-scope case,
§2.4).

On success (`201`), a Discord ticket is created automatically and staff are pinged — nothing further needed
from the frontend for that part.

Validation failures return `400` with Spring's standard field→message map body, same shape as every other
form on the site.

Response — `CommissionResponseDto`:
```json
{
  "id": "uuid",
  "playerIgn": "Steve",
  "requestType": "MAJOR",
  "status": "PENDING_REVIEW",
  "commissionsRequired": null,
  "linkedSlotCount": 1,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### 2.4 `GET /api/commissions/mine` and `GET /api/commissions/{id}`

`mine` returns `List<CommissionResponseDto>` (same shape as above) for a "my commissions" page. `{id}` returns
a single one, `403` if it's not the caller's.

**Status flow to show the player:**
```
PENDING_REVIEW → APPROVED → COMPLETED
PENDING_REVIEW → REJECTED               (terminal — slot is spent, no refund)
PENDING_REVIEW → RESCOPE_REQUIRED       (slot(s) returned to AVAILABLE)
```

When a request comes back `RESCOPE_REQUIRED`:
- `staffNotes` explains what needs to change.
- `commissionsRequired` (nullable int) tells you the **total** number of slots the resubmission needs. If it's
  higher than 1, the player needs to buy `commissionsRequired - <slots they already have available>` more
  before resubmitting — check `GET /api/commissions/slots` to know how many they currently hold.
- The player resubmits via a brand-new `POST /api/commissions` call (there is no PATCH/edit endpoint for
  players), passing however many `slotIds` are needed to cover `commissionsRequired`.

### 2.5 Admin/staff endpoints

Gated by permission `COMMISSIONS:MANAGE` (only staff roles have this — a normal PLAYER token gets `403`).

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/admin/commissions?status=` | — | `200` `List<AdminCommissionResponseDto>` (status filter optional, one of the CommissionStatus values) |
| PATCH | `/api/admin/commissions/{id}` | `UpdateCommissionReviewDto` | `200` `AdminCommissionResponseDto` |

`AdminCommissionResponseDto` (the full record, for the staff review page):
```json
{
  "id": "uuid",
  "discordId": 123456789012345678,
  "discordUsername": "steve#0",
  "playerIgn": "Steve",
  "requestType": "MAJOR",
  "majorTargetName": "Fireball",
  "majorType": "BALANCE_REWORK",
  "majorRequestedChange": "...",
  "majorMotivation": "...",
  "majorLoreReference": "...",
  "minorChanges": [],
  "touchesExistingCommission": false,
  "status": "PENDING_REVIEW",
  "staffNotes": null,
  "assignedDeveloper": null,
  "commissionsRequired": null,
  "linkedSlotIds": ["uuid"],
  "discordTicketChannelId": "123456789012345678",
  "createdAt": "...",
  "updatedAt": "..."
}
```

`touchesExistingCommission` is a non-blocking flag — surface it as a warning badge ("this target has been
commissioned before") but never block submission or approval on it; it's a case-insensitive exact-string match
so it can miss renamed/aliased spells.

`UpdateCommissionReviewDto` (request body for the PATCH):
```json
{
  "status": "RESCOPE_REQUIRED",
  "staffNotes": "This needs to be split into two commissions.",
  "assignedDeveloper": "someone",
  "commissionsRequired": 2
}
```
`status` is required; the other three fields are optional (send `null`/omit to leave unchanged — the backend
only overwrites fields you actually send).

This PATCH also posts a status-update message into the request's Discord ticket automatically — no separate
action needed from the staff UI for that.

---

## 3. Auth summary

Everything above uses the site's existing JWT bearer auth. No new OAuth scopes or login changes — if the
player is already logged in on the site, they're set for both notifications and commissions. Staff-only
endpoints (§2.5) just need the account's role to carry `COMMISSIONS:MANAGE`, which is already granted to
LEADER/DEVELOPER/OWNER in prod.
