import { useState, useCallback } from "react";
import { pipe, map, prop, trim } from "../utils/fp.js";
import {
    generateUniqueKey,
    toggleAppSelection,
    validateApp,
} from "../utils/widgetLogic.js";
import {
    addAppAPI,
    removeAppAPI,
    updateAppAPI,
    withStatusMessage,
    tapEffect,
} from "../utils/effects.js";
import { useForm } from "./useForm.js";
import { useModal } from "./useModal.js";
import { useListAnimation } from "./useListAnimation.js";

export const useAppManagement = (settings, updateSettings, setBuildStatus) => {
    const [editingApp, setEditingApp] = useState(null);

    // Forms
    const newAppForm = useForm({ name: "", path: "" });
    const editingAppForm = useForm({ name: "", path: "" });

    // Modals
    const addAppModal = useModal();
    const removeAppModal = useModal();

    // Animations
    const appAnimation = useListAnimation();

    // Helper function for status messages
    const withStatus = useCallback(
        (successMsg, errorPrefix) =>
            withStatusMessage(setBuildStatus, successMsg, errorPrefix),
        [setBuildStatus],
    );

    // Save settings with status
    const saveSettingsWithStatus = useCallback(
        async (updatedSettings) => {
            const result = await updateSettings(updatedSettings);
            if (!result.success && result.error) {
                setBuildStatus(`❌ ${result.error}`);
            }
            return result;
        },
        [updateSettings, setBuildStatus],
    );

    // Toggle app selection
    const handleAppToggle = useCallback(
        async (appKey) => {
            console.log(
                "Toggling app:",
                appKey,
                "Current value:",
                settings?.selected_apps?.[appKey],
            );
            const updatedSettings = toggleAppSelection(appKey, settings || {});
            await saveSettingsWithStatus(updatedSettings);
        },
        [settings, saveSettingsWithStatus],
    );

    // Move app up
    const moveAppUp = useCallback(
        async (index) => {
            if (index === 0) return;

            await appAnimation.animateMove(
                index,
                "up",
                `app-up-${index}`,
                async () => {
                    const newApps = [...settings.apps];
                    [newApps[index - 1], newApps[index]] = [
                        newApps[index],
                        newApps[index - 1],
                    ];

                    const updatedSettings = { ...settings, apps: newApps };
                    await saveSettingsWithStatus(updatedSettings);
                },
            );
        },
        [settings, saveSettingsWithStatus, appAnimation],
    );

    // Move app down
    const moveAppDown = useCallback(
        async (index) => {
            if (index === (settings?.apps?.length || 0) - 1) return;

            await appAnimation.animateMove(
                index,
                "down",
                `app-down-${index}`,
                async () => {
                    const newApps = [...settings.apps];
                    [newApps[index], newApps[index + 1]] = [
                        newApps[index + 1],
                        newApps[index],
                    ];

                    const updatedSettings = { ...settings, apps: newApps };
                    await saveSettingsWithStatus(updatedSettings);
                },
            );
        },
        [settings, saveSettingsWithStatus, appAnimation],
    );

    // Add app
    const handleAddApp = useCallback(async () => {
        const validation = validateApp(newAppForm.value);
        if (!validation.valid) {
            setBuildStatus(`❌ ${validation.error}`);
            return;
        }

        const appKey = generateUniqueKey(
            map(prop("key"), settings?.apps || []),
            newAppForm.value.name,
        );

        const addOperation = pipe(
            withStatus("App added successfully", "Failed to add app"),
            tapEffect(() => {
                addAppModal.close();
                newAppForm.reset();
            }),
            tapEffect(updateSettings),
        );

        await addOperation(addAppAPI)({
            key: appKey,
            name: trim(newAppForm.value.name),
            path: trim(newAppForm.value.path),
        });
    }, [
        newAppForm,
        settings.apps,
        setBuildStatus,
        withStatus,
        updateSettings,
        addAppModal,
    ]);

    // Remove app
    const handleRemoveApp = useCallback(async () => {
        if (!removeAppModal.data) return;

        const removeOperation = pipe(
            withStatus("App removed successfully", "Failed to remove app"),
            tapEffect(() => removeAppModal.close()),
            tapEffect(updateSettings),
        );

        await removeOperation(removeAppAPI)(removeAppModal.data);
    }, [removeAppModal, withStatus, updateSettings]);

    // Update app
    const handleUpdateApp = useCallback(async () => {
        const validation = validateApp(editingAppForm.value);
        if (!validation.valid) {
            setBuildStatus(`❌ ${validation.error}`);
            return;
        }

        const updateOperation = pipe(
            withStatus("App updated successfully", "Failed to update app"),
            tapEffect(() => {
                setEditingApp(null);
                editingAppForm.reset();
            }),
            tapEffect(updateSettings),
        );

        await updateOperation(updateAppAPI)({
            key: editingApp.key,
            name: trim(editingAppForm.value.name),
            path: trim(editingAppForm.value.path),
        });
    }, [
        editingApp,
        editingAppForm,
        setBuildStatus,
        withStatus,
        updateSettings,
    ]);

    // Start editing app
    const startEditApp = useCallback(
        (app) => {
            setEditingApp(app);
            editingAppForm.setValues({
                name: app.name,
                path: app.path,
            });
        },
        [editingAppForm],
    );

    // Cancel editing
    const cancelEditApp = useCallback(() => {
        setEditingApp(null);
        editingAppForm.reset();
    }, [editingAppForm]);

    return {
        // State
        editingApp,

        // Forms
        newAppForm,
        editingAppForm,

        // Modals
        addAppModal,
        removeAppModal,

        // Animation helpers
        appAnimation,

        // Operations
        handleAppToggle,
        moveAppUp,
        moveAppDown,
        handleAddApp,
        handleRemoveApp,
        handleUpdateApp,
        startEditApp,
        cancelEditApp,
    };
};
