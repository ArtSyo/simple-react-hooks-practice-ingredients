import React, { useState, useReducer, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';

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
  // const [ingredient, setIngredient] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const filterIngredientsHandler = useCallback((filteredIngredients) => {
    // setIngredient(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = (newIngredient) => {
    setIsLoading(true);
    fetch('https://learn-hooks-ingredients.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(newIngredient),
      headers: { 'Content-Type': 'application.json' },
    })
      .then((response) => {
        setIsLoading(false);
        return response.json();
      })
      .then((responseData) => {
        // setIngredient((prevIngredients) => [
        //   ...prevIngredients,
        //   {
        //     id: responseData.name,
        //     ...newIngredient,
        //   },
        // ]);
        dispatch({
          type: 'ADD',
          ingredients: {
            id: responseData.name,
            ...newIngredient,
          },
        });
      });

    console.log(ingredient);
  };

  const removeIngredientHandler = (id) => {
    setIsLoading(true);
    fetch(
      `https://learn-hooks-ingredients.firebaseio.com/ingredients/${id}.json`,
      {
        method: 'DELETE',
      }
    )
      .then((response) => {
        setIsLoading(false);
        // setIngredient((prevIngredients) =>
        //   prevIngredients.filter((ingEl) => ingEl.id !== id)
        // );
        dispatch({type: 'DELETE', id: id})
      })
      .catch((error) => {
        setError('Something went wrong: ' + error.message);
        setIsLoading(false);
      });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm
        addIngredientHandler={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadedIngredients={filterIngredientsHandler} />
        <IngredientList
          ingredients={ingredient}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
}

export default Ingredients;
