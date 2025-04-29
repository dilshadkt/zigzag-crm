import React from "react";
import Input from "../../../components/shared/Field/input";
import { Link } from "react-router-dom";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useSignIn } from "../../../hooks/useSignIn";
import AuthBanner from "../../../components/authBanner";

const SignIn = () => {
  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } =
    useSignIn();
  return (
    <section className="w-full h-full bg-white grid grid-cols-2 rounded-3xl overflow-hidden">
      <AuthBanner />
      <div className="flexCenter ">
        <form onSubmit={handleSubmit} className="flex flex-col max-w-md w-full">
          <h4 className="text-[22px] font-bold  text-center">
            Sign In to Woorkroom
          </h4>
          <div className=" w-full flex flex-col gap-y-4 mt-8 ">
            <Input
              name={"email"}
              value={values}
              touched={touched}
              onchange={handleChange}
              errors={errors}
              title="Email Address"
              placeholder="youremail@gmail.com"
            />
            <Input
              name={"password"}
              value={values}
              touched={touched}
              onchange={handleChange}
              errors={errors}
              title="Password"
              type="password"
              placeholder="Password"
            />
            <div className="flexBetween mt-2">
              <div className="flexStart gap-x-2">
                <input type="checkbox" name="" id="" />
                <span className="text-[#7D8592] text-sm">Remember me</span>
              </div>
              <Link
                to={"/auth/forget-password"}
                className="text-[#7D8592] hover:underline text-sm"
              >
                Forget Password ?
              </Link>
            </div>
            <div className="flex flex-col mt-5  items-center">
              <PrimaryButton
                loading={isSubmitting}
                type="submit"
                iconPosition="right"
                title={"Sign In"}
                icon={"/icons/arrowRight.svg"}
                className={"px-10 text-white"}
              />
              <Link
                to={"/auth/register"}
                className="text-sm  text-[#3F8CFF] font-medium mt-5"
              >
                Don’t have an account?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default SignIn;
