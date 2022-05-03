import { allRecipes } from './dataBuilder';

export const recipesCards = {
  cardsContainer: document.querySelector('.recipes'),

  /**
   *  Add recipe cards to DOM.
   * @param {array} ids - array of recipe ids
   */
  addCards(ids) {
    let html = ``;
    if (!ids.length)
      html = `<li class="no-recipes">Aucune recette ne correspond à votre critère, vous pouvez chercher « tarte aux pommes », « poisson », etc...</li>`;
    else {
      ids.forEach((id) => {
        html += `
          <li class="recipe" tabindex="0">
            <img class="recipe__img" src="https://picsum.photos/380/300" alt="" />
            <div class="recipe__desc">
              <div class="recipe__title-wrapper">
                <h2 class="recipe__title">${allRecipes.table.get(id).name}</h2>
                <div class="recipe__timer-wrapper">
                  <img
                    class="recipe__timer-icon"
                    src="${import.meta.env.BASE_URL}icons/clock.svg"
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
                        }${
                          item.quantity
                            ? `:</span> ${item.quantity} ${
                                item.unit ? item.unit : ''
                              }`
                            : '</span>'
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
    }
    this.cardsContainer.innerHTML = html;
  },

  /**
   * Remove cards from DOM.
   */
  clearCards() {
    this.cardsContainer.innerHTML = '';
  },
};
