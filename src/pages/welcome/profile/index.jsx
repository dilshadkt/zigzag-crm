import React, { useState, useRef, useEffect } from "react";
import { Camera, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpdateProfile, useUploadProfileImage } from "../../../api/hooks";

const ProfileImageUpload = () => {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigator = useNavigate();

  const handleProfileUpdateSuccess = () => {
    setIsUploading(false);
    navigator("/welcome/contact");
  };

  const handleUploadSuccess = (uploadResult) => {
    if (uploadResult.success && uploadResult.fileUrl) {
      // Then update the profile with the uploaded image URL
      const profileData = {
        profileImage: uploadResult.fileUrl,
      };
      updateProfile(profileData);
    } else {
      console.error("Failed to upload image:", uploadResult.message);
      setIsUploading(false);
    }
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
    setIsUploading(false);
  };

  const { mutate: updateProfile } = useUpdateProfile(
    handleProfileUpdateSuccess
  );
  const { mutate: uploadImage } = useUploadProfileImage(
    handleUploadSuccess,
    handleUploadError
  );

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      // Create FormData for image upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload the image
      uploadImage(formData);
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
            disabled={isUploading}
            className={`absolute bottom-0 right-0 p-2 rounded-full text-white shadow-lg transition-colors ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Remove Button - Only show if image exists and not uploading */}
          {image && !isUploading && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 shadow-lg"
            >
              ×
            </button>
          )}

          {/* Loading indicator */}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
          disabled={isUploading}
        />

        {/* Helper Text */}
        <p className="text-sm text-gray-500 text-center">
          {isUploading
            ? "Uploading your profile picture..."
            : "Click the camera icon to upload your profile picture"}
          <br />
          Recommended: Square image, at least 400x400 pixels
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
