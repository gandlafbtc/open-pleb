import { clsx, type ClassValue } from "clsx";
import { toast } from "svelte-sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };


function fallbackCopyTextToClipboard(text: string, thingThatWasCopied?:string) {
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
                       toast.info(`copied${!thingThatWasCopied?"":" "+thingThatWasCopied}!`);
               }
       } catch (err) {
               console.error('Fallback: Oops, unable to copy', err);
       }

       document.body.removeChild(textArea);
}
export function copyTextToClipboard(text: string, thingThatWasCopied: string) {
       if (!navigator.clipboard) {
               fallbackCopyTextToClipboard(text,thingThatWasCopied);
               return;
       }
       navigator.clipboard.writeText(text).then(
               function () {
                       toast.info(`copied${!thingThatWasCopied?"":" "+thingThatWasCopied}!`);
               },
               function (err) {
                       console.error('Async: Could not copy text: ', err);
               }
       );
}