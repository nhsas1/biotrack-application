import * as React from "react";

const memoryStore = new Map<string, unknown>();

function hasCompatibleShape(value: unknown, initialValue: unknown): boolean {
  if (initialValue === null) {
    return value === null;
  }

  if (Array.isArray(initialValue)) {
    if (!Array.isArray(value)) return false;
    const expectedItem = initialValue[0];
    return (
      expectedItem === undefined ||
      value.every((item) => hasCompatibleShape(item, expectedItem))
    );
  }

  if (typeof initialValue === "object") {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      return false;
    const candidate = value as Record<string, unknown>;
    return Object.entries(initialValue as Record<string, unknown>).every(
      ([key, expected]) =>
        key in candidate && hasCompatibleShape(candidate[key], expected),
    );
  }

  return typeof value === typeof initialValue;
}

function readStoredValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    const memoryValue = memoryStore.get(key);
    return hasCompatibleShape(memoryValue, initialValue)
      ? (memoryValue as T)
      : initialValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue !== null) {
      const parsedValue: unknown = JSON.parse(rawValue);
      if (hasCompatibleShape(parsedValue, initialValue))
        return parsedValue as T;
    }
    return initialValue;
  } catch {
    const memoryValue = memoryStore.get(key);
    return hasCompatibleShape(memoryValue, initialValue)
      ? (memoryValue as T)
      : initialValue;
  }
}

function saveValue<T>(key: string, value: T): void {
  try {
    if (typeof window === "undefined") {
      throw new Error("localStorage is unavailable outside a browser");
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    memoryStore.set(key, value);
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(() =>
    readStoredValue(key, initialValue),
  );

  React.useEffect(() => {
    saveValue(key, value);
  }, [key, value]);

  return [value, setValue];
}
