import AddCardModal from "../components/AddCardModal";
import ProjectMeta from "../components/ProjectMeta";
import Stage from "../components/Stage";
import WorkflowStore from "../store/WorkflowStore";
import { Plus } from "lucide-react";
import { useParams, Navigate } from "react-router";

export default () => {
  const { workflowId } = useParams<{ workflowId: string }>();

  const workflows = WorkflowStore((state) => state.workflows);
  const activeWorkflowId = WorkflowStore((state) => state.activeWorkflowId);
  const setActiveWorkflow = WorkflowStore((state) => state.setActiveWorkflow);
  const getActiveWorkflowStages = WorkflowStore(
    (state) => state.getActiveWorkflowStages
  );
  const editTask = WorkflowStore((state) => state.editingTask);
  const addStage = WorkflowStore((state) => state.addStage);
  const modal = WorkflowStore((state) => state.addModal);
  const editMode = WorkflowStore((state) => state.isEditMode);

  if (workflowId && activeWorkflowId !== workflowId) {
    if (workflows[workflowId]) {
      setActiveWorkflow(workflowId);
    } else {
      return <Navigate to="/" replace />;
    }
  }

  if (!activeWorkflowId || !workflows[activeWorkflowId]) {
    return (
      <article className="flex-1 flex items-center justify-center ">
        <div className="text-center text-text-secondary">
          <h2 className="text-2xl font-bold mb-4">No Workflow Selected</h2>
          <p>
            Select a workflow from the sidebar or create a new one to get
            started.
          </p>
        </div>
      </article>
    );
  }

  const activeWorkflow = workflows[activeWorkflowId];
  const activeStages = getActiveWorkflowStages();

  const handleAddStage = () => {
    if (activeWorkflowId) {
      addStage(activeWorkflowId);
    }
  };

  return (
    <article className="flex-1 border overflow-hidden flex flex-col">
      <ProjectMeta workflow={activeWorkflow} />

      <article className="flex gap-x-5 pb-4 overflow-x-auto flex-1 ">
        {activeStages.map((stage, idx) => (
          <Stage key={stage.id} id={stage.id} index={idx} />
        ))}

        {editMode && (
          <div className="flex-shrink-0">
            <button
              onClick={handleAddStage}
              className="bg-card-base pl-4 pr-4 py-2 rounded-full w-[285px] text-text-secondary hover:text-text-primary cursor-pointer transition-colors flex items-center justify-center gap-2"
              title="Add new stage"
            >
              <Plus size={18} />
              Add Stage
            </button>
          </div>
        )}

        {/* Show message if no stages exist */}
        {activeStages.length === 0 && !editMode && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-text-secondary">
              <h3 className="text-lg font-semibold mb-2">No Stages Yet</h3>
              <p>Enable edit mode to add stages to this workflow.</p>
            </div>
          </div>
        )}
      </article>

      {(modal || editTask) && <AddCardModal />}
    </article>
  );
};
