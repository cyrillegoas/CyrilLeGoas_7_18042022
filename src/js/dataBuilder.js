import { recipes } from './recipes';
import { Trie } from './trie';

function buildData(recipes) {
  const table = new Map();
  const set = new Set();
  const ingredients = {};
  const appliances = {};
  const ustensils = {};

  recipes.forEach((recipe) => {
    const appliance = recipe.appliance.toLowerCase();
    const ustensilList = recipe.ustensils.map((ustensil) =>
      ustensil.toLowerCase()
    );
    table.set(recipe.id, recipe);
    set.add(recipe.id);

    recipe.ingredients.forEach((item) => {
      const ingredient = item.ingredient.toLowerCase();
      if (!ingredients[ingredient]) ingredients[ingredient] = [recipe.id];
      else ingredients[ingredient].push(recipe.id);
    });

    if (!appliances[appliance]) appliances[appliance] = [recipe.id];
    else appliances[appliance].push(recipe.id);

    ustensilList.forEach((ustensil) => {
      if (!ustensils[ustensil]) ustensils[ustensil] = [recipe.id];
      else ustensils[ustensil].push(recipe.id);
    });
  });
  return { table, set, ingredients, appliances, ustensils };
}

const allRecipes = buildData(recipes);
const ingredientsTrie = new Trie(Object.keys(allRecipes.ingredients));
const appliancesTrie = new Trie(Object.keys(allRecipes.appliances));
const ustensilsTrie = new Trie(Object.keys(allRecipes.ustensils));

export { allRecipes, ingredientsTrie, appliancesTrie, ustensilsTrie };
