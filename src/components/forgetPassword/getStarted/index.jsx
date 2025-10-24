import React from "react";

const GetStarted = ({ currentStep, steps }) => {
  return (
    <section className="w-[340px] bg-[#3F8CFF] p-10 rounded-3xl">
      <div className="flex flex-col mt-4">
        <img src="/image/logo.svg" alt="" className="w-11" />
        <h3 className="font-bold text-3xl text-white mt-12 mb-10">
          Reset Password
        </h3>
        <ul className="flex flex-col gap-y-2">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-y-2 flex-col">
              <div
                className={` ${
                  currentStep >= step.id && `opacity-100`
                } opacity-30 transition-all duration-300 delay-700 flexStart gap-x-4`}
              >
                <div
                  className="w-5 h-5 rounded-full 
border-2 bg-[#79AFFF] border-white"
                ></div>
                <span className=" text-white">{step.text}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-[2px] translate-x-[10px] h-6 rounded-full bg-gray-100/30 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-full h-full bg-white"
                    style={{
                      transform: `scaleY(${currentStep > step.id ? 1 : 0})`,
                      transformOrigin: "top",
                      transition: "transform 0.7s ease",
                    }}
                  ></div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default GetStarted;
