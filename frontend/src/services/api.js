export const BASE_URL = ''; // using proxy

async function fetchApi(endpoint, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
  };

  if (!(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }

  const mergedHeaders = {
    ...defaultOptions.headers,
    ...(options.headers || {}),
  };

  // Remove Content-Type if explicitly set to undefined (for FormData)
  if (mergedHeaders['Content-Type'] === undefined) {
    delete mergedHeaders['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.message || errData.error || errorMsg;
    } catch (e) {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null;
  }

  try {
    const json = await response.json();
    // Unwrap the standard envelope: { success, data, message, errors }
    return json.data !== undefined ? json.data : json;
  } catch (e) {
    return response.text();
  }
}

export const getHome = () => fetchApi('/api/home');
export const getChallenges = () => fetchApi('/api/challenges');
export const getCardDownloadUrl = (filename) => `/api/challenges/cards/${filename}`;
export const submitFlag = (challengeId, flag) => fetchApi('/api/flags/submit', {
  method: 'POST',
  body: JSON.stringify({ challenge_id: challengeId, flag })
});

export const login = (username, password) => fetchApi('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username, password })
});
export const logout = () => fetchApi('/api/auth/logout', { method: 'POST' });

export const getDashboard = () => fetchApi('/api/admin/dashboard');
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return fetchApi('/api/admin/upload', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined } // let browser set multipart/form-data with boundary
  });
};
export const getUploads = (page = 1, limit = 100) => fetchApi(`/api/admin/uploads?page=${page}&limit=${limit}`);
export const restoreHomepage = () => fetchApi('/api/admin/restore', { method: 'POST' });
export const cleanAllUploads = () => fetchApi('/api/admin/clean-uploads', { method: 'POST' });
export const deleteUpload = (id) => fetchApi('/api/admin/uploads/delete', {
  method: 'POST',
  body: JSON.stringify({ id }),
});

