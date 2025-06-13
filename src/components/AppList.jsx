import React from "react";
import { WidgetItem } from "./WidgetItem.jsx";
import { WidgetForm } from "./WidgetForm.jsx";

export const AppList = ({
    apps,
    selectedApps,
    appManagement,
}) => {
    const {
        editingApp,
        newAppForm,
        editingAppForm,
        addAppModal,
        appAnimation,
        handleAppToggle,
        moveAppUp,
        moveAppDown,
        handleAddApp,
        startEditApp,
        cancelEditApp,
        handleUpdateApp,
    } = appManagement;

    return (
        <div className="section">
            <div className="section-header">
                <h2>Select Destination Apps</h2>
                <button
                    type="button"
                    onClick={addAppModal.open}
                    className="add-widget-button"
                >
                    Add App
                </button>
            </div>

            {/* Add App Form */}
            {addAppModal.isOpen && (
                <WidgetForm
                    title="Add New App"
                    form={newAppForm}
                    onSubmit={handleAddApp}
                    onCancel={() => {
                        addAppModal.close();
                        newAppForm.reset();
                    }}
                    submitLabel="Add App"
                    showKeyPreview={true}
                />
            )}

            <div className="widget-list">
                {(apps || []).map((app, index) => (
                    <div
                        key={app.key}
                        className={`widget-item-container ${appAnimation.getItemClassName(index)}`}
                    >
                        <WidgetItem
                            widget={app}
                            index={index}
                            isSelected={selectedApps?.[app.key] || false}
                            isEditing={editingApp?.key === app.key}
                            editForm={editingAppForm}
                            animationClass={appAnimation.getItemClassName(index)}
                            upButtonClass={appAnimation.getButtonClassName(`app-up-${index}`)}
                            downButtonClass={appAnimation.getButtonClassName(`app-down-${index}`)}
                            isFirstItem={index === 0}
                            isLastItem={index === (apps || []).length - 1}
                            isAnimating={appAnimation.isAnimating()}
                            onToggle={handleAppToggle}
                            onMoveUp={moveAppUp}
                            onMoveDown={moveAppDown}
                            onEdit={startEditApp}
                            onRemove={(app) => appManagement.removeAppModal.open(app.key)}
                            onUpdate={handleUpdateApp}
                            onCancelEdit={cancelEditApp}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
