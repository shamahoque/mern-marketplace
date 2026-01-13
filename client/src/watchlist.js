import axios from "axios";

export const addToWatchlist = (productId, token) =>
  axios.post(`/api/watchlist/${productId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const removeFromWatchlist = (productId, token) =>
  axios.delete(`/api/watchlist/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getWatchlist = (token) =>
  axios.get("/api/watchlist", {
    headers: { Authorization: `Bearer ${token}` }
  });
