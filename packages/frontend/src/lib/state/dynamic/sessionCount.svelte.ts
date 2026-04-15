/**
 * Session count state management
 * Tracks active maker and taker session counts
 */

export interface SessionCounts {
	makerCount: number;
	takerCount: number;
}

class SessionCountState {
	private _counts = $state<SessionCounts>({
		makerCount: 0,
		takerCount: 0
	});

	get counts(): SessionCounts {
		return this._counts;
	}

	get makerCount(): number {
		return this._counts.makerCount;
	}

	get takerCount(): number {
		return this._counts.takerCount;
	}

	setCounts(counts: SessionCounts): void {
		this._counts = counts;
	}

	updateCounts(counts: Partial<SessionCounts>): void {
		this._counts = { ...this._counts, ...counts };
	}
}

export const sessionCountState = new SessionCountState();
