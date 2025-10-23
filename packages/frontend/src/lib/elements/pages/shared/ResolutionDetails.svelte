<script lang="ts">
	import type { Claim, Offer } from '@openPleb/common/db/schema';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/helper';
	import { Gavel, CheckCircle, Info, ArrowRightLeft, RotateCcw } from "lucide-svelte";
	import { RESOLUTION_PATHS } from "@openPleb/common/types";
    import { getDecodedToken } from "@cashu/cashu-ts";

    interface Props {offer: Offer, claim?: Claim}
    
    let {offer, claim}: Props = $props();

    // Format date from unix timestamp
    const formatDate = (timestamp: number | undefined) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
    };
    
    // Map resolution to human readable text
    const getResolutionText = (resolution: string | undefined) => {
        if (!resolution) return 'Unknown';
        
        switch (resolution) {
            case RESOLUTION_PATHS.MAKER_WINS:
                return 'Maker Wins (Offer Creator)';
            case RESOLUTION_PATHS.TAKER_WINS:
                return 'Taker Wins (Claim Creator)';
            case RESOLUTION_PATHS.SPLIT:
                return 'Split (50/50)';
            case RESOLUTION_PATHS.RETURN:
                return 'All Funds Returned';
            default:
                return resolution;
        }
    };
    
    // Get appropriate icon based on resolution
    const getResolutionIcon = (resolution: string | undefined) => {
        if (!resolution) return Info;
        
        switch (resolution) {
            case RESOLUTION_PATHS.MAKER_WINS:
            case RESOLUTION_PATHS.TAKER_WINS:
                return CheckCircle;
            case RESOLUTION_PATHS.SPLIT:
                return ArrowRightLeft;
            case RESOLUTION_PATHS.RETURN:
                return RotateCcw;
            default:
                return Info;
        }
    };
    
    // Extract resolution type from resolution reason
    const getResolutionType = (resolutionReason: string | undefined): string | undefined => {
        if (!resolutionReason) return undefined;
        
        // Simple parsing of resolution reason to extract resolution type
        // Format is expected to be something like "MAKER_WINS: Reason text here"
        const [type] = resolutionReason.split(":")
        return type
    };
    
    // Parse token amount from cashu token string
    const parseTokenAmount = (tokenString: string): number => {
        const token = getDecodedToken(tokenString);
        const amount = token.proofs.reduce((acc, proof) => acc + proof.amount, 0);
        return amount;
    };
    
    
    const resolutionType = getResolutionType(offer.resolutionReason??'');
    const ResolutionIcon = getResolutionIcon(resolutionType);
    const makerPayout = $derived(() =>
        offer.refund ? formatCurrency(parseTokenAmount(offer.refund), 'SAT') : 'N/A'
    );
    const takerPayout = $derived(() =>
        claim?.reward ? formatCurrency(parseTokenAmount(claim.reward), 'SAT') : 'N/A'
    );
</script> 

<div class="flex flex-col justify-center items-center p-4 gap-4 w-full">
    <Card.Root class="w-full">
        <Card.Header>
            <Card.Title class="flex items-center gap-2 text-green-600">
                <Gavel class="h-5 w-5" />
                <span>Dispute Resolution</span>
            </Card.Title>
            <Card.Description>
                This offer's dispute has been resolved by administrators
            </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
            <div class="flex items-center gap-2 mb-4">
                <ResolutionIcon class="h-5 w-5 text-green-600" />
                <div>
                    <p class="font-semibold">Resolution</p>
                    <p>{getResolutionText(resolutionType)}</p>
                </div>
            </div>
            
            {#if offer.resolutionReason}
                <div class="bg-muted p-4 rounded-md">
                    <p class="font-semibold mb-2">Administrator's Decision</p>
                    <p class="text-sm">{offer.resolutionReason.replace(/^[A-Z_]+:\s*/, '')}</p>
                </div>
            {/if}
            
            <div>
                <p class="font-semibold">Dispute Details</p>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <p class="text-sm text-muted-foreground">Original Amount</p>
                        <p>{formatCurrency(offer.amount, offer.currency ?? "?")}</p>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">Sats Amount</p>
                        <p>{formatCurrency(offer.satsAmount, 'SAT')}</p>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">Bonds Amount</p>
                        <p>{formatCurrency(offer.bondFlatRate + offer.bondPercentage, "SAT")}</p>
                    </div>
                </div>
            </div>
            <div>
                <p class="font-semibold">Payout Details</p>
                <div class="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <p class="text-sm text-muted-foreground">Maker (Offer Creator) Received</p>
                        <p>{makerPayout}</p>
                    </div>
                    <div>
                        <p class="text-sm text-muted-foreground">Taker (Claim Creator) Received</p>
                        <p>{takerPayout}</p>
                    </div>
                </div>
            </div>
        </Card.Content>
        <Card.Footer class="text-xs text-muted-foreground">
            <p>This resolution is final and cannot be appealed. If you have any questions, please contact support.</p>
        </Card.Footer>
    </Card.Root>
</div>
