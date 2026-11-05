import { useState } from 'react';
import type { CharactersState } from '../hooks/useCharacters';

const PAGE_SIZE = 5;

type Props = {
  state: CharactersState;
  selectedId: string;
  onSelect: (id: string) => void;
  onRetry: () => void;
  onLoadMore: () => void;
};

// Radio list of characters, 5 at a time. "Show more" reveals 5 more, and asks
// the API for the next page once we've shown everything already fetched.
export function CharacterPicker({ state, selectedId, onSelect, onRetry, onLoadMore }: Props) {
  // How many to show is purely this component's concern, so it lives here.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  return (
    <fieldset className="field character-field">
      <legend>
        Assigned character <span className="required" aria-hidden="true">*</span>
      </legend>

      {state.status === 'loading' && (
        <p className="picker-status" role="status">
          Loading characters…
        </p>
      )}

      {state.status === 'error' && (
        <div className="form-error" role="alert">
          <span>
            Characters didn't load ({state.message}). Every item needs one, so retry to continue.
          </span>
          <button type="button" className="button-subtle" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      {state.status === 'success' && renderOptions(state)}
    </fieldset>
  );

  function renderOptions(loaded: Extract<CharactersState, { status: 'success' }>) {
    const visible = loaded.characters.slice(0, visibleCount);
    // Keep the chosen character on screen even if it's outside the first few
    // (e.g. picked from page 2, then the modal was closed and reopened).
    const selected = loaded.characters.find((c) => c.id === selectedId);
    const shown = selected && !visible.includes(selected) ? [selected, ...visible] : visible;
    const canShowMore = visibleCount < loaded.characters.length || loaded.nextPage !== null;

    function showMore() {
      const next = Math.min(visibleCount, loaded.characters.length) + PAGE_SIZE;
      if (next > loaded.characters.length) onLoadMore();
      setVisibleCount(next);
    }

    return (
      <>
        <div className="character-options">
          {shown.map((c) => (
            <label key={c.id} className="character-option">
              <input
                type="radio"
                name="character"
                value={c.id}
                checked={c.id === selectedId}
                onChange={() => onSelect(c.id)}
                required
              />
              <img src={c.image} alt="" className="avatar avatar-small" />
              <span>{c.name}</span>
            </label>
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {shown.length} characters shown
        </p>

        {loaded.loadMoreError && (
          <p className="picker-status picker-error" role="alert">
            Couldn't load more characters ({loaded.loadMoreError}).
          </p>
        )}

        {canShowMore && (
          <button
            type="button"
            className="button-subtle show-more"
            onClick={showMore}
            disabled={loaded.isLoadingMore}
          >
            {loaded.isLoadingMore
              ? 'Loading…'
              : loaded.loadMoreError
                ? 'Try again'
                : 'Show more characters'}
          </button>
        )}
      </>
    );
  }
}
