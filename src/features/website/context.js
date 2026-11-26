import { createContext, useContext } from "react";

export const WebsiteContext = createContext({ permissions: {}, sites: [], types: {}, uploadsReady: false });
export const useWebsite = () => useContext(WebsiteContext);
