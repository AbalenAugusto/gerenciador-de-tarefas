const GIST_FILENAME = 'tarefas.json';
const GIST_DESCRIPTION = 'Gerenciador de Tarefas — sincronização automática';

export const githubStorage = {
  getConfig() {
    return {
      token: localStorage.getItem('gh_pat'),
      gistId: localStorage.getItem('gh_gist_id'),
      username: localStorage.getItem('gh_username'),
    };
  },

  saveConfig(token, gistId, username) {
    localStorage.setItem('gh_pat', token);
    localStorage.setItem('gh_gist_id', gistId);
    if (username) localStorage.setItem('gh_username', username);
  },

  clearConfig() {
    localStorage.removeItem('gh_pat');
    localStorage.removeItem('gh_gist_id');
    localStorage.removeItem('gh_username');
  },

  isConfigured() {
    const { token, gistId } = this.getConfig();
    return !!(token && gistId);
  },

  async validateToken(token) {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (!res.ok) throw new Error('Token inválido ou sem permissão.');
    return res.json(); // returns { login, avatar_url, ... }
  },

  async createGist(token) {
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false,
        files: {
          [GIST_FILENAME]: { content: '[]' },
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Erro ao criar Gist. Verifique se o token tem permissão de "gist".');
    }
    const data = await res.json();
    return data.id;
  },

  async loadTasks() {
    const { token, gistId } = this.getConfig();
    if (!token || !gistId) return null;

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (res.status === 404) throw new Error('Gist não encontrado. Reconfigure a sincronização.');
    if (!res.ok) throw new Error(`Erro ao carregar tarefas do GitHub (${res.status})`);

    const data = await res.json();
    const fileContent = data.files[GIST_FILENAME]?.content;
    if (!fileContent) return [];

    try {
      return JSON.parse(fileContent);
    } catch {
      return [];
    }
  },

  async saveTasks(tasks) {
    const { token, gistId } = this.getConfig();
    if (!token || !gistId) return;

    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(tasks, null, 2),
          },
        },
      }),
    });

    if (!res.ok) throw new Error(`Erro ao salvar no GitHub (${res.status})`);
  },

  // Saves tasks to localStorage as offline fallback
  cacheLocally(tasks) {
    localStorage.setItem('tasks_cache', JSON.stringify(tasks));
  },

  getLocalCache() {
    const cached = localStorage.getItem('tasks_cache');
    return cached ? JSON.parse(cached) : [];
  },
};
