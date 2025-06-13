import React from "react";
import "./App.css";

// Import hooks
import {
    useSettings,
    useBuildOperations,
    useWidgetManagement,
    useAppManagement,
} from "./hooks";

// Import components
import {
    Header,
    LoadingScreen,
    ErrorScreen,
    StatusSection,
    BuildSection,
    WidgetList,
    AppList,
    ConfirmationModal,
} from "./components";

const App = () => {
    // Core state management
    const { settings, isLoading, error, updateSettings } = useSettings();
    const { buildStatus, isBuilding, buildWidgets, setBuildStatus } =
        useBuildOperations();

    // Widget and App management
    const widgetManagement = useWidgetManagement(
        settings || { widgets: [], selected_widgets: {} },
        updateSettings,
        setBuildStatus,
    );
    const appManagement = useAppManagement(
        settings || { apps: [], selected_apps: {} },
        updateSettings,
        setBuildStatus,
    );

    // Handle build operation
    const handleBuild = () => buildWidgets(settings);

    // Render loading state
    if (isLoading) {
        return <LoadingScreen message="Loading settings..." />;
    }

    // Render error state
    if (error || !settings) {
        return <ErrorScreen error={error || "Failed to load settings"} />;
    }

    // Main render
    return (
        <main className="container">
            <Header />

            <WidgetList
                widgets={settings.widgets}
                selectedWidgets={settings.selected_widgets}
                widgetManagement={widgetManagement}
            />

            <AppList
                apps={settings.apps}
                selectedApps={settings.selected_apps}
                appManagement={appManagement}
            />

            <BuildSection
                settings={settings}
                isBuilding={isBuilding}
                onBuild={handleBuild}
            />

            <StatusSection status={buildStatus} />

            {/* Widget Removal Confirmation Modal */}
            <ConfirmationModal
                isOpen={widgetManagement.removeWidgetModal.isOpen}
                title="Remove Widget"
                message="Are you sure you want to remove the following widget?"
                details={
                    widgetManagement.removeWidgetModal.data && {
                        Name: widgetManagement.removeWidgetModal.data.name,
                        Path: widgetManagement.removeWidgetModal.data.path,
                    }
                }
                warningText="This action cannot be undone."
                confirmText="Yes, Remove"
                cancelText="No, Cancel"
                onConfirm={widgetManagement.handleRemoveWidget}
                onCancel={widgetManagement.removeWidgetModal.close}
            />

            {/* App Removal Confirmation Modal */}
            <ConfirmationModal
                isOpen={appManagement.removeAppModal.isOpen}
                title="Remove App"
                message="Are you sure you want to remove the following app?"
                details={
                    appManagement.removeAppModal.data && {
                        Name: settings.apps?.find(
                            (app) =>
                                app.key === appManagement.removeAppModal.data,
                        )?.name,
                        Path: settings.apps?.find(
                            (app) =>
                                app.key === appManagement.removeAppModal.data,
                        )?.path,
                    }
                }
                warningText="This action cannot be undone."
                confirmText="Yes, Remove"
                cancelText="No, Cancel"
                onConfirm={appManagement.handleRemoveApp}
                onCancel={appManagement.removeAppModal.close}
            />
        </main>
    );
};

export default App;
