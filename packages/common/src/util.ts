export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
export const getUnixNow = () => Math.ceil(Date.now()/1000);
