(() => {
  const API_URL = 'https://jsonplaceholder.typicode.com/posts';
  const PAGE_SIZE = 10;
  const TOTAL_POSTS = 100;
  const DEBOUNCE_DELAY = 300;

  class PostsModel {
    constructor(pageSize, totalPosts) {
      this.pageSize = pageSize;
      this.totalPosts = totalPosts;
      this.posts = [];
      this.query = '';
      this.hasMore = true;
      this.isLoading = false;
      this.error = null;
    }

    getFilteredPosts() {
      const query = this.query.trim().toLowerCase();

      if (query === '') {
        return this.posts;
      }

      return this.posts.filter((post) => post.title.toLowerCase().includes(query));
    }

    setQuery(query) {
      this.query = query;
    }

    clearError() {
      this.error = null;
    }

    async loadNext() {
      if (this.isLoading || !this.hasMore) return;

      this.isLoading = true;
      this.error = null;

      try {
        const url = `${API_URL}?_start=${this.posts.length}&_limit=${this.pageSize}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        this.posts = this.posts.concat(data);

        if (data.length < this.pageSize || this.posts.length >= this.totalPosts) {
          this.hasMore = false;
        }
      } catch (error) {
        this.error = 'Не удалось загрузить посты. Проверьте подключение к интернету и попробуйте ещё раз.';
      } finally {
        this.isLoading = false;
      }
    }
  }

  class PostsView {
    constructor() {
      this.searchInput = document.getElementById('search');
      this.postsContainer = document.getElementById('posts');
      this.emptyText = document.getElementById('empty');
      this.loadingText = document.getElementById('loading');
      this.errorBox = document.getElementById('error');
      this.errorText = document.getElementById('error-text');
      this.retryBtn = document.getElementById('retry-btn');
      this.endText = document.getElementById('end');
      this.sentinel = document.getElementById('sentinel');
    }

    createPostElement(post) {
      const card = document.createElement('article');
      card.className = 'post';

      const title = document.createElement('h2');
      title.className = 'post-title';
      title.textContent = post.title;

      const body = document.createElement('p');
      body.className = 'post-body';
      body.textContent = post.body;

      const author = document.createElement('span');
      author.className = 'post-author';
      author.textContent = `Автор: ${post.userId}`;

      card.appendChild(title);
      card.appendChild(body);
      card.appendChild(author);

      return card;
    }

    render(model) {
      const filtered = model.getFilteredPosts();

      this.postsContainer.innerHTML = '';
      filtered.forEach((post) => {
        this.postsContainer.appendChild(this.createPostElement(post));
      });

      const hasQuery = model.query.trim() !== '';
      this.emptyText.hidden = !(hasQuery && filtered.length === 0 && !model.isLoading);
      this.loadingText.hidden = !model.isLoading;
      this.endText.hidden = !(!model.hasMore && model.posts.length > 0 && !model.error);

      this.errorBox.hidden = model.error === null;
      this.errorText.textContent = model.error === null ? '' : model.error;
    }

    onSearch(handler) {
      this.searchInput.addEventListener('input', () => handler(this.searchInput.value));
    }

    onRetry(handler) {
      this.retryBtn.addEventListener('click', handler);
    }
  }

  class PostsController {
    constructor(model, view, debounceDelay) {
      this.model = model;
      this.view = view;
      this.debounceDelay = debounceDelay;
      this.debounceTimer = null;
      this.observer = null;
    }

    init() {
      this.view.onSearch((value) => this.handleSearch(value));
      this.view.onRetry(() => this.handleRetry());

      this.observer = new IntersectionObserver(
        (entries) => this.handleIntersect(entries),
        { rootMargin: '0px 0px 200px 0px' }
      );
      this.observer.observe(this.view.sentinel);
    }

    handleSearch(value) {
      clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        this.model.setQuery(value);
        this.view.render(this.model);
        this.recheckSentinel();
      }, this.debounceDelay);
    }

    handleRetry() {
      this.model.clearError();
      this.loadMore();
    }

    handleIntersect(entries) {
      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (isVisible) {
        this.loadMore();
      }
    }

    canLoad() {
      return this.model.hasMore && !this.model.isLoading && this.model.error === null;
    }

    async loadMore() {
      if (!this.canLoad()) return;

      const request = this.model.loadNext();
      this.view.render(this.model);

      await request;

      this.view.render(this.model);
      this.recheckSentinel();
    }

    recheckSentinel() {
      if (!this.canLoad()) return;

      this.observer.unobserve(this.view.sentinel);
      this.observer.observe(this.view.sentinel);
    }
  }

  const model = new PostsModel(PAGE_SIZE, TOTAL_POSTS);
  const view = new PostsView();
  const controller = new PostsController(model, view, DEBOUNCE_DELAY);

  controller.init();
})();