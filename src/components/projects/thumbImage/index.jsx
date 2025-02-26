import React, { useState, useRef, useEffect } from "react";

const ThumbImage = ({ onSelect }) => {
  const [thumImg, setThumImg] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Set default image on component mount
  useEffect(() => {
    // Select the first thumbnail by default
    handleThumbnailClick(0);
  }, []);

  // Handle image selection from local device
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage({ file, preview: imageUrl });
      setThumImg(-1);
      if (onSelect) {
        onSelect({ file, preview: imageUrl });
      }
    }
  };

  // Handle image selection from predefined thumbnails
  const handleThumbnailClick = async (index) => {
    setThumImg(index);

    try {
      // Create a file object from the existing thumbnail
      const imageUrl = `/image/projects/icon${index + 1}.png`;

      // Fetch the image to create a File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create a File object from the blob
      const filename = `icon${index + 1}.png`;
      const file = new File([blob], filename, { type: blob.type });

      // Create the same object structure as for uploaded files
      const imageObject = {
        file,
        preview: imageUrl,
      };

      if (onSelect) {
        onSelect(imageObject);
      }
    } catch (error) {
      console.error("Error creating file object from thumbnail:", error);

      // Fallback: still pass the image URL if fetch fails
      if (onSelect) {
        onSelect(`/image/projects/icon${index + 1}.png`);
      }
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
          onClick={() => fileInputRef.current.click()}
          className={`${
            thumImg === -1 && `border-dashed border-2 p-[1px] border-blue-400`
          } w-full h-[53px] bg-[#F4F9FD] rounded-[10px] flexCenter flex flex-col overflow-hidden gap-y-2 cursor-pointer`}
        >
          {uploadedImage ? (
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
