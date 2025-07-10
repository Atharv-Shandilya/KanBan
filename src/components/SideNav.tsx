import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Check, Trash2, Edit3 } from "lucide-react";
import { Outlet, useNavigate } from "react-router";
import WorkflowStore from "../store/WorkflowStore";
import useAuthStore from "../store/AuthStore";

const SideNavigation: React.FC = () => {
  const navigate = useNavigate();
  const {
    workflows,
    activeWorkflowId,
    isAddingWorkflow,
    addWorkflow,
    deleteWorkflow,
    updateWorkflow,
    setActiveWorkflow,
    setIsAddingWorkflow,
  } = WorkflowStore();

  const { user, logout } = useAuthStore();

  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const workflowsArray = Object.values(workflows);

  useEffect(() => {
    if (isAddingWorkflow && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingWorkflow]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAddWorkflow = () => {
    if (newWorkflowName.trim()) {
      addWorkflow(newWorkflowName);
      setNewWorkflowName("");
    }
  };

  const handleCancelAdd = () => {
    setIsAddingWorkflow(false);
    setNewWorkflowName("");
  };

  const handleEditWorkflow = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateWorkflow(editingId, editingName);
      setEditingId(null);
      setEditingName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleWorkflowClick = (workflowId: string) => {
    setActiveWorkflow(workflowId);
    navigate(`/workflow/${workflowId}`);
  };

  const handleDeleteWorkflow = (e: React.MouseEvent, workflowId: string) => {
    e.stopPropagation();

    if (
      window.confirm(
        "Are you sure you want to delete this workflow? This will also delete all stages and tasks."
      )
    ) {
      deleteWorkflow(workflowId);

      if (activeWorkflowId === workflowId) {
        navigate("/");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: "add" | "edit") => {
    if (e.key === "Enter") {
      if (action === "add") {
        handleAddWorkflow();
      } else {
        handleSaveEdit();
      }
    } else if (e.key === "Escape") {
      if (action === "add") {
        handleCancelAdd();
      } else {
        handleCancelEdit();
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const sortedWorkflows = workflowsArray.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="flex h-[90dvh]">
      <nav className="w-[250px] bg-card-base mr-10 rounded-lg flex flex-col p-4 justify-between">
        <div>
          <h1 className="font-bold text-text-primary text-2xl mb-[50px]">
            FLOWMASTER
          </h1>

          {user && (
            <div className="mb-6 p-3 bg-gray-700 rounded-lg">
              <p className="text-text-primary text-sm font-medium">
                {user.name}
              </p>
              <p className="text-text-secondary text-xs">{user.email}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-text-primary font-bold">Workflows</h2>
              <button
                onClick={() => setIsAddingWorkflow(true)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                disabled={isAddingWorkflow}
                title="Add new workflow"
              >
                <Plus size={18} className="text-text-primary" />
              </button>
            </div>

            <ul className="space-y-2 max-h-[400px] overflow-y-auto">
              {isAddingWorkflow && (
                <li className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, "add")}
                    placeholder="Workflow name..."
                    className="flex-1 bg-transparent text-text-primary text-sm outline-none"
                    maxLength={50}
                  />
                  <button
                    onClick={handleAddWorkflow}
                    className="p-1 hover:bg-green-600 rounded transition-colors"
                    disabled={!newWorkflowName.trim()}
                    title="Save workflow"
                  >
                    <Check size={14} className="text-green-400" />
                  </button>
                  <button
                    onClick={handleCancelAdd}
                    className="p-1 hover:bg-red-600 rounded transition-colors"
                    title="Cancel"
                  >
                    <X size={14} className="text-red-400" />
                  </button>
                </li>
              )}

              {sortedWorkflows.map((workflow) => (
                <li key={workflow.id} className="group">
                  {editingId === workflow.id ? (
                    <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, "edit")}
                        className="flex-1 bg-transparent text-text-primary text-sm outline-none"
                        maxLength={50}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 hover:bg-green-600 rounded transition-colors"
                        disabled={!editingName.trim()}
                        title="Save changes"
                      >
                        <Check size={14} className="text-green-400" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-red-600 rounded transition-colors"
                        title="Cancel editing"
                      >
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        activeWorkflowId === workflow.id
                          ? "bg-gray-600 text-text-primary"
                          : "hover:bg-gray-700 text-text-secondary"
                      }`}
                      onClick={() => handleWorkflowClick(workflow.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate block">
                          {workflow.name}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWorkflow(workflow.id, workflow.name);
                          }}
                          className="p-1 hover:bg-blue-600 rounded transition-colors"
                          title="Edit workflow name"
                        >
                          <Edit3 size={12} className="text-blue-400" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteWorkflow(e, workflow.id)}
                          className="p-1 hover:bg-red-600 rounded transition-colors"
                          title="Delete workflow"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}

              {workflowsArray.length === 0 && !isAddingWorkflow && (
                <li className="text-text-secondary text-sm text-center py-4">
                  No workflows yet. Click + to create one.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          {workflowsArray.length > 0 && (
            <div className="text-text-secondary text-xs text-center">
              {workflowsArray.length} workflow
              {workflowsArray.length !== 1 ? "s" : ""}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
      <Outlet />
    </main>
  );
};

export default SideNavigation;
