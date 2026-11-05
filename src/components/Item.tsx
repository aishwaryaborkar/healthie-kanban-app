import { Draggable } from '@hello-pangea/dnd';
import type { KanbanItem } from '../types';

type Props = {
  item: KanbanItem;
  index: number; // position within its column, which the drag library needs
  isDone: boolean;
};

// The whole card is the drag handle. The library makes it focusable and adds
// keyboard dragging (space to lift, arrows to move, space to drop) plus
// screen-reader instructions and announcements.
export function Item({ item, index, isDone }: Props) {
  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`card${snapshot.isDragging ? ' is-dragging' : ''}`}
        >
          <h3 className={isDone ? 'card-title is-done' : 'card-title'}>{item.title}</h3>
          {item.description && <p className="card-description">{item.description}</p>}
          <div className="card-footer">
            <span className="card-assignee-name">{item.character.name}</span>
            {/* Decorative: the name is already shown as text right next to it. */}
            <img src={item.character.image} alt="" className="avatar avatar-small" />
          </div>
        </div>
      )}
    </Draggable>
  );
}
