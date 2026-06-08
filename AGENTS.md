# Agent map (only file to read before coding)

## Flow

`UI → src/lib/*/service.ts → src/services/api/client.ts → instituteofsound-api /api/v1`

## Where to look

| Task | Open these files only |
|------|----------------------|
| Feed | `feedService.ts`, `v1Client.ts`, `v1CommunityFeed.ts` |
| Follow/comments/notify | `*Service.ts` in `community/`, `v1Phase4Client.ts`, `v1Phase4Community.ts` |
| Network | `connectionService.ts` or `presenceService.ts`, `v1Client.ts`, `v1Network.ts` |
| Artist page | `artist-profile/service.ts`, `v1Client.ts`, `v1ArtistProfile.ts` |
| Submissions/DM | `submissions/service.ts` or `dm/service.ts`, `v1Phase5Client.ts`, `v1Phase5.ts` |
| New API route | `instituteofsound-api/src/legacy/handlers/`, `v1Router.ts`, `client.ts`, `service.ts` |

Router: `instituteofsound-api/src/legacy/v1Router.ts`

## Rules

1. Supabase in browser = **auth only**.
2. Services call v1 when configured; localStorage when not.
3. Do not read migrations unless error cites SQL.

## Keep Cursor cheap (human)

| Do | Don't |
|----|-------|
| **Ask** for questions | Agent for "explain codebase" |
| Name 1–2 files in prompt | `@` whole folders |
| Tab for tiny edits | Max model for simple fixes |
| Agent for multi-file bugs | Re-run Agent on same task 5× |
