import { createContext, useContext } from "react";

export const AcademyContext = createContext({ permissions: {}, meta: null });
export const useAcademy = () => useContext(AcademyContext);
