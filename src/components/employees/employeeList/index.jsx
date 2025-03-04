import { useEmpoyees } from "../../../api/hooks";
import { EMPOYEES } from "../../../constants";
import ListItem from "../listItem";

const EmployeeList = ({ employees }) => {
  return (
    <>
      {employees?.map((employee) => (
        <ListItem key={employee?._id} employee={employee} />
      ))}
    </>
  );
};

export default EmployeeList;
