/** cn(): une clases de Tailwind resolviendo conflictos (clsx + tailwind-merge). */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
