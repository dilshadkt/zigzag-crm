import { useEmpoyees } from "../../../api/hooks";
import { EMPOYEES } from "../../../constants";
import ListItem from "../listItem";

const EmployeeList = ({ employees }) => {
  return (
    <div className="flex flex-col gap-y-4">
      {employees?.map((employee) => (
        <ListItem key={employee?._id} employee={employee} />
      ))}
    </div>
  );
};

export default EmployeeList;
