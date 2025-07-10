import { GripVertical, Infinity, Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import WorkflowStore from "../store/WorkflowStore";
import { useDrop, useDrag } from "react-dnd";
import { useEffect, useRef, useState, useCallback } from "react";
import type { DraggedItemI } from "../global";

interface StageDragItem {
  type: string;
  id: string;
  index: number;
}

export default ({ id, index }: { id: string; index: number }) => {
  const stages = WorkflowStore((state) => state.stages);
  const activeWorkflowId = WorkflowStore((state) => state.activeWorkflowId);
  const moveStage = WorkflowStore((state) => state.moveStage);
  const move = WorkflowStore((state) => state.moveTask);
  const modal = WorkflowStore((state) => state.showAddModal);
  const editMode = WorkflowStore((state) => state.isEditMode);
  const setDrag = WorkflowStore((state) => state.setDrag);
  const preview = WorkflowStore((state) => state.drag);
  const updateStage = WorkflowStore((state) => state.updateStage);
  const deleteStage = WorkflowStore((state) => state.deleteStage);
  const stageDrag = WorkflowStore((state) => state.stageDrag);
  const setStageDrag = WorkflowStore((state) => state.setStageDrag);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const currentStage = stages[id];
  if (!currentStage) {
    return null;
  }

  const [{ isDragging }, dragStage, dragPreview] = useDrag({
    type: "STAGE",
    item: (): StageDragItem => ({
      type: "STAGE",
      id,
      index,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: editMode,
  });

  const [{ isOverStage }, dropStage] = useDrop({
    accept: "STAGE",
    hover: (item: StageDragItem, monitor) => {
      if (!stageRef.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = stageRef.current.getBoundingClientRect();
      const hoverMiddleX =
        (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      setStageDrag(dragIndex, hoverIndex);
    },
    drop: (item: StageDragItem) => {
      if (activeWorkflowId && item.index !== index) {
        moveStage(activeWorkflowId, item.index, index);
        item.index = index;
      }
      setStageDrag(null, null);
    },
    collect: (monitor) => ({
      isOverStage: monitor.isOver(),
    }),
  });

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "CARD",
      drop(item: DraggedItemI, monitor) {
        if (!stageRef.current) return;

        const mouse = monitor.getClientOffset();
        if (!mouse) return;

        const stageRect = stageRef.current.getBoundingClientRect();
        const relativeY = mouse.y - stageRect.top;

        const taskElements =
          stageRef.current.querySelectorAll("[data-task-card]");

        let insertIndex = currentStage.taskIds.length;

        for (let i = 0; i < taskElements.length; i++) {
          const taskRect = taskElements[i].getBoundingClientRect();
          const taskRelativeTop = taskRect.top - stageRect.top;
          const taskMidPoint = taskRelativeTop + taskRect.height / 2;

          if (relativeY < taskMidPoint) {
            insertIndex = i;
            break;
          }
        }

        if (currentStage.taskIds.length === 0) {
          insertIndex = 0;
        }

        move(item.stageId, id, item.id, insertIndex);
        item.stageId = id;
        item.index = insertIndex;
      },

      hover(item: DraggedItemI, monitor) {
        if (!stageRef.current) return;

        const mouse = monitor.getClientOffset();
        if (!mouse) return;

        const stageRect = stageRef.current.getBoundingClientRect();
        const relativeY = mouse.y - stageRect.top;

        if (currentStage.taskIds.length === 0) {
          setDrag(0, item.height);
          return;
        }

        const taskElements =
          stageRef.current.querySelectorAll("[data-task-card]");
        let previewIndex = currentStage.taskIds.length;

        for (let i = 0; i < taskElements.length; i++) {
          const taskRect = taskElements[i].getBoundingClientRect();
          const taskRelativeTop = taskRect.top - stageRect.top;
          const taskMidPoint = taskRelativeTop + taskRect.height / 2;

          if (relativeY < taskMidPoint) {
            previewIndex = i;
            break;
          }
        }

        setDrag(previewIndex, item.height);
      },
      collect(monitor) {
        return {
          isOver: monitor.isOver({ shallow: true }),
        };
      },
    }),
    [currentStage, id, move, setDrag]
  );

  const stageRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      stageRef.current = node;
      drop(node);
      dropStage(node);
      dragPreview(node);
    },
    [drop, dropStage, dragPreview]
  );

  const dragHandleRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      dragHandleRef.current = node;
      dragStage(node);
    },
    [dragStage]
  );

  useEffect(() => {
    if (!isOver) {
      setDrag(null, null);
    }
  }, [isOver, setDrag]);

  useEffect(() => {
    if (!isOverStage) {
      setStageDrag(null, null);
    }
  }, [isOverStage, setStageDrag]);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditingTitle(currentStage.title);
  };

  const handleEditSave = () => {
    if (editingTitle.trim() && editingTitle.trim() !== currentStage.title) {
      updateStage(id, editingTitle.trim());
    }
    setIsEditing(false);
    setEditingTitle("");
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingTitle("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleDeleteStage = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${currentStage.title}"? This will also delete all tasks in this stage.`
      )
    ) {
      deleteStage(id);
    }
  };

  return (
    <section
      className={`w-[250px] sm:w-[285px] flex-shrink-0 transition-all duration-200 ${
        isDragging ? "opacity-50 transform rotate-2" : ""
      } ${stageDrag.toIndex === index ? "transform scale-105" : ""}`}
      ref={stageRefCallback}
    >
      <div
        className={`bg-card-base pl-3 sm:pl-4 pr-2 py-[6px] rounded-full flex items-center justify-between mb-4 sm:mb-6 ${
          editMode ? "cursor-move" : ""
        }`}
      >
        {isEditing ? (
          <div className="flex-1 mr-2">
            <input
              ref={editInputRef}
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleEditSave}
              className="bg-transparent text-text-primary text-lg sm:text-xl font-bold outline-none w-full"
              maxLength={30}
            />
          </div>
        ) : (
          <p className="text-text-primary text-lg sm:text-xl flex-1">
            <span
              className={`font-bold transition-colors ${
                editMode ? "cursor-pointer hover:text-blue-400" : ""
              }`}
              onClick={editMode ? handleEditStart : undefined}
              title={editMode ? "Click to edit stage name" : undefined}
            >
              {currentStage.title}
            </span>
            {!editMode && (
              <span className="ml-2 sm:ml-3 text-sm sm:text-base">
                {currentStage.taskIds.length}
              </span>
            )}
          </p>
        )}

        {!editMode && !isEditing && (
          <div
            className="w-[22px] h-[22px] sm:w-[25px] sm:h-[25px] flex items-center justify-center bg-[#D9D9D9] rounded-full cursor-pointer hover:bg-[#C0C0C0] transition-colors"
            onClick={() => modal(id)}
            title="Add new task"
          >
            <Plus height={14} className="sm:hidden" />
            <Plus height={16} className="hidden sm:block" />
          </div>
        )}

        {editMode && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteStage}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
              title="Delete stage"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>

            <div
              ref={dragHandleRefCallback}
              className="cursor-move p-1"
              title="Drag to reorder stage"
            >
              <GripVertical className="text-text-secondary hover:text-text-primary transition-colors" />
            </div>
          </div>
        )}
      </div>

      {!editMode && (
        <article>
          {isOver && preview.index === 0 && (
            <div
              className="bg-card-base w-full mb-4 rounded-lg opacity-70 pointer-events-none"
              style={{ height: preview.height + "px" }}
            />
          )}
          {currentStage.taskIds.map((taskId, idx) => (
            <div key={taskId} className="relative">
              <TaskCard key={taskId} id={taskId} index={idx} data-task-card />
              {isOver && preview.index === idx + 1 && (
                <div
                  className="bg-card-base w-full mb-4 rounded-lg opacity-70 pointer-events-none"
                  style={{ height: preview.height + "px" }}
                />
              )}
            </div>
          ))}
        </article>
      )}

      <p className="text-text-secondary flex border-t-[0.5px] border-outline pt-2 justify-center items-center">
        <span className="font-bold mr-2 text-sm">MAX</span>
        <Infinity height={20} />
      </p>
    </section>
  );
};
