import AddCardModal from "../components/AddCardModal";
import ProjectMeta from "../components/ProjectMeta";
import Stage from "../components/Stage";
import WorkflowStore from "../store/WorkflowStore";

export default () => {
  const stages = WorkflowStore((state) => state.stages);
  let modal = WorkflowStore((state) => state.addModal);
  let editMode = WorkflowStore((state) => state.isEditMode);
  return (
    <main>
      <ProjectMeta />
      <article className="flex gap-x-5">
        {Object.keys(stages).map((id: string) => (
          <Stage key={id} id={id} />
        ))}
        {editMode && (
          <div>
            <button className=" bg-card-base pl-4 pr-2 py-2 rounded-full w-[285px] text-text-secondary hover:text-text-primary cursor-pointer">
              Add Card
            </button>
          </div>
        )}
      </article>
      {modal && <AddCardModal />}
    </main>
  );
};
