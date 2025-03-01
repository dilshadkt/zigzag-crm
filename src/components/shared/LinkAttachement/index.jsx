import React from "react";
import { Link } from "react-router-dom";

const LinkAttachement = ({ disable, links, removeLink }) => {
  return (
    <div className="flex flex-col gap-y-2">
      {links?.length > 0 && (
        <h5 className="font-medium ">Links Attachments ({links?.length})</h5>
      )}
      <div className="flex flex-col gap-y-2 ">
        {links.map((link, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-gray-50 p-2 rounded "
          >
            <Link
              href={link?.preview}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 flex-1 truncate"
            >
              {link?.preview}
            </Link>
            {!disable && (
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="text-red-500 cursor-pointer hover:text-red-700"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkAttachement;
