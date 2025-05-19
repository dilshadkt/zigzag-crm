import { useEmpoyees } from "../../../api/hooks";
import { EMPOYEES } from "../../../constants";
import ListItem from "../listItem";
import { useNavigate } from "react-router-dom";

const EmployeeList = ({ employees }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-y-4">
      {employees?.map((employee) => (
        <ListItem
          key={employee?._id}
          employee={employee}
          onClick={() => {
            navigate(`/employees/${employee?._id}`);
          }}
        />
      ))}
    </div>
  );
};

export default EmployeeList;
