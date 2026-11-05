import { Droppable } from '@hello-pangea/dnd';
import type { KanbanItem, Status } from '../types';
import { Item } from './Item';

type Props = {
  status: Status;
  title: string;
  items: KanbanItem[]; // already filtered to this column by the board
  emptyMessage?: string;
};

// One column. The column's status is its droppable id, so the drop result
// tells the board which column an item landed in.
export function ItemList({ status, title, items, emptyMessage }: Props) {
  return (
    <section className="column" aria-labelledby={`column-${status}`}>
      <h2 id={`column-${status}`} className="column-title">
        {title}
        <span className="count">{items.length}</span>
      </h2>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`item-list${snapshot.isDraggingOver ? ' is-over' : ''}`}
          >
            {items.map((item, index) => (
              <Item key={item.id} item={item} index={index} isDone={status === 'done'} />
            ))}
            {provided.placeholder}
            {emptyMessage && <li className="empty">{emptyMessage}</li>}
          </ul>
        )}
      </Droppable>
    </section>
  );
}
