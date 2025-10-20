import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUniqueSlug(title: string): string {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: "ru",
    remove: /[*+~.()'"!:@]/g,
  });

  const uniqueId = crypto.randomUUID().split("-")[0];

  return `${baseSlug}_${uniqueId}`;
}
