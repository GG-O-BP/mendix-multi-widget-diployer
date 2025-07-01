import React from "react";
import { WidgetItem } from "./WidgetItem.jsx";
import { WidgetForm } from "./WidgetForm.jsx";

export const WidgetList = ({ widgets, selectedWidgets, widgetManagement }) => {
    const {
        editingWidget,
        newWidgetForm,
        editingWidgetForm,
        addWidgetModal,
        widgetAnimation,
        handleWidgetToggle,
        moveWidgetUp,
        moveWidgetDown,
        handleAddWidget,
        startEditWidget,
        cancelEditWidget,
        handleUpdateWidget,
    } = widgetManagement;

    return (
        <div className="section">
            <div className="section-header">
                <h2>Select Widgets to Build</h2>
                <button
                    type="button"
                    onClick={addWidgetModal.open}
                    className="add-widget-button"
                >
                    Add Widget
                </button>
            </div>

            {/* Add Widget Form */}
            {addWidgetModal.isOpen && (
                <WidgetForm
                    title="Add New Widget"
                    form={newWidgetForm}
                    onSubmit={handleAddWidget}
                    onCancel={() => {
                        addWidgetModal.close();
                        newWidgetForm.reset();
                    }}
                    submitLabel="Add Widget"
                    showKeyPreview={true}
                    urlPlaceholder="e.g., C:\Users\YourName\Mendix_monorepo\packages\my-custom-widget"
                />
            )}

            <div className="widget-list">
                {(widgets || []).map((widget, index) => (
                    <div
                        key={widget.key}
                        className={`widget-item-container ${widgetAnimation.getItemClassName(index)}`}
                    >
                        <WidgetItem
                            widget={widget}
                            index={index}
                            isSelected={selectedWidgets?.[widget.key] || false}
                            isEditing={editingWidget?.key === widget.key}
                            editForm={editingWidgetForm}
                            animationClass={widgetAnimation.getItemClassName(
                                index,
                            )}
                            upButtonClass={widgetAnimation.getButtonClassName(
                                `widget-up-${index}`,
                            )}
                            downButtonClass={widgetAnimation.getButtonClassName(
                                `widget-down-${index}`,
                            )}
                            isFirstItem={index === 0}
                            isLastItem={index === (widgets || []).length - 1}
                            isAnimating={widgetAnimation.isAnimating()}
                            onToggle={handleWidgetToggle}
                            onMoveUp={moveWidgetUp}
                            onMoveDown={moveWidgetDown}
                            onEdit={startEditWidget}
                            onRemove={(widget) =>
                                widgetManagement.removeWidgetModal.open(widget)
                            }
                            onUpdate={handleUpdateWidget}
                            onCancelEdit={cancelEditWidget}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
