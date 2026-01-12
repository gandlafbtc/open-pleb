export const formatCurrency = (amount: number, currencyCode: string): string => {
	if (currencyCode === 'SAT')
		return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)} sats`;
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(
		amount
	);
};

import { toast } from 'svelte-sonner';

function fallbackCopyTextToClipboard(text: string): void {
	const textArea = document.createElement('textarea');
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = '0';
	textArea.style.left = '0';
	textArea.style.position = 'fixed';

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		const successful = document.execCommand('copy');
		if (successful) {
			toast.info('copied!');
		}
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}
export function copyTextToClipboard(text: string): void {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(
		() => {
			toast.info('copied!');
		},
		(err) => {
			console.error('Async: Could not copy text: ', err);
		}
	);
}

export const getHostFromUrl = (url: string) => {
	return url?.split(':')[1].split('/').join('');
};

export const getCount = (from: number, to: number): number[] => {
	const count = [];
	for (let i = from; i <= to; i++) {
		count.push(i);
	}
	return count;
};

export const getDivider = (currentUnit: string) => {
	if (currentUnit === 'sat') {
		return { divider: 100000000, fraction: 8 };
	} 
	if (currentUnit === 'msat') {
		return { divider: 1000, fraction: 3 };
	} 
	return { divider: 100, fraction: 2 };
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const css = (element: HTMLElement, style: Record<string, string>) => {
	for (const property in style) {
		element.style.setProperty(property, style[property]);
	}
};

export const getImgMeta = async (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject();
		img.src = url;
	});
};

export function objectUrlToBase64(objectUrl: string, callback: (base64: string) => void): void {
	const img = new Image();
	img.onload = () => {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;

		const ctx = canvas.getContext('2d');
		ctx?.drawImage(img, 0, 0);

		const base64String = canvas.toDataURL('image/png');
		callback(base64String);
	};
	img.src = objectUrl;
}

/**
 * Converts a base64 string to a Uint8Array
 * 
 * This is particularly useful for Web Push Notifications where
 * the server keys need to be converted from base64 to binary format.
 * 
 * @param base64String - The base64 encoded string to convert
 * @returns Uint8Array representation of the data
 */
export function base64ToUint8Array(base64String: string): Uint8Array {
  // Convert base64 string from URL-safe format to standard base64
  const normalizedBase64 = base64String.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const paddedBase64 = normalizedBase64.padEnd(
    normalizedBase64.length + (4 - (normalizedBase64.length % 4 || 4)) % 4,
    '='
  );
  
  // Decode base64 to binary string
  const binaryString = atob(paddedBase64);
  
  // Create Uint8Array from binary string
  const bytes = new Uint8Array(binaryString.length);
  
  // Fill array byte by byte
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}
