// Party popper from Microsoft Fluent Emoji (MIT). See README for credit.
// Purely visual: the screen-reader announcement lives in KanbanBoard.
export function Celebration() {
  return (
    <div className="celebration" aria-hidden="true">
      <img src="/party-popper.svg" alt="" />
      <p>Moved to Done</p>
    </div>
  );
}
