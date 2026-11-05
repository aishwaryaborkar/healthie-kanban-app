// The three statuses double as the three column ids.
export type Status = 'todo' | 'doing' | 'done';

export const COLUMNS: { status: Status; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'doing', title: 'Doing' },
  { status: 'done', title: 'Done' },
];

// Data from the outside world (Rick and Morty API). We only ask for what we show.
export type Character = {
  id: string;
  name: string;
  image: string;
};

// Data the user creates. Order is NOT stored here: an item's position in the
// items array is its order on the board.
export type KanbanItem = {
  id: string;
  title: string;
  description: string;
  status: Status;
  character: Character;
};

// The half-typed create form. Owned by KanbanBoard so it survives the modal closing.
export type Draft = {
  title: string;
  description: string;
  characterId: string; // '' = not chosen yet (no pre-pick)
};

export const EMPTY_DRAFT: Draft = { title: '', description: '', characterId: '' };
