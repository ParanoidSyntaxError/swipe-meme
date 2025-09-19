import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars: number = 4): string {
	return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatBalance(balance: number | null, decimals: number): string {
    if (balance === null) {
        return "0";
    }

    const sol = balance / decimals;
    if (sol >= 1) {
        return Math.floor(sol).toLocaleString();
    } else if (sol > 0) {
        return sol.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3,
        });
    } else {
        return "0";
    }
}