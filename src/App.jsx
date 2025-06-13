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
    getSelectedApps,
    getWidgetPaths,
    getAppPaths,
    validatePaths,
    validateWidget,
    validateApp,
    hasSelectedWidgets,
    canBuild,
    toggleWidgetSelection,
    toggleAppSelection,
} from "./utils/widgetLogic.js";

// Import effect handlers
import {
    loadSettingsAPI,
    saveSettingsAPI,
    buildWidgetsAPI,
    addWidgetAPI,
    removeWidgetAPI,
    updateWidgetAPI,
    addAppAPI,
    removeAppAPI,
    updateAppAPI,
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

    const newAppForm = useWidgetForm();
    const [editingApp, setEditingApp] = useState(null);
    const editingAppForm = useWidgetForm();

    // Modal states
    const addWidgetModal = useModal();
    const removeWidgetModal = useModal();
    const addAppModal = useModal();
    const removeAppModal = useModal();

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
            destinationApps: pipe(
                getSelectedApps(settings.selected_apps),
                getAppPaths,
            )(settings.apps || []),
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

    // ===== APP OPERATIONS =====

    const handleAppToggle = async (appKey) => {
        console.log(
            "Toggling app:",
            appKey,
            "Current value:",
            settings.selected_apps[appKey],
        );
        const updatedSettings = toggleAppSelection(appKey, settings);
        await saveSettingsWithStatus(updatedSettings);
    };

    const handleAddApp = async () => {
        const validation = validateApp(newAppForm.value);
        if (!validation.valid) {
            setBuildStatus(`❌ ${validation.error}`);
            return;
        }

        const appKey = generateUniqueKey(
            map(prop("key"), settings.apps || []),
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
    };

    const handleRemoveApp = async () => {
        const removeOperation = pipe(
            withStatus("App removed successfully", "Failed to remove app"),
            tapEffect(() => removeAppModal.close()),
            tapEffect(updateSettings),
        );

        await removeOperation(removeAppAPI)(removeAppModal.data);
    };

    const handleUpdateApp = async () => {
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
    };

    const startEditApp = (app) => {
        setEditingApp(app);
        editingAppForm.updateField("name", app.name);
        editingAppForm.updateField("path", app.path);
    };

    const cancelEditApp = () => {
        setEditingApp(null);
        editingAppForm.reset();
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
                                <label>Absolute Path:</label>
                                <input
                                    type="text"
                                    value={newWidgetForm.value.path}
                                    onChange={(e) =>
                                        newWidgetForm.updateField(
                                            "path",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., C:\Users\YourName\Mendix_monorepo\packages\my-custom-widget"
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
                <div className="section-header">
                    <h2>Deploy to Mendix Apps</h2>
                    <button
                        type="button"
                        onClick={addAppModal.open}
                        className="add-widget-button"
                    >
                        Add App
                    </button>
                </div>

                {/* Add App Form */}
                {addAppModal.isOpen && (
                    <div className="widget-form">
                        <h3>Add New App</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>App Name:</label>
                                <input
                                    type="text"
                                    value={newAppForm.value.name}
                                    onChange={(e) =>
                                        newAppForm.updateField(
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., My Mendix App"
                                />
                                {newAppForm.value.name && (
                                    <small className="key-preview">
                                        Key will be:{" "}
                                        <code>
                                            {generateKeyFromName(
                                                newAppForm.value.name,
                                            )}
                                        </code>
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>App Widgets Path:</label>
                                <input
                                    type="text"
                                    value={newAppForm.value.path}
                                    onChange={(e) =>
                                        newAppForm.updateField(
                                            "path",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g., C:\Users\YourName\Documents\Mendix\MyApp\widgets"
                                />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleAddApp}
                                className="save-button"
                            >
                                Add App
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    addAppModal.close();
                                    newAppForm.reset();
                                }}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Remove App Confirmation */}
                {removeAppModal.isOpen && (
                    <div className="remove-confirmation">
                        <p>Are you sure you want to remove this app?</p>
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleRemoveApp}
                                className="remove-button"
                            >
                                Remove
                            </button>
                            <button
                                type="button"
                                onClick={removeAppModal.close}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="widget-list">
                    {(settings.apps || []).map((app) => (
                        <div key={app.key} className="widget-item-container">
                            {editingApp && editingApp.key === app.key ? (
                                <div className="widget-edit-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>App Name:</label>
                                            <input
                                                type="text"
                                                value={
                                                    editingAppForm.value.name
                                                }
                                                onChange={(e) =>
                                                    editingAppForm.updateField(
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
                                                    editingAppForm.value.path
                                                }
                                                onChange={(e) =>
                                                    editingAppForm.updateField(
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
                                            onClick={handleUpdateApp}
                                            className="save-button"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEditApp}
                                            className="cancel-button"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="widget-item">
                                    <label className="widget-label">
                                        <input
                                            type="checkbox"
                                            checked={
                                                (settings.selected_apps &&
                                                    settings.selected_apps[
                                                        app.key
                                                    ]) ||
                                                false
                                            }
                                            onChange={() =>
                                                handleAppToggle(app.key)
                                            }
                                        />
                                        <div className="widget-info">
                                            <span className="widget-name">
                                                {app.name}
                                            </span>
                                            <span className="widget-path">
                                                ({app.path})
                                            </span>
                                        </div>
                                    </label>
                                    <div className="widget-actions">
                                        <button
                                            type="button"
                                            onClick={() => startEditApp(app)}
                                            className="edit-button"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeAppModal.open(app.key)
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
