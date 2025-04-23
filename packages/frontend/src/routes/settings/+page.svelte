<script>
	import LnurlSetting from "$lib/elements/settings/LNURLSetting.svelte";
	import { keysStore } from "@gandlaf21/cashu-wallet-engine";

</script>
<div class="flex flex-col gap-4">
    <div class="font-bold">
        <h2 class="text-xl">Settings</h2>
    </div>
    <!-- 
    <div>
        <h3 class="text-lg">LNURL Settings</h3>
    </div>
    <div>
        <p>Set an LNURL to receive payments directly to your wallet</p>
    </div>
    <LnurlSetting></LnurlSetting>
    
    -->
    <div>
        <h3 class="text-lg">Keys</h3>
    </div>
    <div>
        <p>PubKey: { $keysStore[0]?.publicKey }</p>
        <p>PrivKey: { $keysStore[0]?.privateKey }</p>
    </div>
    <LnurlSetting></LnurlSetting>
</div>