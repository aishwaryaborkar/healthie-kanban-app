import type { FormEvent } from 'react';
import type { Draft, KanbanItem } from '../types';
import type { CharactersState } from '../hooks/useCharacters';

type Props = {
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  charactersState: CharactersState;
  onRetry: () => void;
  onCreate: (item: KanbanItem) => void;
  onCancel: () => void;
};

export function CreateItemForm({
  draft,
  onDraftChange,
  charactersState,
  onRetry,
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
      <p className="hint">
        Required fields are marked with <span className="required">*</span>
      </p>

      <label className="field">
        <span>
          Title <span className="required">*</span>
        </span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </label>

      <label className="field">
        <span>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </label>

      <label className="field">
        <span>
          Assigned character <span className="required">*</span>
        </span>
        <div className="character-picker">
          {character ? (
            <img src={character.image} alt="" className="avatar" />
          ) : (
            <span className="avatar avatar-empty" aria-hidden="true" />
          )}
          <select
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            disabled={charactersState.status !== 'success'}
            required
          >
            <option value="" disabled>
              {charactersState.status === 'loading' ? 'Loading characters…' : 'Choose a character'}
            </option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </label>

      {charactersState.status === 'error' && (
        <div className="form-error" role="alert">
          <span>
            Characters didn't load ({charactersState.message}). Every item needs one, so retry to
            continue.
          </span>
          <button type="button" className="button-subtle" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

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
