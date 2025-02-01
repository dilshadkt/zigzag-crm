import { EMPOYEES } from "../../../constants";
import ListItem from "../listItem";

const EmployeeList = () => {
  return (
    <>
      {EMPOYEES.map((item, index) => (
        <ListItem key={index} employee={item} />
      ))}
    </>
  );
};

export default EmployeeList;
