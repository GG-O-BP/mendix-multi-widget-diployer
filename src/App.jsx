import { useState, useEffect } from "react";
import "./App.css";

// Import functional utilities
import { pipe, curry, trim, assoc, prop, map } from "./utils/fp.js";

// Import widget business logic
import {
    generateKeyFromName,
    generateUniqueKey,
    createWidget,
    getSelectedWidgets,
    getWidgetPaths,
    validatePaths,
    validateWidget,
    hasSelectedWidgets,
    canBuild,
    toggleWidgetSelection,
    updateSettingsField,
} from "./utils/widgetLogic.js";

// Import effect handlers
import {
    loadSettingsAPI,
    saveSettingsAPI,
    buildWidgetsAPI,
    addWidgetAPI,
    removeWidgetAPI,
    updateWidgetAPI,
    selectFolderDialog,
    withStatusMessage,
    tapEffect,
    tryCatch,
} from "./utils/effects.js";

// ===== CUSTOM HOOKS =====

const useSettings = () => {
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

const useWidgetForm = (initialValue = { name: "", path: "" }) => {
    const [value, setValue] = useState(initialValue);

    const updateField = curry((field, newValue) => {
        setValue((current) => assoc(field, newValue, current));
    });

    const reset = () => setValue(initialValue);

    return { value, updateField, reset };
};

const useModal = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);
    const [data, setData] = useState(null);

    const open = (modalData = null) => {
        setData(modalData);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setData(null);
    };

    return { isOpen, data, open, close };
};

// ===== COMPONENT =====

const App = () => {
    // State management
    const [buildStatus, setBuildStatus] = useState("");
    const [isBuilding, setIsBuilding] = useState(false);
    const { settings, isLoading, error, updateSettings } = useSettings();

    // Form states
    const newWidgetForm = useWidgetForm();
    const [editingWidget, setEditingWidget] = useState(null);
    const editingWidgetForm = useWidgetForm();

    // Modal states
    const addWidgetModal = useModal();
    const removeWidgetModal = useModal();

    // ===== EFFECT COMPOSERS =====

    const withStatus = (successMsg, errorPrefix) =>
        withStatusMessage(setBuildStatus, successMsg, errorPrefix);

    const saveSettingsWithStatus = async (updatedSettings) => {
        const result = await updateSettings(updatedSettings);
        if (!result.success && result.error) {
            setBuildStatus(`❌ ${result.error}`);
        }
        return result;
    };

    // ===== PATH OPERATIONS =====

    const selectPathAndUpdate = curry(async (field, title) => {
        const result = await tryCatch(selectFolderDialog, title);
        if (result.success && result.data) {
            const updatedSettings = updateSettingsField(
                field,
                result.data,
                settings,
            );
            await saveSettingsWithStatus(updatedSettings);
        }
    });

    const handlePathChange = curry((field, value) => {
        const updatedSettings = updateSettingsField(field, value, settings);
        saveSettingsWithStatus(updatedSettings);
    });

    // ===== BUILD OPERATION =====

    const buildWidgets = async () => {
        const validation = validatePaths(settings);
        if (!validation.valid) {
            setBuildStatus(`❌ ${validation.error}`);
            return;
        }

        if (!hasSelectedWidgets(settings)) {
            setBuildStatus("❌ No widgets selected");
            return;
        }

        setIsBuilding(true);
        setBuildStatus("🔄 Starting build process...");

        const buildData = {
            widgets: pipe(
                getSelectedWidgets(settings.selected_widgets),
                getWidgetPaths,
            )(settings.widgets),
            destinationPath: trim(settings.destination_path),
            basePath: trim(settings.base_path),
        };

        const result = await tryCatch(buildWidgetsAPI, buildData);

        if (result.success) {
            setBuildStatus(`✅ ${result.data}`);
        } else {
            setBuildStatus(`❌ ${result.error}`);
        }

        setIsBuilding(false);
    };

    // ===== WIDGET OPERATIONS =====

    const handleWidgetToggle = async (widgetKey) => {
        console.log(
            "Toggling widget:",
            widgetKey,
            "Current value:",
            settings.selected_widgets[widgetKey],
        );
        const updatedSettings = toggleWidgetSelection(widgetKey, settings);
        console.log(
            "Updated settings after toggle:",
            updatedSettings.selected_widgets[widgetKey],
        );
        await saveSettingsWithStatus(updatedSettings);
    };

    const handleAddWidget = async () => {
        const validation = validateWidget(newWidgetForm.value);
        if (!validation.valid) {
            setBuildStatus(`❌ ${validation.error}`);
            return;
        }

        const existingKeys = map(prop("key"), settings.widgets);
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
    };

    const handleRemoveWidget = async () => {
        if (!removeWidgetModal.data) return;

        const removeOperation = pipe(
            withStatus(
                "Widget removed successfully",
                "Failed to remove widget",
            ),
            tapEffect(() => removeWidgetModal.close()),
            tapEffect(updateSettings),
        );

        await removeOperation(removeWidgetAPI)(removeWidgetModal.data.key);
    };

    const handleUpdateWidget = async () => {
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
    };

    const startEditWidget = (widget) => {
        setEditingWidget(widget);
        editingWidgetForm.updateField("name", widget.name);
        editingWidgetForm.updateField("path", widget.path);
    };

    const cancelEdit = () => {
        setEditingWidget(null);
        editingWidgetForm.reset();
    };

    // ===== RENDER CONDITIONS =====

    if (isLoading) {
        return (
            <main className="container">
                <div className="loading">Loading settings...</div>
            </main>
        );
    }

    if (error || !settings) {
        return (
            <main className="container">
                <div className="error">
                    {error || "Failed to load settings"}
                </div>
            </main>
        );
    }

    // ===== MAIN RENDER =====

    return (
        <main className="container">
            <h1>Mendix Multi Widget Diployer</h1>
            <p>Build and deploy Mendix widgets automatically</p>

            <div className="section">
                <div className="section-header">
                    <h2>Select Widgets to Build</h2>
                    <button
                        type="button"
                        onClick={addWidgetModal.open}
                        className="add-widget-button"
                    >
                        Add Widget
                    </button>
                </div>

                {/* Add Widget Form */}
                {addWidgetModal.isOpen && (
                    <div className="widget-form">
                        <h3>Add New Widget</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Display Name:</label>
                                <input
                                    type="text"
                                    value={newWidgetForm.value.name}
                                    onChange={(e) =>
                                        newWidgetForm.updateField(
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., My Custom Widget"
                                />
                                {newWidgetForm.value.name && (
                                    <small className="key-preview">
                                        Key will be:{" "}
                                        <code>
                                            {generateKeyFromName(
                                                newWidgetForm.value.name,
                                            )}
                                        </code>
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>
                                    Path (relative to packages folder):
                                </label>
                                <input
                                    type="text"
                                    value={newWidgetForm.value.path}
                                    onChange={(e) =>
                                        newWidgetForm.updateField(
                                            "path",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., my-custom-widget"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleAddWidget}
                                className="save-button"
                            >
                                Add Widget
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    addWidgetModal.close();
                                    newWidgetForm.reset();
                                }}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="widget-list">
                    {settings.widgets.map((widget) => (
                        <div key={widget.key} className="widget-item-container">
                            {editingWidget &&
                            editingWidget.key === widget.key ? (
                                <div className="widget-edit-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Display Name:</label>
                                            <input
                                                type="text"
                                                value={
                                                    editingWidgetForm.value.name
                                                }
                                                onChange={(e) =>
                                                    editingWidgetForm.updateField(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Path:</label>
                                            <input
                                                type="text"
                                                value={
                                                    editingWidgetForm.value.path
                                                }
                                                onChange={(e) =>
                                                    editingWidgetForm.updateField(
                                                        "path",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={handleUpdateWidget}
                                            className="save-button"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="cancel-button"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="widget-item">
                                    <label className="widget-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={
                                                (settings.selected_widgets &&
                                                    settings.selected_widgets[
                                                        widget.key
                                                    ]) ||
                                                false
                                            }
                                            onChange={() =>
                                                handleWidgetToggle(widget.key)
                                            }
                                        />
                                        <div className="widget-info">
                                            <span className="widget-name">
                                                {widget.name}
                                            </span>
                                            <span className="widget-path">
                                                ({widget.path})
                                            </span>
                                        </div>
                                    </label>
                                    <div className="widget-actions">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                startEditWidget(widget)
                                            }
                                            className="edit-button"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeWidgetModal.open(widget)
                                            }
                                            className="remove-button"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="section">
                <h2>Base Path (Mendix widget packages)</h2>
                <div className="path-selector">
                    <input
                        type="text"
                        value={settings.base_path}
                        onChange={(e) =>
                            handlePathChange("base_path", e.target.value)
                        }
                        onBlur={() => saveSettingsWithStatus(settings)}
                        placeholder="Enter base path to Mendix widget packages (e.g., C:\Users\YourName\Mendix_monorepo\packages)"
                        className="path-input"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            selectPathAndUpdate(
                                "base_path",
                                "Select Mendix widget packages base folder",
                            )
                        }
                        className="browse-button"
                    >
                        Browse
                    </button>
                </div>
            </div>

            <div className="section">
                <h2>Destination Path</h2>
                <div className="path-selector">
                    <input
                        type="text"
                        value={settings.destination_path}
                        onChange={(e) =>
                            handlePathChange("destination_path", e.target.value)
                        }
                        onBlur={() => saveSettingsWithStatus(settings)}
                        placeholder="Enter destination path for .mpk files"
                        className="path-input"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            selectPathAndUpdate(
                                "destination_path",
                                "Select destination folder for .mpk files",
                            )
                        }
                        className="browse-button"
                    >
                        Browse
                    </button>
                </div>
            </div>

            <div className="section">
                <button
                    onClick={buildWidgets}
                    disabled={isBuilding || !canBuild(settings)}
                    className="build-button"
                >
                    {isBuilding ? "Building..." : "Build & Deploy Widgets"}
                </button>
            </div>

            {buildStatus && (
                <div className="status-section">
                    <h3>Build Status</h3>
                    <div
                        className="status-message"
                        style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                        }}
                    >
                        {buildStatus}
                    </div>
                </div>
            )}

            {/* Remove Widget Confirmation Modal */}
            {removeWidgetModal.isOpen && removeWidgetModal.data && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Remove Widget</h3>
                        <p>
                            Are you sure you want to remove the following
                            widget?
                        </p>
                        <div className="widget-details">
                            <div>
                                <strong>Name:</strong>{" "}
                                {removeWidgetModal.data.name}
                            </div>
                            <div>
                                <strong>Path:</strong>{" "}
                                {removeWidgetModal.data.path}
                            </div>
                        </div>
                        <p className="warning-text">
                            This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button
                                type="button"
                                onClick={handleRemoveWidget}
                                className="confirm-button"
                            >
                                Yes, Remove
                            </button>
                            <button
                                type="button"
                                onClick={removeWidgetModal.close}
                                className="cancel-button"
                            >
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default App;
