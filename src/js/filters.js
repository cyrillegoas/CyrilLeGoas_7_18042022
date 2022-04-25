import { allRecipes, tries } from './dataBuilder';
import { recipesCards } from './cards';

const selectedFilters = {
  ingredients: new Set(),
  appliances: new Set(),
  ustensils: new Set(),
};

function intersection(selectedFilters, filterTable) {
  return () => {
    if (!selectedFilters.size) return allRecipes.ids;
    const filterKeywords = selectedFilters.values();
    let keyword = filterKeywords.next();
    let sharedIds = filterTable[keyword.value];

    for (; !keyword.done; keyword = filterKeywords.next()) {
      sharedIds = sharedIds.filter(
        Set.prototype.has,
        new Set(filterTable[keyword.value])
      );
    }
    return sharedIds;
  };
}

const filterByIngredients = intersection(
  selectedFilters.ingredients,
  allRecipes.ingredients
);
const filterByAppliances = intersection(
  selectedFilters.appliances,
  allRecipes.appliances
);
const filterByUstensils = intersection(
  selectedFilters.ustensils,
  allRecipes.ustensils
);

const get = {
  ingredients(filteredRecipes) {
    if (filteredRecipes === allRecipes.ids)
      return Object.keys(allRecipes.ingredients).slice(0, 30);

    return Array.from(
      filteredRecipes.reduce((ingredients, id) => {
        const recipeIngredients = allRecipes.table.get(id).ingredients;
        recipeIngredients.forEach((item) => {
          const ingredient = item.ingredient.toLowerCase();
          if (!selectedFilters.ingredients.has(ingredient))
            ingredients.add(item.ingredient.toLowerCase(ingredient));
        });
        return ingredients;
      }, new Set())
    ).slice(0, 30);
  },
  appliances() {},
  ustensils() {},
};

function optionsHtml(options) {
  return options.reduce((optionList, option) => {
    optionList += `<li class="filter__option" role="option">${option}</li>`;
    return optionList;
  }, '');
}

class Filter {
  constructor(element, filterFunction) {
    this.filter = element;
    this.filterFunction = filterFunction;
    this.filterType = this.filter.dataset.type;
    const openOptionBtn = this.filter.querySelector('.filter__expand');
    this.textInput = this.filter.querySelector('.filter__text-input');

    // EVENT LISTENERS
    openOptionBtn.addEventListener('click', () => this._handleBtnEvent());
    this.textInput.addEventListener('click', () => this._handleInputEvent());
    this.textInput.addEventListener('keyup', () => this._handleKeyupEvent());
  }

  _buildDropdownHtml(options) {
    const html = `
      <ul
        class="filter__dropdown"
        role="listbox"
        aria-label="filter options"
        tabindex="0"
      >
        ${optionsHtml(options)}
      </ul>
    `;
    this.filter.insertAdjacentHTML('beforeend', html);
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.addEventListener('click', (event) =>
      this._handleOptionSelection(event)
    );
  }

  _updateOptions(options) {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.innerHTML = optionsHtml(options);
    this._resizeOptionsList(options);
    this._setfilterWidth();
  }

  _resizeOptionsList(options) {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.style.gridTemplateRows = `repeat(${
      options.length >= 10 ? '10' : `${options.length}`
    },1fr)`;
  }

  _setfilterWidth() {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    const dropdownWidth = dropdown.clientWidth;
    this.filter.style.width = `${dropdownWidth}px`;
    this._toogleFilterOpenClass();
  }

  _resetFilterWidth() {
    this.filter.style.width = ``;
  }

  _toogleFilterOpenClass() {
    this.filter.classList.toggle('filter--open');
  }

  _clearInputValue() {
    this.textInput.value = '';
  }

  isFilterOpen() {
    return !!this.filter.classList.contains('filter--open');
  }

  addOptions(options) {
    this._buildDropdownHtml(options);
    this._resizeOptionsList(options);
    this._setfilterWidth();
  }

  clearOptions() {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.remove();
    this._clearInputValue();
    this._resetFilterWidth();
    this._toogleFilterOpenClass();
  }

  _handleBtnEvent() {
    const filteredRecipes = this.filterFunction();
    const options = get[this.filterType](filteredRecipes);
    this.isFilterOpen() ? this.clearOptions() : this.addOptions(options);
  }

  _handleInputEvent() {
    const filteredRecipes = this.filterFunction();
    const options = get[this.filterType](filteredRecipes);
    if (!this.isFilterOpen()) this.addOptions(options);
  }

  _handleKeyupEvent() {
    const inputValue = this.textInput.value;
    const filteredRecipes = this.filterFunction();
    let options = [];
    if (inputValue.length < 3) options = get[this.filterType](filteredRecipes);
    else
      options = tries[this.filterType].getPossibilities(
        inputValue.toLowerCase()
      );
    this._updateOptions(options);
  }

  _handleOptionSelection(event) {
    const { target } = event;
    if (target.classList.contains('filter__option')) {
      selectedFilters[this.filterType].add(target.textContent);
      const filteredRecipes = this.filterFunction();
      const options = get[this.filterType](filteredRecipes);
      this._updateOptions(options);
      recipesCards.addCards(filteredRecipes);
    }
  }
}

export const ingredientFilter = new Filter(
  document.querySelector('.filter--ingredients'),
  filterByIngredients
);
export const applianceFilter = new Filter(
  document.querySelector('.filter--appliance'),
  filterByAppliances
);
export const ustensilsFilter = new Filter(
  document.querySelector('.filter--ustensils'),
  filterByUstensils
);

ingredientFilter.filter.addEventListener('click', (event) => {
  event.stopPropagation();
  if (applianceFilter.isFilterOpen()) applianceFilter.clearOptions();
  if (ustensilsFilter.isFilterOpen()) ustensilsFilter.clearOptions();
});
applianceFilter.filter.addEventListener('click', (event) => {
  event.stopPropagation();
  if (ingredientFilter.isFilterOpen()) ingredientFilter.clearOptions();
  if (ustensilsFilter.isFilterOpen()) ustensilsFilter.clearOptions();
});
ustensilsFilter.filter.addEventListener('click', (event) => {
  event.stopPropagation();
  if (applianceFilter.isFilterOpen()) applianceFilter.clearOptions();
  if (ingredientFilter.isFilterOpen()) ingredientFilter.clearOptions();
});
document.addEventListener('click', () => {
  if (ingredientFilter.isFilterOpen()) ingredientFilter.clearOptions();
  if (applianceFilter.isFilterOpen()) applianceFilter.clearOptions();
  if (ustensilsFilter.isFilterOpen()) ustensilsFilter.clearOptions();
});
