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
    return "API rejected the request with HTTP 405. This usually means the frontend is still calling an old or wrong endpoint. Verify the deployed REACT_APP_BACKEND_URL and redeploy the frontend.";
  }

  if (status) {
    return `${fallback} (HTTP ${status})`;
  }

  return error?.message || fallback;
}
