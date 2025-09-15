import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//snake_case → camelCase converter
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj; // langsung return null/undefined tanpa proses
  }

  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }

  return obj;
}

// camelCase → snake_case converter
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(v => toSnakeCase(v));
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = key
        .replace(/([A-Z])/g, "_$1")  // ubah huruf besar jadi _huruf
        .toLowerCase();
      result[snakeKey] = toSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }

  return obj;
}

