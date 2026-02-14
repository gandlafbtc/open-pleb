import { describe, test, expect, beforeEach } from "vitest";
import { mnemonicToSeedSync } from "@scure/bip39";
import { bytesToHex } from "@noble/ciphers/utils.js";
import { seed } from "$lib/state/dynamic/seed.svelte";
import { idKeys } from "$lib/state/dynamic/id.svelte";

describe("Nostr ID Key Derivation", () => {
  /**
   * Test vectors from NIP-06
   */
  const TEST_MNEMONIC = "leader monkey parrot ring guide accident before fence cannon height naive bean";
  const EXPECTED_PRIVKEY_HEX = "7f7ff03d123792d6ac594bfa67bf6d0c0ab55b6b1fdb6249303fe861f1ccba9a";
  const EXPECTED_PUBKEY_HEX = "17162c921dc4d2518f9a101db33695df1afb56ab82f5ff3e5da6eec3ca5cd917";
  const EXPECTED_NPUB = "npub1zutzeysacnf9rru6zqwmxd54mud0k44tst6l70ja5mhv8jjumytsd2x7nu";

  beforeEach(() => {
    // Mock the seed with the test mnemonic
    const testSeed = mnemonicToSeedSync(TEST_MNEMONIC);
    seed.seed = testSeed;
  });

  test("should derive correct private key from seed using BIP32 path m/44'/1237'/0'/0/0", () => {
    idKeys.initKeysFromSeed();
    
    expect(idKeys.privkey).toBeDefined();
    const privkeyHex = bytesToHex(idKeys.privkey!);
    expect(privkeyHex).toBe(EXPECTED_PRIVKEY_HEX);
  });

  test("should derive correct public key from private key", () => {
    idKeys.initKeysFromSeed();
    
    expect(idKeys.pubkey).toBeDefined();
    const pubkeyHex = bytesToHex(idKeys.pubkey!);
    expect(pubkeyHex).toBe(EXPECTED_PUBKEY_HEX);
  });

  test("should generate correct npub from public key", () => {
    idKeys.initKeysFromSeed();
    
    const npub = idKeys.getNpub();
    expect(npub).toBe(EXPECTED_NPUB);
  });

  test("should generate correct hex public key", () => {
    idKeys.initKeysFromSeed();
    
    const hexPubKey = idKeys.getHexPubKey();
    expect(hexPubKey).toBe(EXPECTED_PUBKEY_HEX);
  });

  test("full integration: seed -> keys -> npub", () => {
    // Step 1: Initialize keys from seed
    idKeys.initKeysFromSeed();
    
    // Step 2: Verify private key
    expect(idKeys.privkey).toBeDefined();
    const privkeyHex = bytesToHex(idKeys.privkey!);
    expect(privkeyHex).toBe(EXPECTED_PRIVKEY_HEX);
    
    // Step 3: Verify public key
    expect(idKeys.pubkey).toBeDefined();
    const pubkeyHex = bytesToHex(idKeys.pubkey!);
    expect(pubkeyHex).toBe(EXPECTED_PUBKEY_HEX);
    
    // Step 4: Verify hex public key
    const hexPubKey = idKeys.getHexPubKey();
    expect(hexPubKey).toBe(EXPECTED_PUBKEY_HEX);
    
    // Step 5: Verify npub
    const npub = idKeys.getNpub();
    expect(npub).toBe(EXPECTED_NPUB);
  });

  test("should throw error when seed is not set", () => {
    //@ts-expect-error Clear the seed
    seed.seed = undefined;
    
    expect(() => {
      idKeys.initKeysFromSeed();
    }).toThrow("Could not init ID keys: No seed set.");
  });

  test("should throw error when getting npub without pubkey", () => {
    //@ts-expect-error Create a new instance without initializing
    idKeys.pubkey = undefined;
    
    expect(() => {
      idKeys.getNpub();
    }).toThrow("Could not get pubkey: pubkey not set");
  });

  test("should throw error when getting hex pubkey without pubkey", () => {
    //@ts-expect-error Create a new instance without initializing
    idKeys.pubkey = undefined;
    
    expect(() => {
      idKeys.getHexPubKey();
    }).toThrow("Could not get pubkey: pubkey not set");
  });
});
