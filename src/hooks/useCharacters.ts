import { useEffect, useState } from 'react';
import type { Character } from '../types';

const API_URL = 'https://rickandmortyapi.com/graphql';

// First page of characters (20). Enough to pick from for this board.
const CHARACTERS_QUERY = `
  query {
    characters(page: 1) {
      results { id name image }
    }
  }
`;

type CharactersResponse = {
  data?: { characters: { results: Character[] } };
  errors?: { message: string }[];
};

// One status instead of separate loading/error/data flags, so impossible
// combinations (like "loading AND error") can't happen.
export type CharactersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; characters: Character[] };

export function useCharacters() {
  const [state, setState] = useState<CharactersState>({ status: 'loading' });
  // Bumping this number re-runs the effect, which is how "Retry" works.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Cancels the request if the component unmounts (or StrictMode re-runs the effect).
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: CHARACTERS_QUERY }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const json: CharactersResponse = await res.json();
        if (json.errors?.length) throw new Error(json.errors[0].message);

        setState({ status: 'success', characters: json.data?.characters.results ?? [] });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Something went wrong',
        });
      }
    }

    load();
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }

  return { state, retry };
}
