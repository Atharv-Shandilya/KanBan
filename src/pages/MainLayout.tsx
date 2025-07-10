import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import WorkflowStore from "../store/WorkflowStore";

import SideNavigation from "../components/SideNav";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams();

  const workflows = WorkflowStore((state) => state.workflows);
  const activeWorkflowId = WorkflowStore((state) => state.activeWorkflowId);
  const setActiveWorkflow = WorkflowStore((state) => state.setActiveWorkflow);

  useEffect(() => {
    if (
      workflowId &&
      workflows[workflowId] &&
      activeWorkflowId !== workflowId
    ) {
      setActiveWorkflow(workflowId);
    } else if (workflowId && !workflows[workflowId]) {
      navigate("/", { replace: true });
    }
  }, [workflowId, workflows, activeWorkflowId, setActiveWorkflow, navigate]);

  return <SideNavigation />;
};

export default MainLayout;
