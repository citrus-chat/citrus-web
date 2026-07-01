import { isRef, toRaw, unref } from "vue";

function toPlainValue(value: unknown): unknown {
  const unwrapped = isRef(value) ? unref(value) : value;
  const raw = toRaw(unwrapped);

  if (typeof raw === "function") {
    return undefined;
  }

  if (raw === null || typeof raw !== "object") {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw.map((item) => toPlainValue(item));
  }

  if (raw instanceof Date) {
    return raw.toISOString();
  }

  if (raw instanceof Map) {
    return Object.fromEntries(
      [...raw.entries()].map(([key, item]) => [
        String(key),
        toPlainValue(item),
      ]),
    );
  }

  if (raw instanceof Set) {
    return [...raw.values()].map((item) => toPlainValue(item));
  }

  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .filter(([, item]) => typeof item !== "function")
      .map(([key, item]) => [key, toPlainValue(item)]),
  );
}

export function toPlainObject<T>(value: T): T {
  return toPlainValue(value) as T;
}
