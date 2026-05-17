/**
 * REST API adapter that replaces the base44 SDK.
 * Maps .list(), .filter(), .create(), .update(), .delete() to Django REST endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('auth_token');
}

function setToken(token) {
  localStorage.setItem('auth_token', token);
}

function removeToken() {
  localStorage.removeItem('auth_token');
}

// Build headers with auth token
function getHeaders(isJson = true) {
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// Generic fetch wrapper
async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`);
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch (e) {
      error.data = {};
    }
    throw error;
  }
  if (response.status === 204) return {};
  return response.json();
}

// Map entity names to API endpoint paths
const ENTITY_ENDPOINT_MAP = {
  'Post': 'posts',
  'Comment': 'comments',
  'Campaign': 'campaigns',
  'Donation': 'donations',
  'Team': 'teams',
  'TeamMember': 'team-members',
  'NeedyPerson': 'needy-persons',
  'Poll': 'polls',
  'PollOption': 'poll-options',
  'PollVote': 'poll-votes',
  'Survey': 'surveys',
  'SurveyResponse': 'survey-responses',
  'Report': 'reports',
  'Advertisement': 'advertisements',
  'LiveBroadcast': 'live-broadcasts',
  'ZakatCollection': 'zakat-collections',
  'AboutSection': 'about-sections',
  'CharityType': 'charity-types',
  'FundType': 'fund-types',
};

function getEndpoint(entityName) {
  return ENTITY_ENDPOINT_MAP[entityName] || entityName.toLowerCase() + 's';
}

// Parse base44-style ordering string (e.g. '-created_date') into DRF ordering param
function parseOrdering(ordering) {
  if (!ordering) return '';
  return ordering;
}

// Build query string from filter object
function buildFilterParams(filters) {
  const params = new URLSearchParams();
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
  }
  return params;
}

/**
 * Create a proxy object for an entity that mirrors the base44 SDK interface.
 */
function createEntityProxy(entityName) {
  const endpoint = getEndpoint(entityName);
  const baseUrl = `${API_BASE}/${endpoint}`;

  return {
    /**
     * List all records, optionally sorted.
     * Usage: db.entities.Post.list('-created_date')
     */
    list: async (ordering) => {
      const params = new URLSearchParams();
      if (ordering) params.set('ordering', parseOrdering(ordering));
      params.set('page_size', '1000');
      const url = `${baseUrl}/?${params.toString()}`;
      const data = await apiFetch(url, { headers: getHeaders() });
      return data.results || data;
    },

    /**
     * Filter records by field values, optionally sorted.
     * Usage: db.entities.Comment.filter({ post_id: '123' }, '-created_date')
     */
    filter: async (filters, ordering) => {
      const params = buildFilterParams(filters);
      if (ordering) params.set('ordering', parseOrdering(ordering));
      params.set('page_size', '1000');
      const url = `${baseUrl}/?${params.toString()}`;
      const data = await apiFetch(url, { headers: getHeaders() });
      return data.results || data;
    },

    /**
     * Get a single record by ID.
     * Usage: db.entities.Post.get('123')
     */
    get: async (id) => {
      const url = `${baseUrl}/${id}/`;
      return apiFetch(url, { headers: getHeaders() });
    },

    /**
     * Create a new record.
     * Usage: db.entities.Post.create({ content: '...' })
     */
    create: async (data) => {
      const url = `${baseUrl}/`;
      return apiFetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
    },

    /**
     * Update an existing record.
     * Usage: db.entities.Post.update('123', { content: '...' })
     */
    update: async (id, data) => {
      const url = `${baseUrl}/${id}/`;
      return apiFetch(url, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete a record.
     * Usage: db.entities.Post.delete('123')
     */
    delete: async (id) => {
      const url = `${baseUrl}/${id}/`;
      return apiFetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    },
  };
}

// Auth adapter
const auth = {
  me: async () => {
    const token = getToken();
    if (!token) return null;
    return apiFetch(`${API_BASE}/auth/me/`, { headers: getHeaders() });
  },

  updateMe: async (data) => {
    return apiFetch(`${API_BASE}/auth/me/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  isAuthenticated: async () => {
    const token = getToken();
    if (!token) return false;
    try {
      await apiFetch(`${API_BASE}/auth/me/`, { headers: getHeaders() });
      return true;
    } catch {
      return false;
    }
  },

  login: async (username, password) => {
    const data = await apiFetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data.user;
  },

  register: async (userData) => {
    const data = await apiFetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data.user;
  },

  logout: async (redirectUrl) => {
    try {
      await apiFetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {
      // Ignore logout errors
    }
    removeToken();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  },

  redirectToLogin: (returnUrl) => {
    // For now, redirect to a login page
    window.location.href = `/login?returnUrl=${encodeURIComponent(returnUrl || window.location.pathname)}`;
  },
};

// Integrations adapter
const integrations = {
  Core: {
    UploadFile: async ({ file }) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiFetch(`${API_BASE}/upload/`, {
        method: 'POST',
        headers: { Authorization: `Token ${getToken()}` },
        body: formData,
      });
    },

    InvokeLLM: async ({ prompt }) => {
      // Stub: In production connect to an LLM service
      console.warn('InvokeLLM called but no LLM backend configured. Returning original text.');
      return prompt;
    },

    SendEmail: async (data) => {
      console.warn('SendEmail not implemented');
      return {};
    },

    SendSMS: async (data) => {
      console.warn('SendSMS not implemented');
      return {};
    },

    GenerateImage: async (data) => {
      console.warn('GenerateImage not implemented');
      return {};
    },

    ExtractDataFromUploadedFile: async (data) => {
      console.warn('ExtractDataFromUploadedFile not implemented');
      return {};
    },
  },
};

// User entity (for the @mention feature — list users)
const UserEntity = {
  list: async () => {
    return apiFetch(`${API_BASE}/auth/users/`, { headers: getHeaders() });
  },
  filter: async (filters) => {
    const params = buildFilterParams(filters);
    return apiFetch(`${API_BASE}/auth/users/?${params.toString()}`, { headers: getHeaders() });
  },
  get: async (id) => {
    return apiFetch(`${API_BASE}/auth/users/${id}/`, { headers: getHeaders() });
  },
  create: async () => ({}),
  update: async (id, data) => {
    return apiFetch(`${API_BASE}/auth/users/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return apiFetch(`${API_BASE}/auth/users/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },
};

// Stubs for base44-specific features (logging, agents/chat)
const appLogs = {
  logUserInApp: async () => {},
};

const agents = {
  createConversation: async () => ({ id: 'stub' }),
  subscribeToConversation: () => () => {},
  addMessage: async () => {},
};

// Build the db object that mirrors globalThis.__B44_DB__
export const db = {
  auth,
  entities: new Proxy({}, {
    get: (target, name) => {
      if (name === 'User') return UserEntity;
      return createEntityProxy(name);
    },
  }),
  integrations,
  appLogs,
  agents,
};

export const base44 = db;
export default db;

// Set on globalThis so all pages that read globalThis.__B44_DB__ use our adapter
globalThis.__B44_DB__ = db;