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
    ({ widgets, destinationApps }) =>
        invoke("build_widgets", { widgets, destinationApps }),
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

export const addAppAPI = withErrorHandling(
    "Failed to add app",
    ({ key, name, path }) => invoke("add_app", { key, name, path }),
);

export const removeAppAPI = withErrorHandling("Failed to remove app", (key) =>
    invoke("remove_app", { key }),
);

export const updateAppAPI = withErrorHandling(
    "Failed to update app",
    ({ key, name, path }) => invoke("update_app", { key, name, path }),
);

// ===== EFFECT RUNNERS =====

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

// Tap into effect without changing result
export const tapEffect = curry((sideEffect, effect) => async (...args) => {
    const result = await effect(...args);
    await sideEffect(result);
    return result;
});
