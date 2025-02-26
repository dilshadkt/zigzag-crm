import React, { useState, useRef, useEffect } from "react";
import { Camera, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpdateProfile } from "../../../api/hooks";

const ProfileImageUpload = () => {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const navigator = useNavigate();

  const handleSuccess = () => {
    navigator("/welcome/contact");
  };
  const { mutate } = useUpdateProfile(handleSuccess);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      const formData = new FormData();
      formData.append("image", file);
      mutate(formData);
      // setTimeout(() => {
      //   navigator("/welcome/contact");
      // }, 1000);
    }
  };

  const handleRemoveImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
      setImage(null);
    }
  };
  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="flex flex-col items-center gap-6">
        {/* Profile Image Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 shadow-lg transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Remove Button - Only show if image exists */}
          {image && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 shadow-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />

        {/* Helper Text */}
        <p className="text-sm text-gray-500 text-center">
          Click the camera icon to upload your profile picture
          <br />
          Recommended: Square image, at least 400x400 pixels
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
