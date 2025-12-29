import axios from 'axios';

const api_base_url = import.meta.env.VITE_API_URL;

// Cache for content to avoid multiple API calls
let contentCache = {};
let contentCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all content for a specific page
export const getPageContent = async (page) => {
  try {
    // Check cache
    const now = Date.now();
    if (contentCache[page] && contentCacheTime && (now - contentCacheTime) < CACHE_DURATION) {
      return contentCache[page];
    }

    const response = await axios.get(
      `${api_base_url}/api/v1/content/get-by-page/${page}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      contentCache[page] = response.data.data;
      contentCacheTime = now;
      return response.data.data;
    }
    return {};
  } catch (error) {
    console.error(`Error fetching content for page ${page}:`, error);
    return {};
  }
};

// Get a specific content by key
export const getContent = async (key) => {
  try {
    const response = await axios.get(
      `${api_base_url}/api/v1/content/get-by-key/${key}`,
      { withCredentials: true }
    );

    if (response.data.success) {
      return response.data.data.content;
    }
    return '';
  } catch (error) {
    console.error(`Error fetching content for key ${key}:`, error);
    return '';
  }
};

// Clear cache (useful after content updates)
export const clearContentCache = () => {
  contentCache = {};
  contentCacheTime = null;
};

