import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

// Uses the native <dialog> element: showModal() gives us the backdrop,
// focus trapping, and Esc-to-close for free.
export function Modal({ title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose} // fires on Esc
      onClick={(e) => {
        // A click on the dialog element itself (not its content) is a backdrop click.
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="modal-body">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-button" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
