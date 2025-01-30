import ListItem from "../listItem";

const EmployeeList = () => {
  return (
    <>
      {new Array(8).fill(" ").map((item, index) => (
        <ListItem key={index} />
      ))}
    </>
  );
};

export default EmployeeList;
