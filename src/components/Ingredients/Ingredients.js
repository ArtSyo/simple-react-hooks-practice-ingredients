import React, { useReducer, useCallback, useMemo, useEffect } from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredient, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredient, action.ingredients];
    case 'DELETE':
      return currentIngredient.filter((item) => item.id !== action.id);
    default:
      throw new Error('Should not get here!');
  }
};

function Ingredients() {
  const [ingredient, dispatch] = useReducer(ingredientReducer, []);
  const {
    isLoading,
    data,
    error,
    sendRequest,
    reqExtra,
    reqIdentifier,
    clear,
  } = useHttp();

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'REMOVE_INGREDIENT') {
      dispatch({ type: 'DELETE', id: reqExtra });
    } else if (!isLoading && !error && reqIdentifier === 'ADD_INGREDIENT') {
      dispatch({
        type: 'ADD',
        ingredients: {
          id: data.name,
          ...reqExtra,
        },
      });
    }
  }, [data, reqExtra, reqIdentifier, isLoading, error]);

  const filterIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(
    (newIngredient) => {
      sendRequest(
        'https://learn-hooks-ingredients.firebaseio.com/ingredients.json',
        'POST',
        JSON.stringify(newIngredient),
        newIngredient,
        'ADD_INGREDIENT'
      );
    },
    [sendRequest]
  );

  const removeIngredientHandler = useCallback(
    (id) => {
      sendRequest(
        `https://learn-hooks-ingredients.firebaseio.com/ingredients/${id}.json`,
        'DELETE',
        null,
        id,
        'REMOVE_INGREDIENT'
      );
    },
    [sendRequest]
  );

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={ingredient}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [ingredient, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}

      <IngredientForm
        addIngredientHandler={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadedIngredients={filterIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
