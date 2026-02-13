export const lnurlCallback = async (address: string): Promise<string> => {
    const addressParts = address.split('@');
    const endpoint = `https://${addressParts[1]}/.well-known/lnurlp/${addressParts[0]}`;
    const { callback } = (await (await fetch(endpoint)).json()) as { callback: string };
    if (!callback) {
        throw new Error('No callback url found.');
    }
    return callback;
}

export const getInvoiceForLNURLAddress = async (amount: number, address: string): Promise<string> => {
    const callback = await lnurlCallback(address);
    const cb = `${callback + (callback.includes('?') ? "&" : "?")}amount=${amount * 1000}`;
    const { pr } = (await (await fetch(cb)).json()) as { pr: string };
    return pr;
}

export const validateLnAddress = (address: string): boolean => {
    if (!address || typeof address !== 'string') {
        return false;
    }
    // Basic email format validation for Lightning Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(address)) {
        return false;
    }

    // Split into local and domain parts
    const parts = address.split('@');
    if (parts.length !== 2) {
        return false;
    }

    const [localPart, domain] = parts;

    // Validate local part (username)
    if (localPart.length === 0 || localPart.length > 253) {
        return false;
    }

    // Validate domain part
    if (domain.length === 0 || domain.length > 253) {
        return false;
    }

    // Check for valid characters in local part
    const localPartRegex = /^[a-zA-Z0-9._-]+$/;
    if (!localPartRegex.test(localPart)) {
        return false;
    }

    // Check domain has at least one dot and valid characters
    const domainRegex = /^[a-zA-Z0-9.-]+$/;
    if (!domainRegex.test(domain) || !domain.includes('.')) {
        return false;
    }

    // Ensure domain doesn't start or end with a dot or hyphen
    if (domain.startsWith('.') || domain.startsWith('-') || 
        domain.endsWith('.') || domain.endsWith('-')) {
        return false;
    }

    return true;
}
