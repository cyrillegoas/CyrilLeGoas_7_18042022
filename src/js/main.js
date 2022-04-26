import { allRecipes } from './dataBuilder';
import { recipesCards } from './cards';
import { filterInit } from './filters';

recipesCards.addCards(allRecipes.ids);
filterInit();

console.log(allRecipes);
