import {bech32} from "@scure/base";


export const pubkeyToNpub = (pubkey: Uint8Array): string => {
    const words = bech32.toWords(pubkey);
    return bech32.encode("npub", words);
}

export const npubToPubkey = (npub: string): Uint8Array => {
    const words = bech32.decode(npub as `${string}1${string}`)
    return bech32.fromWords(words.words)
}

