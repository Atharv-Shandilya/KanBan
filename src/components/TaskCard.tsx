import { useDrag } from "react-dnd";
import WorkflowStore from "../store/WorkflowStore";
import { useRef, useState } from "react";
import {
  EllipsisVertical,
  MoveRight,
  Edit3,
  Trash2,
  Paperclip,
  User,
  Calendar,
  Download,
} from "lucide-react";
import type { FileAttachment } from "../global";

interface TaskCardProps {
  id: string;
  index: number;
  [key: string]: any;
}

export default ({ id, index, ...props }: TaskCardProps) => {
  const tasks = WorkflowStore((state) => state.tasks);
  const users = WorkflowStore((state) => state.users);
  const deleteTask = WorkflowStore((state) => state.deleteTask);
  const setEditingTask = WorkflowStore((state) => state.setEditingTask);
  const setModal = WorkflowStore((state) => state.addModal);

  const [showMenu, setShowMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const task = tasks[id];
  if (!task) return null;

  const [{ isDragging }, drag, _dragPreview] = useDrag(() => ({
    type: "CARD",
    item: () => ({
      id,
      stageId: task.stageId,
      index,
      height: ref.current ? ref.current.getBoundingClientRect().height : null,
    }),
    collect(monitor) {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));

  const refCallback = (node: HTMLDivElement | null) => {
    ref.current = node;
    drag(node);
  };

  const handleEdit = () => {
    setEditingTask(id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(id);
    }
    setShowMenu(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "//") return "";
    return dateString;
  };

  const assignedUsers =
    task.assignedUsers?.map((userId) => users[userId]).filter(Boolean) || [];

  const handleFileDownload = (attachment: FileAttachment) => {
    const link = document.createElement("a");
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      className={`bg-card-base w-full px-4 py-4 rounded-lg mb-4 relative transition-all duration-200 ${
        isDragging ? "opacity-50 transform rotate-1" : "hover:shadow-lg"
      }`}
      ref={refCallback}
      {...props}
    >
      {/* Menu Button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded"
        >
          <EllipsisVertical height={16} />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-8 bg-card-base border border-outline rounded-lg shadow-lg z-10 min-w-[120px]">
            <button
              onClick={handleEdit}
              className="w-full px-3 py-2 text-left text-text-primary hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
            >
              <Edit3 size={14} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2 rounded-b-lg"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Task Title */}
      <h2 className="text-text-primary font-bold text-lg mb-2 pr-8">
        {task.title}
      </h2>

      {/* Dates */}
      {(task.startDate || task.dueDate) && (
        <div className="flex items-center text-text-secondary text-sm mb-3">
          <Calendar size={14} className="mr-1" />
          {formatDate(task.startDate) && (
            <>
              <span>{formatDate(task.startDate)}</span>
              {formatDate(task.dueDate) && (
                <MoveRight className="mx-2" width={12} />
              )}
            </>
          )}
          {formatDate(task.dueDate) && <span>{formatDate(task.dueDate)}</span>}
        </div>
      )}

      {/* Description */}
      {task.description && (
        <p className="text-text-secondary text-sm mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center text-text-secondary text-sm mb-2">
            <Paperclip size={14} className="mr-1" />
            <span>
              {task.attachments.length} attachment
              {task.attachments.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-1">
            {task.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between bg-gray-700 p-2 rounded text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Paperclip
                    size={12}
                    className="text-text-secondary flex-shrink-0"
                  />
                  <span className="text-text-primary truncate">
                    {attachment.name}
                  </span>
                </div>
                <button
                  onClick={() => handleFileDownload(attachment)}
                  className="text-blue-400 hover:text-blue-300 p-1 flex-shrink-0"
                  title="Download file"
                >
                  <Download size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Users */}
      {assignedUsers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User size={14} className="text-text-secondary mr-1" />
            <div className="flex -space-x-2">
              {assignedUsers.slice(0, 3).map((user, idx) => (
                <div
                  key={user.id}
                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-card-base"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {assignedUsers.length > 3 && (
                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs border-2 border-card-base">
                  +{assignedUsers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {showMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
      )}
    </section>
  );
};
