// Helper functions
export function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        // Replace spaces and special characters like slashes, parentheses, and ampersands with a single hyphen
        .replace(/[\s/()&]+/g, '-')
        // Remove any characters that are not lowercase letters, numbers, or hyphens
        .replace(/[^a-z0-9-]/g, '')
        // Remove consecutive hyphens
        .replace(/-+/g, '-')
        // Remove any leading or trailing hyphens
        .replace(/^-+|-+$/g, '');
}