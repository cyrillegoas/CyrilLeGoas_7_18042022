import { recipes } from './recipes';

function buildTableSet(array, key) {
  const table = new Map();
  const set = new Set();

  array.forEach((item) => {
    table.set(item[key], item);
    set.add(item[key]);
  });
  console.log('test');
  return { table, set };
}

const allRecipes = buildTableSet(recipes, 'id');

export { allRecipes };
