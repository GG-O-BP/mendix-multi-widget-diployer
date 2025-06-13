import React from "react";

export const StatusSection = ({ status }) => {
    if (!status) return null;

    return (
        <div className="status-section">
            <h3>Build Status</h3>
            <div
                className="status-message"
                style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                }}
            >
                {status}
            </div>
        </div>
    );
};
