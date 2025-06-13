import { useState } from "react";
import { pipe } from "../utils/fp.js";
import {
    validatePaths,
    hasSelectedWidgets,
    getSelectedWidgets,
    getSelectedApps,
    getWidgetPaths,
    getAppPaths,
} from "../utils/widgetLogic.js";
import { tryCatch, buildWidgetsAPI } from "../utils/effects.js";

export const useBuildOperations = () => {
    const [buildStatus, setBuildStatus] = useState("");
    const [isBuilding, setIsBuilding] = useState(false);

    const buildWidgets = async (settings) => {
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

    const clearStatus = () => setBuildStatus("");

    return {
        buildStatus,
        isBuilding,
        buildWidgets,
        setBuildStatus,
        clearStatus,
    };
};
