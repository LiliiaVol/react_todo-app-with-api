/* eslint-disable max-len */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  deleteTodo,
  getTodos,
  patchTodo,
  postTodo,
  USER_ID,
} from './api/todos';
import { Todo, TodoResponse } from './types/Todo';
import { FilterType } from './types/FilterType';
import { TodoList } from './components/TodoList/TodoList';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { ErrorNotification } from './components/ErrorNotification/ErrorNotification';
import { ErrorType } from './types/ErrorType';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTodos, setActiveTodos] = useState<Todo[]>([]);

  const [titleEdit, setTitleEdit] = useState('');

  const [errorState, setErrorState] = useState<Record<ErrorType, boolean>>({
    [ErrorType.Load]: false,
    [ErrorType.Input]: false,
    [ErrorType.Add]: false,
    [ErrorType.Delete]: false,
    [ErrorType.CompletedDelete]: false,
    [ErrorType.Update]: false,
  });

  const setError = (errorType: ErrorType) => {
    setErrorState(prevState => ({
      ...prevState,
      [errorType]: true,
    }));

    setTimeout(() => {
      setErrorState(prevState => ({
        ...prevState,
        [errorType]: false,
      }));
    }, 3000);
  };

  const [isLoading, setIsLoading] = useState(false);

  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [title, setTitle] = useState('');
  const [filterType, setFilterType] = useState<FilterType>(FilterType.All);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputEditRef = useRef<HTMLInputElement>(null);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);

  const [idTodoChanged, setIdTodoChanged] = useState<number | null>(null);
  const [todoChangedTitle, setTodoChangedTitle] = useState<Todo | null>(null);

  const [isAllCompleted, setIsAllCompleted] = useState(false);

  useEffect(() => {
    getTodos()
      .then(responses => {
        setTodos(responses);

        setIsAllCompleted(responses.every(todo => todo.completed));
      })
      .catch(() => {
        setError(ErrorType.Load);
      });

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const filteredTodos = useMemo((): Todo[] => {
    switch (filterType) {
      case FilterType.All:
        return todos;
      case FilterType.Active:
        return todos.filter(todo => !todo.completed);
      case FilterType.Completed:
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [filterType, todos]);

  const todosLeft = useMemo((): Todo[] => {
    return todos.filter(todo => !todo.completed);
  }, [todos]);

  const todosCompleted = useMemo((): Todo[] => {
    return todos.filter(todo => todo.completed);
  }, [todos]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAllCompleted(false);

    if (title.trim() === '') {
      setError(ErrorType.Input);

      return;
    }

    const newTodo = {
      userId: USER_ID,
      title: title.trim(),
      completed: false,
    };

    setTempTodo({ ...newTodo, id: 0 });

    setIsInputDisabled(true);

    postTodo(newTodo)
      .then((response: TodoResponse) => {
        const { userId, id, title: titleTodo, completed } = response;

        setTodos(currentTodos => [
          ...currentTodos,
          { userId, id, title: titleTodo, completed },
        ]);
        setTempTodo(null);
        setTitle('');
      })
      .catch(() => {
        setError(ErrorType.Add);
        setTempTodo(null);
      })
      .finally(() => {
        setIsInputDisabled(false);
      });
  };

  const handleDeleteTodo = (todoID: number | null) => {
    setIdTodoChanged(todoID);
    setIsInputDisabled(true);

    deleteTodo(todoID)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoID),
        );
        setIsInputDisabled(false);
      })
      .catch(() => {
        setIsLoading(false);
        setError(ErrorType.Delete);
      })
      .finally(() => {
        setIdTodoChanged(null);
      });
  };

  const handleDeleteCompletedTodos = () => {
    setIsInputDisabled(true);

    todos.forEach(todo => {
      if (todo.completed) {
        deleteTodo(todo.id)
          .then(() => {
            setTodos(currentTodos =>
              currentTodos.filter(currentTodo => currentTodo.id !== todo.id),
            );
          })
          .catch(() => {
            setError(ErrorType.CompletedDelete);
          })
          .finally(() => {
            setIsInputDisabled(false);
          });
      }
    });
  };

  const handleToggleAll = async (state: boolean) => {
    const patchPromises: Promise<Todo>[] = [];

    for (const todo of todos) {
      if (!state && todo.completed) {
        continue;
      }

      const updatedTodo: Todo = {
        ...todo,
        completed: !state,
      };

      const patchPromise = patchTodo(todo.id, updatedTodo) as Promise<Todo>;

      patchPromises.push(patchPromise);
      setActiveTodos(currentTodos => [...currentTodos, updatedTodo]);
    }

    try {
      setIsLoading(true);
      const patchedTodos = await Promise.all(patchPromises);

      setTodos(currentTodos =>
        currentTodos.map(
          todo => patchedTodos.find(patched => patched.id === todo.id) || todo,
        ),
      );

      setIsAllCompleted(!isAllCompleted);
    } catch (error) {
      setError(ErrorType.Update);
    } finally {
      setIsLoading(false);
      setActiveTodos([]);
    }
  };

  const handleCompletedTodo = async (chosenTodo: Todo) => {
    setIdTodoChanged(chosenTodo.id);
    setIsLoading(true);

    const updatedTodo: Todo = {
      ...chosenTodo,
      completed: !chosenTodo.completed,
    };

    try {
      const patchedTodo = await patchTodo(chosenTodo.id, updatedTodo);

      setTodos(currentTodos => {
        const updatedTodos = currentTodos.map(todo =>
          todo.id === patchedTodo.id ? patchedTodo : todo,
        );

        setIsAllCompleted(updatedTodos.every(todo => todo.completed));

        return updatedTodos;
      });
    } catch (error) {
      setError(ErrorType.Update);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setActiveTodos([]);
      setIdTodoChanged(null);
    }
  };

  const handleDoubleClickTodo = (chosenTodo: Todo) => {
    setTodoChangedTitle(chosenTodo);
  };

  const handleSubmitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = titleEdit.trim();
    const prevTodo = todos.find(todo => todo.id === todoChangedTitle?.id);

    if (!trimmedTitle) {
      setIsLoading(false);
      handleDeleteTodo(todoChangedTitle?.id || null);

      return;
    }

    if (
      todoChangedTitle &&
      prevTodo &&
      trimmedTitle &&
      trimmedTitle !== prevTodo.title
    ) {
      setIsLoading(true);

      const updatedTodo: Todo = {
        ...todoChangedTitle,
        title: trimmedTitle,
      };

      try {
        const patchedTodo = await patchTodo(todoChangedTitle.id, updatedTodo);

        setTodos(currentTodos => {
          return currentTodos.map(todo =>
            todo.id === patchedTodo.id ? patchedTodo : todo,
          );
        });

        setTodoChangedTitle(null);
      } catch (error) {
        setError(ErrorType.Update);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTodoChangedTitle(null);
    }
  };

  const handleBlurEdit = async () => {
    const trimmedTitle = titleEdit.trim();
    const prevTodo = todos.find(todo => todo.id === todoChangedTitle?.id);

    if (
      todoChangedTitle &&
      prevTodo &&
      trimmedTitle &&
      trimmedTitle !== prevTodo.title
    ) {
      setIsLoading(true);

      const updatedTodo: Todo = {
        ...todoChangedTitle,
        title: trimmedTitle,
      };

      try {
        const patchedTodo = await patchTodo(todoChangedTitle.id, updatedTodo);

        setTodos(currentTodos => {
          return currentTodos.map(todo =>
            todo.id === patchedTodo.id ? patchedTodo : todo,
          );
        });

        setTodoChangedTitle(null);
      } catch (error) {
        setError(ErrorType.Update);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    } else if (!trimmedTitle) {
      handleDeleteTodo(todoChangedTitle?.id || null);
    } else {
      setTodoChangedTitle(null);
    }
  };

  const handleCancelEdit = () => {
    setTodoChangedTitle(null);
  };

  useEffect(() => {
    if (!isInputDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputDisabled]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          isAllCompleted={isAllCompleted}
          onToggleAll={handleToggleAll}
          onSubmit={handleSubmit}
          inputRef={inputRef}
          title={title}
          setTitle={setTitle}
          isInputDisabled={isInputDisabled}
        />
        <TodoList
          todos={filteredTodos}
          onDeleteTodo={handleDeleteTodo}
          onCompletedTodo={handleCompletedTodo}
          onDoubleClickTodo={handleDoubleClickTodo}
          onSubmitEdit={handleSubmitEdit}
          tempTodo={tempTodo}
          idDeletedTodo={idTodoChanged}
          todoChangedTitle={todoChangedTitle}
          isLoading={isLoading}
          activeTodos={activeTodos}
          titleEdit={titleEdit}
          onTitleEdit={setTitleEdit}
          inputEditRef={inputEditRef}
          onCancelEdit={handleCancelEdit}
          handleBlurEdit={handleBlurEdit}
        />

        {!todos.length || (
          <Footer
            todosLeft={todosLeft}
            filterType={filterType}
            setFilterType={setFilterType}
            todosCompleted={todosCompleted}
            onDeleteCompletedTodos={handleDeleteCompletedTodos}
          />
        )}
      </div>

      <ErrorNotification todos={todos} errorState={errorState} />
    </div>
  );
};
