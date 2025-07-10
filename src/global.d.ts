export interface DraggedItemI {
  id: string;
  stageId: string;
  index: number;
  height: number | null;
}

export interface WorkflowI {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  stageIds: string[];
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}
