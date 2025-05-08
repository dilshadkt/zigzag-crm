import React from "react";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

const WelcomeHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center max-w-md w-full">
      <h4 className="text-4xl font-bold  text-center">
        Welcome, {user?.firstName} 👋
      </h4>
      <PrimaryButton
        title={"Get Start"}
        onclick={() => navigate("/welcome/get-start")}
        className="w-[80%] mt-4 text-white font-medium"
      />
    </div>
  );
};

export default WelcomeHome;
