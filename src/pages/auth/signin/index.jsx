import React from "react";
import Input from "../../../components/shared/Field/input";
import { Link } from "react-router-dom";
import PrimaryButton from "../../../components/shared/buttons/primaryButton";
import { useSignIn } from "../../../hooks/useSignIn";
import AuthBanner from "../../../components/authBanner";
import logo from "../../../assets/icons/logo.svg";
const SignIn = () => {
  const { values, errors, touched, handleChange, handleSubmit, isSubmitting } =
    useSignIn();
  return (
    <section
      className="w-full h-full bg-[#f4f9fd] md:bg-white grid grid-cols-1 md:grid-cols-2 
    rounded-3xl overflow-hidden"
    >
      <AuthBanner />
      <div className="flexCenter gap-y-7 md:gap-y-0 flex-col ">
        <div className="flexCenter gap-x-4">
          <img src={logo} alt="" />
          <span className="text-xl text-[#3A89FF]  font-bold">Woorkroom</span>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex bg-white shadow-sm md:bg-transparent p-5
        md:p-0 rounded-3xl md:rounded-none  flex-col max-w-md w-full"
        >
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
            <div>
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
              {errors.general && (
                <p className="text-red-500 mt-2 text-xs font-medium">
                  {errors.general}
                </p>
              )}
            </div>

            <div className="flexBetween ">
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
                className="text-sm  text-[#3F8CFF] font-semibold mt-5"
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
