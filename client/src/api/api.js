async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...headers
    },
    ...restOptions
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "The request could not be completed.");
  }
  return payload;
}

function toQuery(parameters) {
  const query = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined && value !== false) {
      query.set(key, value);
    }
  });
  return query.toString();
}

export const api = {
  getCurrentUser: () => request("/auth/me"),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  getPlaces: (parameters) => request(`/places?${toQuery(parameters)}`),
  getPlace: (id) => request(`/places/${id}`),
  createPlace: (data) => request("/places", { method: "POST", body: JSON.stringify(data) }),
  updatePlace: (id, data) =>
    request(`/places/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePlace: (id) => request(`/places/${id}`, { method: "DELETE" }),
  getReports: (parameters) => request(`/reports?${toQuery(parameters)}`),
  getReport: (id) => request(`/reports/${id}`),
  createReport: (data) => request("/reports", { method: "POST", body: JSON.stringify(data) }),
  updateReport: (id, data) =>
    request(`/reports/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteReport: (id) => request(`/reports/${id}`, { method: "DELETE" }),
  updateReportStatus: (id, status) =>
    request(`/reports/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) })
};
