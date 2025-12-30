/*
 * Part of the hugo-fuse-search project
 * https://github.com/theys96/hugo-fuse-search/
 * License: https://github.com/Theys96/hugo-fuse-search/blob/master/LICENSE
 *
 * Note: contains parts of code still remaining from the original code this
 * program is based on. Author: Craig Mod.
 * https://gist.github.com/cmod/5410eae147e4318164258742dd053993
 */

// ==========================================
// BASICS
//

function setupSearch() {
  const fusesearch = new FuseSearch();
  const searchbar = new Searchbar(fusesearch);
  return { fusesearch, searchbar };
}

// ==========================================
// CLASSES
//

/* Core search class containing logic for the search engine */
class FuseSearch {
  isInit = false;
  index = '/search.json';
  fuse = null;
  maxResults = 20;
  fuseConfig = {
    shouldSort: true,
    location: 0,
    distance: 100,
    threshold: 0.4,
    minMatchCharLength: 2,
    keys: ['title', 'permalink', 'contents'],
  };

  constructor() {}

  init() {
    if (!this.isInit) {
      return this.loadSearch();
    }
    return Promise.resolve();
  }

  async loadSearch() {
    try {
      const data = await fetchJSONFile(this.index);
      this.fuse = new Fuse(data, this.fuseConfig);
      this.isInit = true;
    } catch (error) {
      console.warn('hugo-fuse-search: cannot retrieve search index');
      console.error(error);
    }
  }

  isReady() {
    return this.isInit && this.fuse !== null;
  }

  toString() {
    return 'FuseSearch';
  }
}

/* Base code for multiple searchbar implementations
 */
class Searchbar {
  constructor(fusesearch) {
    this.search = fusesearch;
    this.element_main = document.getElementById('searchbar');
    this.element_input = document.getElementById('searchbar-input');
    this.element_results = document.getElementById('searchbar-results');
    this.template = document.getElementById('search-result-template');
    this.initPromise = this.search.init();
    this.init();
  }

  createItemElement(item, isFirst, isLast) {
    // Clone the template
    const template = this.template.content.cloneNode(true);
    const li = template.querySelector('li');
    const a = template.querySelector('a');
    const titleSpan = template.querySelector('.title');

    // Add conditional classes
    if (isFirst) li.classList.add('pt-4');
    if (isLast) li.classList.add('pb-4');

    // Set content
    a.href = item.permalink;
    titleSpan.textContent = item.title;

    return template;
  }

  init() {
    this.visible = false;
    this.resultsAvailable = false;
    this.selectedIndex = -1;

    // Handle keyboard navigation
    this.element_input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateResults(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateResults(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.selectResult();
      } else if (e.key === 'Escape') {
        this.element_main.classList.add('hidden');
      }
    });

    // Renew search whenever the user types
    this.element_input.addEventListener('keyup', (e) => {
      // Skip navigation keys
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        return;
      }
      this.executeSearch(this.element_input.value);
    });
  }

  navigateResults(direction) {
    if (!this.resultsAvailable) return;

    const results = this.element_results.querySelectorAll(
      '.search-result-item',
    );
    if (results.length === 0) return;

    // Remove previous selection
    if (this.selectedIndex >= 0 && this.selectedIndex < results.length) {
      results[this.selectedIndex]
        .querySelector('a')
        .classList.remove('bg-hbg-dark');
    }

    // Update selected index
    this.selectedIndex += direction;

    // Wrap around
    if (this.selectedIndex < 0) {
      this.selectedIndex = results.length - 1;
    } else if (this.selectedIndex >= results.length) {
      this.selectedIndex = 0;
    }

    // Add selection to new item
    const selectedLink = results[this.selectedIndex].querySelector('a');
    selectedLink.classList.add('bg-hbg-dark');
    selectedLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  selectResult() {
    if (!this.resultsAvailable || this.selectedIndex < 0) return;

    const results = this.element_results.querySelectorAll(
      '.search-result-item',
    );
    if (this.selectedIndex < results.length) {
      const link = results[this.selectedIndex].querySelector('a');
      if (link) {
        window.location.href = link.href;
      }
    }
  }

  // Run the search (which happens whenever the user types)
  async executeSearch(term) {
    if (!this.search.isInit) {
      await this.search.init();
    }

    if (!this.search.isInit) {
      return;
    }

    try {
      const results = this.search.fuse.search(term);

      // Clear previous results and reset selection
      this.element_results.innerHTML = '';
      this.selectedIndex = -1;

      if (results.length === 0) {
        // no results based on what was typed into the input box
        this.resultsAvailable = false;
        this.element_results.classList.remove('border', 'border-ht-lightest');
      } else {
        // we got results
        const slicedResults = results
          .slice(0, this.search.maxResults)
          .map((item) => item.item)
          .filter(Boolean);

        // Filter for unique permalinks
        const seenPermalinks = new Set();
        const uniqueResults = slicedResults.filter((item) => {
          if (!item.permalink) return false;
          const seen = seenPermalinks.has(item.permalink);
          seenPermalinks.add(item.permalink);
          return !seen;
        });

        const fragment = document.createDocumentFragment();

        uniqueResults.forEach((item, index) => {
          const isFirst = index === 0;
          const isLast = index === uniqueResults.length - 1;
          const element = this.createItemElement(item, isFirst, isLast);
          fragment.appendChild(element);
        });

        this.element_results.appendChild(fragment);
        this.resultsAvailable = true;
        this.element_results.classList.add('border', 'border-ht-lightest');
      }
    } catch (err) {
      console.warn('hugo-fuse-search: search failed');
      console.error(err);
    }
  }
}

// ==========================================
// HELPER FUNCTIONS
//

/* Fetches JSON file and returns the parsed contents in the callback */
function fetchJSONFile(path) {
  return new Promise((resolve, reject) => {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var data = JSON.parse(httpRequest.responseText);
          resolve(data);
        } else {
          reject(
            new Error(`${httpRequest.status} - ${httpRequest.statusText}`),
          );
        }
      }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
  });
}

// EXPORTS
// At the end of the file, replace the exports with:
export { setupSearch };
