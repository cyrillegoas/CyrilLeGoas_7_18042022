import { allRecipes, tries } from './dataBuilder';
import { recipesCards } from './cards';
import { intersection, union } from './utils';

const MQ_SMALL_SCREEN = 970;

const selectedFilters = {
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
function intersectionFilter(selectedFilters, filterTable) {
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

const filterByIngredients = intersectionFilter(
  selectedFilters.ingredients,
  allRecipes.ingredients
);
const filterByAppliances = intersectionFilter(
  selectedFilters.appliances,
  allRecipes.appliances
);
const filterByUstensils = intersectionFilter(
  selectedFilters.ustensils,
  allRecipes.ustensils
);

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
                    src="${import.meta.env.BASE_URL}icons/close.svg"
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
    const filteredRecipes = intersection([
      filterByIngredients(),
      filterByAppliances(),
      filterByUstensils(),
      searchBar.filteredIds,
    ]);
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
    this.textInput.addEventListener('focus', () => this._handleInputEvent());
    this.textInput.addEventListener('keyup', (event) =>
      this._handleKeyupEvent(event)
    );
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
    if (window.screen.width > MQ_SMALL_SCREEN) {
      const dropdown = this.filter.querySelector('.filter__dropdown');
      const dropdownWidth = dropdown.clientWidth;
      this.filter.style.width = `${dropdownWidth}px`;
    }
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
   */
  addOptions() {
    const filteredRecipes = intersection([
      filterByIngredients(),
      filterByAppliances(),
      filterByUstensils(),
      searchBar.filteredIds,
    ]);
    const options = get[this.filterType](filteredRecipes);
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
    if (this.isFilterOpen()) this.clearOptions();
    else this.addOptions();
  }

  /**
   * Handle click event on the filter input
   * Will open the dropdown if closed.
   */
  _handleInputEvent() {
    if (!this.isFilterOpen()) this.addOptions();
  }

  /**
   * Handle keyup event.
   * Will try to auto-complete the user input and update options list accordingly.
   */
  _handleKeyupEvent(event) {
    event.stopPropagation();
    const inputValue = this.textInput.value;
    let options = [];
    if (!inputValue.length) {
      const filteredRecipes = intersection([
        filterByIngredients(),
        filterByAppliances(),
        filterByUstensils(),
        searchBar.filteredIds,
      ]);
      options = get[this.filterType](filteredRecipes);
    } else
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
      const filteredRecipes = intersection([
        filterByIngredients(),
        filterByAppliances(),
        filterByUstensils(),
        searchBar.filteredIds,
      ]);
      const options = get[this.filterType](filteredRecipes);
      this._updateOptions(options);
      recipesCards.addCards(filteredRecipes);
      addTag(target.textContent, this.filterType);
    }
  }
}

/**
 * Search bar
 */
const searchBar = {
  filteredIds: allRecipes.ids,
  init() {
    this.input = document.querySelector('.search-primary__input');
    this.input.addEventListener('keyup', () => this.filter());
  },
  filter() {
    const inputValue = this.input.value.toLowerCase();
    if (inputValue.length < 3) {
      if (this.filteredIds === allRecipes.ids) return;
      this.filteredIds = allRecipes.ids;
    } else {
      this.filteredIds = union([
        this.searchByingredients(inputValue),
        this.searchBytitle(inputValue),
        this.searchBydescription(inputValue),
      ]);
    }
    const filteredRecipes = intersection([
      this.filteredIds,
      filterByIngredients(),
      filterByAppliances(),
      filterByUstensils(),
    ]);
    recipesCards.addCards(filteredRecipes);
  },
  searchByingredients(string) {
    const possibilities = tries.ingredients.getPossibilities(string);
    return possibilities.reduce((ids, ingredient) => {
      ids.push(...allRecipes.ingredients[ingredient]);
      return ids;
    }, []);
  },
  searchBytitle(string) {
    const possibilities = tries.titles.getPossibilities(string);
    return possibilities.reduce((ids, wordFromTitle) => {
      ids.push(...allRecipes.titles[wordFromTitle]);
      return ids;
    }, []);
  },
  searchBydescription(string) {
    const possibilities = tries.descriptions.getPossibilities(string);
    return possibilities.reduce((ids, wordFromDesc) => {
      ids.push(...allRecipes.descriptions[wordFromDesc]);
      return ids;
    }, []);
  },
};

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

  searchBar.init();

  // CLOSE FILTERS IF CLICKED OUTSIDE OR ON OTHER FILTER

  function closeDropdown(filterType) {
    if (filterType !== 'ingredients' && ingredientFilter.isFilterOpen())
      ingredientFilter.clearOptions();
    if (filterType !== 'appliances' && applianceFilter.isFilterOpen())
      applianceFilter.clearOptions();
    if (filterType !== 'ustensils' && ustensilsFilter.isFilterOpen())
      ustensilsFilter.clearOptions();
  }

  ingredientFilter.filter.addEventListener('click', (event) => {
    event.stopPropagation();
    closeDropdown(event.currentTarget.dataset.type);
  });
  applianceFilter.filter.addEventListener('click', (event) => {
    event.stopPropagation();
    closeDropdown(event.currentTarget.dataset.type);
  });
  ustensilsFilter.filter.addEventListener('click', (event) => {
    event.stopPropagation();
    closeDropdown(event.currentTarget.dataset.type);
  });
  document.addEventListener('click', () => {
    closeDropdown();
  });

  ingredientFilter.textInput.addEventListener('focus', (event) => {
    const { type } = event.currentTarget.closest('.filter').dataset;
    closeDropdown(type);
  });
  applianceFilter.textInput.addEventListener('focus', (event) => {
    const { type } = event.currentTarget.closest('.filter').dataset;
    closeDropdown(type);
  });
  ustensilsFilter.textInput.addEventListener('focus', (event) => {
    const { type } = event.currentTarget.closest('.filter').dataset;
    closeDropdown(type);
  });

  document.addEventListener('keyup', (event) => {
    if (
      event.key === 'Tab' &&
      document.activeElement !== ingredientFilter.textInput &&
      document.activeElement !== applianceFilter.textInput &&
      document.activeElement !== ustensilsFilter.textInput
    ) {
      closeDropdown();
    }
  });

  // REMOVE TAG IF CLICKED
  tagsContainer.addEventListener('click', (event) => handleTagClick(event));
}
