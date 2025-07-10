import { MoveRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WorkflowStore from "../store/WorkflowStore";
import DeadLineInput from "./DeadLineInput";

export default () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const stages = WorkflowStore((state) => state.stages);

  const closeModal = WorkflowStore((state) => state.closeAddModal);
  const modal = WorkflowStore((state) => state.addModal);

  const addTask = WorkflowStore((state) => state.addTask);

  const desRef = useRef<HTMLTextAreaElement>(null);

  const [startDate, setStartDate] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");

  const [startError, setStartError] = useState(false);

  const [dueDate, setDueDate] = useState("");
  const [dueMonth, setDueMonth] = useState("");
  const [dueYear, setDueYear] = useState("");
  const [dueError, setDueError] = useState(false);

  useEffect(() => {
    if (desRef && desRef.current) {
      desRef.current.style.height = 0 + "px";
      desRef.current.style.height = desRef.current.scrollHeight + "px";
    }
  }, [description]);
  return (
    <>
      <div
        className="fixed left-0 right-0 top-0 bottom-0 bg-black/30 "
        onClick={() => {
          closeModal();
        }}
      ></div>
      <article className="bg-card-base fixed top-1/2 left-1/2 transform -translate-1/2 p-7  rounded-lg w-full max-w-[600px] pt-[80px]">
        <header className="flex justify-between items-center text-2xl text-text-primary shadow-sm absolute top-0 left-0 right-0 px-7 pt-4 pb-3">
          <h2>
            Add To{" "}
            <span className="font-bold">"{stages[modal as string].title}"</span>
          </h2>
          <div className="cursor-pointer" onClick={() => closeModal()}>
            <X className="text-text-primary" />
          </div>
        </header>

        <input
          placeholder="Task Title..."
          value={title}
          onChange={(e) => {
            console.log(e.target.value);
            setTitle(e.target.value);
          }}
          className=" border w-full px-4 py-2 rounded-lg outline-none placeholder:text-text-primary text-lg text-text-primary border-outline mb-6 "
        />

        <section className="mb-6 flex items-center gap-x-6">
          <div className="border-outline border px-4 py-2 rounded-lg">
            <h3
              className={`${
                startError ? "text-red-600" : "text-text-secondary"
              } text-sm`}
            >
              Start Date
            </h3>
            <DeadLineInput
              error={startError}
              setError={setStartError}
              date={startDate}
              setDate={setStartDate}
              month={startMonth}
              setMonth={setStartMonth}
              year={startYear}
              setYear={setStartYear}
            />
          </div>
          <MoveRight className="text-text-secondary" />
          <div className="border-outline border px-4 py-2 rounded-lg">
            <h3
              className={`${
                dueError ? "text-red-600" : "text-text-secondary"
              } text-sm`}
            >
              Due Date
            </h3>

            <DeadLineInput
              error={dueError}
              setError={setDueError}
              date={dueDate}
              setDate={setDueDate}
              month={dueMonth}
              setMonth={setDueMonth}
              year={dueYear}
              setYear={setDueYear}
            />
          </div>
        </section>
        <section>
          <div>
            <h3 className="text-text-primary mb-2">Description</h3>
          </div>
          <textarea
            className="resize-none outline-none placeholder:text-text-secondary border border-outline py-3 px-4 text-text-primary rounded-lg w-full min-h-[200px] overflow-hidden"
            placeholder="Your description"
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                e.preventDefault();
              }
            }}
            ref={desRef}
          />
        </section>
        <section className="flex justify-end">
          <button
            className="text-text-primary bg-accent px-6 py-2 rounded-lg mt-4 "
            onClick={() => {
              addTask(
                modal as string,
                title,
                description,
                `${startDate}/${startMonth}/${startYear}`,
                `${dueDate}/${dueMonth}/${dueYear}`
              );
              closeModal();
            }}
          >
            Add Card
          </button>
        </section>
      </article>
    </>
  );
};
