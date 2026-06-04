export const BASE_URL = "https://www.eventernote.com";

export function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanHtmlText(value: string | undefined): string {
  return cleanText((value ?? "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""));
}

export function absoluteUrl(path: string): string {
  return new URL(path, BASE_URL).toString();
}

export function parseTime(label: string, text: string): string | undefined {
  return new RegExp(`${label}\\s*(\\d{1,2}:\\d{2})`).exec(text)?.[1];
}
