import { useDrag } from "react-dnd";
import WorkflowStore from "../store/WorkflowStore";
import { useRef, type Ref } from "react";
import { Clock, EllipsisVertical, MoveRight } from "lucide-react";

export default ({
  id,
  index,
  ...props
}: {
  id: string;
  index: number;
  [key: string]: any;
}) => {
  const tasks = WorkflowStore((state) => state.tasks);
  const ref = useRef<HTMLElement>(null);

  const [{ isDragging }, drag, _dragPreview] = useDrag(() => ({
    type: "CARD",
    item: () => ({
      id,
      stageId: tasks[id].stageId,
      index,
      height: ref.current ? ref.current.getBoundingClientRect().height : null,
    }),

    collect(monitor) {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));

  return (
    <>
      <section
        className={`bg-card-base w-full px-4 py-6 rounded-lg mb-4 relative ${
          isDragging ? " hidden" : ""
        }`}
        ref={drag(ref) as unknown as Ref<HTMLElement>}
        {...props}
      >
        <EllipsisVertical
          className="text-text-primary absolute top-4 right-3 cursor-pointer"
          height={20}
        />

        <h2 className="text-text-primary font-bold text-lg">
          {tasks[id].title}
        </h2>
        <p className="text-text-secondary text-sm flex items-center mb-2">
          <Clock height="14" /> {tasks[id].startDate}{" "}
          <MoveRight className="mx-2" width={12} /> {tasks[id].dueDate}
        </p>
        <p className="text-text-secondary text-base">{tasks[id].description}</p>
      </section>
    </>
  );
};
