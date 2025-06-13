import React from "react";

export const LoadingScreen = ({ message = "Loading..." }) => {
    return (
        <main className="container">
            <div className="loading">{message}</div>
        </main>
    );
};
