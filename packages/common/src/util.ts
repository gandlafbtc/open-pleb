export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
export const getUnixNow = () => Math.ceil(Date.now()/1000);
export const getOriginFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.origin; 
    } catch (error) {
        console.error('Invalid URL:', url);
        return url; 
    }
};