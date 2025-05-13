import { useState, useEffect, useCallback } from 'react';

export function useChromeStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);

  // Load from storage
  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      if (result.hasOwnProperty(key)) {
        setValue(result[key]);
      }
    });

    // Listen for external changes to the storage
    const listener = (changes, areaName) => {
      if (areaName === 'local' && changes[key]) {
        setValue(changes[key].newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, [key]);

  // Save to storage
  const updateValue = useCallback((newValue) => {
    setValue(newValue);
    chrome.storage.local.set({ [key]: newValue });
  }, [key]);

  return [value, updateValue];
}
