export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

export function validateDeckName(name: string): boolean {
  return name.length > 0 && name.length <= 100 && /^[a-zA-Z0-9\s\-_]+$/.test(name);
}

export function validateCardId(id: string): boolean {
  return /^[a-f0-9\-]+$/.test(id);
}

export function validateJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

export function validateStorageKey(key: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(key);
}