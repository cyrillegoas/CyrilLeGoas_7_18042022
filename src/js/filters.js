class Filter {
  constructor(element) {
    this.filter = element;
    const openOptionBtn = this.filter.querySelector('.filter__expand');

    // EVENT LISTENERS
    openOptionBtn.addEventListener('click', () => this.handleBtnEvent());
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

  _isFilterOpen() {
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
    this._resetFilterWidth();
    this._toogleFilterOpenClass();
  }

  handleBtnEvent() {
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

    this._isFilterOpen() ? this.clearOptions() : this.addOptions(test);
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
