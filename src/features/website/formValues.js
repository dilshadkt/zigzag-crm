// Turns stored content into form state and back, from the section's field list.

let nextKey = 0;

/** Repeated items need a stable key while they are moved around. */
export const newItem = (fields, item) => ({
  _key: `item-${(nextKey += 1)}`,
  ...(item?._id && { _id: item._id }),
  ...formValues(fields, item),
});

export const formValues = (fields, data) =>
  Object.fromEntries(
    fields.map((field) => {
      const value = data?.[field.key];
      if (field.type === "group") return [field.key, formValues(field.fields, value)];
      if (field.type === "repeater") {
        const items = value ?? (field.required ? [undefined] : []);
        return [field.key, items.map((item) => newItem(field.fields, item))];
      }
      if (value !== undefined && value !== null) return [field.key, value];
      if (!data && field.default !== undefined) return [field.key, field.default];
      return [field.key, field.type === "boolean" ? false : ""];
    })
  );

/** The values as they are sent: without the form's own keys. */
export const toData = (value) => {
  if (Array.isArray(value)) return value.map(toData);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "_key")
      .map(([key, v]) => [key, toData(v)])
  );
};

/**
 * Only the fields that were edited, so saving never rewrites the rest of an
 * imported article.
 */
export const changedData = (initial, values) =>
  Object.fromEntries(
    Object.keys(values)
      .filter((key) => JSON.stringify(toData(values[key])) !== JSON.stringify(toData(initial[key])))
      .map((key) => [key, toData(values[key])])
  );
