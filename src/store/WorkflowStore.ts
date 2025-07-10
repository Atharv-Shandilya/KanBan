import { v4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TaskI {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
  description: string;
  stageId: string;
}
interface StageI {
  id: string;
  title: string;
  taskIds: string[];
}

interface StoreI {
  stages: Record<string, StageI>;
  addStage: () => void;
  tasks: Record<string, TaskI>;
  addModal: string | null;
  showAddModal: (id: string) => void;
  closeAddModal: () => void;
  addTask: (
    stageId: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string
  ) => void;
  moveTask: (
    srcStageId: string,
    desStageId: string,
    cardId: string,
    insertIndex: number
  ) => void;
  isEditMode: boolean;
  setEditMode: () => void;

  drag: { index: number | null; height: number | null };
  setDrag: (index: number | null, height: number | null) => void;
}

const DummyStages: Record<string, StageI> = {
  "1": {
    id: "1",
    title: "Backlog",
    taskIds: [],
  },
  "2": {
    id: "2",
    title: "In Progress",
    taskIds: [],
  },
  "3": {
    id: "3",
    title: "Done",
    taskIds: [],
  },
};

export default create<StoreI>()(
  persist(
    (set) => ({
      stages: { ...DummyStages },
      addStage: () => {
        set((prev) => {
          return { ...prev };
        });
      },
      tasks: {},
      addModal: null,

      showAddModal: (id) => {
        set((prev) => ({
          ...prev,
          addModal: id,
        }));
      },

      closeAddModal: () => {
        set((prev) => ({
          ...prev,
          addModal: null,
        }));
      },

      addTask: (stageId, title, description, startDate, dueDate) => {
        const taskId = v4();

        const task: TaskI = {
          id: taskId,
          title,
          startDate,
          dueDate,
          description,
          stageId,
        };

        set((prev) => {
          return {
            ...prev,
            stages: {
              ...prev.stages,
              [stageId]: {
                ...prev.stages[stageId],
                taskIds: [...prev.stages[stageId].taskIds, taskId],
              },
            },
            tasks: { ...prev.tasks, [taskId]: task },
          };
        });
      },

      moveTask: (srcStageId, desStageId, cardId, insetIndex) => {
        set((prev) => {
          const cards = { ...prev.tasks };
          cards[cardId].stageId = desStageId;

          //remove card
          const stages = { ...prev.stages };
          const cardIdx = stages[srcStageId].taskIds.findIndex(
            (curr) => curr == cardId
          );

          stages[srcStageId].taskIds = [
            ...stages[srcStageId].taskIds.slice(0, cardIdx),
            ...stages[srcStageId].taskIds.slice(cardIdx + 1),
          ];

          stages[desStageId].taskIds.splice(insetIndex, 0, cardId);

          return { ...prev, cards, stages };
        });
      },

      isEditMode: false,
      setEditMode: () => {
        set((prev) => ({ ...prev, isEditMode: !prev.isEditMode }));
      },

      drag: { index: null, height: null },
      setDrag: (index, height) => {
        set((prev) => ({
          ...prev,
          drag: { index, height },
        }));
      },
    }),

    {
      storage: createJSONStorage(() => sessionStorage),
      name: "Workflow",
      partialize: (state) => ({
        tasks: state.tasks,
        stages: state.stages,
      }),
    }
  )
);
