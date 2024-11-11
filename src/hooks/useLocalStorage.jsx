import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to synchronize state with localStorage.
 * @param {string} key - The key in localStorage.
 * @param {*} initialValue - The initial value to use.
 * @returns {[*, function]} - An array with the current value and a function to update it.
 */
export function useLocalStorage(key, initialValue) {
    const isServer = typeof window === "undefined";

    // Initialize state with initialValue
    const [storedValue, setStoredValue] = useState(initialValue);

    // Ref to keep track of the current storedValue without causing re-renders
    const storedValueRef = useRef(storedValue);
    storedValueRef.current = storedValue;

    // Function to update storedValue if different
    const updateStoredValue = useCallback((newValue) => {
        if (JSON.stringify(newValue) !== JSON.stringify(storedValueRef.current)) {
            setStoredValue(newValue);
        }
    }, []);

    // Sync state with localStorage
    const syncStateWithLocalStorage = useCallback(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                const parsedItem = JSON.parse(item);
                updateStoredValue(parsedItem);
            } else {
                updateStoredValue(initialValue);
            }
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
        }
    }, [key, initialValue, updateStoredValue]);

    // On client, read from localStorage after component mounts
    useEffect(() => {
        if (!isServer) {
            syncStateWithLocalStorage();
        }
    }, [isServer, syncStateWithLocalStorage]);

    const setValue = useCallback(
        (value) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                // Dispatch a custom event to notify all listeners in this tab
                window.dispatchEvent(new CustomEvent("local-storage", { detail: { key, value: valueToStore } }));
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key]
    );

    // Function to handle storage events (both 'storage' and 'local-storage')
    const handleStorageEvent = useCallback(
        (event) => {
            let newValue = null;

            if (event instanceof StorageEvent && event.storageArea === window.localStorage && event.key === key) {
                // Handle native 'storage' event
                if (event.newValue) {
                    try {
                        newValue = JSON.parse(event.newValue);
                    } catch (error) {
                        console.error(`Error parsing localStorage key "${key}":`, error);
                    }
                } else {
                    newValue = initialValue;
                }
            } else if (event.type === "local-storage") {
                // Handle custom 'local-storage' event
                const customEvent = event;
                if (customEvent.detail.key === key) {
                    newValue = customEvent.detail.value;
                }
            }

            if (newValue !== null) {
                updateStoredValue(newValue);
            }
        },
        [key, initialValue, updateStoredValue]
    );

    // Listen for storage events
    useEffect(() => {
        if (isServer) return;

        window.addEventListener("storage", handleStorageEvent);
        window.addEventListener("local-storage", handleStorageEvent);
        return () => {
            window.removeEventListener("storage", handleStorageEvent);
            window.removeEventListener("local-storage", handleStorageEvent);
        };
    }, [handleStorageEvent, isServer]);

    return [storedValue, setValue];
}
