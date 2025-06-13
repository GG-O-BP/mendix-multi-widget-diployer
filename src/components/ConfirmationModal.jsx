import React from "react";

export const ConfirmationModal = ({
    isOpen,
    title,
    message,
    details,
    warningText,
    confirmText = "Yes, Confirm",
    cancelText = "No, Cancel",
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                {message && <p>{message}</p>}

                {details && (
                    <div className="widget-details">
                        {Object.entries(details).map(([key, value]) => (
                            <div key={key}>
                                <strong>{key}:</strong> {value}
                            </div>
                        ))}
                    </div>
                )}

                {warningText && <p className="warning-text">{warningText}</p>}

                <div className="modal-actions">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="confirm-button"
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cancel-button"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};
