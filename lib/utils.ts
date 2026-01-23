import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeArea(area: string): string {
  return area.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern API (works in secure contexts)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("Navigator clipboard failed, trying fallback", e);
    }
  }

  // 2. Fallback for non-secure or older support (specifically mobile iOS/Android)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Mobile-friendly styling
    textArea.style.position = "fixed";
    textArea.style.left = "0";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";

    // iOS needs contentEditable to be robust in some versions
    textArea.contentEditable = "true";
    textArea.readOnly = false;

    document.body.appendChild(textArea);

    textArea.focus();

    // iOS specific selection
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    return successful;
  } catch (err) {
    console.error("Copy fallback failed", err);
    return false;
  }
}
