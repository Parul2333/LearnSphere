import { LocalStorage, SessionStorage } from '../utils/storageManager.js';

/**
 * 🔥 Custom Hook - useStorage
 * Simplified access to all storage operations
 */
export const useStorage = () => {
  return {
    // Local Storage operations
    local: {
      theme: {
        set: LocalStorage.setTheme,
        get: LocalStorage.getTheme,
        remove: LocalStorage.removeTheme,
      },
      token: {
        set: LocalStorage.setToken,
        get: LocalStorage.getToken,
        remove: LocalStorage.removeToken,
      },
      userProfile: {
        set: LocalStorage.setUserProfile,
        get: LocalStorage.getUserProfile,
        remove: LocalStorage.removeUserProfile,
      },
      lastVisitedPage: {
        set: LocalStorage.setLastVisitedPage,
        get: LocalStorage.getLastVisitedPage,
        remove: LocalStorage.removeLastVisitedPage,
      },
      selectedYear: {
        set: LocalStorage.setSelectedYear,
        get: LocalStorage.getSelectedYear,
        remove: LocalStorage.removeSelectedYear,
      },
      selectedBranch: {
        set: LocalStorage.setSelectedBranch,
        get: LocalStorage.getSelectedBranch,
        remove: LocalStorage.removeSelectedBranch,
      },
      userPreferences: {
        set: LocalStorage.setUserPreferences,
        get: LocalStorage.getUserPreferences,
        remove: LocalStorage.removeUserPreferences,
      },
      clearAll: LocalStorage.clearAll,
    },
    // Session Storage operations
    session: {
      refreshToken: {
        set: SessionStorage.setRefreshToken,
        get: SessionStorage.getRefreshToken,
        remove: SessionStorage.removeRefreshToken,
      },
      adobeCleanFont: {
        set: SessionStorage.setAdobeCleanFontAdded,
        get: SessionStorage.getAdobeCleanFontAdded,
        remove: SessionStorage.removeAdobeCleanFontAdded,
      },
      tempUIState: {
        set: SessionStorage.setTempUIState,
        get: SessionStorage.getTempUIState,
        remove: SessionStorage.removeTempUIState,
      },
      searchHistory: {
        set: SessionStorage.setSessionSearchHistory,
        get: SessionStorage.getSessionSearchHistory,
        remove: SessionStorage.removeSessionSearchHistory,
      },
      scrollPosition: {
        set: SessionStorage.setScrollPosition,
        get: SessionStorage.getScrollPosition,
        clear: SessionStorage.clearScrollPositions,
      },
      notificationPrefs: {
        set: SessionStorage.setNotificationPreferences,
        get: SessionStorage.getNotificationPreferences,
        remove: SessionStorage.removeNotificationPreferences,
      },
      clearAll: SessionStorage.clearAll,
    },
  };
};

export default useStorage;
