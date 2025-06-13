import React from "react";

export const WidgetItem = ({
    widget,
    index,
    isSelected,
    isEditing,
    editForm,
    animationClass,
    upButtonClass,
    downButtonClass,
    isFirstItem,
    isLastItem,
    isAnimating,
    onToggle,
    onMoveUp,
    onMoveDown,
    onEdit,
    onRemove,
    onUpdate,
    onCancelEdit,
}) => {
    if (isEditing) {
        return (
            <div className="widget-edit-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Display Name:</label>
                        <input
                            type="text"
                            value={editForm.value.name}
                            onChange={(e) => editForm.updateField("name", e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Path:</label>
                        <input
                            type="text"
                            value={editForm.value.path}
                            onChange={(e) => editForm.updateField("path", e.target.value)}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onUpdate} className="save-button">
                        Save
                    </button>
                    <button type="button" onClick={onCancelEdit} className="cancel-button">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="widget-item">
            <label className="widget-checkbox">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(widget.key)}
                />
                <div className="widget-info">
                    <span className="widget-name">{widget.name}</span>
                    <span className="widget-path">({widget.path})</span>
                </div>
            </label>
            <div className="widget-actions">
                <button
                    type="button"
                    onClick={() => onMoveUp(index)}
                    className={`order-button ${upButtonClass}`}
                    disabled={isFirstItem || isAnimating}
                    title="Move up"
                >
                    ↑
                </button>
                <button
                    type="button"
                    onClick={() => onMoveDown(index)}
                    className={`order-button ${downButtonClass}`}
                    disabled={isLastItem || isAnimating}
                    title="Move down"
                >
                    ↓
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(widget)}
                    className="edit-button"
                >
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(widget)}
                    className="remove-button"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};
