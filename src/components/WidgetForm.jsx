import React from "react";
import { generateKeyFromName } from "../utils/widgetLogic.js";

export const WidgetForm = ({
    title,
    form,
    onSubmit,
    onCancel,
    submitLabel = "Save",
    showKeyPreview = false,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="widget-form">
            <h3>{title}</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Display Name:</label>
                        <input
                            type="text"
                            value={form.value.name}
                            onChange={(e) => form.updateField("name", e.target.value)}
                            placeholder="e.g., My Custom Widget"
                            autoFocus
                        />
                        {showKeyPreview && form.value.name && (
                            <small className="key-preview">
                                Key will be:{" "}
                                <code>{generateKeyFromName(form.value.name)}</code>
                            </small>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Absolute Path:</label>
                        <input
                            type="text"
                            value={form.value.path}
                            onChange={(e) => form.updateField("path", e.target.value)}
                            placeholder="e.g., C:\Users\YourName\Mendix_monorepo\packages\my-custom-widget"
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="save-button">
                        {submitLabel}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
