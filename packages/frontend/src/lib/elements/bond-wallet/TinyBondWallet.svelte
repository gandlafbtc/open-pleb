<script lang="ts">
import { formatCurrency } from "$lib/helper";
import { mnemonicStore, proofsStore } from "@gandlaf21/cashu-wallet-engine";

    import Keyboard from "@lucide/svelte/icons/keyboard";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { Banknote, Download, Sprout, Upload, Zap } from "lucide-svelte";

    let isShowSeed= $state(false)
	let isHide = $state(true);

   </script>
   
   <div class="relative">
    <div class="absolute p-0.5 rounded-full bg-purple-500 text-purple-200 right-0 top-0 -mt-2 -mr-8">
        <p class="text-xs px-2 text-nowrap">
                Tokens
        </p>
    </div>

   <DropdownMenu.Root>
    <DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}
     >{formatCurrency($proofsStore.reduce((acc, proof) => acc + proof.amount, 0), "SAT")}
     </DropdownMenu.Trigger
    >
    <DropdownMenu.Content class="w-56">
     <DropdownMenu.Group>
      <DropdownMenu.GroupHeading>Tokens</DropdownMenu.GroupHeading>
      <DropdownMenu.Separator />
      <DropdownMenu.Group>
        <a href="/wallet/mint">
            <DropdownMenu.Item>
                <Banknote class="mr-2 size-4" />
                <span>Mint more tokens</span>
            </DropdownMenu.Item>
        </a>
       <a href="/wallet/melt">
        <DropdownMenu.Item>
            <Zap class="mr-2 size-4" />
            <span>Cash out</span>
        </DropdownMenu.Item>
        </a>
       <DropdownMenu.Separator />
       <DropdownMenu.Item disabled>
        <Download class="mr-2 size-4" />
        <span>Receive token</span>
       </DropdownMenu.Item>
       <DropdownMenu.Item disabled>
        <Upload class="mr-2 size-4" />
        <span>Send Token</span>
       </DropdownMenu.Item>
       <DropdownMenu.Item onclick={()=> isShowSeed = true}>
        <Sprout class="mr-2 size-4" />
        <span>View seed phrase</span>
       </DropdownMenu.Item>
      </DropdownMenu.Group>
    </DropdownMenu.Group>
    </DropdownMenu.Content>
   </DropdownMenu.Root>
</div>


   <Dialog.Root bind:open={isShowSeed}    >
    <Dialog.Content>
     <Dialog.Header>
      <Dialog.Title>Note down this seed phrase to recover tokens in case of loss!</Dialog.Title>
      <Dialog.Description>
        <button
        class=" grid w-80 grid-cols-3 rounded-lg border border-dashed p-2 text-start transition-colors duration-200 hover:bg-secondary"
        onclick={() => (isHide = !isHide)}
    >
        {#each $mnemonicStore[0]?.mnemonic.split(' ') as word, i}
            <span class="text-xs">
                {i + 1}. {isHide ? '******' : word}
            </span>
        {/each}
    </button>
      </Dialog.Description>
     </Dialog.Header>
    </Dialog.Content>
   </Dialog.Root>