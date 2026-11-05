import type { FormEvent } from 'react';
import type { Draft, KanbanItem } from '../types';
import type { CharactersState } from '../hooks/useCharacters';
import { CharacterPicker } from './CharacterPicker';

type Props = {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  charactersState: CharactersState;
  onRetry: () => void;
  onLoadMore: () => void;
  onCreate: (item: KanbanItem) => void;
  onCancel: () => void;
};

export function CreateItemForm({
  draft,
  onDraftChange,
  charactersState,
  onRetry,
  onLoadMore,
  onCreate,
  onCancel,
}: Props) {
  // The half-typed draft is owned by KanbanBoard, not this form: the form
  // unmounts when the modal closes, and the draft should survive that.
  const { title, description, characterId } = draft;
  const setTitle = (value: string) => onDraftChange({ ...draft, title: value });
  const setDescription = (value: string) => onDraftChange({ ...draft, description: value });
  const setCharacterId = (value: string) => onDraftChange({ ...draft, characterId: value });

  const characters = charactersState.status === 'success' ? charactersState.characters : [];
  const character = characters.find((c) => c.id === characterId);
  const canSubmit = title.trim() !== '' && character !== undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      character,
    });
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <p className="hint" aria-hidden="true">
        Required fields are marked with <span className="required">*</span>
      </p>

      <label className="field">
        <span>
          Title <span className="required" aria-hidden="true">*</span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </label>

      <CharacterPicker
        state={charactersState}
        selectedId={characterId}
        onSelect={setCharacterId}
        onRetry={onRetry}
        onLoadMore={onLoadMore}
      />

      <footer className="form-actions">
        <button type="button" className="button-subtle" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button-primary" disabled={!canSubmit}>
          Create item
        </button>
      </footer>
    </form>
  );
}
