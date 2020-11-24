import React, { useReducer, useCallback } from 'react';

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

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...currentHttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorData };
    case 'CLEAR':
      return { ...currentHttpState, error: null };
    default:
      throw new Error('should not be reached!');
  }
};

function Ingredients() {
  const [ingredient, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: false,
  });

  // const [ingredient, setIngredient] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  const filterIngredientsHandler = useCallback((filteredIngredients) => {
    // setIngredient(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = (newIngredient) => {
    // setIsLoading(true);
    dispatchHttp({ type: 'SEND' });
    fetch('https://learn-hooks-ingredients.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(newIngredient),
      headers: { 'Content-Type': 'application.json' },
    })
      .then((response) => {
        // setIsLoading(false);
        dispatchHttp({ type: 'RESPONSE' });
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
    // setIsLoading(true);
    dispatchHttp({ type: 'SEND' });
    fetch(
      `https://learn-hooks-ingredients.firebaseio.com/ingredients/${id}.json`,
      {
        method: 'DELETE',
      }
    )
      .then((response) => {
        dispatchHttp({ type: 'RESPONSE' });

        // setIsLoading(false);

        // setIngredient((prevIngredients) =>
        //   prevIngredients.filter((ingEl) => ingEl.id !== id)
        // );
        dispatch({ type: 'DELETE', id: id });
      })
      .catch((error) => {
        dispatchHttp({
          type: 'ERROR',
          errorData: 'Something went wrong: ' + error.message,
        });
        // setError('Something went wrong: ' + error.message);
        // setIsLoading(false);
      });
  };

  const clearError = () => {
    // setError(null);
    dispatchHttp({ type: 'CLEAR' });
  };

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}

      <IngredientForm
        addIngredientHandler={addIngredientHandler}
        loading={httpState.loading}
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
