export const formatCurrency = (amount: number, currencyCode: string): string => {
	if (currencyCode === 'SAT')
		return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount) + ' sats';
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(
		amount
	);
};

import { toast } from 'svelte-sonner';

function fallbackCopyTextToClipboard(text: string) {
	var textArea = document.createElement('textarea');
	textArea.value = text;

	// Avoid scrolling to bottom
	textArea.style.top = '0';
	textArea.style.left = '0';
	textArea.style.position = 'fixed';

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		if (successful) {
			toast.info('copied!');
		}
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}
export function copyTextToClipboard(text: string) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(
		function () {
			toast.info('copied!');
		},
		function (err) {
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
	} else if (currentUnit === 'msat') {
		return { divider: 1000, fraction: 3 };
	} else {
		return { divider: 100, fraction: 2 };
	}
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const css = (element: HTMLElement, style: any) => {
	for (const property in style) element.style[property] = style[property];
};

export const getImgMeta = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();
        img.src = url;
    });
}

export function objectUrlToBase64(objectUrl, callback) {
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