import React from "react";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useNavigate } from "react-router-dom";

const WelcomeHome = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center max-w-md w-full">
      <h4 className="text-4xl font-bold  text-center">Welcome, Dilshad 👋</h4>
      <PrimaryButton
        title={"Get Start"}
        onclick={() => navigate("/welcome/get-start")}
        className="w-[80%] mt-4 text-white font-medium"
      />
    </div>
  );
};

export default WelcomeHome;
