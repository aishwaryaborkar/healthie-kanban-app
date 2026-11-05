import { useEffect, useState } from 'react';
import type { Character } from '../types';

const API_URL = 'https://rickandmortyapi.com/graphql';

// The API returns 20 characters per page; info.next is the next page number (or null).
const CHARACTERS_QUERY = `
  query Characters($page: Int) {
    characters(page: $page) {
      info { next }
      results { id name image }
    }
  }
`;

type CharactersResponse = {
  data?: { characters: { info: { next: number | null }; results: Character[] } };
  errors?: { message: string }[];
};

async function fetchCharacterPage(page: number, signal?: AbortSignal) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: CHARACTERS_QUERY, variables: { page } }),
    signal,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  const json: CharactersResponse = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);

  return {
    characters: json.data?.characters.results ?? [],
    nextPage: json.data?.characters.info.next ?? null,
  };
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong';
}

// One status instead of separate loading/error/data flags, so impossible
// combinations (like "loading AND error") can't happen.
export type CharactersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'success';
      characters: Character[];
      nextPage: number | null; // null = no more pages
      isLoadingMore: boolean;
      loadMoreError: string | null;
    };

export function useCharacters() {
  const [state, setState] = useState<CharactersState>({ status: 'loading' });
  // Bumping this number re-runs the effect, which is how "Retry" works.
  const [attempt, setAttempt] = useState(0);

  // First page.
  useEffect(() => {
    // Cancels the request if the component unmounts (or StrictMode re-runs the effect).
    const controller = new AbortController();

    fetchCharacterPage(1, controller.signal)
      .then(({ characters, nextPage }) =>
        setState({ status: 'success', characters, nextPage, isLoadingMore: false, loadMoreError: null }),
      )
      .catch((err) => {
        if (!controller.signal.aborted) setState({ status: 'error', message: errorMessage(err) });
      });

    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }

  // Next page, appended to what we already have. A failure here keeps the
  // characters we already loaded and only reports the error.
  async function loadMore() {
    if (state.status !== 'success' || state.nextPage === null || state.isLoadingMore) return;

    const page = state.nextPage;
    setState({ ...state, isLoadingMore: true, loadMoreError: null });
    try {
      const result = await fetchCharacterPage(page);
      setState((prev) =>
        prev.status === 'success'
          ? {
              status: 'success',
              characters: [...prev.characters, ...result.characters],
              nextPage: result.nextPage,
              isLoadingMore: false,
              loadMoreError: null,
            }
          : prev,
      );
    } catch (err) {
      setState((prev) =>
        prev.status === 'success'
          ? { ...prev, isLoadingMore: false, loadMoreError: errorMessage(err) }
          : prev,
      );
    }
  }

  return { state, retry, loadMore };
}
