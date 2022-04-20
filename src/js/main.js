import { allRecipes } from './dataBuilder';
import { recipesCards } from './cards';
import { ingredientFilter } from './filters';

recipesCards.addCards(allRecipes.set);
