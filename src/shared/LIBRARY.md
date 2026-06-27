# IOS UI Library

`src/shared/` is the **Institute of Sound internal UI library**. Before building any UI, search this catalog first.

## Golden rule

1. Check this file and `@/shared/components`
2. Reuse existing components via props/className
3. If missing and reusable (2+ places) → add to `src/shared/components/<kit>/`, export from `index.ts`, document here
4. Never import generic UI from `@/modules/*`

## Tier 1 — Primitives (`shared/components/ui/`)

| Component | Import | Use when |
|-----------|--------|----------|
| `Button` | `@/shared/components/ui/button` | Primary actions, submits |
| `IconButton` | `@/shared/components/ui/icon-button` | Icon-only actions (toolbar, header, messenger) |
| `Input`, `Textarea` | `@/shared/components/ui/input` | Form fields |
| `Dialog` | `@/shared/components/ui/dialog` | Overlays, modals (prefer over raw Radix) |
| `AlertDialog` | `@/shared/components/ui/alert-dialog` | Confirm / destructive flows |
| `Avatar` | `@/shared/components/ui/avatar` | Low-level avatar shell |
| `Skeleton` | `@/shared/components/ui/skeleton` | Loading placeholders |
| `Card`, `Tabs`, `Select`, `Badge`, etc. | `@/shared/components/ui/*` | Standard form/layout primitives |

**Deprecated:** `Modal` and `Sheet` wrappers — use `Dialog` / `AlertDialog` directly. No current consumers.

## Tier 2 — Patterns

### Layout (`@/shared/components/layout`)

| Component | Use when |
|-----------|----------|
| `Page`, `PageHeader`, `PageTitle`, `PageSection`, `PageGrid` | Page shells and sections |
| `SectionHeader` | Section title + optional action |
| `SurfaceSection` | Bordered content surface |
| `PanelCard` | Card panel with title |
| `ListRow` | Clickable or static list row |
| `DividedList` | Bordered list with dividers |
| `WorkspaceHeader`, `WorkspaceFooter` | Editor / preview chrome bars |
| `StatCard`, `DashboardPanel` | Dashboard metrics and panels |

### Controls (`@/shared/components/controls`)

| Component | Use when |
|-----------|----------|
| `SegmentedControl` | Pill toggle (feed scope, period filters) |
| `SlidingTabBar` | Animated tab/filter bar |

### Forms (`@/shared/components/forms`)

| Component | Use when |
|-----------|----------|
| `FileDropzone` | Drag-and-drop file upload |
| `FormGroupCard` | Grouped form section with title |

### Media (`@/shared/components/media`)

| Component | Use when |
|-----------|----------|
| `MediaPreviewRow` | Track/post preview row with artwork |

### Engagement (`@/shared/components/engagement`)

| Component | Use when |
|-----------|----------|
| `EngagementActionBar` | Like / comment / share action row |
| `EngagementActionSlot` | Slot inside action bar |
| `EngagementActionButton` | Styled engagement button |

### User (`@/shared/components/user`)

| Component | Props | Use when |
|-----------|-------|----------|
| `UserAvatar` | `name`, `avatarUrl?`, `className?` | User photo with initials fallback |
| `GroupAvatarStack` | `members?`, `title?`, `avatarUrl?`, `size?` | Group chat / thread avatars |
| `ProfileLink` | `userId`, `name`, `variant?: avatar\|name` | Link to `/profile/:id` |

### Reactions (`@/shared/components/reactions`)

| Component | Use when |
|-----------|----------|
| `ReactionPicker` | Hover/long-press reaction menu |
| `ReactionPickerIcon` | Display a reaction kind |
| `ReactionHoverPickerSlot` | Wrap like button + picker hover zone |

### Emoji (`@/shared/components/emoji`)

| Component | Use when |
|-----------|----------|
| `AnimatedEmojiPicker` | Emoji picker popover |
| `AnimatedEmojiText` | Render animated emoji in text |
| `EmojiTriggerButton` | Open emoji picker |

### Navigation (`@/shared/components/navigation`)

| Component | Use when |
|-----------|----------|
| `HeaderPopover` | Header utility dropdown (notifications, messenger) |
| `StickySectionNav` | Sticky section navigation |
| `ScrollToTopButton` | Scroll-to-top FAB |

### Feedback (`@/shared/components/feedback`)

| Component | Variants / props | Use when |
|-----------|------------------|----------|
| `PageLoader` | — | Full-page / route loading |
| `ErrorState` | `onRetry?` | Inline error with retry |
| `EmptyState` | `variant: default \| dashed \| card`, `action?` | Empty lists, panels, tabs |
| `CenteredPageState` | `message`, `action?` | Full-page error / not-found |

### Icons (`@/shared/components/icons`)

| Component | Use when |
|-----------|----------|
| `VerifiedUserName` | Name + verified badge |

## Tier 3 — Domain kits

### Link preview (`@/shared/components/link-preview`)

| Component | Use when |
|-----------|----------|
| `LinkPreviewCard` | URL preview card (feed, messenger, composer) |
| `LinkPreviewCardSkeleton` | Loading state for link preview |

### Social (`@/shared/components/social`)

| Component | Use when |
|-----------|----------|
| `ProfileFollowButton` | Follow/unfollow on profiles |
| `FollowStats` | Follower/following counts |
| `FollowListDialog` | Followers/following list modal |

### Other kits

- `geo-map` — `GeoPulseMap`
- `wire-picks` — editorial wire pick builder
- `editor-submissions`, `editor-events` — editor desk UIs

## Hooks (`@/shared/hooks/`)

| Hook | Use when |
|------|----------|
| `useReactionHoverPicker` | Reaction picker open/close on hover |
| `useSlidingIndicator` | Animated tab/filter indicator |
| `useLinkPreview` | Auto-fetch URL preview from text |
| `useHeaderPopoverPosition` | Position header dropdown panel |
| `useHeaderPopoverDismiss` | Click-outside + Escape for popovers |
| `useFollow`, `useFollowingUsers` | Follow API state |
| `useIsMobile`, `useInfiniteScroll`, `useBodyScrollLock` | Layout / scroll utilities |

## Utils (`@/shared/lib/`)

| Util | Use when |
|------|----------|
| `payloadString`, `payloadNumber` | Read typed values from JSON payloads |
| `formatEngagementCount` | Compact counts (1.2K, 3M) |
| `formatRelativeTime` | Relative timestamps (`notification`, `dashboard`, `comment` styles) |
| `getProfilePath` | `/profile/:userId` path |
| `userInitials` | Avatar fallback initials |
| `cn` | Tailwind class merging |

## Not in library (keep in modules)

- FeedList, FeedComposer, feed cards — feed domain layout
- Messenger thread list, message bubble content — DM domain
- `use-feed-engagement` — feed API mutations
- Editor canvas blocks, music player internals — domain-specific
- Module-scoped CSS: `messenger-icon-btn`, `feed-page`, `explore-page` — use shared kits inside, keep module wrappers
