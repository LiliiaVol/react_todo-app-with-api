/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import classNames from 'classnames';
import { Todo } from '../../types/Todo';

type Props = {
  onDoubleClickTodo: (todo: Todo) => void;
  todo: Todo;
  onTitleEdit: (newValue: string) => void;
  onCompletedTodo: (todo: Todo) => void;
  todoChangedTitle: Todo | null;
  onSubmitEdit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  inputEditRef: React.RefObject<HTMLInputElement> | null;
  titleEdit: string;
  handleBlurEdit: () => void;
  onDeleteTodo: (todoId: number | null) => void;
  idDeletedTodo: number | null;
  activeTodos: Todo[];
  isLoading: boolean;
};

export const TodoComponent: React.FC<Props> = (props: Props) => {
  const {
    onDoubleClickTodo,
    todo,
    onTitleEdit,
    onCompletedTodo,
    todoChangedTitle,
    onSubmitEdit,
    inputEditRef,
    titleEdit,
    handleBlurEdit,
    onDeleteTodo,
    idDeletedTodo,
    activeTodos,
    isLoading,
  } = props;

  const { id, completed, title } = todo;

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: completed })}
      onDoubleClick={() => {
        onDoubleClickTodo(todo);
        onTitleEdit(title);
      }}
    >
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={completed}
          onClick={() => {
            onCompletedTodo(todo);
          }}
        />
      </label>

      {todoChangedTitle?.id === id ? (
        <form onSubmit={onSubmitEdit}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            ref={inputEditRef}
            value={titleEdit}
            onChange={event => onTitleEdit(event.target.value)}
            onBlur={handleBlurEdit}
          />
        </form>
      ) : (
        <>
          <span data-cy="TodoTitle" className="todo__title">
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => {
              onDeleteTodo(id);
            }}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active':
            idDeletedTodo === id ||
            (activeTodos.find(activeTodo => todo.id === activeTodo.id) &&
              isLoading) ||
            (isLoading && todoChangedTitle?.id === id) ||
            todo.id === 0,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
