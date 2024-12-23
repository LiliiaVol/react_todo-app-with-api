import classNames from 'classnames';
import React from 'react';
import { ErrorType } from '../../types/ErrorType';
import { Todo } from '../../types/Todo';

type Props = {
  todos: Todo[];
  errorState: Record<ErrorType, boolean>;
};

export const ErrorNotification: React.FC<Props> = (props: Props) => {
  const { todos, errorState } = props;

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        {
          hidden: Object.values(errorState).every(value => !value),
        },
      )}
    >
      <button data-cy="HideErrorButton" type="button" className="delete" />
      {!todos.length && `Unable to load todos`}
      {errorState[ErrorType.Input] && `Title should not be empty`}
      {errorState[ErrorType.Add] && `Unable to add a todo`}
      {(errorState[ErrorType.Delete] ||
        errorState[ErrorType.CompletedDelete]) &&
        `Unable to delete a todo`}
      {errorState[ErrorType.Update] && `Unable to update a todo`}
    </div>
  );
};
