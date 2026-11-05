import { Draggable } from '@hello-pangea/dnd';
import type { KanbanItem } from '../types';

type Props = {
  item: KanbanItem;
  index: number; // position within its column, which the drag library needs
  isDone: boolean;
};

export function Item({ item, index, isDone }: Props) {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card${snapshot.isDragging ? ' is-dragging' : ''}`}
        >
          <h3 className={isDone ? 'card-title is-done' : 'card-title'}>{item.title}</h3>
          {item.description && <p className="card-description">{item.description}</p>}
          <footer className="card-footer">
            <span className="card-assignee-name">{item.character.name}</span>
            <img
              src={item.character.image}
              alt={`Assigned to ${item.character.name}`}
              className="avatar avatar-small"
            />
          </footer>
        </li>
      )}
    </Draggable>
  );
}
