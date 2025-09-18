import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars: number = 4): string {
	return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

