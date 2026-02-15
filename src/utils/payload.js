import { ApiError } from "./apiError.js";

export function buildPayload(body, fields, { partial = false } = {}) {
  const payload = {};

  for (const [key, config] of Object.entries(fields)) {
    const rawValue = body?.[key];

    if (rawValue === undefined) {
      if (!partial) {
        if (config.default !== undefined) {
          payload[key] = config.default;
        } else if (config.required) {
          throw new ApiError(400, `Field \"${key}\" is required.`);
        }
      }
      continue;
    }

    if (config.type === "string") {
      if (typeof rawValue !== "string") {
        throw new ApiError(400, `Field \"${key}\" must be a string.`);
      }

      const value = config.trim === false ? rawValue : rawValue.trim();

      if (!config.allowEmpty && value.length === 0) {
        throw new ApiError(400, `Field \"${key}\" cannot be empty.`);
      }

      if (config.maxLength && value.length > config.maxLength) {
        throw new ApiError(
          400,
          `Field \"${key}\" is too long (max ${config.maxLength} chars).`,
        );
      }

      payload[key] = value;
      continue;
    }

    if (config.type === "number") {
      const value = typeof rawValue === "number" ? rawValue : Number(rawValue);

      if (Number.isNaN(value)) {
        throw new ApiError(400, `Field \"${key}\" must be a number.`);
      }

      if (config.integer && !Number.isInteger(value)) {
        throw new ApiError(400, `Field \"${key}\" must be an integer.`);
      }

      if (config.min !== undefined && value < config.min) {
        throw new ApiError(400, `Field \"${key}\" must be >= ${config.min}.`);
      }

      if (config.max !== undefined && value > config.max) {
        throw new ApiError(400, `Field \"${key}\" must be <= ${config.max}.`);
      }

      payload[key] = value;
      continue;
    }

    throw new ApiError(500, `Unsupported field type on \"${key}\".`);
  }

  if (partial && Object.keys(payload).length === 0) {
    throw new ApiError(400, "No valid fields provided for update.");
  }

  return payload;
}
