import { GripVertical, Infinity, Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import WorkflowStore from "../store/WorkflowStore";
import { useDrop } from "react-dnd";
import { useEffect, useRef, useState, type Ref } from "react";
import type { DraggedItemI } from "../global";

export default ({ id }: { id: string }) => {
  const stages = WorkflowStore((state) => state.stages);
  const move = WorkflowStore((state) => state.moveTask);
  const modal = WorkflowStore((state) => state.showAddModal);
  const editMode = WorkflowStore((state) => state.isEditMode);
  const setDrag = WorkflowStore((state) => state.setDrag);
  const preview = WorkflowStore((state) => state.drag);

  const stageRef = useRef<HTMLElement>(null);

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

        let insertIndex = stages[id].taskIds.length;

        for (let i = 0; i < taskElements.length; i++) {
          const taskRect = taskElements[i].getBoundingClientRect();
          const taskRelativeTop = taskRect.top - stageRect.top;
          const taskMidPoint = taskRelativeTop + taskRect.height / 2;

          if (relativeY < taskMidPoint) {
            insertIndex = i;
            break;
          }
        }

        if (stages[id].taskIds.length === 0) {
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

        if (stages[id].taskIds.length === 0) {
          setDrag(0, item.height);
          return;
        }

        const taskElements =
          stageRef.current.querySelectorAll("[data-task-card]");
        let previewIndex = stages[id].taskIds.length;

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
    [stages, id, move, setDrag]
  );

  useEffect(() => {
    if (!isOver) {
      setDrag(null, null);
    }
  }, [isOver, setDrag]);

  const combinedRef = (node: HTMLElement | null) => {
    stageRef.current = node;
    drop(node);
  };

  return (
    <section className="max-w-[285px] w-full " ref={combinedRef}>
      <div className=" bg-card-base pl-4 pr-2 py-[6px] rounded-full flex items-center justify-between mb-6">
        <p className="text-text-primary text-xl">
          <span className="font-bold">{stages[id].title}</span>
          {!editMode && (
            <span className="ml-3">{stages[id].taskIds.length}</span>
          )}
        </p>

        {!editMode && (
          <div
            className="w-[25px] h-[25px] flex items-center justify-center bg-[#D9D9D9] rounded-full cursor-pointer"
            onClick={() => {
              modal(id);
            }}
          >
            <Plus height={16} />
          </div>
        )}

        {editMode && (
          <GripVertical className="text-text-secondary cursor-pointer" />
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
          {stages[id].taskIds.map((taskId, idx) => (
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
