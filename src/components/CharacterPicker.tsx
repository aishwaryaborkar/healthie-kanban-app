import { useState } from 'react';
import type { CharactersState } from '../hooks/useCharacters';

const PAGE_SIZE = 10;

type Props = {
  state: CharactersState;
  selectedId: string;
  onSelect: (id: string) => void;
  onRetry: () => void;
  onLoadMore: () => void;
};

// Native dropdown showing 10 characters at a time. "Show more" adds 10 more,
// and asks the API for the next page once we've shown everything already fetched.
// (A typeahead combobox would be the better long-term UX; see README.)
export function CharacterPicker({ state, selectedId, onSelect, onRetry, onLoadMore }: Props) {
  // How many to show is purely this component's concern, so it lives here.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const characters = state.status === 'success' ? state.characters : [];
  const visible = characters.slice(0, visibleCount);
  // Keep the chosen character in the list even if it's past the first 10
  // (e.g. picked after "Show more", then the modal was closed and reopened).
  const selected = characters.find((c) => c.id === selectedId);
  const options = selected && !visible.includes(selected) ? [selected, ...visible] : visible;

  const canShowMore =
    state.status === 'success' && (visibleCount < characters.length || state.nextPage !== null);

  function showMore() {
    const next = Math.min(visibleCount, characters.length) + PAGE_SIZE;
    if (next > characters.length) onLoadMore();
    setVisibleCount(next);
  }

  return (
    <div className="field">
      <label htmlFor="character">
        Assigned character <span className="required" aria-hidden="true">*</span>
      </label>

      <div className="character-picker">
        {selected ? (
          <img src={selected.image} alt="" className="avatar" />
        ) : (
          <span className="avatar avatar-empty" aria-hidden="true" />
        )}
        <select
          id="character"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          disabled={state.status !== 'success'}
          required
        >
          <option value="" disabled>
            {state.status === 'loading' ? 'Loading characters…' : 'Choose a character'}
          </option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {state.status === 'success' && (
        <div className="picker-footer">
          <span className="picker-status" aria-live="polite">
            {options.length} characters in the list
          </span>
          {canShowMore && (
            <button
              type="button"
              className="button-subtle show-more"
              onClick={showMore}
              disabled={state.isLoadingMore}
            >
              {state.isLoadingMore ? 'Loading…' : state.loadMoreError ? 'Try again' : 'Show 10 more'}
            </button>
          )}
        </div>
      )}

      {state.status === 'success' && state.loadMoreError && (
        <p className="picker-status picker-error" role="alert">
          Couldn't load more characters ({state.loadMoreError}).
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
    </div>
  );
}
