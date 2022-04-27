import { recipes } from './recipes';
import { Trie } from './trie';

function buildData(recipes) {
  const table = new Map();
  const ids = [];
  const ingredients = {};
  const appliances = {};
  const ustensils = {};
  const titles = {};
  const descriptions = {};

  recipes.forEach((recipe) => {
    const appliance = recipe.appliance.toLowerCase();
    const ustensilList = recipe.ustensils.map((ustensil) =>
      ustensil.toLowerCase()
    );
    let title = recipe.name;
    let { description } = recipe;
    table.set(recipe.id, recipe);
    ids.push(recipe.id);

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

    title = title.replace(/[.,;:()']/g, ' ').replace(/\s+/g, ' ');
    title = title.split(' ');
    title.forEach((word) => {
      const wordLower = word.toLowerCase();
      if (wordLower.length > 2) {
        if (!titles[wordLower]) titles[wordLower] = [recipe.id];
        else titles[wordLower].push(recipe.id);
      }
    });

    description = description.replace(/[.,;:()']/g, ' ').replace(/\s+/g, ' ');
    description = description.split(' ');
    description.forEach((word) => {
      const wordLower = word.toLowerCase();
      if (wordLower.length > 2) {
        if (!descriptions[wordLower]) descriptions[wordLower] = [recipe.id];
        else descriptions[wordLower].push(recipe.id);
      }
    });
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
