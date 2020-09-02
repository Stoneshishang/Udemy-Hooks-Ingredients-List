import React, { useReducer, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModel from "../UI/ErrorModal";
import Search from "./Search";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error("Should not get here!");
  }
};

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...curHttpState, loading: false };
    case "ERROR":
      return { loading: false, error: action.errorMessage };
    case "CLEAR":
      return { ...curHttpState, error: null };
    default:
      throw new Error("Should not be reached!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHTTP] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });
  useEffect(() => {
    console.log("RENDERING INGREDIENTS", userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  // https://console.firebase.google.com/u/0/project/react-hooks-update-faf1a/database/react-hooks-update-faf1a/data
  // try ' git config --global core.safecrlf false ' to get ride of the warning when git add .
  const addIngredientHandler = (ingredient) => {
    dispatchHTTP({ type: "SEND" }); //this action doesn't need any old data to work. see above httpReducer return statement
    fetch("https://react-hooks-update-faf1a.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        dispatchHTTP({ type: "RESPONSE" });
        return response.json();
      })
      .then((responseData) => {
        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      });
  };

  const removeIngredientHandler = (ingredientId) => {
    dispatchHTTP({ type: "SEND" });
    fetch(
      `https://react-hooks-update-faf1a.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        dispatchHTTP({ type: "RESPONSE" });
        dispatch({ type: "DELETE", id: ingredientId });
      })
      .catch((error) => {
        dispatchHTTP({
          type: "ERROR",
          errorMessage: "Something went wrong, please contact developer!",
        });
      });
  };

  const clearError = () => {
    dispatchHTTP({ type: "CLEAR" });
  };

  return (
    <div className='App'>
      {httpState.error && (
        <ErrorModel onClose={clearError}>{httpState.error}</ErrorModel>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
