class Filter {
  constructor(element) {
    this.filter = element;
    const openOptionBtn = this.filter.querySelector('.filter__expand');

    // EVENT LISTENERS
    openOptionBtn.addEventListener('click', () => this.handleBtnEvent());
  }

  addOptions(options) {
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

    const dropdown = this.filter.querySelector('.filter__dropdown');
    dropdown.style.gridTemplateRows = `repeat(${
      options.size >= 10 ? '10' : `${options.size}`
    },1fr)`;

    const dropdownWidth = dropdown.clientWidth;
    this.filter.style.width = `${dropdownWidth}px`;
    this.filter.classList.add('filter--open');
  }

  clearOptions() {
    const options = this.filter.querySelector('.filter__dropdown');
    options.remove();
    this.filter.style.width = ``;
    this.filter.classList.remove('filter--open');
  }

  handleBtnEvent() {
    if (this.filter.classList.contains('filter--open')) {
      this.clearOptions();
    } else {
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
      this.addOptions(test);
    }
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
