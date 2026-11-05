# Kanban Board (Rick and Morty)

A frontend-only Kanban board built with React and TypeScript. Items are created through a form, each one is assigned a character from the [Rick and Morty GraphQL API](https://rickandmortyapi.com/graphql), and items can be dragged between **To Do**, **Doing**, and **Done** or reordered within a column. Moving an item into Done pops a celebration.

<!-- TODO: author name -->

## Running it

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run lint
```

## Project structure

```
src/
  types.ts                  Status, Character, KanbanItem, Draft
  hooks/useCharacters.ts    Fetches characters (loading / error / success + retry)
  lib/moveItem.ts           Pure function: "column + slot" -> new position in the items array
  components/
    KanbanBoard.tsx         Owns board state; handles drops and the celebration
    ItemList.tsx            One column (a drop zone)
    Item.tsx                One card (draggable)
    CreateItemForm.tsx      The create form (controlled by the board)
    CharacterPicker.tsx     Character radio list, 5 at a time with "Show more"
    Modal.tsx               Wrapper around the native <dialog>
    Celebration.tsx         The "moved to Done" moment
```

## Key decisions

**State ownership.** `KanbanBoard` owns the list of items. `CreateItemForm` and each column are siblings, and siblings can't share state sideways, so the list lives in their shared parent. Children change it through callbacks passed down as props. The same rule puts `isFormOpen` on the board: the Create button opens the modal and the modal closes it.

**Order is array position.** Items don't store an order number. Their position in the array *is* their order. A move is "remove, then insert", so only the moved item changes. Storing a number on every item would mean one drag could rewrite many items.

**One flat list, with `status` on each item.** The drag library reports positions per column ("Done, slot 1"), so `lib/moveItem.ts` translates that into a position in the flat array. I kept one list because filtering and persistence are simpler with a single source of truth. Three per-column lists would map more directly to the library, and that's a fair alternative.

**Server data vs. user data.** Characters come from the API through a small custom hook (`useEffect` + `fetch`, with an `AbortController` for cleanup). With only one query, a data-fetching library like React Query or Apollo felt like more than this needed. The hook exposes a single status (`loading | error | success`) so the UI can't end up in an impossible state like "loading and errored."

**Every item must have a real character.** The form doesn't pre-pick a character, because then the app would be choosing, not the user. If characters fail to load, Create is blocked and a Retry button is shown. I chose not to allow a placeholder "unassigned" character, because fixing it afterwards would require editing items, which is out of scope.

**Character picker shows 5 at a time.** The API returns 20 characters per page. The picker shows 5, and "Show more" reveals 5 more. Once everything already fetched is on screen, it requests the next page. How many are visible is the picker's own local state. The fetched list and the next page number live in `useCharacters`. If loading more fails, the characters already loaded stay and the error is shown next to a "Try again" button.

**Draft survives closing the modal.** The form unmounts when the modal closes, so the half-typed draft lives one level up in `KanbanBoard`. The tradeoff is that every keystroke re-renders the board, which is fine at this size. Drafts don't survive a page refresh. That would be persistence, which is listed below.

**Drag and drop: [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd).** It's a maintained fork of `react-beautiful-dnd`, which is now deprecated. I picked it because Kanban (cross-list moves and reordering) is its main use case, `onDragEnd` reports the source and destination column and index directly, and keyboard dragging and screen-reader announcements are built in. I considered `dnd-kit`, which is more flexible but needs custom multi-container logic.

**Done delight.** The celebration only fires when an item arrives in Done *from another column*. Reordering within Done doesn't count. It shows for 2 seconds. If a second item lands in Done during that time, the timer restarts instead of the first timer cutting the second celebration short. The timer is cleared in a `useEffect` cleanup, which also covers unmounting. The animation is turned off for users who prefer reduced motion.

## Accessibility

I checked the code against WCAG 2.1 AA:

- **Keyboard:** every action works without a mouse. Cards can be dragged with the keyboard (Tab to a card, Space to lift, arrow keys to move, Space to drop), and the drag library announces each step to screen readers.
- **Modal:** uses the native `<dialog>`, so focus is trapped inside and Esc closes it. Focus moves to the Title field on open and returns to the Create button on close.
- **Form:** every field has a label, and the character choices are a radio group inside a `<fieldset>`/`<legend>`. Required fields use the native `required` attribute, and the decorative `*` is hidden from screen readers.
- **Announcements:** "Moved to Done" is announced through a live region that's always rendered. The animation itself is hidden from screen readers and turned off for users who prefer reduced motion.
- **Contrast:** every text and color pair meets AA (4.5:1 for text, 3:1 for borders and focus rings).
- **Semantics:** column headings are `h2` and card titles are `h3`. Avatars next to a visible name have empty `alt` text so names aren't read twice.

Not done yet: an automated axe or Lighthouse pass in CI, and a manual test with VoiceOver or NVDA.

## Not done / future work

- **Tests.** `lib/moveItem.ts` is a pure function and the riskiest logic in the app, so it's the first thing I'd test (Vitest): reorder within a column, move into an empty column, move to the end, and an unknown id. After that, component tests for the form's validation and the error/retry state.
- **Extract hooks from `KanbanBoard`.** It currently handles items, the modal, the draft, and the celebration timer.
  - `useCelebration()`: move the timer logic into its own hook.
  - `useReducer` for items, with actions like `add` and `move`. This puts every item change in one place, which makes persistence and filtering easier to add.
- **Persistence.** Items disappear on refresh. The first step would be `localStorage`. A real product would sync to a backend.
- **Filtering** by character or text. The filter would be view state on the board. The items themselves stay unfiltered, and the drop logic needs to account for positions in the filtered view.
- **Editing and deleting items.**
- **Typeahead character search.** "Show more" works, but scrolling hundreds of characters to find one is slow. A better experience is a combobox where you type part of a name and pick from matches. The API supports `characters(filter: { name: "..." })`. It would need debouncing, a way to discard stale responses, and the ARIA combobox pattern so it works with a keyboard and screen readers.
- **Error boundary** around the board.

## How I used AI

I used Claude Code throughout, and on purpose in two different ways: first as a thinking partner to make the decisions, then as a pair programmer to build them.

### 1. Planning: brainstorming, then getting grilled

Before writing any code, I set ground rules: no code, and no answers or library picks from the AI. Claude asked questions and laid out tradeoffs, I made every decision, and then it challenged each decision the way an interviewer would. Most of the grilling was about **state**, because explaining state out loud is the skill I most wanted to sharpen. Some examples of what changed because of it:

- **Where order lives.** I first chose to store an order number on each item. Claude had me work through a cross-column move by hand. With a number on every item, one drag rewrote four items. With array position, only the moved item changed. I switched to array position (Claude made the final call when I was short on time), and the reasoning is in *Key decisions*.
- **Who owns the items.** I started with "the board owns it because it sets up the columns." When pressed on *why not one level lower*, I first said the form could reach a list kept in `ItemList`. It can't: they're siblings, and props only flow down. That became the main reason the state lives in `KanbanBoard`.
- **Where the half-typed form lives.** Moving the form into a modal meant the draft was lost whenever the modal closed. My first instinct was `localStorage`. Being asked "which problem are you actually solving?" showed me that lifting the draft one level up fixes losing it on close, while `localStorage` is a separate persistence decision.
- **The character rule.** I wanted to pre-pick a character and fall back to "Unassigned" when the API fails. Rereading the requirement ("every item must have a character assigned") changed my mind: no pre-pick, and creating is blocked with a Retry until characters load.
- **The Done moment.** Questions about edge cases (reordering within Done, two drops in a row) produced the "only when it arrives from another column" rule and the restarting timer.
- **Is this senior-level structure?** I asked for an honest review. Out of that I chose the single-status `useCharacters` state and the `hooks/` and `lib/` folders. I deferred tests and the `useReducer`/`useCelebration` refactor to *Future work*.

### 2. Research (background agents)

- **Drag and drop:** an agent compared `@hello-pangea/dnd`, `dnd-kit` (both versions), Pragmatic DnD, `react-dnd`, SortableJS, and native HTML5 drag and drop. It looked at maintenance status (checked against npm and GitHub), what the drop callback reports, accessibility, and how easy each is to explain. Its pick, `@hello-pangea/dnd`, matched my needs.
- **Celebration graphic:** an agent found SVGs with confirmed open licenses. I used the MIT-licensed Fluent Emoji party popper and left out a ShareAlike option.

### 3. Building

Claude Code wrote the implementation from the decisions above. I ran and checked it locally, and asked for changes as I went. I've read every file and can explain each line. The skills (packaged instructions Claude Code loads for a task) I used:

| Skill | What it did here |
|---|---|
| **frontend-design** | A plan for the Jira-inspired look (color, type, layout), checked against generic "AI-looking" defaults before building |
| **frontend-ui-engineering** | The WCAG 2.1 AA audit that found and fixed the contrast, list-semantics, focus-return, and live-region problems listed under *Accessibility* |

AI also helped with checks: build and lint after every change, a script that runs `moveItem` on the board examples, computed contrast ratios, and live queries against the GraphQL API to confirm the query and pagination shape.

## Credits

- Character data: [Rick and Morty API](https://rickandmortyapi.com/)
- Celebration graphic: Party Popper from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), MIT License, Copyright (c) Microsoft Corporation.
