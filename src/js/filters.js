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

function intersectionFilters() {
  const array = [
    filterByIngredients(),
    filterByAppliances(),
    filterByUstensils(),
  ];
  const arrayWithoutEmptyItem = array.reduce((acc, item) => {
    if (item.length) acc.push(item);
    return acc;
  }, []);
  if (!arrayWithoutEmptyItem.length) return allRecipes.ids;

  let sharedIds = arrayWithoutEmptyItem[0];
  for (let i = 1; i < arrayWithoutEmptyItem.length; i++) {
    sharedIds = sharedIds.filter(
      Set.prototype.has,
      new Set(arrayWithoutEmptyItem[i])
    );
  }
  return sharedIds;
}

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
  appliances(filteredRecipes) {
    if (filteredRecipes === allRecipes.ids)
      return Object.keys(allRecipes.appliances).slice(0, 30);

    return Array.from(
      filteredRecipes.reduce((appliances, id) => {
        const appliance = allRecipes.table.get(id).appliance.toLowerCase();
        if (!selectedFilters.appliances.has(appliance))
          appliances.add(appliance);
        return appliances;
      }, new Set())
    ).slice(0, 30);
  },
  ustensils(filteredRecipes) {
    if (filteredRecipes === allRecipes.ids)
      return Object.keys(allRecipes.ustensils).slice(0, 30);

    return Array.from(
      filteredRecipes.reduce((ustensils, id) => {
        const recipeUstensils = allRecipes.table.get(id).ustensils;
        recipeUstensils.forEach((ustensil) => {
          if (!selectedFilters.ustensils.has(ustensil.toLowerCase()))
            ustensils.add(ustensil.toLowerCase());
        });
        return ustensils;
      }, new Set())
    ).slice(0, 30);
  },
};

function optionsHtml(options) {
  return options.reduce((optionList, option) => {
    optionList += `<li class="filter__option" role="option">${option}</li>`;
    return optionList;
  }, '');
}

class Filter {
  constructor(element) {
    this.filter = element;
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
    this._toogleFilterOpenClass();
  }

  clearOptions() {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.remove();
    this._clearInputValue();
    this._resetFilterWidth();
    this._toogleFilterOpenClass();
  }

  _handleBtnEvent() {
    const filteredRecipes = intersectionFilters();
    const options = get[this.filterType](filteredRecipes);
    this.isFilterOpen() ? this.clearOptions() : this.addOptions(options);
  }

  _handleInputEvent() {
    const filteredRecipes = intersectionFilters();
    const options = get[this.filterType](filteredRecipes);
    if (!this.isFilterOpen()) this.addOptions(options);
  }

  _handleKeyupEvent() {
    const inputValue = this.textInput.value;
    const filteredRecipes = intersectionFilters();
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
      const filteredRecipes = intersectionFilters();
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
