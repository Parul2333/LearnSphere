/**
 * Storage Manager - Centralized storage management for localStorage and sessionStorage
 * 🔥 Best Practices Implementation
 */

// ==========================================
// 🔒 LOCAL STORAGE - PERSISTENT DATA
// ==========================================
/**
 * Local Storage stores data that persists even after browser is closed
 * Use for: theme, token, user profile, preferences
 */
export const LocalStorage = {
  /**
   * Store theme preference (dark/light)
   * ✔ UI preferences store karne ke liye perfect choice
   */
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
  },
  getTheme: () => {
    return localStorage.getItem('theme');
  },
  removeTheme: () => {
    localStorage.removeItem('theme');
  },

  /**
   * Store JWT token
   * ✔ Ye localStorage me store karna allowed hai jab tak sensitive info nahi ho
   */
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  removeToken: () => {
    localStorage.removeItem('token');
  },

  /**
   * Store user profile (name, email, role, etc.)
   * ✔ Ye bhi localStorage me rakhna bilkul sahi hai kyunki page refresh pe bhi profile maintain rehni chahiye
   */
  setUserProfile: (profile) => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  },
  getUserProfile: () => {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : null;
  },
  removeUserProfile: () => {
    localStorage.removeItem('userProfile');
  },

  /**
   * Store last visited page/route
   * ✔ User experience improvement - redirect to last page on login
   */
  setLastVisitedPage: (page) => {
    localStorage.setItem('lastVisitedPage', page);
  },
  getLastVisitedPage: () => {
    return localStorage.getItem('lastVisitedPage');
  },
  removeLastVisitedPage: () => {
    localStorage.removeItem('lastVisitedPage');
  },

  /**
   * Store selected year/branch for filters
   * ✔ Maintain user's study preferences
   */
  setSelectedYear: (year) => {
    localStorage.setItem('selectedYear', year);
  },
  getSelectedYear: () => {
    return localStorage.getItem('selectedYear');
  },
  removeSelectedYear: () => {
    localStorage.removeItem('selectedYear');
  },

  setSelectedBranch: (branch) => {
    localStorage.setItem('selectedBranch', branch);
  },
  getSelectedBranch: () => {
    return localStorage.getItem('selectedBranch');
  },
  removeSelectedBranch: () => {
    localStorage.removeItem('selectedBranch');
  },

  /**
   * Store user preferences (notifications, email, etc.)
   */
  setUserPreferences: (preferences) => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  },
  getUserPreferences: () => {
    const prefs = localStorage.getItem('userPreferences');
    return prefs ? JSON.parse(prefs) : {};
  },
  removeUserPreferences: () => {
    localStorage.removeItem('userPreferences');
  },

  /**
   * Clear all localStorage data (on logout)
   */
  clearAll: () => {
    localStorage.clear();
  },
};

// ==========================================
// 🔐 SESSION STORAGE - TEMPORARY DATA
// ==========================================
/**
 * Session Storage stores data only for the current browser session
 * Data is automatically cleared when browser tab is closed
 * Use for: refresh token, temporary UI states, one-time configs
 */
export const SessionStorage = {
  /**
   * Store refresh token
   * ✔ Perfect!
   * Refresh token ko sessionStorage me store karna recommended pattern hai,
   * kyunki browser close hote hi token remove ho jata hai → security high
   */
  setRefreshToken: (token) => {
    sessionStorage.setItem('refreshToken', token);
  },
  getRefreshToken: () => {
    return sessionStorage.getItem('refreshToken');
  },
  removeRefreshToken: () => {
    sessionStorage.removeItem('refreshToken');
  },

  /**
   * Store Adobe Clean Font Added flag
   * ✔ UI related session config — correct
   */
  setAdobeCleanFontAdded: (value) => {
    sessionStorage.setItem('adobeCleanFontAdded', JSON.stringify(value));
  },
  getAdobeCleanFontAdded: () => {
    const value = sessionStorage.getItem('adobeCleanFontAdded');
    return value ? JSON.parse(value) : false;
  },
  removeAdobeCleanFontAdded: () => {
    sessionStorage.removeItem('adobeCleanFontAdded');
  },

  /**
   * Store temporary UI state (open modals, expanded sections)
   * ✔ Session-specific UI preferences
   */
  setTempUIState: (state) => {
    sessionStorage.setItem('tempUIState', JSON.stringify(state));
  },
  getTempUIState: () => {
    const state = sessionStorage.getItem('tempUIState');
    return state ? JSON.parse(state) : {};
  },
  removeTempUIState: () => {
    sessionStorage.removeItem('tempUIState');
  },

  /**
   * Store search history for current session
   * ✔ Temporary search cache
   */
  setSessionSearchHistory: (history) => {
    sessionStorage.setItem('sessionSearchHistory', JSON.stringify(history));
  },
  getSessionSearchHistory: () => {
    const history = sessionStorage.getItem('sessionSearchHistory');
    return history ? JSON.parse(history) : [];
  },
  removeSessionSearchHistory: () => {
    sessionStorage.removeItem('sessionSearchHistory');
  },

  /**
   * Store current page scroll position
   * ✔ Better UX - restore scroll position on back navigation
   */
  setScrollPosition: (path, position) => {
    const scrollMap = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    scrollMap[path] = position;
    sessionStorage.setItem('scrollPositions', JSON.stringify(scrollMap));
  },
  getScrollPosition: (path) => {
    const scrollMap = JSON.parse(sessionStorage.getItem('scrollPositions') || '{}');
    return scrollMap[path] || 0;
  },
  clearScrollPositions: () => {
    sessionStorage.removeItem('scrollPositions');
  },

  /**
   * Store notification preferences for current session
   */
  setNotificationPreferences: (prefs) => {
    sessionStorage.setItem('notificationPrefs', JSON.stringify(prefs));
  },
  getNotificationPreferences: () => {
    const prefs = sessionStorage.getItem('notificationPrefs');
    return prefs ? JSON.parse(prefs) : {};
  },
  removeNotificationPreferences: () => {
    sessionStorage.removeItem('notificationPrefs');
  },

  /**
   * Clear all sessionStorage data
   */
  clearAll: () => {
    sessionStorage.clear();
  },
};

// ==========================================
// 🛡️ SECURE STORAGE UTILS
// ==========================================
/**
 * Helper function to safely get item
 */
export const getSafeStorage = (key, storage = 'local') => {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage;
    const item = store.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Failed to parse storage item '${key}':`, error);
    return null;
  }
};

/**
 * Helper function to safely set item
 */
export const setSafeStorage = (key, value, storage = 'local') => {
  try {
    const store = storage === 'local' ? localStorage : sessionStorage;
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set storage item '${key}':`, error);
    return false;
  }
};

/**
 * Check if localStorage is available (some browsers restrict it)
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if sessionStorage is available
 */
export const isSessionStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export default {
  LocalStorage,
  SessionStorage,
  getSafeStorage,
  setSafeStorage,
  isLocalStorageAvailable,
  isSessionStorageAvailable,
};
