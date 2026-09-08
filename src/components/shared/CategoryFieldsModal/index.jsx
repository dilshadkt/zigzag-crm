import React, { useEffect, useState } from "react";
import Modal from "../modal";
import CategoryFieldInputs from "../CategoryFieldInputs";
import { findMissingRequiredCategoryField } from "../../../utils/categoryFields";

const CategoryFieldsModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  fields = [],
  categoryName = "",
}) => {
  const [values, setValues] = useState(fields);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValues(fields);
      setError("");
    }
  }, [isOpen, fields]);

  const handleChange = (key, value) => {
    setValues((prev) =>
      prev.map((field) => (field.key === key ? { ...field, value } : field))
    );
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const missing = findMissingRequiredCategoryField(values);
    if (missing) {
      setError(`${missing.label} is required before submitting for review.`);
      return;
    }
    onSubmit(values);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryName ? `${categoryName} details` : "Category details"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500">
          Fill these category fields before moving this work to on review.
        </p>
        <CategoryFieldInputs
          fields={values}
          onChange={handleChange}
          disabled={isLoading}
        />
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 h-10 rounded-xl text-sm font-medium ${
              isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Saving..." : "Save & continue"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFieldsModal;
