import React, { useState, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

const Ingredients = () => {
  const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    console.log("RENDERING INGREDIENTS", userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    setUserIngredients(filteredIngredients);
  }, []);

  // https://console.firebase.google.com/u/0/project/react-hooks-update-faf1a/database/react-hooks-update-faf1a/data
  // try ' git config --global core.safecrlf false ' to get ride of the warning when git add .
  const addIngredientHandler = (ingredient) => {
    setIsLoading(true);
    fetch("https://react-hooks-update-faf1a.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        setIsLoading(false);
        return response.json();
      })
      .then((responseData) => {
        setUserIngredients((prevIngredients) => [
          ...prevIngredients,
          { id: responseData.name, ...ingredient },
        ]);
      });
  };

  const removeIngredientHandler = (ingredientId) => {
    setIsLoading(true);
    fetch(
      `https://react-hooks-update-faf1a.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        setIsLoading(false);
        setUserIngredients((prevIngredients) =>
          prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
        );
      })
      .catch((error) => {
        setError("Something went wrong!");
        setIsLoading(false);
      });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className='App'>
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
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
