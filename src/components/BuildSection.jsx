import React from "react";
import { canBuild } from "../utils/widgetLogic.js";

export const BuildSection = ({ settings, isBuilding, onBuild }) => {
    return (
        <div className="section">
            <button
                onClick={onBuild}
                disabled={isBuilding || !canBuild(settings)}
                className="build-button"
            >
                {isBuilding ? "Building..." : "Build & Deploy Widgets"}
            </button>
        </div>
    );
};
