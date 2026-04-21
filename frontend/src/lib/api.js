const configuredBackendUrl = (process.env.REACT_APP_BACKEND_URL || "").trim();
const normalizedConfiguredBackendUrl = configuredBackendUrl.replace(/\/$/, "");
const runtimeOrigin =
  typeof window !== "undefined" ? window.location.origin : "";

export const BACKEND_URL = normalizedConfiguredBackendUrl || runtimeOrigin;
export const API_BASE_URL = `${BACKEND_URL}/api`;

export function getApiErrorMessage(error, fallback = "Request failed") {
  const detail = error?.response?.data?.detail;
  if (detail) {
    return detail;
  }

  const status = error?.response?.status;
  if (status === 405) {
    return "API rejected the request. Check that REACT_APP_BACKEND_URL points to the FastAPI backend, not a static site.";
  }

  if (status) {
    return `${fallback} (HTTP ${status})`;
  }

  return error?.message || fallback;
}
