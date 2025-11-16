/**
 * 🔥 Storage Initialization Hook
 * Initialize all storage items on app load
 */

import { useEffect } from 'react';
import { SessionStorage } from '../utils/storageManager.js';

export const useStorageInitialization = () => {
  useEffect(() => {
    // 🔥 Only initialize storage items that need to exist for app to work
    // Don't initialize notification preferences - that's handled by NotificationCenter
    
    // Initialize tempUIState if it doesn't exist
    if (!SessionStorage.getTempUIState()) {
      SessionStorage.setTempUIState({
        sidebarOpen: false,
        modalOpen: false,
        activeTab: 'overview',
      });
    }

    // Initialize sessionSearchHistory if it doesn't exist
    if (!SessionStorage.getSessionSearchHistory()) {
      SessionStorage.setSessionSearchHistory([]);
    }

    // Initialize scrollPositions if they don't exist
    const scrollPos = SessionStorage.getScrollPosition('/');
    if (!scrollPos) {
      SessionStorage.setScrollPosition('/', 0);
    }

    console.log('🔥 Session Storage Core Items Initialized (Fresh Session)');
  }, []);
};

export default useStorageInitialization;
