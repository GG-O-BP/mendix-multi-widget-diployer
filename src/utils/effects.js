import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { curry } from "./fp.js";

// ===== ERROR HANDLING =====

// Wrap async functions with error handling
export const withErrorHandling = curry((errorPrefix, fn) => async (...args) => {
    try {
        return await fn(...args);
    } catch (error) {
        const errorMessage = typeof error === "string" ? error : String(error);
        throw new Error(`${errorPrefix}: ${errorMessage}`);
    }
});

// Try-catch wrapper that returns Result monad-like object
export const tryCatch = async (fn, ...args) => {
    try {
        const result = await fn(...args);
        return { success: true, data: result, error: null };
    } catch (error) {
        const errorMessage = error.message || String(error);
        return { success: false, data: null, error: errorMessage };
    }
};

// Create a safe version of an async function
export const makeSafe =
    (fn) =>
    async (...args) =>
        tryCatch(fn, ...args);

// ===== TAURI API WRAPPERS =====

// Settings operations
export const loadSettingsAPI = withErrorHandling(
    "Failed to load settings",
    () => invoke("load_settings"),
);

export const saveSettingsAPI = withErrorHandling(
    "Failed to save settings",
    (settings) => invoke("save_settings", { settings }),
);

// Widget operations
export const buildWidgetsAPI = withErrorHandling(
    "Build failed",
    ({ widgets, destinationPath, basePath }) =>
        invoke("build_widgets", { widgets, destinationPath, basePath }),
);

export const addWidgetAPI = withErrorHandling(
    "Failed to add widget",
    ({ key, name, path }) => invoke("add_widget", { key, name, path }),
);

export const removeWidgetAPI = withErrorHandling(
    "Failed to remove widget",
    (key) => invoke("remove_widget", { key }),
);

export const updateWidgetAPI = withErrorHandling(
    "Failed to update widget",
    ({ key, name, path }) => invoke("update_widget", { key, name, path }),
);

// Dialog operations
export const selectFolderDialog = withErrorHandling(
    "Failed to select folder",
    (title) => open({ directory: true, title }),
);

// ===== EFFECT COMPOSITION =====

// Chain effects sequentially
export const chainEffects =
    (...effects) =>
    async (input) => {
        let result = input;
        for (const effect of effects) {
            result = await effect(result);
        }
        return result;
    };

// Run effects in parallel
export const parallelEffects =
    (...effects) =>
    async (input) => {
        const results = await Promise.all(
            effects.map((effect) => effect(input)),
        );
        return results;
    };

// Run effect and ignore result
export const fireAndForget =
    (effect) =>
    async (...args) => {
        effect(...args).catch(console.error);
    };

// Retry effect on failure
export const retryEffect = curry(
    (maxRetries, delay, effect) =>
        async (...args) => {
            let lastError;
            for (let i = 0; i <= maxRetries; i++) {
                try {
                    return await effect(...args);
                } catch (error) {
                    lastError = error;
                    if (i < maxRetries) {
                        await new Promise((resolve) =>
                            setTimeout(resolve, delay),
                        );
                    }
                }
            }
            throw lastError;
        },
);

// Debounce effect
export const debounceEffect = curry((delay, effect) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        return new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
                const result = await effect(...args);
                resolve(result);
            }, delay);
        });
    };
});

// Throttle effect
export const throttleEffect = curry((delay, effect) => {
    let lastCall = 0;
    let pendingCall = null;

    return async (...args) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall;

        if (timeSinceLastCall >= delay) {
            lastCall = now;
            return effect(...args);
        }

        if (!pendingCall) {
            pendingCall = new Promise((resolve) => {
                setTimeout(async () => {
                    lastCall = Date.now();
                    pendingCall = null;
                    const result = await effect(...args);
                    resolve(result);
                }, delay - timeSinceLastCall);
            });
        }

        return pendingCall;
    };
});

// ===== EFFECT RUNNERS =====

// Run effect with loading state
export const withLoadingState = curry(
    (setLoading, effect) =>
        async (...args) => {
            setLoading(true);
            try {
                return await effect(...args);
            } finally {
                setLoading(false);
            }
        },
);

// Run effect with error state
export const withErrorState = curry((setError, effect) => async (...args) => {
    setError(null);
    try {
        return await effect(...args);
    } catch (error) {
        const errorMessage = error.message || String(error);
        setError(errorMessage);
        throw error;
    }
});

// Run effect with status message
export const withStatusMessage = curry(
    (setStatus, successMessage, errorPrefix, effect) =>
        async (...args) => {
            try {
                const result = await effect(...args);
                setStatus(`✅ ${successMessage}`);
                return result;
            } catch (error) {
                const errorMessage = error.message || String(error);
                setStatus(`❌ ${errorPrefix}: ${errorMessage}`);
                throw error;
            }
        },
);

// ===== EFFECT TRANSFORMERS =====

// Map over effect result
export const mapEffect = curry((fn, effect) => async (...args) => {
    const result = await effect(...args);
    return fn(result);
});

// FlatMap over effect result
export const flatMapEffect = curry((fn, effect) => async (...args) => {
    const result = await effect(...args);
    return fn(result);
});

// Filter effect result
export const filterEffect = curry(
    (predicate, defaultValue, effect) =>
        async (...args) => {
            const result = await effect(...args);
            return predicate(result) ? result : defaultValue;
        },
);

// Tap into effect without changing result
export const tapEffect = curry((sideEffect, effect) => async (...args) => {
    const result = await effect(...args);
    await sideEffect(result);
    return result;
});

// ===== EFFECT COMBINATORS =====

// Either effect - try first, if fails try second
export const eitherEffect = curry((effect1, effect2) => async (...args) => {
    try {
        return await effect1(...args);
    } catch {
        return await effect2(...args);
    }
});

// Race effects - return first to complete
export const raceEffects =
    (...effects) =>
    async (input) => {
        return Promise.race(effects.map((effect) => effect(input)));
    };

// Conditional effect
export const whenEffect = curry((predicate, effect) => async (input) => {
    if (await predicate(input)) {
        return effect(input);
    }
    return input;
});

// Unless effect
export const unlessEffect = curry((predicate, effect) => async (input) => {
    if (!(await predicate(input))) {
        return effect(input);
    }
    return input;
});

// ===== EFFECT UTILITIES =====

// Create delayed effect
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Create effect from value
export const fromValue = (value) => async () => value;

// Create effect from error
export const fromError = (error) => async () => {
    throw error;
};

// Log effect
export const logEffect = (label) =>
    tapEffect((result) => {
        console.log(label, result);
        return Promise.resolve();
    });

// Time effect execution
export const timeEffect = curry((label, effect) => async (...args) => {
    const start = performance.now();
    try {
        const result = await effect(...args);
        const end = performance.now();
        console.log(`${label} took ${end - start}ms`);
        return result;
    } catch (error) {
        const end = performance.now();
        console.log(`${label} failed after ${end - start}ms`);
        throw error;
    }
});

// Cache effect results
export const memoizeEffect = (effect) => {
    const cache = new Map();
    return async (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = await effect(...args);
        cache.set(key, result);
        return result;
    };
};

// Clear memoized effect cache
export const createMemoizedEffect = (effect) => {
    const cache = new Map();
    const memoized = async (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = await effect(...args);
        cache.set(key, result);
        return result;
    };
    memoized.clear = () => cache.clear();
    return memoized;
};
