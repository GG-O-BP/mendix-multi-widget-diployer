import { useState, useEffect } from "react";
import { tryCatch, loadSettingsAPI, saveSettingsAPI } from "../utils/effects.js";

export const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadSettings = async () => {
        const result = await tryCatch(loadSettingsAPI);
        if (result.success) {
            // Ensure selected_widgets is initialized
            const loadedSettings = result.data;
            if (!loadedSettings.selected_widgets) {
                loadedSettings.selected_widgets = {};
            }
            if (!loadedSettings.apps) {
                loadedSettings.apps = [];
            }
            if (!loadedSettings.selected_apps) {
                loadedSettings.selected_apps = {};
            }
            setSettings(loadedSettings);
            setError(null);
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    const updateSettings = async (updatedSettings) => {
        console.log("Updating settings:", updatedSettings);
        const result = await tryCatch(saveSettingsAPI, updatedSettings);
        if (result.success) {
            setSettings(updatedSettings);
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return { settings, isLoading, error, updateSettings };
};
