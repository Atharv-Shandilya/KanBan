import { Pencil } from "lucide-react";
import WorkflowStore from "../store/WorkflowStore";

export default () => {
  const setEditMode = WorkflowStore((state) => state.setEditMode);
  const editMode = WorkflowStore((state) => state.isEditMode);

  return (
    <>
      {!editMode && (
        <article className="w-full bg-card-base px-6 py-2 rounded-lg mb-10 text-2xl font-bold flex justify-between items-center">
          <h2 className="text-text-primary">Workflow Name</h2>
          <Pencil
            className="text-text-primary cursor-pointer"
            onClick={() => setEditMode()}
          />
        </article>
      )}

      {editMode && (
        <article className="mb-10">
          <button className="bg-accent px-10 py-2 text-text-primary rounded-lg cursor-pointer mr-4">
            Done
          </button>

          <button
            className="bg-[#5B5B5B] px-10 py-2 text-text-primary rounded-lg cursor-pointer"
            onClick={() => {
              setEditMode();
            }}
          >
            Cancel
          </button>
        </article>
      )}
    </>
  );
};
