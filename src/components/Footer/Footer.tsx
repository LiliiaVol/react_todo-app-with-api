import classNames from 'classnames';
import React from 'react';
import { Todo } from '../../types/Todo';
import { FilterType } from '../../types/FilterType';

type Props = {
  todosLeft: Todo[];
  filterType: FilterType;
  setFilterType: React.Dispatch<React.SetStateAction<FilterType>>;
  todosCompleted: Todo[];
  onDeleteCompletedTodos: () => void;
};

export const Footer: React.FC<Props> = (props: Props) => {
  const {
    todosLeft,
    filterType,
    setFilterType,
    todosCompleted,
    onDeleteCompletedTodos,
  } = props;

  return (
    <footer className={classNames('todoapp__footer')} data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {todosLeft.length} items left
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: filterType === FilterType.All,
          })}
          data-cy="FilterLinkAll"
          onClick={() => {
            setFilterType(FilterType.All);
          }}
        >
          All
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: filterType === FilterType.Active,
          })}
          data-cy="FilterLinkActive"
          onClick={() => {
            setFilterType(FilterType.Active);
          }}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: filterType === FilterType.Completed,
          })}
          data-cy="FilterLinkCompleted"
          onClick={() => {
            setFilterType(FilterType.Completed);
          }}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!todosCompleted.length}
        onClick={onDeleteCompletedTodos}
      >
        Clear completed
      </button>
    </footer>
  );
};
