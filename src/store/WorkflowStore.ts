import type { FileAttachment } from "./../global.d";
import { v4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TaskI {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
  description: string;
  stageId: string;
  workflowId: string;
  assignedUsers: string[];
  attachments: FileAttachment[];
  createdAt: string;
  updatedAt: string;
}

interface StageI {
  id: string;
  title: string;
  taskIds: string[];
  workflowId: string;
  order: number;
}

interface WorkflowI {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  stageIds: string[];
}

interface StoreI {
  // Workflow Management
  workflows: Record<string, WorkflowI>;
  activeWorkflowId: string | null;
  isAddingWorkflow: boolean;
  addWorkflow: (name: string) => void;
  deleteWorkflow: (id: string) => void;
  updateWorkflow: (id: string, name: string) => void;
  setActiveWorkflow: (id: string) => void;
  setIsAddingWorkflow: (isAdding: boolean) => void;

  // Stage Management
  stages: Record<string, StageI>;
  addStage: (workflowId: string, title?: string) => void;
  deleteStage: (id: string) => void;
  updateStage: (id: string, title: string) => void;
  moveStage: (workflowId: string, fromIndex: number, toIndex: number) => void;

  // Task Management
  tasks: Record<string, TaskI>;
  addTask: (
    stageId: string,
    title: string,
    description: string,
    startDate: string,
    dueDate: string,
    assignedUsers?: string[],
    attachments?: FileAttachment[]
  ) => void;
  updateTask: (id: string, updates: Partial<TaskI>) => void;
  deleteTask: (id: string) => void;
  moveTask: (
    srcStageId: string,
    desStageId: string,
    cardId: string,
    insertIndex: number
  ) => void;

  // User Management
  users: Record<string, User>;
  addUsers: (users: User[]) => void;

  // UI State Management
  editingTask: string | null;
  setEditingTask: (id: string | null) => void;
  addModal: string | null;
  showAddModal: (id: string) => void;
  closeAddModal: () => void;
  isEditMode: boolean;
  setEditMode: () => void;

  // Drag & Drop State
  drag: { index: number | null; height: number | null };
  setDrag: (index: number | null, height: number | null) => void;
  stageDrag: { fromIndex: number | null; toIndex: number | null };
  setStageDrag: (fromIndex: number | null, toIndex: number | null) => void;

  // Computed Getters
  getActiveWorkflowStages: () => StageI[];
  getActiveWorkflowTasks: () => TaskI[];
}

const createDefaultStages = (workflowId: string): Record<string, StageI> => {
  const stageIds = [v4(), v4(), v4()];
  return {
    [stageIds[0]]: {
      id: stageIds[0],
      title: "Backlog",
      taskIds: [],
      workflowId,
      order: 0,
    },
    [stageIds[1]]: {
      id: stageIds[1],
      title: "In Progress",
      taskIds: [],
      workflowId,
      order: 1,
    },
    [stageIds[2]]: {
      id: stageIds[2],
      title: "Done",
      taskIds: [],
      workflowId,
      order: 2,
    },
  };
};

const useWorkflowStore = create<StoreI>()(
  persist(
    (set, get) => ({
      // Workflow Management
      workflows: {},
      activeWorkflowId: null,
      isAddingWorkflow: false,

      addWorkflow: (name: string) => {
        const workflowId = v4();
        const defaultStages = createDefaultStages(workflowId);
        const stageIds = Object.keys(defaultStages);
        const now = new Date().toISOString();

        const newWorkflow: WorkflowI = {
          id: workflowId,
          name: name.trim(),
          createdAt: now,
          updatedAt: now,
          stageIds,
        };

        set((prev) => ({
          ...prev,
          workflows: {
            ...prev.workflows,
            [workflowId]: newWorkflow,
          },
          stages: {
            ...prev.stages,
            ...defaultStages,
          },
          activeWorkflowId: workflowId,
          isAddingWorkflow: false,
        }));
      },

      deleteWorkflow: (id: string) => {
        set((prev) => {
          const workflow = prev.workflows[id];
          if (!workflow) return prev;

          const newStages = { ...prev.stages };
          const newTasks = { ...prev.tasks };

          workflow.stageIds.forEach((stageId) => {
            const stage = newStages[stageId];
            if (stage) {
              stage.taskIds.forEach((taskId) => {
                delete newTasks[taskId];
              });
              delete newStages[stageId];
            }
          });

          const newWorkflows = { ...prev.workflows };
          delete newWorkflows[id];

          return {
            ...prev,
            workflows: newWorkflows,
            stages: newStages,
            tasks: newTasks,
            activeWorkflowId:
              prev.activeWorkflowId === id ? null : prev.activeWorkflowId,
          };
        });
      },

      updateWorkflow: (id: string, name: string) => {
        set((prev) => ({
          ...prev,
          workflows: {
            ...prev.workflows,
            [id]: {
              ...prev.workflows[id],
              name: name.trim(),
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      setActiveWorkflow: (id: string) => {
        set((prev) => ({
          ...prev,
          activeWorkflowId: id,
        }));
      },

      setIsAddingWorkflow: (isAdding: boolean) => {
        set((prev) => ({
          ...prev,
          isAddingWorkflow: isAdding,
        }));
      },

      // Stage Management
      stages: {},

      addStage: (workflowId: string, title = "New Stage") => {
        const stageId = v4();
        const workflow = get().workflows[workflowId];
        if (!workflow) return;

        const nextOrder = workflow.stageIds.length;
        const newStage: StageI = {
          id: stageId,
          title,
          taskIds: [],
          workflowId,
          order: nextOrder,
        };

        set((prev) => ({
          ...prev,
          stages: {
            ...prev.stages,
            [stageId]: newStage,
          },
          workflows: {
            ...prev.workflows,
            [workflowId]: {
              ...prev.workflows[workflowId],
              stageIds: [...prev.workflows[workflowId].stageIds, stageId],
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      deleteStage: (stageId: string) => {
        set((prev) => {
          const stage = prev.stages[stageId];
          if (!stage) return prev;

          const workflowId = stage.workflowId;
          const newStages = { ...prev.stages };
          const newTasks = { ...prev.tasks };

          stage.taskIds.forEach((taskId) => {
            delete newTasks[taskId];
          });

          delete newStages[stageId];

          const newWorkflows = {
            ...prev.workflows,
            [workflowId]: {
              ...prev.workflows[workflowId],
              stageIds: prev.workflows[workflowId].stageIds.filter(
                (id) => id !== stageId
              ),
              updatedAt: new Date().toISOString(),
            },
          };

          const remainingStageIds = newWorkflows[workflowId].stageIds;
          remainingStageIds.forEach((id, index) => {
            if (newStages[id]) {
              newStages[id].order = index;
            }
          });

          return {
            ...prev,
            stages: newStages,
            tasks: newTasks,
            workflows: newWorkflows,
          };
        });
      },

      updateStage: (stageId: string, title: string) => {
        set((prev) => {
          const stage = prev.stages[stageId];
          if (!stage) return prev;

          return {
            ...prev,
            stages: {
              ...prev.stages,
              [stageId]: {
                ...stage,
                title: title.trim(),
              },
            },
            workflows: {
              ...prev.workflows,
              [stage.workflowId]: {
                ...prev.workflows[stage.workflowId],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      moveStage: (workflowId: string, fromIndex: number, toIndex: number) => {
        set((prev) => {
          const workflow = prev.workflows[workflowId];
          if (!workflow) return prev;

          const stageIds = [...workflow.stageIds];
          const [movedStageId] = stageIds.splice(fromIndex, 1);
          stageIds.splice(toIndex, 0, movedStageId);

          const newStages = { ...prev.stages };

          stageIds.forEach((stageId, index) => {
            if (newStages[stageId]) {
              newStages[stageId].order = index;
            }
          });

          return {
            ...prev,
            stages: newStages,
            workflows: {
              ...prev.workflows,
              [workflowId]: {
                ...workflow,
                stageIds,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      // Task Management
      tasks: {},

      addTask: (
        stageId: string,
        title: string,
        description: string,
        startDate: string,
        dueDate: string,
        assignedUsers: string[] = [],
        attachments: FileAttachment[] = []
      ) => {
        const taskId = v4();
        const stage = get().stages[stageId];

        if (!stage) return;

        const task: TaskI = {
          id: taskId,
          title,
          startDate,
          dueDate,
          description,
          stageId,
          workflowId: stage.workflowId,
          assignedUsers,
          attachments,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((prev) => ({
          ...prev,
          stages: {
            ...prev.stages,
            [stageId]: {
              ...prev.stages[stageId],
              taskIds: [...prev.stages[stageId].taskIds, taskId],
            },
          },
          tasks: {
            ...prev.tasks,
            [taskId]: task,
          },
          workflows: {
            ...prev.workflows,
            [stage.workflowId]: {
              ...prev.workflows[stage.workflowId],
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      updateTask: (taskId: string, updates: Partial<TaskI>) => {
        set((prev) => {
          const task = prev.tasks[taskId];
          if (!task) return prev;

          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [taskId]: {
                ...task,
                ...updates,
                updatedAt: new Date().toISOString(),
              },
            },
            workflows: {
              ...prev.workflows,
              [task.workflowId]: {
                ...prev.workflows[task.workflowId],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteTask: (taskId: string) => {
        set((prev) => {
          const task = prev.tasks[taskId];
          if (!task) return prev;

          const newTasks = { ...prev.tasks };
          delete newTasks[taskId];

          const newStages = {
            ...prev.stages,
            [task.stageId]: {
              ...prev.stages[task.stageId],
              taskIds: prev.stages[task.stageId].taskIds.filter(
                (id) => id !== taskId
              ),
            },
          };

          const workflows = {
            ...prev.workflows,
            [task.workflowId]: {
              ...prev.workflows[task.workflowId],
              updatedAt: new Date().toISOString(),
            },
          };

          return {
            ...prev,
            tasks: newTasks,
            stages: newStages,
            workflows,
          };
        });
      },

      moveTask: (
        srcStageId: string,
        desStageId: string,
        cardId: string,
        insertIndex: number
      ) => {
        set((prev) => {
          const tasks = { ...prev.tasks };
          const task = tasks[cardId];
          if (!task) return prev;

          tasks[cardId] = {
            ...task,
            stageId: desStageId,
          };

          const stages = { ...prev.stages };
          const cardIdx = stages[srcStageId].taskIds.findIndex(
            (curr) => curr === cardId
          );

          if (cardIdx === -1) return prev;

          stages[srcStageId] = {
            ...stages[srcStageId],
            taskIds: [
              ...stages[srcStageId].taskIds.slice(0, cardIdx),
              ...stages[srcStageId].taskIds.slice(cardIdx + 1),
            ],
          };

          const newTaskIds = [...stages[desStageId].taskIds];
          newTaskIds.splice(insertIndex, 0, cardId);

          stages[desStageId] = {
            ...stages[desStageId],
            taskIds: newTaskIds,
          };

          const workflowId = stages[desStageId].workflowId;
          const workflows = {
            ...prev.workflows,
            [workflowId]: {
              ...prev.workflows[workflowId],
              updatedAt: new Date().toISOString(),
            },
          };

          return {
            ...prev,
            tasks,
            stages,
            workflows,
          };
        });
      },

      // User Management
      users: {},

      addUsers: (users: User[]) => {
        set((prev) => {
          const newUsers = users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {} as Record<string, User>);

          return {
            ...prev,
            users: {
              ...prev.users,
              ...newUsers,
            },
          };
        });
      },

      // UI State Management
      editingTask: null,
      setEditingTask: (taskId: string | null) => {
        set((prev) => ({
          ...prev,
          editingTask: taskId,
        }));
      },

      addModal: null,
      showAddModal: (id: string) => {
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

      isEditMode: false,
      setEditMode: () => {
        set((prev) => ({ ...prev, isEditMode: !prev.isEditMode }));
      },

      // Drag & Drop State
      drag: { index: null, height: null },
      setDrag: (index: number | null, height: number | null) => {
        set((prev) => ({
          ...prev,
          drag: { index, height },
        }));
      },

      stageDrag: { fromIndex: null, toIndex: null },
      setStageDrag: (fromIndex: number | null, toIndex: number | null) => {
        set((prev) => ({
          ...prev,
          stageDrag: { fromIndex, toIndex },
        }));
      },

      // Computed Getters
      getActiveWorkflowStages: () => {
        const state = get();
        const activeWorkflow = state.activeWorkflowId
          ? state.workflows[state.activeWorkflowId]
          : null;
        if (!activeWorkflow) return [];

        return activeWorkflow.stageIds
          .map((stageId) => state.stages[stageId])
          .filter(Boolean)
          .sort((a, b) => a.order - b.order);
      },

      getActiveWorkflowTasks: () => {
        const state = get();
        if (!state.activeWorkflowId) return [];

        return Object.values(state.tasks).filter(
          (task) => task.workflowId === state.activeWorkflowId
        );
      },
    }),

    {
      storage: createJSONStorage(() => sessionStorage),
      name: "FlowMaster-Workflow",
      partialize: (state) => ({
        workflows: state.workflows,
        tasks: state.tasks,
        stages: state.stages,
        activeWorkflowId: state.activeWorkflowId,
        users: state.users,
      }),
    }
  )
);

export default useWorkflowStore;
