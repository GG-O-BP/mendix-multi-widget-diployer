import {
    pipe,
    curry,
    when,
    trim,
    toLowerCase,
    isEmpty,
    isNotEmpty,
    filter,
    map,
    includes,
    assoc,
    prop,
    identity,
} from "./fp.js";

// ===== KEY GENERATION FUNCTIONS =====

// Sanitize a string to be used as a key
export const sanitizeForKey = pipe(
    toLowerCase,
    (str) => str.replace(/[^a-z0-9\s-]/g, ""),
    trim,
    (str) => str.replace(/\s+/g, "-"),
    (str) => str.replace(/-+/g, "-"),
    (str) => str.replace(/^-|-$/g, ""),
);

// Generate a key from a name
export const generateKeyFromName = (name) =>
    when(isNotEmpty, sanitizeForKey)(name);

// Generate a unique key given existing keys and a base name
export const generateUniqueKey = curry((existingKeys, baseName) => {
    const baseKey = generateKeyFromName(baseName);
    if (!baseKey) return `widget-${Date.now()}`;

    const keyExists = includes(baseKey);
    if (!keyExists(existingKeys)) return baseKey;

    const findAvailableKey = (counter) => {
        const candidateKey = `${baseKey}-${counter}`;
        return keyExists(existingKeys)(candidateKey)
            ? findAvailableKey(counter + 1)
            : candidateKey;
    };

    return findAvailableKey(1);
});

// ===== WIDGET DATA TRANSFORMATIONS =====

// Create a widget object
export const createWidget = curry((key, name, path) => ({ key, name, path }));

// Get only selected widgets
export const getSelectedWidgets = curry((selectedWidgets, widgets) =>
    filter(
        (widget) => selectedWidgets && selectedWidgets[widget.key] === true,
        widgets,
    ),
);

// Get widget paths from widgets array
export const getWidgetPaths = map(prop("path"));

// ===== APP DATA TRANSFORMATIONS =====

// Get only selected apps
export const getSelectedApps = curry((selectedApps, apps) =>
    filter((app) => selectedApps && selectedApps[app.key] === true, apps),
);

// Get app paths from apps array
export const getAppPaths = map(prop("path"));

// ===== SETTINGS TRANSFORMATIONS =====

// Toggle widget selection
export const toggleWidgetSelection = curry((widgetKey, settings) => {
    const currentValue = settings.selected_widgets?.[widgetKey] || false;
    return assoc(
        "selected_widgets",
        assoc(widgetKey, !currentValue, settings.selected_widgets || {}),
        settings,
    );
});

// Toggle app selection
export const toggleAppSelection = curry((appKey, settings) => {
    const currentValue = settings.selected_apps?.[appKey] || false;
    return assoc(
        "selected_apps",
        assoc(appKey, !currentValue, settings.selected_apps || {}),
        settings,
    );
});

// ===== VALIDATION FUNCTIONS =====

// Validate that paths are not empty
export const validatePaths = (settings) => {
    if (!settings.apps || settings.apps.length === 0) {
        return { valid: false, error: "Please add at least one Mendix app" };
    }
    const selectedAppsCount = settings.selected_apps
        ? Object.values(settings.selected_apps).filter(identity).length
        : 0;
    if (selectedAppsCount === 0) {
        return {
            valid: false,
            error: "Please select at least one Mendix app for deployment",
        };
    }
    return { valid: true };
};

// Validate widget data
export const validateWidget = (widget) => {
    if (isEmpty(widget.name)) {
        return { valid: false, error: "Name is required for widget" };
    }
    if (isEmpty(widget.path)) {
        return { valid: false, error: "Path is required for widget" };
    }
    return { valid: true };
};

// Validate app data
export const validateApp = (app) => {
    if (isEmpty(app.name)) {
        return { valid: false, error: "Name is required for app" };
    }
    if (isEmpty(app.path)) {
        return { valid: false, error: "Path is required for app" };
    }
    return { valid: true };
};

// Check if any widgets are selected
export const hasSelectedWidgets = (settings) =>
    settings.selected_widgets &&
    Object.values(settings.selected_widgets).some(identity);

// Check if any apps are selected
export const hasSelectedApps = (settings) =>
    settings.selected_apps &&
    Object.values(settings.selected_apps).some(identity);

// Check if build is possible
export const canBuild = (settings) =>
    settings && hasSelectedWidgets(settings) && hasSelectedApps(settings);
