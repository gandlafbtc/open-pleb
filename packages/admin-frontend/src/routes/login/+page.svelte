<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import { toast } from 'svelte-sonner';
	import { bytesToHex } from '@noble/hashes/utils';
	import { scrypt } from '@noble/hashes/scrypt';
	import { goto } from '$app/navigation';
	import { LoaderCircle, LockKeyholeOpen } from 'lucide-svelte';
	import { ensureError } from '$lib/errors';
	import { userLoggedIn } from '$lib/stores/user';


    let username = $state('')
    let password = $state('')
    let isLoading = $state(false);

    const login = async () => {
		try {
            isLoading = true;
			const data = await userLoggedIn.login(username, password)
            toast.success(data.message)
            goto('/')
        } catch (error) {
            console.error(error)
            const err = ensureError(error)
            toast.error(err.message)
		} finally {
			isLoading = false;
		}
    }
</script>
<div class="w-full h-screen items-center justify-center flex">

    <Card.Root class='w-80'>
        <form onsubmit={(e)=>{
            e.preventDefault()
            login()
            }}>

            <Card.Header>
                <Card.Title>Login</Card.Title>
                <Card.Description>
                    Enter your login information.
                </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-2">
                <div class="space-y-1">
                    <Label for="user">Username</Label>
                    <Input disabled={isLoading} bind:value={username} required placeholder="user" />
                </div>
                <div class="space-y-1">
                    <Label for="pass">Password</Label>
                    <Input disabled={isLoading} bind:value={password} required type='password' placeholder='*********'/>
                </div>
            </Card.Content>
            <Card.Footer class='flex gap-2 justify-between items-center'>
                <a href="/signup" class="text-sm underline">
                    Sign up
                </a>
                <FormButton disabled={isLoading}>
                    {#if isLoading}
                      <LoaderCircle class='animate-spin'></LoaderCircle>
                    {:else}
                      <LockKeyholeOpen></LockKeyholeOpen>
                    {/if}
                    Login
                </FormButton>
            </Card.Footer>
        </form>
    </Card.Root>
    
</div>