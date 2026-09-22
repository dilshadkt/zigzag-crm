import React, { useState, useRef, useEffect } from "react";
import { uploadSingleFile } from "../../../api/service";

const ThumbImage = ({ onSelect, initialImage }) => {
  const [uploadedImage, setUploadedImage] = useState(initialImage ? { preview: initialImage } : null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Sync with initialImage if it changes from outside
  useEffect(() => {
    if (initialImage) {
      setUploadedImage({ preview: initialImage });
    }
  }, [initialImage]);

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
        if (onSelect) {
          onSelect(imageUrl);
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col border h-fit px-7 py-6 border-[#CED5E0]/70 rounded-3xl">
      <h4 className="font-bold">Select image</h4>
      <p className="text-[#0A1629]/70 my-2 text-sm">
        Upload an avatar for the project (available formats: jpg, png)
      </p>
      
      {/* Upload image from local device */}
      <div
        onClick={() => !isUploading && fileInputRef.current.click()}
        className={`w-full h-[150px] mt-4 bg-[#F4F9FD] rounded-[10px] flex items-center justify-center flex-col overflow-hidden gap-y-2 cursor-pointer relative border-dashed border-2 border-blue-200 hover:border-blue-400 transition-colors group`}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : uploadedImage ? (
          <>
            <img
              src={uploadedImage.preview}
              alt="Uploaded"
              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="bg-white/80 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                 Change Image
               </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity">
            <img
              src={`/image/projects/upload.png`}
              alt="Upload"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-sm font-semibold">Click to upload</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg, image/png, image/jpg"
      />
    </div>
  );
};

export default ThumbImage;
