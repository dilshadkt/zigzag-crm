import React, { useState, useRef, useEffect } from "react";
import { uploadSingleFile } from "../../../api/service";

const ThumbImage = ({ onSelect }) => {
  const [thumImg, setThumImg] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Set default image on component mount
  useEffect(() => {
    // Select the first thumbnail by default
    handleThumbnailClick(0);
  }, []);

  // Handle image selection from local device
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await uploadSingleFile(formData);
        
        if (response.success) {
          const imageUrl = response.fileUrl;
          setUploadedImage({ file, preview: imageUrl });
          setThumImg(-1);
          if (onSelect) {
            onSelect(imageUrl);
          }
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        // Fallback to local preview if upload fails
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage({ file, preview: imageUrl });
        setThumImg(-1);
        if (onSelect) {
          onSelect(imageUrl);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle image selection from predefined thumbnails
  const handleThumbnailClick = (index) => {
    setThumImg(index);
    const imageUrl = `/image/projects/icon${index + 1}.png`;
    
    if (onSelect) {
      onSelect(imageUrl);
    }
  };

  return (
    <div className="flex flex-col border h-fit max-h-[340px] px-7 py-6 border-[#CED5E0]/70 rounded-3xl">
      <h4 className="font-bold">Select image</h4>
      <p className="text-[#0A1629]/70 my-2">
        Select or upload an avatar for the project (available formats: jpg, png)
      </p>
      <div className="grid gap-6 mt-2 grid-cols-4">
        {/* Predefined thumbnails */}
        {new Array(7).fill(" ").map((item, index) => (
          <div
            onClick={() => handleThumbnailClick(index)}
            key={index}
            className={`${
              thumImg === index &&
              `border-dashed border-2 p-[1px] border-blue-400`
            } w-full h-[53px] bg-[#F4F9FD] rounded-[10px] flexCenter flex flex-col overflow-hidden gap-y-2 cursor-pointer`}
          >
            <img
              src={`/image/projects/icon${index + 1}.png`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Upload image from local device */}
        <div
          onClick={() => !isUploading && fileInputRef.current.click()}
          className={`${
            thumImg === -1 && `border-dashed border-2 p-[1px] border-blue-400`
          } w-full h-[53px] bg-[#F4F9FD] rounded-[10px] flexCenter flex flex-col overflow-hidden gap-y-2 cursor-pointer relative`}
        >
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : uploadedImage ? (
            <img
              src={uploadedImage.preview}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={`/image/projects/upload.png`}
              alt="Upload"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
};

export default ThumbImage;
