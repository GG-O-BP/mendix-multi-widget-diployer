import React from "react";

export const ErrorScreen = ({ error }) => {
    return (
        <main className="container">
            <div className="error">
                {error || "An error occurred"}
            </div>
        </main>
    );
};
