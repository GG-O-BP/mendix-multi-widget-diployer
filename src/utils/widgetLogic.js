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

// Create an app object
export const createApp = curry((key, name, path) => ({ key, name, path }));

// Update a widget in the widgets array
export const updateWidget = curry((key, name, path, widgets) =>
    map(
        (widget) =>
            widget.key === key ? createWidget(key, name, path) : widget,
        widgets,
    ),
);

// Remove a widget from the widgets array
export const removeWidget = curry((key, widgets) =>
    filter((widget) => widget.key !== key, widgets),
);

// Get only selected widgets
export const getSelectedWidgets = curry((selectedWidgets, widgets) =>
    filter(
        (widget) => selectedWidgets && selectedWidgets[widget.key] === true,
        widgets,
    ),
);

// Get widget paths from widgets array
export const getWidgetPaths = map(prop("path"));

// Find widget by key
export const findWidgetByKey = curry((key, widgets) =>
    widgets.find((widget) => widget.key === key),
);

// Check if widget key exists
export const widgetKeyExists = curry((key, widgets) =>
    widgets.some((widget) => widget.key === key),
);

// ===== APP DATA TRANSFORMATIONS =====

// Update an app in the apps array
export const updateApp = curry((key, name, path, apps) =>
    map((app) => (app.key === key ? createApp(key, name, path) : app), apps),
);

// Remove an app from the apps array
export const removeApp = curry((key, apps) =>
    filter((app) => app.key !== key, apps),
);

// Get only selected apps
export const getSelectedApps = curry((selectedApps, apps) =>
    filter((app) => selectedApps && selectedApps[app.key] === true, apps),
);

// Get app paths from apps array
export const getAppPaths = map(prop("path"));

// Find app by key
export const findAppByKey = curry((key, apps) =>
    apps.find((app) => app.key === key),
);

// Check if app key exists
export const appKeyExists = curry((key, apps) =>
    apps.some((app) => app.key === key),
);

// ===== SETTINGS TRANSFORMATIONS =====

// Update a single field in settings
export const updateSettingsField = curry((field, value, settings) =>
    assoc(field, value, settings),
);

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

// Add a new widget to settings
export const addWidgetToSettings = curry((widget, settings) => ({
    ...settings,
    widgets: [...settings.widgets, widget],
    selected_widgets: {
        ...settings.selected_widgets,
        [widget.key]: false,
    },
}));

// Remove a widget from settings
export const removeWidgetFromSettings = curry((key, settings) => ({
    ...settings,
    widgets: removeWidget(key, settings.widgets),
    selected_widgets: (() => {
        const { [key]: _, ...rest } = settings.selected_widgets;
        return rest;
    })(),
}));

// Update a widget in settings
export const updateWidgetInSettings = curry((key, name, path, settings) => ({
    ...settings,
    widgets: updateWidget(key, name, path, settings.widgets),
}));

// Add a new app to settings
export const addAppToSettings = curry((app, settings) => ({
    ...settings,
    apps: [...(settings.apps || []), app],
    selected_apps: {
        ...(settings.selected_apps || {}),
        [app.key]: false,
    },
}));

// Remove an app from settings
export const removeAppFromSettings = curry((key, settings) => ({
    ...settings,
    apps: removeApp(key, settings.apps || []),
    selected_apps: (() => {
        const { [key]: _, ...rest } = settings.selected_apps || {};
        return rest;
    })(),
}));

// Update an app in settings
export const updateAppInSettings = curry((key, name, path, settings) => ({
    ...settings,
    apps: updateApp(key, name, path, settings.apps || []),
}));

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

// ===== WIDGET LIST OPERATIONS =====

// Sort widgets by name
export const sortWidgetsByName = (widgets) =>
    [...widgets].sort((a, b) => a.name.localeCompare(b.name));

// Sort widgets by key
export const sortWidgetsByKey = (widgets) =>
    [...widgets].sort((a, b) => a.key.localeCompare(b.key));

// Group widgets by first letter of name
export const groupWidgetsByFirstLetter = (widgets) =>
    widgets.reduce((acc, widget) => {
        const firstLetter = widget.name[0].toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(widget);
        return acc;
    }, {});

// Filter widgets by search term
export const filterWidgetsBySearch = curry((searchTerm, widgets) => {
    const term = toLowerCase(trim(searchTerm));
    if (isEmpty(term)) return widgets;

    return filter(
        (widget) =>
            toLowerCase(widget.name).includes(term) ||
            toLowerCase(widget.path).includes(term) ||
            toLowerCase(widget.key).includes(term),
        widgets,
    );
});

// Get widget statistics
export const getWidgetStats = (settings) => {
    const selectedCount = settings.selected_widgets
        ? Object.values(settings.selected_widgets).filter(identity).length
        : 0;
    return {
        total: settings.widgets.length,
        selected: selectedCount,
        unselected: settings.widgets.length - selectedCount,
    };
};

// ===== PATH OPERATIONS =====

// Normalize path separators
export const normalizePath = (path) => path.replace(/[\\\/]+/g, "/");

// Join paths
export const joinPaths = (...paths) =>
    normalizePath(paths.filter(isNotEmpty).join("/"));

// Get parent path
export const getParentPath = (path) => {
    const normalized = normalizePath(path);
    const lastSlash = normalized.lastIndexOf("/");
    return lastSlash === -1 ? "" : normalized.substring(0, lastSlash);
};

// Get filename from path
export const getFilename = (path) => {
    const normalized = normalizePath(path);
    const lastSlash = normalized.lastIndexOf("/");
    return lastSlash === -1 ? normalized : normalized.substring(lastSlash + 1);
};

// ===== BATCH OPERATIONS =====

// Select all widgets
export const selectAllWidgets = (settings) => ({
    ...settings,
    selected_widgets: settings.widgets.reduce(
        (acc, widget) => ({ ...acc, [widget.key]: true }),
        {},
    ),
});

// Deselect all widgets
export const deselectAllWidgets = (settings) => ({
    ...settings,
    selected_widgets: settings.widgets.reduce(
        (acc, widget) => ({ ...acc, [widget.key]: false }),
        {},
    ),
});

// Toggle all widgets
export const toggleAllWidgets = (settings) => {
    const allSelected =
        settings.selected_widgets &&
        settings.widgets.every(
            (widget) => settings.selected_widgets[widget.key],
        );
    return allSelected
        ? deselectAllWidgets(settings)
        : selectAllWidgets(settings);
};

// Select widgets by predicate
export const selectWidgetsByPredicate = curry((predicate, settings) => ({
    ...settings,
    selected_widgets: settings.widgets.reduce(
        (acc, widget) => ({
            ...acc,
            [widget.key]: predicate(widget),
        }),
        {},
    ),
}));
