// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// // HOC for role-based route protection
// export const WithRoleAccess = (allowedRoles) => (Component) => {
//   const WithRoleAccess = (props) => {
//     const { user } = useAuth(); // Custom hook to access auth context
//     if (!user || !allowedRoles.includes(user.role)) {
//       return <Navigate to="/unauthorized" />;
//     }

//     return <Component {...props} />;
//   };

//   return WithRoleAccess;
// };

function WithRoleAcess({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default WithRoleAcess;
