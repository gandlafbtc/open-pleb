import { bech32 } from '@scure/base';

export interface InvoiceData {
    amount: number | null; // in sats
    paymentHash?: string;
    description?: string;
    timestamp?: number;
    expiry?: number;
}

/**
 * Parse a Lightning BOLT11 invoice to extract amount and other data
 */
export function parseInvoice(invoice: string): InvoiceData | null {
    try {
        // Remove lightning: prefix if present
        const cleanInvoice = invoice.toLowerCase().replace('lightning:', '').trim();
        
        // Decode bech32
        const { prefix } = bech32.decode(cleanInvoice as `${string}1${string}`, 1000);
        
        // Check if it's a valid lightning invoice (lnbc, lntb, lnbcrt)
        if (!prefix.startsWith('ln')) {
            return null;
        }
        
        // Extract amount from prefix
        // Format: ln + network + amount (optional)
        // e.g., lnbc1000n (1000 nano-bitcoin = 100 sats)
        const amountMatch = prefix.match(/^ln[a-z]+(\d+)([munp]?)$/);
        
        let amount: number | null = null;
        
        if (amountMatch) {
            const amountValue = parseInt(amountMatch[1]);
            const multiplier = amountMatch[2];
            
            // Convert to satoshis based on multiplier
            switch (multiplier) {
                case 'm': // milli-bitcoin (0.001 BTC)
                    amount = amountValue * 100000;
                    break;
                case 'u': // micro-bitcoin (0.000001 BTC)
                    amount = amountValue * 100;
                    break;
                case 'n': // nano-bitcoin (0.000000001 BTC)
                    amount = amountValue * 0.1;
                    break;
                case 'p': // pico-bitcoin (0.000000000001 BTC)
                    amount = amountValue * 0.0001;
                    break;
                default:
                    // No multiplier means the amount is in BTC
                    amount = amountValue * 100000000;
            }
            
            amount = Math.round(amount);
        }
        
        return {
            amount,
        };
    } catch (error) {
        console.error('Failed to parse invoice:', error);
        return null;
    }
}

/**
 * Check if a string is a valid Lightning invoice
 */
export function isLightningInvoice(str: string): boolean {
    if (!str) return false;
    const cleaned = str.toLowerCase().replace('lightning:', '').trim();
    return cleaned.startsWith('ln') && cleaned.length > 10;
}
