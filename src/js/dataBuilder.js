import { recipes } from './recipes';
import { Trie } from './trie';

/**
 * Build data structure for fast lookup.
 * @param {object} recipes - collection of recipes
 * @returns {object} data
 */
function buildData(recipes) {
  const table = new Map();
  const ids = [];
  const ingredients = {};
  const appliances = {};
  const ustensils = {};
  const titles = {};
  const descriptions = {};

  /**
   * ADD item and recipe id to hash table.
   * @param {object} hashTable - hash table used for fast lookup {item:[ids]}
   * @param {string} item - name of the item
   * @param {number} recipeId - id of the recipe
   */
  function addToHashTable(hashTable, item, recipeId) {
    if (!hashTable[item]) hashTable[item] = [recipeId];
    else hashTable[item].push(recipeId);
  }

  /**
   * Get appliances used in the recipe.
   * @param {object} recipe
   */
  function getAppliances(recipe) {
    const appliance = recipe.appliance.toLowerCase();
    addToHashTable(appliances, appliance, recipe.id);
  }

  /**
   * Get ustensils used in the recipe.
   * @param {object} recipe
   */
  function getUstensils(recipe) {
    const ustensilList = recipe.ustensils.map((ustensil) =>
      ustensil.toLowerCase()
    );
    ustensilList.forEach((ustensil) => {
      addToHashTable(ustensils, ustensil, recipe.id);
    });
  }

  /**
   * Get ingredients used in the recipe.
   * @param {object} recipe
   */
  function getIngredients(recipe) {
    recipe.ingredients.forEach((item) => {
      const ingredient = item.ingredient.toLowerCase();
      addToHashTable(ingredients, ingredient, recipe.id);
    });
  }

  /**
   * Parse a string and add every word (with length > 2) to an hash table
   * @param {object} hashTable - hash table used for fast lookup {item:[ids]}
   * @param {string} string - string to parse
   * @param {number} recipeId - id of the recipe
   */
  function parseString(hashTable, string, recipeId) {
    const stringToParse = string;
    stringToParse
      .replace(/[.,;:()']/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.toLowerCase())
      .forEach((word) => {
        if (word.length > 2) {
          addToHashTable(hashTable, word, recipeId);
        }
      });
  }

  // LOOP THROUGH EACH RECIPES
  recipes.forEach((recipe) => {
    getAppliances(recipe);
    getUstensils(recipe);
    getIngredients(recipe);

    table.set(recipe.id, recipe);
    ids.push(recipe.id);

    parseString(titles, recipe.name, recipe.id);
    parseString(descriptions, recipe.description, recipe.id);
  });

  return {
    table,
    ids,
    ingredients,
    appliances,
    ustensils,
    titles,
    descriptions,
  };
}

const allRecipes = buildData(recipes);

const tries = {
  ingredients: new Trie(Object.keys(allRecipes.ingredients)),
  appliances: new Trie(Object.keys(allRecipes.appliances)),
  ustensils: new Trie(Object.keys(allRecipes.ustensils)),
  titles: new Trie(Object.keys(allRecipes.titles)),
  descriptions: new Trie(Object.keys(allRecipes.descriptions)),
};

export { allRecipes, tries };
