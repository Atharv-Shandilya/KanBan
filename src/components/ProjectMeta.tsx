import { Edit, Save, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import WorkflowStore from "../store/WorkflowStore";
import type { WorkflowI } from "../global";

interface ProjectMetaProps {
  workflow: WorkflowI;
}

export default ({ workflow }: ProjectMetaProps) => {
  const editMode = WorkflowStore((state) => state.isEditMode);
  const setEditMode = WorkflowStore((state) => state.setEditMode);
  const updateWorkflow = WorkflowStore((state) => state.updateWorkflow);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleEditName = () => {
    setIsEditingName(true);
    setEditingName(workflow.name);
  };

  const handleSaveName = () => {
    if (editingName.trim() && editingName.trim() !== workflow.name) {
      updateWorkflow(workflow.id, editingName.trim());
    }
    setIsEditingName(false);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditingName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-card-base text-text-primary text-3xl font-bold outline-none px-2 py-1 rounded"
              maxLength={50}
            />
            <button
              onClick={handleSaveName}
              className="text-green-400 hover:text-green-300 p-1"
              title="Save"
            >
              <Save size={20} />
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-red-400 hover:text-red-300 p-1"
              title="Cancel"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <h1
              className="text-text-primary text-3xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
              onClick={handleEditName}
              title="Click to edit workflow name"
            >
              {workflow.name}
            </h1>
            <button
              onClick={handleEditName}
              className="text-text-secondary hover:text-text-primary p-1"
              title="Edit workflow name"
            >
              <Edit size={18} />
            </button>
          </div>
        )}

        <div className="text-text-secondary text-sm mt-1">
          Created: {formatDate(workflow.createdAt)}
          {workflow.updatedAt !== workflow.createdAt && (
            <span className="ml-4">
              Updated: {formatDate(workflow.updatedAt)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={setEditMode}
        className={`px-4 py-2 rounded transition-colors ${
          editMode
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-card-base hover:bg-gray-700 text-text-primary"
        }`}
      >
        {editMode ? "Done Editing" : "Edit Mode"}
      </button>
    </div>
  );
};
