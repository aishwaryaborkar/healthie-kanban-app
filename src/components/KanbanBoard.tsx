import { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { COLUMNS, EMPTY_DRAFT } from '../types';
import type { Draft, KanbanItem } from '../types';
import { moveItem } from '../lib/moveItem';
import { useCharacters } from '../hooks/useCharacters';
import { CreateItemForm } from './CreateItemForm';
import { ItemList } from './ItemList';
import { Celebration } from './Celebration';
import { Modal } from './Modal';

const CELEBRATION_MS = 2000;

export function KanbanBoard() {
  // The board owns the items: CreateItemForm and every ItemList are siblings
  // that all need them, so the state lives in their shared parent.
  const [items, setItems] = useState<KanbanItem[]>([]);
  // The Create button (header) and the modal both depend on this, so it lives here too.
  const [isFormOpen, setIsFormOpen] = useState(false);
  // The half-typed form lives here (not in the form) so closing the modal by
  // accident doesn't throw it away. It's cleared after a successful create.
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  // When the last celebration started (null = not celebrating).
  const [celebratedAt, setCelebratedAt] = useState<number | null>(null);
  const { state: charactersState, retry } = useCharacters();

  // Hide the celebration after 2s. A new drop changes celebratedAt, which
  // cancels the old timer (cleanup) and starts a fresh one. Same cleanup runs on unmount.
  useEffect(() => {
    if (celebratedAt === null) return;
    const timer = setTimeout(() => setCelebratedAt(null), CELEBRATION_MS);
    return () => clearTimeout(timer);
  }, [celebratedAt]);

  function addItem(item: KanbanItem) {
    setItems((prev) => [...prev, item]);
    setDraft(EMPTY_DRAFT);
    setIsFormOpen(false);
  }

  function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return; // dropped outside a column
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return; // dropped back where it started
    }

    const toStatus = COLUMNS.find((c) => c.status === destination.droppableId)?.status;
    if (!toStatus) return;

    setItems((prev) => moveItem(prev, draggableId, toStatus, destination.index));

    // Only celebrate when an item arrives in Done from another column.
    if (toStatus === 'done' && source.droppableId !== 'done') {
      setCelebratedAt(Date.now());
    }
  }

  return (
    <div className="page">
      <header className="board-header">
        <div>
          <p className="breadcrumb">Projects / Rick and Morty</p>
          <h1>Kanban board</h1>
        </div>
        <button type="button" className="button-primary" onClick={() => setIsFormOpen(true)}>
          + Create
        </button>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="columns">
          {COLUMNS.map((column) => (
            <ItemList
              key={column.status}
              status={column.status}
              title={column.title}
              items={items.filter((item) => item.status === column.status)}
              emptyMessage={
                column.status === 'todo' && items.length === 0
                  ? 'Nothing here yet. Use Create to add the first item.'
                  : undefined
              }
            />
          ))}
        </main>
      </DragDropContext>

      {isFormOpen && (
        <Modal title="Create item" onClose={() => setIsFormOpen(false)}>
          <CreateItemForm
            draft={draft}
            onDraftChange={setDraft}
            charactersState={charactersState}
            onRetry={retry}
            onCreate={addItem}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}

      {celebratedAt !== null && <Celebration key={celebratedAt} />}
    </div>
  );
}
