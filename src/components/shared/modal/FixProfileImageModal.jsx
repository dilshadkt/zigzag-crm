import React, { useState, useRef } from "react";
import Modal from "./index";
import { updatedProfile } from "../../../api/service";
import { useDispatch } from "react-redux";
import { updateUser } from "../../../store/slice/authSlice";
import { toast } from "react-hot-toast";
import { IoCloudUploadOutline } from "react-icons/io5";

const FixProfileImageModal = ({ isOpen, onClose, user }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const dispatch = useDispatch();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size should be less than 5MB");
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) {
            toast.error("Please select an image first");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("profileImage", selectedImage);

            const response = await updatedProfile(formData);

            if (response.success) {
                toast.success("Profile image updated successfully");
                const updatedImg = response.employee?.profileImage || response.employee?.avatar;
                dispatch(updateUser({
                    profileImage: updatedImg,
                    avatar: updatedImg
                }));
                onClose();
            } else {
                toast.error(response.message || "Failed to update profile image");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Profile Image">
            <div className="flex flex-col items-center gap-6 p-2">
                <p className="text-gray-600 text-center text-sm">
                    Your current profile image seems to have an access issue. Please re-upload your profile picture to fix this.
                </p>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors group overflow-hidden"
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 group-hover:text-indigo-500">
                            <IoCloudUploadOutline size={32} />
                            <span className="text-xs mt-1">Select Image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-xs font-medium">Change</span>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                />

                <div className="flex w-full gap-3 mt-2">
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !selectedImage}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            "Upload & Fix"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default FixProfileImageModal;
