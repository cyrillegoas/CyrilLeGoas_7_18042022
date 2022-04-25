import { allRecipes } from './dataBuilder';

export const recipesCards = {
  cardsContainer: document.querySelector('.recipes'),
  addCards(ids) {
    let html = ``;
    ids.forEach((id) => {
      html += `
        <li class="recipe">
          <img class="recipe__img" src="https://picsum.photos/380/300" alt="" />
          <div class="recipe__desc">
            <div class="recipe__title-wrapper">
              <h2 class="recipe__title">${allRecipes.table.get(id).name}</h2>
              <div class="recipe__timer-wrapper">
                <img
                  class="recipe__timer-icon"
                  src="./public/icons/clock.svg"
                  alt="clock"
                />
                <span class="recipe__timer-min">${
                  allRecipes.table.get(id).time
                } min</span>
              </div>
            </div>
            <div class="recipe__instructions-wrapper">
              <ul class="recipe__ingredients">
                ${(() =>
                  allRecipes.table
                    .get(id)
                    .ingredients.reduce((itemList, item) => {
                      itemList += `<li class="recipe__ingredient"><span>${
                        item.ingredient
                      }:</span> ${item.quantity} ${
                        item.unit ? item.unit : ''
                      }</li>`;
                      return itemList;
                    }, ''))()}
              </ul>
              <p class="recipe__instructions">${
                allRecipes.table.get(id).description
              }</p>
            </div>
          </div>
        </li>`;
    });
    this.cardsContainer.innerHTML = html;
  },
  clearCards() {
    this.cardsContainer.innerHTML = '';
  },
};
