import React from "react";
import clsx from "clsx";

const PrimaryButton = ({
  className = "text-white",
  icon,
  loading = false,
  title,
  onclick,
  type = "button",
  iconPosition = "left",
  disable = false,
}) => {
  if (disable) return null;
  return (
    <button
      disabled={disable}
      type={type}
      onClick={onclick}
      className={clsx(
        `flexCenter ${
          iconPosition === "left" ? `` : `flex-row-reverse`
        } h-10 px-3   gap-x-2 ${
          disable ? `cursor-default` : ` cursor-pointer`
        }  ${loading && "opacity-50"} bg-[#3F8CFF]   rounded-xl `,
        className
      )}
    >
      {icon && <img src={icon} alt="" className="w-5" />}
      {title && <span>{title}</span>}
      {loading && <img src="/icons/loader.svg" alt="" className="w-5" />}
    </button>
  );
};

export default PrimaryButton;
