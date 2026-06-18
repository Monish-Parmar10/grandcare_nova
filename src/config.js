/**
 * Central API configuration for GrandCare.
 * All API calls in the frontend should import from this file.
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${API_BASE}/api`;
