import { MoveRight, X, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WorkflowStore from "../store/WorkflowStore";
import DeadLineInput from "./DeadLineInput";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export default () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string>("");

  const stages = WorkflowStore((state) => state.stages);

  const tasks = WorkflowStore((state) => state.tasks);
  const closeModal = WorkflowStore((state) => state.closeAddModal);
  const modal = WorkflowStore((state) => state.addModal);
  const editingTask = WorkflowStore((state) => state.editingTask);
  const setEditingTask = WorkflowStore((state) => state.setEditingTask);
  const addTask = WorkflowStore((state) => state.addTask);
  const updateTask = WorkflowStore((state) => state.updateTask);

  const desRef = useRef<HTMLTextAreaElement>(null);

  const [startDate, setStartDate] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [startError, setStartError] = useState(false);

  const [dueDate, setDueDate] = useState("");
  const [dueMonth, setDueMonth] = useState("");
  const [dueYear, setDueYear] = useState("");
  const [dueError, setDueError] = useState(false);

  const isEditing = !!editingTask;
  const currentTask = isEditing ? tasks[editingTask] : null;

  const shouldShowModal = modal || editingTask;

  useEffect(() => {
    if (isEditing && currentTask) {
      setTitle(currentTask.title || "");
      setDescription(currentTask.description || "");
      setAssignedUsers(currentTask.assignedUsers || []);
      setAttachments(currentTask.attachments || []);

      if (currentTask.startDate && currentTask.startDate !== "//") {
        const [d, m, y] = currentTask.startDate.split("/");
        setStartDate(d || "");
        setStartMonth(m || "");
        setStartYear(y || "");
      } else {
        setStartDate("");
        setStartMonth("");
        setStartYear("");
      }

      if (currentTask.dueDate && currentTask.dueDate !== "//") {
        const [d, m, y] = currentTask.dueDate.split("/");
        setDueDate(d || "");
        setDueMonth(m || "");
        setDueYear(y || "");
      } else {
        setDueDate("");
        setDueMonth("");
        setDueYear("");
      }
    }
  }, [isEditing, currentTask, editingTask]);

  useEffect(() => {
    if (!modal && !editingTask) {
      resetForm();
    }
  }, [modal, editingTask]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedUsers([]);
    setAttachments([]);
    setStartDate("");
    setStartMonth("");
    setStartYear("");
    setDueDate("");
    setDueMonth("");
    setDueYear("");
    setUploadError("");
  };

  useEffect(() => {
    if (desRef && desRef.current) {
      desRef.current.style.height = "auto";
      desRef.current.style.height = desRef.current.scrollHeight + "px";
    }
  }, [description]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setUploadError("Please enter a task title.");
      return;
    }

    const startDateStr = `${startDate}/${startMonth}/${startYear}`;
    const dueDateStr = `${dueDate}/${dueMonth}/${dueYear}`;

    try {
      if (isEditing && currentTask) {
        updateTask(editingTask, {
          title: title.trim(),
          description: description.trim(),
          assignedUsers,
          attachments,
          startDate: startDateStr,
          dueDate: dueDateStr,
          updatedAt: new Date().toISOString(),
        });
        setEditingTask(null);
      } else {
        addTask(
          modal as string,
          title.trim(),
          description.trim(),
          startDateStr,
          dueDateStr,
          assignedUsers,
          attachments
        );
        closeModal();
      }
    } catch (error) {
      console.error("Save error:", error);
      setUploadError("Failed to save task. Please try again.");
    }
  };

  const handleClose = () => {
    if (isEditing) {
      setEditingTask(null);
    } else {
      closeModal();
    }
  };

  const stageTitle = isEditing
    ? stages[currentTask?.stageId || ""]?.title
    : stages[modal as string]?.title;

  if (!shouldShowModal) {
    return null;
  }

  return (
    <>
      <div
        className="fixed left-0 right-0 top-0 bottom-0 bg-black/30 z-40"
        onClick={handleClose}
      />
      <article className="bg-card-base fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-7 rounded-lg w-full max-w-[700px] max-h-[90vh] overflow-y-auto z-50">
        <header className="flex justify-between items-center text-2xl text-text-primary mb-6">
          <h2>
            {isEditing ? "Edit Task" : "Add To"}{" "}
            <span className="font-bold">"{stageTitle}"</span>
          </h2>
          <button
            className="cursor-pointer hover:text-red-400 transition-colors"
            onClick={handleClose}
          >
            <X className="text-text-primary" />
          </button>
        </header>
        {/* Error Message */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm">{uploadError}</span>
          </div>
        )}
        {/* Title Input */}
        <input
          placeholder="Task Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border w-full px-4 py-2 rounded-lg outline-none placeholder:text-text-secondary text-lg text-text-primary border-outline mb-4"
        />
        {/* Date Inputs */}
        <section className="mb-6 flex items-center gap-x-6 w-fit">
          <div className="border-outline border px-4 py-2 rounded-lg flex-1">
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
          <div className="border-outline border px-4 py-2 rounded-lg flex-1">
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
        {/* Description */}
        <section className="mb-6">
          <h3 className="text-text-primary mb-2 text-sm font-medium">
            Description
          </h3>
          <textarea
            className="resize-none outline-none placeholder:text-text-secondary border border-outline py-3 px-4 text-text-primary rounded-lg w-full min-h-[120px]"
            placeholder="Task description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            ref={desRef}
          />
        </section>
        {/* Action Buttons */}
        <section className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="text-text-secondary bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            className="text-white bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            {isEditing ? "Update Task" : "Add Task"}
          </button>
        </section>
      </article>
    </>
  );
};
