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
    Modal.tsx               Wrapper around the native <dialog>
    Celebration.tsx         The "moved to Done" moment
```

## Key decisions

**State ownership.** `KanbanBoard` owns the list of items. `CreateItemForm` and each column are siblings, and siblings can't share state sideways, so the list lives in their shared parent. Children change it through callbacks passed down as props. The same rule puts `isFormOpen` on the board: the Create button opens the modal and the modal closes it.

**Order is array position.** Items don't store an order number. Their position in the array *is* their order. A move is "remove, then insert", so only the moved item changes. Storing a number on every item would mean one drag could rewrite many items.

**One flat list, with `status` on each item.** The drag library reports positions per column ("Done, slot 1"), so `lib/moveItem.ts` translates that into a position in the flat array. I kept one list because filtering and persistence are simpler with a single source of truth. Three per-column lists would map more directly to the library, and that's a fair alternative.

**Server data vs. user data.** Characters come from the API through a small custom hook (`useEffect` + `fetch`, with an `AbortController` for cleanup). With only one query, a data-fetching library like React Query or Apollo felt like more than this needed. The hook exposes a single status (`loading | error | success`) so the UI can't end up in an impossible state like "loading and errored."

**Every item must have a real character.** The form doesn't pre-pick a character, because then the app would be choosing, not the user. If characters fail to load, Create is blocked and a Retry button is shown. I chose not to allow a placeholder "unassigned" character, because fixing it afterwards would require editing items, which is out of scope.

**Draft survives closing the modal.** The form unmounts when the modal closes, so the half-typed draft lives one level up in `KanbanBoard`. The tradeoff is that every keystroke re-renders the board, which is fine at this size. Drafts don't survive a page refresh. That would be persistence, which is listed below.

**Drag and drop: [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd).** It's a maintained fork of `react-beautiful-dnd`, which is now deprecated. I picked it because Kanban (cross-list moves and reordering) is its main use case, `onDragEnd` reports the source and destination column and index directly, and keyboard dragging and screen-reader announcements are built in. I considered `dnd-kit`, which is more flexible but needs custom multi-container logic.

**Done delight.** The celebration only fires when an item arrives in Done *from another column*. Reordering within Done doesn't count. It shows for 2 seconds. If a second item lands in Done during that time, the timer restarts instead of the first timer cutting the second celebration short. The timer is cleared in a `useEffect` cleanup, which also covers unmounting. The animation is turned off for users who prefer reduced motion.

## Not done / future work

- **Tests.** `lib/moveItem.ts` is a pure function and the riskiest logic in the app, so it's the first thing I'd test (Vitest): reorder within a column, move into an empty column, move to the end, and an unknown id. After that, component tests for the form's validation and the error/retry state.
- **Extract hooks from `KanbanBoard`.** It currently handles items, the modal, the draft, and the celebration timer.
  - `useCelebration()`: move the timer logic into its own hook.
  - `useReducer` for items, with actions like `add` and `move`. This puts every item change in one place, which makes persistence and filtering easier to add.
- **Persistence.** Items disappear on refresh. The first step would be `localStorage`. A real product would sync to a backend.
- **Filtering** by character or text. The filter would be view state on the board. The items themselves stay unfiltered, and the drop logic needs to account for positions in the filtered view.
- **Editing and deleting items.**
- **More characters.** Only the first page (20) is loaded. Next would be search-as-you-type or pagination.
- **Error boundary** around the board.

<!-- TODO: "How I used AI" section -->

## Credits

- Character data: [Rick and Morty API](https://rickandmortyapi.com/)
- Celebration graphic: Party Popper from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji), MIT License, Copyright (c) Microsoft Corporation.
