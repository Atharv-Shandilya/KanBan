import React from "react";
import WorkflowStore from "../store/WorkflowStore";

const WelcomeScreen: React.FC = () => {
  const workflows = WorkflowStore((state) => state.workflows);
  const setIsAddingWorkflow = WorkflowStore(
    (state) => state.setIsAddingWorkflow
  );

  const workflowCount = Object.keys(workflows).length;

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Welcome to FlowMaster
        </h1>

        {workflowCount === 0 ? (
          <div>
            <p className="text-text-secondary mb-6">
              Get started by creating your first workflow to organize your tasks
              and boost productivity.
            </p>
            <button
              onClick={() => setIsAddingWorkflow(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <div>
            <p className="text-text-secondary mb-6">
              You have {workflowCount} workflow{workflowCount !== 1 ? "s" : ""}.
              Select one from the sidebar to get started, or create a new one.
            </p>
            <div className="text-text-secondary text-sm">
              <p>💡 Tip: Use the sidebar to navigate between your workflows</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
