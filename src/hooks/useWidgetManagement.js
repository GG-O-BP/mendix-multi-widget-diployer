import { useState, useCallback } from "react";
import { pipe, map, prop, trim } from "../utils/fp.js";
import {
    generateUniqueKey,
    createWidget,
    toggleWidgetSelection,
    validateWidget,
} from "../utils/widgetLogic.js";
import {
    addWidgetAPI,
    removeWidgetAPI,
    updateWidgetAPI,
    withStatusMessage,
    tapEffect,
} from "../utils/effects.js";
import { useForm } from "./useForm.js";
import { useModal } from "./useModal.js";
import { useListAnimation } from "./useListAnimation.js";

export const useWidgetManagement = (
    settings,
    updateSettings,
    setBuildStatus,
) => {
    const [editingWidget, setEditingWidget] = useState(null);

    // Forms
    const newWidgetForm = useForm({ name: "", path: "" });
    const editingWidgetForm = useForm({ name: "", path: "" });

    // Modals
    const addWidgetModal = useModal();
    const removeWidgetModal = useModal();

    // Animations
    const widgetAnimation = useListAnimation();

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

    // Toggle widget selection
    const handleWidgetToggle = useCallback(
        async (widgetKey) => {
            console.log(
                "Toggling widget:",
                widgetKey,
                "Current value:",
                settings?.selected_widgets?.[widgetKey],
            );
            const updatedSettings = toggleWidgetSelection(
                widgetKey,
                settings || {},
            );
            console.log(
                "Updated settings after toggle:",
                updatedSettings.selected_widgets[widgetKey],
            );
            await saveSettingsWithStatus(updatedSettings);
        },
        [settings, saveSettingsWithStatus],
    );

    // Move widget up
    const moveWidgetUp = useCallback(
        async (index) => {
            if (index === 0) return;

            await widgetAnimation.animateMove(
                index,
                "up",
                `widget-up-${index}`,
                async () => {
                    const newWidgets = [...settings.widgets];
                    [newWidgets[index - 1], newWidgets[index]] = [
                        newWidgets[index],
                        newWidgets[index - 1],
                    ];

                    const updatedSettings = {
                        ...settings,
                        widgets: newWidgets,
                    };
                    await saveSettingsWithStatus(updatedSettings);
                },
            );
        },
        [settings, saveSettingsWithStatus, widgetAnimation],
    );

    // Move widget down
    const moveWidgetDown = useCallback(
        async (index) => {
            if (index === (settings?.widgets?.length || 0) - 1) return;

            await widgetAnimation.animateMove(
                index,
                "down",
                `widget-down-${index}`,
                async () => {
                    const newWidgets = [...settings.widgets];
                    [newWidgets[index], newWidgets[index + 1]] = [
                        newWidgets[index + 1],
                        newWidgets[index],
                    ];

                    const updatedSettings = {
                        ...settings,
                        widgets: newWidgets,
                    };
                    await saveSettingsWithStatus(updatedSettings);
                },
            );
        },
        [settings, saveSettingsWithStatus, widgetAnimation],
    );

    // Add widget
    const handleAddWidget = useCallback(async () => {
        const validation = validateWidget(newWidgetForm.value);
        if (!validation.valid) {
            setBuildStatus(`❌ ${validation.error}`);
            return;
        }

        const existingKeys = map(prop("key"), settings?.widgets || []);
        const widget = createWidget(
            generateUniqueKey(existingKeys, trim(newWidgetForm.value.name)),
            trim(newWidgetForm.value.name),
            trim(newWidgetForm.value.path),
        );

        const addOperation = pipe(
            withStatus("Widget added successfully", "Failed to add widget"),
            tapEffect(() => {
                newWidgetForm.reset();
                addWidgetModal.close();
            }),
            tapEffect(updateSettings),
        );

        await addOperation(addWidgetAPI)(widget);
    }, [
        newWidgetForm,
        settings.widgets,
        setBuildStatus,
        withStatus,
        updateSettings,
        addWidgetModal,
    ]);

    // Remove widget
    const handleRemoveWidget = useCallback(async () => {
        if (!removeWidgetModal.data) return;

        const removeOperation = pipe(
            withStatus(
                "Widget removed successfully",
                "Failed to remove widget",
            ),
            tapEffect(() => removeWidgetModal.close()),
            tapEffect(updateSettings),
        );

        await removeOperation(removeWidgetAPI)(removeWidgetModal.data);
    }, [removeWidgetModal, withStatus, updateSettings]);

    // Update widget
    const handleUpdateWidget = useCallback(async () => {
        const validation = validateWidget(editingWidgetForm.value);
        if (!validation.valid) {
            setBuildStatus(`❌ ${validation.error}`);
            return;
        }

        const updateOperation = pipe(
            withStatus(
                "Widget updated successfully",
                "Failed to update widget",
            ),
            tapEffect(() => {
                setEditingWidget(null);
                editingWidgetForm.reset();
            }),
            tapEffect(updateSettings),
        );

        await updateOperation(updateWidgetAPI)({
            key: editingWidget.key,
            name: trim(editingWidgetForm.value.name),
            path: trim(editingWidgetForm.value.path),
        });
    }, [
        editingWidget,
        editingWidgetForm,
        setBuildStatus,
        withStatus,
        updateSettings,
    ]);

    // Start editing widget
    const startEditWidget = useCallback(
        (widget) => {
            setEditingWidget(widget);
            editingWidgetForm.setValues({
                name: widget.name,
                path: widget.path,
            });
        },
        [editingWidgetForm],
    );

    // Cancel editing
    const cancelEditWidget = useCallback(() => {
        setEditingWidget(null);
        editingWidgetForm.reset();
    }, [editingWidgetForm]);

    return {
        // State
        editingWidget,

        // Forms
        newWidgetForm,
        editingWidgetForm,

        // Modals
        addWidgetModal,
        removeWidgetModal,

        // Animation helpers
        widgetAnimation,

        // Operations
        handleWidgetToggle,
        moveWidgetUp,
        moveWidgetDown,
        handleAddWidget,
        handleRemoveWidget,
        handleUpdateWidget,
        startEditWidget,
        cancelEditWidget,
    };
};
