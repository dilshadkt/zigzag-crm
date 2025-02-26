import { useSelector } from "react-redux";

export const useProject = () => {
  return useSelector((state) => state.project);
};
