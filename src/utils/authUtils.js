export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    // Decode JWT token to check expiration (optional)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    return payload.exp > currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};
