import React from "react";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useNavigate } from "react-router-dom";

const SingUpSuccess = () => {
  const navigate = useNavigate();
  return (
    <section className="w-full h-full flexCenter bg-white rounded-3xl  flex-col">
      <img src="/image/success.svg" alt="" className="scale-75" />
      <h3 className="text-lg font-bold my-4 text-gray-800">
        You are successfully registered!
      </h3>
      <PrimaryButton
        title={"Let's Start"}
        icon={"/icons/arrowRight.svg"}
        className={"text-white  px-5"}
        iconPosition="right"
        onclick={() => navigate("/")}
      />
    </section>
  );
};

export default SingUpSuccess;
