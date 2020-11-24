import React, { useState, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import Search from './Search';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';

function Ingredients() {
  const [ingredient, setIngredient] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const filterIngredientsHandler = useCallback((filteredIngredients) => {
    setIngredient(filteredIngredients);
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
        setIngredient((prevIngredients) => [
          ...prevIngredients,
          {
            id: responseData.name,
            ...newIngredient,
          },
        ]);
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
        setIngredient((prevIngredients) =>
          prevIngredients.filter((ingEl) => ingEl.id !== id)
        );
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
