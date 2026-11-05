# Kanban Board (Rick and Morty)

A React + TypeScript Kanban board. You create items in a form, assign each one a character from the [Rick and Morty GraphQL API](https://rickandmortyapi.com/graphql), and drag them between To Do, Doing, and Done. Moving an item to Done shows a small celebration.
## Running it

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Project structure

```
src/
  types.ts                  Shared types
  hooks/useCharacters.ts    Fetches characters, with loading, error, retry, and paging
  lib/moveItem.ts           Moves an item in the items array after a drop
  components/
    KanbanBoard.tsx         Owns the board state and handles drops
    ItemList.tsx            One column
    Item.tsx                One card
    CreateItemForm.tsx      The create form
    CharacterPicker.tsx     Character dropdown
    Modal.tsx               Native <dialog> wrapper
    Celebration.tsx         The Done animation
```

## Decisions

**Where state lives.** `KanbanBoard` owns the items. The form and the columns are siblings, and siblings can't share state directly, so it lives in their parent. Children update it through callbacks. `isFormOpen` and the form draft live there too, so the draft isn't lost when the modal closes.

**Order is array position.** Items don't store an order number. A move removes the item and inserts it at the new spot, so only that item changes.

**One list, with a status on each item.** The drag library reports positions per column, so `moveItem` converts that into a position in the full list. One list keeps filtering and persistence simple. Three separate lists would also work.

**Fetching characters.** A small custom hook with `fetch` and `useEffect`. There's only one query, so I didn't add React Query or Apollo. The hook has a single status (`loading`, `error`, or `success`), so it can't be loading and errored at the same time.

**Every item needs a real character.** The form doesn't pre-select one. If characters fail to load, you can't create an item until a retry succeeds.

**Character dropdown.** A native `<select>` showing 10 characters, with "Show 10 more". It fetches the next page from the API when needed.

**Drag and drop.** [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd), the maintained fork of `react-beautiful-dnd`. It's built for Kanban boards, its drop callback gives the source and destination column, and keyboard dragging is built in. I also considered `dnd-kit`, but multi-column boards take more custom code there.

**Done celebration.** It only shows when an item moves into Done from another column, not when you reorder inside Done. It lasts 2 seconds, and a second drop restarts the timer. It's turned off for users who prefer reduced motion.

## Accessibility

- Everything works with a keyboard, including dragging (Space to pick up, arrow keys to move, Space to drop).
- The modal traps focus, closes on Esc, and returns focus to the Create button.
- All fields have labels. Text and borders meet WCAG AA contrast.
- "Moved to Done" is announced to screen readers.

Not done: an automated axe/Lighthouse check and a screen reader test.

## Future work

- **Tests**, starting with `moveItem`.
- **Split up `KanbanBoard`**: move the celebration timer into a `useCelebration` hook, and use `useReducer` for item changes.
- **Persistence**: items are lost on refresh. Start with `localStorage`.
- **Filtering** by character or text.
- **Edit and delete items.**
- **Typeahead character search.** A combobox where you type a name and pick from matches is a better experience than paging through a dropdown. The API supports filtering by name.
- **Error boundary** around the board.

## How I used AI

I used Claude Code to pressure-test my design decisions, especially where state should live, and to research the drag-and-drop library and the celebration graphic. I used the `frontend-design` skill for the visual design and the `frontend-ui-engineering` skill for the accessibility review.

## Credits

- Character data: [Rick and Morty API](https://rickandmortyapi.com/)
- Celebration graphic: Party Popper from [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT, Copyright (c) Microsoft Corporation)
