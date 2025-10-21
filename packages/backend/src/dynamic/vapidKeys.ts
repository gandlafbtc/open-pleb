import type * as webpush from "@negrel/webpush";

export class VapidKeys {
	private static _instance: VapidKeys;
	private static _vapidKeys: CryptoKeyPair;
	private static _appServer: webpush.ApplicationServer;

	// Private constructor to prevent direct instantiation
	private constructor() {}

	// Static method to get the singleton instance
	public static getInstance(): VapidKeys {
		if (!VapidKeys._instance) {
			VapidKeys._instance = new VapidKeys();
		}
		return VapidKeys._instance;
	}

	// Instance getter for vapidKeys
	public get vapidKeys(): CryptoKeyPair {
		return VapidKeys._vapidKeys;
	}

	// Instance setter for vapidKeys
	public set vapidKeys(keys: CryptoKeyPair) {
		VapidKeys._vapidKeys = keys;
	}

	// Instance getter for appServer
	public get appServer(): webpush.ApplicationServer {
		return VapidKeys._appServer;
	}

	// Instance setter for appServer
	public set appServer(server: webpush.ApplicationServer) {
		VapidKeys._appServer = server;
	}
}
