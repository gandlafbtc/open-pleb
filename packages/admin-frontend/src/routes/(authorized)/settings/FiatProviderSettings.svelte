<script lang="ts">
    import { onMount } from "svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import FormButton from "$lib/components/ui/form/form-button.svelte";
    import * as Card from "$lib/components/ui/card";
    import { LoaderCircle, Trash, Pencil, Check, X } from "lucide-svelte";
    import { toast } from "svelte-sonner";
	import { fiatProvidersStore } from "$lib/stores/fiatProviders";
	import Dropzone from 'svelte-file-dropzone';
	import { objectUrlToBase64 } from "$lib/helper";
	import { browser } from "$app/environment";
    let file = $state('');
    let editFile = $state('');
    $effect(() => {
        if (browser) {
            objectUrlToBase64(file, async (b64: string) => {
                    newProvider.icon = b64;
            });
        }
    })

    $effect(() => {
        if (browser) {
            objectUrlToBase64(editFile, async (b64: string) => {
                    editData.icon = b64;
            });
        }
    })

    // Main store subscription
    let providers = $derived($fiatProvidersStore.providers);
    let loading = $derived($fiatProvidersStore.loading);

    // Form data for new provider
    let newProvider = $state({
        label: "",
        icon: "",
        matchTemplate: ""
    });

    // Editing state
    let editingId = $state(null);
    let editData = $state({
        label: "",
        icon: "",
        matchTemplate: ""
    });

    // Load providers on mount
    onMount(() => {
        fiatProvidersStore.fetchProviders();
    });

    // Add new provider
    const addProvider = async () => {
        if (!newProvider.label || !newProvider.icon) {
            toast.warning("Label and icon are required");
            return;
        }

        const success = await fiatProvidersStore.addProvider(newProvider);
        if (success) {
            // Reset form
            newProvider = {
                label: "",
                icon: "",
                matchTemplate: ""
            };
        }
    };

    // Edit provider setup
    const startEdit = (provider) => {
        editingId = provider.id;
        editData = {
            label: provider.label,
            icon: provider.icon,
            matchTemplate: provider.matchTemplate || ""
        };
    };

    // Save edited provider
    const saveEdit = async () => {
        if (!editData.label || !editData.icon) {
            toast.warning("Label and icon are required");
            return;
        }

        const success = await fiatProvidersStore.updateProvider(editingId, editData);
        if (success) {
            editingId = null;
        }
    };

    // Cancel editing
    const cancelEdit = () => {
        editingId = null;
    };

    // Delete provider
    const deleteProvider = async (id) => {
        if (confirm("Are you sure you want to delete this provider?")) {
            await fiatProvidersStore.deleteProvider(id);
        }
    };
</script>

<Card.Root class="w-full mb-4">
    <Card.Header>
        <h3 class="text-lg font-semibold">Fiat Providers</h3>
        <p class="text-sm text-muted-foreground">Manage fiat payment providers for your offers</p>
    </Card.Header>
    <Card.Content>
        <!-- Add new provider form -->
        <div class="mb-4">
            <h4 class="text-md font-medium mb-2">Add New Provider</h4>
            <form onsubmit={(e)=>{
                e.preventDefault()
                addProvider()}} class="space-y-3">
                <div>
                    <label for="label" class="block text-sm mb-1">Label</label>
                    <Input id="label" type="text" placeholder="PayPal" bind:value={newProvider.label} />
                </div>
                <div>
                    <label for="icon" class="block text-sm mb-1">Icon</label>
                    {#if file}
                    <div class="relative">
                        <button
                            class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-all hover:opacity-100"
                            onclick={() => {
                                file = '';
                            }}
                        >
                            <Trash class="text-white "></Trash>
                        </button>
                        <img id="receiptImage" src={file} alt="" class="rounded-md px-[20%]" />
                    </div>
                {:else}
                    <Dropzone
                    containerClasses="h-full"
                    accept=".png,.jpg,.jpeg, .webp"
                    multiple={false}
                    maxSize={1024 * 1024 * 5}
                    on:drop={(e) => {
                        file = URL.createObjectURL(e.detail.acceptedFiles[0]);
                    }}
                >
                    Click here or drop a file to upload a provider icon
                </Dropzone>
                {/if}
                </div>
                <div>
                    <label for="matchTemplate" class="block text-sm mb-1">Match Template (Optional)</label>
                    <Input id="matchTemplate" type="text" placeholder="Template for receipt matching" bind:value={newProvider.matchTemplate} />
                </div>
                <FormButton type="submit" disabled={loading}>
                    {#if loading}
                        <LoaderCircle class="animate-spin" />
                    {:else}
                        Add Provider
                    {/if}
                </FormButton>
            </form>
        </div>

        <!-- Provider list -->
        <div>
            <h4 class="text-md font-medium mb-2">Existing Providers</h4>
            {#if providers.length === 0}
                <p class="text-sm text-muted-foreground italic">No providers added yet</p>
            {:else}
                <div class="space-y-3">
                    {#each providers as provider (provider.id)}
                        <div class="border rounded-md p-3">
                            {#if editingId === provider.id}
                                <!-- Edit mode -->
                                <div class="space-y-2">
                                    <div>
                                        <label class="block text-sm mb-1">Label</label>
                                        <Input type="text" bind:value={editData.label} />
                                    </div>
                                    <div>
                                        <label class="block text-sm mb-1">Icon</label>
                                        {#if editFile}
                                        <div class="relative">
                                            <button
                                                class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-all hover:opacity-100"
                                                onclick={() => {
                                                    editFile = '';
                                                }}
                                            >
                                                <Trash class="text-white "></Trash>
                                            </button>
                                            <img id="receiptImage" src={editFile} alt="" class="rounded-md px-[20%]" />
                                        </div>
                                    {:else}
                                        <Dropzone
                                        containerClasses="h-full"
                                        accept=".png,.jpg,.jpeg, .webp"
                                        multiple={false}
                                        maxSize={1024 * 1024 * 5}
                                        on:drop={(e) => {
                                            editFile = URL.createObjectURL(e.detail.acceptedFiles[0]);
                                        }}
                                    >
                                        Click here or drop a file to upload a provider icon
                                    </Dropzone>
                                    {/if}
                                    </div>
                                    <div>
                                        <label class="block text-sm mb-1">Match Template</label>
                                        <Input type="text" bind:value={editData.matchTemplate} />
                                    </div>
                                    <div class="flex gap-2">
                                        <FormButton 
                                            type="button" 
                                            onclick={saveEdit} 
                                            disabled={loading}
                                            class="!h-8 !px-3"
                                        >
                                            {#if loading}
                                                <LoaderCircle class="animate-spin" />
                                            {:else}
                                                <Check class="w-4 h-4" />
                                                Save
                                            {/if}
                                        </FormButton>
                                        <FormButton 
                                            type="button" 
                                            onclick={cancelEdit} 
                                            variant="outline"
                                            class="!h-8 !px-3"
                                        >
                                            <X class="w-4 h-4" />
                                            Cancel
                                        </FormButton>
                                    </div>
                                </div>
                            {:else}
                                <!-- View mode -->
                                <div class="flex justify-between items-center">
                                    <div>
                                        <div class="flex gap-2 items-center">

                                            <div class="text-sm flex items-center gap-2">
                                                <img src={provider.icon} alt={provider.label} class="w-8 h-8 rounded-sm" />
                                            </div>
                                            <div class="font-medium">{provider.label}</div>
                                        </div>
                                        {#if provider.matchTemplate}
                                            <div class="text-xs text-muted-foreground mt-1">
                                                Template: {provider.matchTemplate}
                                            </div>
                                        {/if}
                                    </div>
                                    <div class="flex gap-2">
                                        <button 
                                            class="text-primary hover:text-primary/80 p-1 rounded-full"
                                            onclick={() => startEdit(provider)}
                                        >
                                            <Pencil class="w-4 h-4" />
                                        </button>
                                        <button 
                                            class="text-destructive hover:text-destructive/80 p-1 rounded-full"
                                            onclick={() => deleteProvider(provider.id)}
                                        >
                                            <Trash class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </Card.Content>
</Card.Root>
