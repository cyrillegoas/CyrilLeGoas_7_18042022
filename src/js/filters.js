class Filter {
  constructor(element) {
    this.filter = element;
    this.filterType = this.filter.dataset.type;
    const openOptionBtn = this.filter.querySelector('.filter__expand');
    this.textInput = this.filter.querySelector('.filter__text-input');

    // EVENT LISTENERS
    openOptionBtn.addEventListener('click', () => this._handleBtnEvent());
    this.textInput.addEventListener('click', () => this._handleInputEvent());
  }

  _buildOptionsHtml(options) {
    const html = `
      <ul
        class="filter__dropdown"
        role="listbox"
        aria-label="filter options"
        tabindex="0"
      >
        ${(() => {
          let optionList = '';
          options.forEach((option) => {
            optionList += `<li class="filter__option" role="option">${option}</li>`;
          });
          return optionList;
        })()}
      </ul>
    `;
    this.filter.insertAdjacentHTML('beforeend', html);
  }

  _resizeOptionsList(options) {
    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.style.gridTemplateRows = `repeat(${
      options.size >= 10 ? '10' : `${options.size}`
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
    this._buildOptionsHtml(options);
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
    const test = new Set([
      'pomme',
      'poire',
      'cerise',
      'banane',
      'orange',
      'fraise',
      'franboise',
      'kiwi',
      'mures',
      'pruneau',
      'clementine',
      'mangue',
    ]);

    this.isFilterOpen() ? this.clearOptions() : this.addOptions(test);
  }

  _handleInputEvent() {
    const test = new Set([
      'pomme',
      'poire',
      'cerise',
      'banane',
      'orange',
      'fraise',
      'franboise',
      'kiwi',
      'mures',
      'pruneau',
      'clementine',
      'mangue',
    ]);
    if (!this.isFilterOpen()) this.addOptions(test);
  }
}

export const ingredientFilter = new Filter(
  document.querySelector('.filter--ingredients')
);
export const applianceFilter = new Filter(
  document.querySelector('.filter--appliance')
);
export const ustensilsFilter = new Filter(
  document.querySelector('.filter--ustensils')
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
