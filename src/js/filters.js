import { allRecipes, tries } from './dataBuilder';
import { recipesCards } from './cards';

export const selectedFilters = {
  ingredients: new Set(),
  appliances: new Set(),
  ustensils: new Set(),
};

/**
 * Returns the intersection between lists of ids coresponding to each filter keyword.
 * @param {set} selectedFilters - set of selected filter keyword
 * @param {object} filterTable - object containing paires of keyword / recipes ids
 * @returns {array} array of ids shared between filters
 */
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

// todo: need to be generic and move to utils
function intersectionFilters() {
  const array = [
    filterByIngredients(),
    filterByAppliances(),
    filterByUstensils(),
  ];

  let sharedIds = array[0];
  for (let i = 1; i < array.length; i++) {
    sharedIds = sharedIds.filter(Set.prototype.has, new Set(array[i]));
  }
  return sharedIds;
}

/**
 * Collection of methods returning the remaining ingredients/appliances/ustensils.
 * @param {array} filteredRecipes - array of recipe ids
 * @returns {array} remaining ingredients/appliances/ustensils
 */
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

/**
 * Return list items html from an array of ingredients/appliances/ustensils.
 * @param {array} dropdownOptions - array of ingredients/appliances/ustensils
 * @returns {string} html li elements
 */
function optionsHtml(dropdownOptions) {
  const options = !dropdownOptions.length ? ['no match'] : [...dropdownOptions];
  return options.reduce((optionList, option) => {
    optionList += `<li class="filter__option" role="option">${option}</li>`;
    return optionList;
  }, '');
}

/**
 * Add a tag to the tag list.
 * @param {string} name - name of the tag
 * @param {string} type - type of tag, can be either ingredients, appliances or ustensils
 */
function addTag(name, type) {
  const tagsContainer = document.querySelector('.tags-container');
  const html = `<li class="tag tag--${type}" data-name="${name}" data-type="${type}">
                  <span class="tag__name">${name}</span>
                  <img
                    class="tag__remove-icon"
                    src="./public/icons/close.svg"
                    alt="remove tag"
                  />
                </li>`;

  tagsContainer.insertAdjacentHTML('beforeend', html);
}

/**
 * Remove tag from the tag list and filter/update recipes accordingly.
 * @param {object} event - click event on tags
 */
function handleTagClick(event) {
  const clickedElement = event.target;
  if (clickedElement.classList.contains('tag')) {
    const filterType = clickedElement.dataset.type;
    const filterName = clickedElement.dataset.name;
    selectedFilters[filterType].delete(filterName);
    clickedElement.remove();
    const filteredRecipes = intersectionFilters();
    recipesCards.addCards(filteredRecipes);
  }
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

  /**
   * Build dropdown html and add it to DOM.
   * @param {array} options - array of ingredients/appliances/ustensils
   */
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

  /**
   * Update list of options within a dropdown.
   * @param {*} dropdownOptions  - array of ingredients/appliances/ustensils
   */
  _updateOptions(dropdownOptions) {
    const options = !dropdownOptions.length
      ? ['no match']
      : [...dropdownOptions];
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.innerHTML = optionsHtml(options);
    this._resizeOptionsList(options);
    this._setfilterWidth();
  }

  /**
   * Update the number of row in the dropdown grid.
   * @param {*} options - array of ingredients/appliances/ustensils
   */
  _resizeOptionsList(options) {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.style.gridTemplateRows = `repeat(${
      options.length >= 10 ? '10' : `${!options.length ? '1' : options.length}`
    },1fr)`;
  }

  /**
   * Update the filter width to match the dropdown.
   */
  _setfilterWidth() {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    const dropdownWidth = dropdown.clientWidth;
    this.filter.style.width = `${dropdownWidth}px`;
  }

  /**
   * Reset the filter width to its original size.
   */
  _resetFilterWidth() {
    this.filter.style.width = ``;
  }

  /**
   * Toggle the filter-open class (used for arrow animation).
   */
  _toogleFilterOpenClass() {
    this.filter.classList.toggle('filter--open');
  }

  /**
   * Reset the input value.
   */
  _clearInputValue() {
    this.textInput.value = '';
  }

  /**
   * Check if the dropdown is open or not.
   * @returns {boolean}
   */
  isFilterOpen() {
    return !!this.filter.classList.contains('filter--open');
  }

  /**
   * ADD filter dropdown to the DOM.
   * @param {*} options - array of ingredients/appliances/ustensils
   */
  addOptions(options) {
    this._buildDropdownHtml(options);
    this._resizeOptionsList(options);
    this._setfilterWidth();
    this._toogleFilterOpenClass();
  }

  /**
   * Remove filter dropdown from the DOM.
   */
  clearOptions() {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.remove();
    this._clearInputValue();
    this._resetFilterWidth();
    this._toogleFilterOpenClass();
  }

  /**
   * Handle click event on the filter button.
   * Will open/close the dropdown depending of its current state.
   */
  _handleBtnEvent() {
    const filteredRecipes = intersectionFilters();
    const options = get[this.filterType](filteredRecipes);
    this.isFilterOpen() ? this.clearOptions() : this.addOptions(options);
  }

  /**
   * Handle click event on the filter input
   * Will open the dropdown if closed.
   */
  _handleInputEvent() {
    const filteredRecipes = intersectionFilters();
    const options = get[this.filterType](filteredRecipes);
    if (!this.isFilterOpen()) this.addOptions(options);
  }

  /**
   * Handle keyup event.
   * Will try to auto-complete the user input and update options list accordingly.
   */
  _handleKeyupEvent() {
    const inputValue = this.textInput.value;
    const filteredRecipes = intersectionFilters(); // todo: move to if statement below
    let options = [];
    if (!inputValue.length) options = get[this.filterType](filteredRecipes);
    else
      options = tries[this.filterType].getPossibilities(
        inputValue.toLowerCase()
      );
    this._updateOptions(options);
  }

  /**
   * Handle click event on an option form the dropdown.
   * Filter recipe and update option list with new filter option.
   * @param {object} event - click event on an option
   */
  _handleOptionSelection(event) {
    const { target } = event;
    if (
      target.classList.contains('filter__option') &&
      target.textContent !== 'no match' &&
      !selectedFilters[this.filterType].has(target.textContent)
    ) {
      selectedFilters[this.filterType].add(target.textContent);
      const filteredRecipes = intersectionFilters();
      const options = get[this.filterType](filteredRecipes);
      this._updateOptions(options);
      recipesCards.addCards(filteredRecipes);
      addTag(target.textContent, this.filterType);
    }
  }
}

/**
 * Filter initialization.
 */
export function filterInit() {
  const ingredientFilter = new Filter(
    document.querySelector('.filter--ingredients'),
    filterByIngredients
  );
  const applianceFilter = new Filter(
    document.querySelector('.filter--appliance'),
    filterByAppliances
  );
  const ustensilsFilter = new Filter(
    document.querySelector('.filter--ustensils'),
    filterByUstensils
  );
  const tagsContainer = document.querySelector('.tags-container');

  // CLOSE FILTERS IF CLICKED OUTSIDE OR ON OTHER FILTER
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

  // REMOVE TAG IF CLICKED
  tagsContainer.addEventListener('click', (event) => handleTagClick(event));
}
