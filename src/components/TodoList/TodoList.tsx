/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect } from 'react';
import { Todo } from '../../types/Todo';
import classNames from 'classnames';
import { TodoComponent } from '../TodoComponent/TodoComponent';

type Props = {
  todos: Todo[];
  onDeleteTodo: (todoId: number | null) => void;
  onCompletedTodo: (todo: Todo) => void;
  onDoubleClickTodo: (todo: Todo) => void;
  onSubmitEdit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  tempTodo: Todo | null;
  idDeletedTodo: number | null;
  todoChangedTitle: Todo | null;
  isLoading: boolean;
  activeTodos: Todo[];
  titleEdit: string;
  onTitleEdit: (newValue: string) => void;
  inputEditRef: React.RefObject<HTMLInputElement> | null;
  onCancelEdit: () => void;
  handleBlurEdit: () => void;
};

export const TodoList: React.FC<Props> = (props: Props) => {
  const {
    todos,
    onDeleteTodo,
    onCompletedTodo,
    onDoubleClickTodo,
    onSubmitEdit,
    tempTodo,
    idDeletedTodo,
    todoChangedTitle,
    isLoading,
    activeTodos,
    titleEdit,
    onTitleEdit,
    inputEditRef,
    onCancelEdit,
    handleBlurEdit,
  } = props;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancelEdit();
    }
  };

  useEffect(() => {
    if (inputEditRef?.current) {
      inputEditRef.current.focus();
      inputEditRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (inputEditRef?.current) {
        inputEditRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [todoChangedTitle, inputEditRef]);

  return (
    <section className={classNames('todoapp__main')} data-cy="TodoList">
      {todos.map(todo => {
        return (
          <TodoComponent
            key={todo.id}
            onDoubleClickTodo={onDoubleClickTodo}
            todo={todo}
            onTitleEdit={onTitleEdit}
            onCompletedTodo={onCompletedTodo}
            todoChangedTitle={todoChangedTitle}
            onSubmitEdit={onSubmitEdit}
            inputEditRef={inputEditRef}
            titleEdit={titleEdit}
            handleBlurEdit={handleBlurEdit}
            onDeleteTodo={onDeleteTodo}
            idDeletedTodo={idDeletedTodo}
            activeTodos={activeTodos}
            isLoading={isLoading}
          />
        );
      })}

      {tempTodo && (
        <TodoComponent
          onDoubleClickTodo={onDoubleClickTodo}
          todo={tempTodo}
          onTitleEdit={onTitleEdit}
          onCompletedTodo={onCompletedTodo}
          todoChangedTitle={todoChangedTitle}
          onSubmitEdit={onSubmitEdit}
          inputEditRef={inputEditRef}
          titleEdit={titleEdit}
          handleBlurEdit={handleBlurEdit}
          onDeleteTodo={onDeleteTodo}
          idDeletedTodo={idDeletedTodo}
          activeTodos={activeTodos}
          isLoading={isLoading}
        />
      )}
    </section>
  );
};
