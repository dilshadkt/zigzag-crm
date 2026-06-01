/**
 * fieldRuleUtils.js
 * Utility functions for evaluating conditional field visibility rules.
 * Used by LeadFormPreviewPanel, DynamicLeadForm, and the rule builder UI.
 */

/**
 * Supported operators for conditional rules.
 */
export const RULE_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "is_filled", label: "is filled" },
  { value: "is_empty", label: "is empty" },
];

/**
 * Evaluate a single rule against the current form values.
 * @param {object} rule  - { fieldId, operator, value }
 * @param {object} values - current form values keyed by fieldId
 * @returns {boolean}
 */
export function evaluateRule(rule, values) {
  if (!rule || !rule.fieldId || !rule.operator) return true;

  const fieldValue = values?.[rule.fieldId];
  const normalised = typeof fieldValue === "string"
    ? fieldValue.trim()
    : fieldValue;

  const isEmpty =
    normalised === undefined ||
    normalised === null ||
    normalised === "" ||
    normalised === false;

  switch (rule.operator) {
    case "equals":
      return String(normalised ?? "") === String(rule.value ?? "");
    case "not_equals":
      return String(normalised ?? "") !== String(rule.value ?? "");
    case "is_filled":
      return !isEmpty;
    case "is_empty":
      return isEmpty;
    default:
      return true;
  }
}

/**
 * Determine whether a field should be visible given current form values.
 * A field with no rules is always visible.
 * When multiple rules exist, ALL must pass (AND logic).
 *
 * @param {object} field    - field object (may have a `rules` array)
 * @param {object} values   - current form values keyed by fieldId
 * @returns {boolean}
 */
export function isFieldVisible(field, values) {
  if (!field?.rules || field.rules.length === 0) return true;
  return field.rules.every((rule) => evaluateRule(rule, values));
}

/**
 * Filter a fields array to only those that should currently be visible.
 * @param {Array}  fields - full list of form fields
 * @param {object} values - current form values
 * @returns {Array}
 */
export function getVisibleFields(fields, values) {
  return (fields || []).filter((field) => isFieldVisible(field, values));
}
