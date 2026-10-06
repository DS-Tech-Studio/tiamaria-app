export type CacheValidator<T> = (value: unknown) => value is T;

export function readLocalCache<T>(key: string, isValid: CacheValidator<T>): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const serializedValue = window.localStorage.getItem(key);
    if (serializedValue === null) return null;

    const value: unknown = JSON.parse(serializedValue);
    if (!isValid(value)) {
      console.warn(`Cached data for "${key}" has an invalid shape.`);
      return null;
    }

    return value;
  } catch (error) {
    console.warn(`Unable to read cached data for "${key}".`, error);
    return null;
  }
}

export function writeLocalCache<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to save cached data for "${key}".`, error);
  }
}

export async function fetchWithLocalCache<T>(
  key: string,
  request: () => Promise<T>,
  isValid: CacheValidator<T>,
): Promise<T> {
  try {
    const value = await request();
    if (!isValid(value)) {
      throw new Error(`The response for "${key}" has an invalid shape.`);
    }

    writeLocalCache(key, value);
    return value;
  } catch (error) {
    const response = (error as { response?: { status?: unknown } }).response;
    if (typeof response?.status === 'number' && response.status < 500) {
      throw error;
    }

    const cachedValue = readLocalCache(key, isValid);
    if (cachedValue !== null) {
      console.warn(`The request for "${key}" failed; using locally cached data.`, error);
      return cachedValue;
    }

    throw error;
  }
}
