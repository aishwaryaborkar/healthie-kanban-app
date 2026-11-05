import type { KanbanItem, Status } from '../types';

// The drag library speaks "column + slot" (e.g. Done, slot 1).
// We store ONE flat array, so this translates a column slot into an array position.
// Pure function: list in, new list out. Nothing is mutated.
export function moveItem(
  items: KanbanItem[],
  itemId: string,
  toStatus: Status,
  toIndex: number,
): KanbanItem[] {
  const moving = items.find((item) => item.id === itemId);
  if (!moving) return items;

  // 1. Unpin it.
  const rest = items.filter((item) => item.id !== itemId);
  // 2. Relabel it.
  const moved = { ...moving, status: toStatus };

  // 3. Find the neighbor: the item currently in the destination slot.
  const column = rest.filter((item) => item.status === toStatus);
  const neighbor = column[toIndex];

  // 4. Pin it back: right before the neighbor, or after the column's last item.
  let insertAt: number;
  if (neighbor) {
    insertAt = rest.indexOf(neighbor);
  } else if (column.length > 0) {
    insertAt = rest.indexOf(column[column.length - 1]) + 1;
  } else {
    insertAt = rest.length;
  }

  return [...rest.slice(0, insertAt), moved, ...rest.slice(insertAt)];
}
