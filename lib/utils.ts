import { detect } from 'detect-browser';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function trimAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function isMobile() {
  const browser = detect();
  return browser?.os === 'Android OS' || browser?.os === 'iOS';
}
