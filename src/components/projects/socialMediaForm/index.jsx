import React, { useState } from "react";
import Input from "../../shared/Field/input";
import Description from "../../shared/Field/description";
import PrimaryButton from "../../shared/buttons/primaryButton";

const SocialMediaForm = ({ values, setFieldValue, errors, touched }) => {
  const [showOtherPlatform, setShowOtherPlatform] = useState(false);
  const [newPlatform, setNewPlatform] = useState({
    platform: "",
    manage: false,
    handle: "",
    notes: "",
  });

  // Standard platforms
  const platforms = ["instagram", "facebook", "youtube", "linkedin", "twitter"];

  // Handle toggle for manage checkbox
  const handleToggleManage = (platform) => {
    const updatedSocialMedia = { ...values.socialMedia };

    if (!updatedSocialMedia[platform]) {
      updatedSocialMedia[platform] = { manage: false, handle: "", notes: "" };
    }

    updatedSocialMedia[platform].manage = !updatedSocialMedia[platform].manage;
    setFieldValue("socialMedia", updatedSocialMedia);
  };

  // Handle change for platform details
  const handlePlatformChange = (platform, field, value) => {
    const updatedSocialMedia = { ...values.socialMedia };

    if (!updatedSocialMedia[platform]) {
      updatedSocialMedia[platform] = { manage: false, handle: "", notes: "" };
    }

    updatedSocialMedia[platform][field] = value;
    setFieldValue("socialMedia", updatedSocialMedia);
  };

  // Add new platform to the "other" array
  const handleAddOtherPlatform = () => {
    if (!newPlatform.platform) return;

    const updatedSocialMedia = { ...values.socialMedia };
    if (!updatedSocialMedia.other) {
      updatedSocialMedia.other = [];
    }

    updatedSocialMedia.other.push({ ...newPlatform });
    setFieldValue("socialMedia", updatedSocialMedia);
    setNewPlatform({ platform: "", manage: false, handle: "", notes: "" });
    setShowOtherPlatform(false);
  };

  // Remove a platform from the "other" array
  const handleRemoveOtherPlatform = (index) => {
    const updatedSocialMedia = { ...values.socialMedia };
    updatedSocialMedia.other.splice(index, 1);
    setFieldValue("socialMedia", updatedSocialMedia);
  };

  // Initialize socialMedia if undefined
  if (!values.socialMedia) {
    values.socialMedia = {
      instagram: { manage: false, handle: "", notes: "" },
      facebook: { manage: false, handle: "", notes: "" },
      youtube: { manage: false, handle: "", notes: "" },
      linkedin: { manage: false, handle: "", notes: "" },
      twitter: { manage: false, handle: "", notes: "" },
      other: [],
    };
  }

  return (
    <div className="flex flex-col gap-y-6 ">
      {/* Standard Platforms */}
      <div className="grid grid-cols-1 gap-y-4">
        {platforms.map((platform) => (
          <div key={platform} className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h6 className="font-medium capitalize text-sm text-gray-600">
                {platform}
              </h6>
              <div className="flex cursor-pointer items-center">
                <label
                  htmlFor={`manage-${platform}`}
                  className="mr-2 text-gray-600 text-sm"
                >
                  Manage
                </label>
                <input
                  id={`manage-${platform}`}
                  type="checkbox"
                  checked={values.socialMedia?.[platform]?.manage || false}
                  onChange={() => handleToggleManage(platform)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>

            {values.socialMedia?.[platform]?.manage && (
              <>
                <Input
                  name={`${platform}-handle`}
                  title="Handle/Username"
                  value={values.socialMedia?.[platform]?.handle || ""}
                  onchange={(e) =>
                    handlePlatformChange(platform, "handle", e.target.value)
                  }
                  placeholder={`@${platform}handle`}
                />
                <Description
                  name={`${platform}-notes`}
                  title="Notes"
                  value={{
                    [`${platform}-notes`]:
                      values.socialMedia?.[platform]?.notes || "",
                  }}
                  onChange={(e) =>
                    handlePlatformChange(platform, "notes", e.target.value)
                  }
                  placeholder={`Add notes about ${platform} management`}
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Other Platforms */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-4">
          <h6 className="font-medium text-gray-600">Other Platforms</h6>
          <PrimaryButton
            title="Add Platform"
            onclick={() => setShowOtherPlatform(true)}
            className="text-white px-4 py-2"
          />
        </div>

        {/* List of other platforms */}
        {values.socialMedia?.other?.map((item, index) => (
          <div
            key={index}
            className="border border-gray-300 p-4 rounded-lg mb-4 relative"
          >
            <button
              type="button"
              onClick={() => handleRemoveOtherPlatform(index)}
              className="absolute right-2 top-3 text-red-500 p-1"
            >
              ✕
            </button>
            <div className="flex items-center justify-between mb-4">
              <h6 className="font-medium capitalize">{item.platform}</h6>
              <div className="flex items-center mr-7">
                <label
                  htmlFor={`manage-other-${index}`}
                  className="mr-2 text-sm"
                >
                  Manage
                </label>
                <input
                  id={`manage-other-${index}`}
                  type="checkbox"
                  checked={item.manage || false}
                  onChange={() => {
                    const updatedSocialMedia = { ...values.socialMedia };
                    updatedSocialMedia.other[index].manage = !item.manage;
                    setFieldValue("socialMedia", updatedSocialMedia);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>

            {item.manage && (
              <>
                <Input
                  name={`other-${index}-handle`}
                  title="Handle/Username"
                  value={item.handle || ""}
                  onchange={(e) => {
                    const updatedSocialMedia = { ...values.socialMedia };
                    updatedSocialMedia.other[index].handle = e.target.value;
                    setFieldValue("socialMedia", updatedSocialMedia);
                  }}
                  placeholder="@handle"
                />
                <Description
                  name={`other-${index}-notes`}
                  title="Notes"
                  value={{ [`other-${index}-notes`]: item.notes || "" }}
                  onChange={(e) => {
                    const updatedSocialMedia = { ...values.socialMedia };
                    updatedSocialMedia.other[index].notes = e.target.value;
                    setFieldValue("socialMedia", updatedSocialMedia);
                  }}
                  placeholder="Add notes about platform management"
                />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new platform form */}
      {showOtherPlatform && (
        <div className="border p-4 rounded-lg border-gray-200 bg-gray-50">
          <h6 className="font-medium text-sm text-gray-600 mb-2">
            Add New Platform
          </h6>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <Input
              name="new-platform-name"
              title="Platform Name"
              value={newPlatform.platform}
              onchange={(e) =>
                setNewPlatform({ ...newPlatform, platform: e.target.value })
              }
              placeholder="Platform name"
            />
            <div className="flex items-center mb-2">
              <label htmlFor="new-platform-manage" className="mr-2 text-sm">
                Manage
              </label>
              <input
                id="new-platform-manage"
                type="checkbox"
                checked={newPlatform.manage}
                onChange={() =>
                  setNewPlatform({
                    ...newPlatform,
                    manage: !newPlatform.manage,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            {newPlatform.manage && (
              <>
                <Input
                  name="new-platform-handle"
                  title="Handle/Username"
                  value={newPlatform.handle}
                  onchange={(e) =>
                    setNewPlatform({ ...newPlatform, handle: e.target.value })
                  }
                  placeholder="@handle"
                />
                <Description
                  name="new-platform-notes"
                  title="Notes"
                  value={{ "new-platform-notes": newPlatform.notes }}
                  onChange={(e) =>
                    setNewPlatform({ ...newPlatform, notes: e.target.value })
                  }
                  placeholder="Add notes about platform management"
                />
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <PrimaryButton
              title="Cancel"
              onclick={() => setShowOtherPlatform(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2"
            />
            <PrimaryButton
              title="Add"
              onclick={handleAddOtherPlatform}
              className="text-white px-4 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaForm;
