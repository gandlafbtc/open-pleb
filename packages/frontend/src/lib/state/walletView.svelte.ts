import type { HistoryEntry } from 'coco-cashu-core';

export type WalletViewType = 'balance' | 'receive' | 'send' | 'scan' | 'history-detail';

class WalletView {
	private _view: WalletViewType = $state('balance');
	private _selectedHistoryId: string | undefined = $state(undefined);
	private _isOpen: boolean = $state(false);

	// View getter and setter
	public get view(): WalletViewType {
		return this._view;
	}

	public set view(value: WalletViewType) {
		this._view = value;
	}

	// Selected history ID getter and setter
	public get selectedHistoryId(): string | undefined {
		return this._selectedHistoryId;
	}

	public set selectedHistoryId(value: string | undefined) {
		this._selectedHistoryId = value;
	}

	// Is open getter and setter
	public get isOpen(): boolean {
		return this._isOpen;
	}

	public set isOpen(value: boolean) {
		this._isOpen = value;
	}

	// Helper methods
	public setView(view: WalletViewType): void {
		this._view = view;
	}

	public selectHistory(historyItem: HistoryEntry): void {
		this._selectedHistoryId = historyItem.id;
		this._view = 'history-detail';
	}

	public goToBalance(): void {
		this._view = 'balance';
		this._selectedHistoryId = undefined;
	}

	public open(): void {
		this._isOpen = true;
	}

	public close(): void {
		this._isOpen = false;
	}

	public toggle(): void {
		this._isOpen = !this._isOpen;
	}

	public reset(): void {
		this._view = 'balance';
		this._selectedHistoryId = undefined;
	}
}

export const walletView = new WalletView();
