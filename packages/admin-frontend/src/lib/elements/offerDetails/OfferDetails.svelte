<script lang="ts">
	import { dataStore } from "$lib/stores/data.svelte";
	import * as Card from '$lib/components/ui/card/index.js';
	import Progress from "$lib/components/ui/progress/progress.svelte";
	import { formatCurrency } from '$lib/helper';
	import { clock } from "$lib/stores/clock.svelte";
	import { OFFER_STATE } from "@openPleb/common/types";
	import { BadgeDollarSign, CalendarDays, Coins, CurrencyIcon, FileImage, Fullscreen, Info, Rotate3D, Stamp, User, Clock, Award, QrCode, Receipt as ReceiptIcon, RefreshCcw, AlertTriangle, Scale } from "lucide-svelte";
	import CopiableToken from "./CopiableToken.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import ResolveDispute from "./ResolveDispute.svelte";

    interface Props {id: number }
    
    const {id}: Props = $props();

    const offer = $derived(dataStore.offers.find(o => o.id === id));
    const claim = $derived(dataStore.claims.find(c => c.offerId === id));
    const receipt = $derived(dataStore.receipts.find(r => r.offerId === id));
    
    // biome-ignore lint/style/useConst: This variable is modified by button clicks to toggle fullscreen mode
    let showFullScreen = $state(false);
    
    // Calculate expiry percentage
    const expiryPercentage = $derived(((((offer?.validForS??0) + (offer?.createdAt??0) - $clock)/((offer?.validForS??0)||1)) * 100));
    
    // Format date from unix timestamp
    const formatDate = (timestamp: number | undefined) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
    };
</script>

<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Offer Details Section -->
    {#if offer && offer.status === OFFER_STATE.DISPUTED}
    <!-- Dispute Details Section -->
    <Card.Root class="w-full col-span-1 md:col-span-2 mb-6">
        <Card.Header>
            <Card.Title class="flex items-center gap-2 text-red-500">
                <AlertTriangle class="h-5 w-5" />
                <span>Dispute Information</span>
            </Card.Title>
            <Card.Description>
                This offer has been escalated to a dispute and is under administrative review
            </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
            <div class="p-4 border rounded-md mb-4">
                <div class="flex items-center gap-2 mb-3">
                    <Scale class="h-5 w-5 text-red-600" />
                    <p class="font-semibold text-red-600">Dispute Details</p>
                </div>
                <p class="mb-2">
                    A dispute was raised for this offer. Both parties have presented their sides, and the case is now under review by administrators.
                </p>
                <p class="mb-2">
                    All bonds are held until this dispute is resolved. A resolution will be made based on the evidence provided and transaction details.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Maker Information -->
                <div class="border rounded-md p-4 shadow-sm">
                    <div class="flex items-center gap-2 mb-3">
                        <User class="h-5 w-5 text-blue-600" />
                        <p class="font-semibold text-blue-600">Maker (Offer Creator)</p>
                    </div>
                    
                    <div class="space-y-3">
                        <div>
                            <p class="font-semibold text-sm text-gray-600">Public Key:</p>
                            <a href={`/user/${offer.pubkey}`} class="underline hover:no-underline text-sm">
                                {offer.pubkey ? offer.pubkey.substring(0, 8) + '...' + offer.pubkey.substring(offer.pubkey.length - 8) : 'N/A'}
                            </a>
                        </div>
                        
                        <div>
                            <p class="font-semibold text-sm text-gray-600">Reputation:</p>
                            <div class="flex items-center">
                                <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                </svg>
                                <p class="ms-2 text-sm font-bold">4.95</p>
                                <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                                <a href={`/user/${offer.pubkey}/ratings`} class="text-sm font-medium underline hover:no-underline">73 reviews</a>
                            </div>
                        </div>
                        
                        <div>
                            <p class="font-semibold text-sm text-gray-600">Bond Amount:</p>
                            <p class="text-sm">{formatCurrency(offer.bondFlatRate + offer.bondPercentage, "SAT")}</p>
                        </div>
                        
                        <div>
                            <p class="font-semibold text-sm text-gray-600">Offer Amount:</p>
                            <p class="text-sm">{formatCurrency(offer.amount, offer.currency ?? "?")} / {formatCurrency(offer.satsAmount, 'SAT')}</p>
                        </div>
                        
                        {#if offer.feedback}
                            <div>
                                <p class="font-semibold text-sm text-gray-600">Dispute Statement:</p>
                                <p class="italic text-sm p-2  rounded border">{offer.feedback}</p>
                            </div>
                        {/if}
                    </div>
                </div>
                
                <!-- Taker Information -->
                {#if claim}
                    <div class="border rounded-md p-4 shadow-sm">
                        <div class="flex items-center gap-2 mb-3">
                            <User class="h-5 w-5 text-green-600" />
                            <p class="font-semibold text-green-600">Taker (Claim Creator)</p>
                        </div>
                        
                        <div class="space-y-3">
                            <div>
                                <p class="font-semibold text-sm text-gray-600">Public Key:</p>
                                <a href={`/user/${claim.pubkey}`} class="underline hover:no-underline text-sm">
                                    {claim.pubkey ? claim.pubkey.substring(0, 8) + '...' + claim.pubkey.substring(claim.pubkey.length - 8) : 'N/A'}
                                </a>
                            </div>
                            
                            <div>
                                <p class="font-semibold text-sm text-gray-600">Reputation:</p>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <p class="ms-2 text-sm font-bold">4.95</p>
                                    <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                                    <a href={`/user/${claim.pubkey}/ratings`} class="text-sm font-medium underline hover:no-underline">73 reviews</a>
                                </div>
                            </div>
                            
                            <div>
                                <p class="font-semibold text-sm text-gray-600">Bond Amount:</p>
                                <p class="text-sm">{formatCurrency(offer.bondFlatRate + offer.bondPercentage, "SAT")}</p>
                            </div>
                            
                            <div>
                                
                    <div class="flex items-center gap-2">
                        <div>
                            <p class="font-semibold text-sm text-gray-600">Receipt Image</p>
                        </div>
                    </div>
                    
                    <div class="w-full overflow-hidden rounded-lg border relative">
                        <div class="absolute right-5 top-5">
                            <button
                                onclick={() => {
                                    showFullScreen = true;
                                }}
                                class="opacity-80 hover:opacity-100 transition-colors p-2 rounded-md bg-background"
                            >
                                <Fullscreen></Fullscreen>
                            </button>
                        </div>
                        <img
                        src={receipt?.receiptImg}
                        alt="Receipt"
                        class="h-20 object-contain"
                        />
                    </div>
                            </div>
                            
                            {#if offer.feedbackResponse}
                                <div>
                                    <p class="font-semibold text-sm text-gray-600">Dispute Response:</p>
                                    <p class="italic text-sm p-2 rounded border">{offer.feedbackResponse}</p>
                                </div>
                            {/if}
                        </div>
                    </div>
                    {/if}
                </div>
                <ResolveDispute></ResolveDispute>
            
            <div class="text-sm text-muted-foreground">
                <p>Dispute opened at: {formatDate(offer.createdAt)}</p>
                <p>Current status: <span class="font-medium text-red-500">{offer.status}</span></p>
            </div>
        </Card.Content>
    </Card.Root>
{/if}
    <Card.Root class="w-full">
        <Card.Header>
            <Card.Title class="flex items-center justify-between">
                <span>Offer Details</span>
                <span class="text-sm font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {offer?.status ?? 'Unknown'}
                </span>
            </Card.Title>
            <Card.Description>
                Created at {formatDate(offer?.createdAt)}
            </Card.Description>
        </Card.Header>
        <Card.Content class="space-y-4">
            {#if offer}
                <div class="flex items-center gap-2">
                    <BadgeDollarSign class="h-5 w-5" />
                    <div>
                        <p class="font-semibold">Amount</p>
                        <p>{formatCurrency(offer.amount, offer.currency ?? "?")}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-2">
                    <Coins class="h-5 w-5" />
                    <div>
                        <p class="font-semibold">Sats Amount</p>
                        <p>{formatCurrency(offer.satsAmount, 'SAT')}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <Rotate3D class="h-5 w-5" />
                    <div>
                        <p class="font-semibold">Exchange rate</p>
                        <p>1 BTC = {formatCurrency(offer.conversionRate, offer.currency ?? "?")}</p>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <User class="h-5 w-5" />
                    <div>
                        <p class="font-semibold">Maker</p>
                        <a href={`/user/${offer.pubkey}`} class="underline hover:no-underline"> {offer.pubkey ? offer.pubkey.substring(0, 8) + '...' + offer.pubkey.substring(offer.pubkey.length - 8) : 'N/A'}</a>
                        <div>
                        <div class="flex items-center">
                            <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                            </svg>
                            <p class="ms-2 text-sm font-bold">4.95</p>
                            <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                            <a href={`/user/${offer.pubkey}/ratings`} class="text-sm font-medium underline hover:no-underline ">73 reviews</a>
                        </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2">
                    <Info class="h-5 w-5" />
                    <div>
                        <p class="font-semibold">Description</p>
                        <p>{offer.description ?? 'No description provided'}</p>
                    </div>
                </div>

                {#if offer.feedback}
                    <div class="flex items-center gap-2">
                        <Info class="h-5 w-5" />
                        <div>
                            <p class="font-semibold">Feedback</p>
                            <p>{offer.feedback}</p>
                        </div>
                    </div>
                {/if}

                <div class="flex items-center gap-2">
                    <Stamp class="h-5 w-5" />
                    <div>
                        <p class="font-semibold">Fees and Bonds</p>
                        <p><span class="font-bold">Platform Fee:</span> {formatCurrency(offer.platformFeeFlatRate, "SAT")} + {offer.platformFeePercentage}%</p>
                        <p><span class="font-bold">Taker Fee:</span> {formatCurrency(offer.takerFeeFlatRate, "SAT")} + {offer.takerFeePercentage}%</p>
                        <p><span class="font-bold">Bond:</span> {formatCurrency(offer.bondFlatRate + offer.bondPercentage, "SAT")}</p>
                    </div>
                </div>

                {#if offer.paidAt}
                    <div class="flex items-center gap-2">
                        <Clock class="h-5 w-5" />
                        <div>
                            <p class="font-semibold">Paid at</p>
                            <p>{formatDate(offer.paidAt)}</p>
                        </div>
                    </div>
                {/if}

                {#if offer.invoice}
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <ReceiptIcon class="h-5 w-5" />
                            <p class="font-semibold">Invoice</p>
                        </div>
                        <div class="w-full">
                            <CopiableToken token={offer.invoice}></CopiableToken>
                        </div>
                    </div>
                {/if}

                {#if offer.qrCode}
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <QrCode class="h-5 w-5" />
                            <p class="font-semibold">QR Code</p>
                        </div>
                        <div class="w-full">
                            <CopiableToken token={offer.qrCode}></CopiableToken>
                        </div>
                    </div>
                {/if}

                {#if offer.refund}
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <RefreshCcw class="h-5 w-5" />
                            <p class="font-semibold">Refund</p>
                        </div>
                        <div class="w-full">
                            <CopiableToken token={offer.refund}></CopiableToken>
                        </div>
                    </div>
                {/if}

                {#if offer.validForS && offer.createdAt && expiryPercentage > 0}
                    <div>
                        <p class="font-semibold mb-1">Expiry</p>
                        <Progress value={expiryPercentage}></Progress>
                    </div>
                {/if}
            {:else}
                <div class="py-4 text-center">
                    <p>No offer data available</p>
                </div>
            {/if}
        </Card.Content>
    </Card.Root>



        <!-- Claim and Receipt Details -->
    <div class="space-y-6">
        <!-- Claim Details Section -->
        <Card.Root class="w-full">
            <Card.Header>
                <Card.Title>Claim Details</Card.Title>
                <Card.Description>
                    {#if claim}
                        Claimed at {formatDate(claim.createdAt)}
                    {:else}
                        Not claimed yet
                    {/if}
                </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                {#if claim}
                    <div class="flex items-center gap-2">
                        <User class="h-5 w-5" />
                        <div>
                            <p class="font-semibold">Claimed by</p>
                            <p>Pubkey: {claim.pubkey ? claim.pubkey.substring(0, 8) + '...' + claim.pubkey.substring(claim.pubkey.length - 8) : 'N/A'}</p>
                            <div>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <p class="ms-2 text-sm font-bold">4.95</p>
                                    <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                                    <a href={`/user/${claim.pubkey}/ratings`} class="text-sm font-medium underline hover:no-underline ">73 reviews</a>
                                </div>
                                </div>
                        </div>
                    </div>

                    {#if claim.reward}
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <Award class="h-5 w-5" />
                                <p class="font-semibold">Reward</p>
                            </div>
                            <div class="w-full">
                                <CopiableToken token={claim.reward}></CopiableToken>
                            </div>
                        </div>
                    {/if}
                {:else}
                    <div class="py-4 text-center">
                        <p>This offer has not been claimed yet</p>
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>

        <!-- Receipt Details Section -->
        <Card.Root class="w-full">
            <Card.Header>
                <Card.Title>Receipt Details</Card.Title>
                <Card.Description>
                    {#if receipt}
                        Submitted at {formatDate(receipt.createdAt)}
                    {:else}
                        No receipt submitted
                    {/if}
                </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                {#if receipt}
                    <div class="flex items-center gap-2">
                        <User class="h-5 w-5" />
                        <div>
                            <p class="font-semibold">Submitted by</p>
                            <p>Pubkey: {receipt.pubkey ? receipt.pubkey.substring(0, 8) + '...' + receipt.pubkey.substring(receipt.pubkey.length - 8) : 'N/A'}</p>
                            <div>
                                <div class="flex items-center">
                                    <svg class="w-4 h-4 text-yellow-300 me-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    <p class="ms-2 text-sm font-bold">4.95</p>
                                    <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
                                    <a href={`/user/${receipt.pubkey}/ratings`} class="text-sm font-medium underline hover:no-underline ">73 reviews</a>
                                </div>
                                </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <FileImage class="h-5 w-5" />
                        <div>
                            <p class="font-semibold">Receipt Image</p>
                        </div>
                    </div>
                    
                    <div class="w-full overflow-hidden rounded-lg border relative">
                        <div class="absolute right-5 top-5">
                            <button
                                onclick={() => {
                                    showFullScreen = true;
                                }}
                                class="opacity-80 hover:opacity-100 transition-colors p-2 rounded-md bg-background"
                            >
                                <Fullscreen></Fullscreen>
                            </button>
                        </div>
                        <img
                        src={receipt.receiptImg}
                        alt="Receipt"
                        class="h-auto max-h-80 w-full object-contain"
                        />
                    </div>
                    {#if showFullScreen}
                        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                            <!-- Close button -->
                            <button
                                onclick={() => {
                                    showFullScreen = false;
                                }}
                                class="absolute right-6 top-4 text-4xl text-white hover:text-gray-300">&times;</button
                            >
                            <img src={receipt.receiptImg} alt="" class="max-h-[100%] max-w-[100%] object-contain" />
                        </div>
                    {/if}
                {:else}
                    <div class="py-4 text-center">
                        <p>No receipt has been submitted for this offer</p>
                    </div>
                {/if}
            </Card.Content>
        </Card.Root>
    </div>
    
</div>
