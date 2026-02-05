<script>
	import DarkmodeToggle from '$lib/components/ui/custom/DarkmodeToggle.svelte';
	import { mode } from 'mode-watcher';
	
	let mobileMenuOpen = false;
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<!-- Header -->
<header class="fixed z-50 w-full border-b border-border bg-card shadow">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
		<div class="flex gap-2">
			<a href="/" class="flex items-center space-x-2">
				{#if mode.current === 'light'}
					<img src="/logo/logo-txt-black.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
				{:else}
					<img src="/logo/logo-txt.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
				{/if}
				<span class="sr-only">OpenPleb</span>
			</a>
			<div>
				<DarkmodeToggle></DarkmodeToggle>
			</div>
		</div>
		
		<!-- Desktop Navigation -->
		<nav class="hidden md:block">
			<ul class="flex space-x-6 text-sm font-medium text-foreground">
				<li><a href="#features" class="transition hover:text-primary">Features</a></li>
				<li><a href="#how-it-works" class="transition hover:text-primary">How It Works</a></li>
				<li><a href="#status" class="transition hover:text-primary">Status</a></li>
				<li>
					<a
						href="https://github.com/gandlafbtc/open-pleb"
						target="_blank"
						class="transition hover:text-primary flex gap-2 items-center"
						rel="noreferrer noopener"
						><p class="h-5 w-5">
							<svg
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 52 52"
								enable-background="new 0 0 52 52"
								xml:space="preserve"
							>
								<g>
									<path
										d="M48.7,2H29.6C28.8,2,28,2.5,28,3.3v3C28,7.1,28.7,8,29.6,8h7.9c0.9,0,1.4,1,0.7,1.6l-17,17   c-0.6,0.6-0.6,1.5,0,2.1l2.1,2.1c0.6,0.6,1.5,0.6,2.1,0l17-17c0.6-0.6,1.6-0.2,1.6,0.7v7.9c0,0.8,0.8,1.7,1.6,1.7h2.9   c0.8,0,1.5-0.9,1.5-1.7v-19C50,2.5,49.5,2,48.7,2z"
									/>
									<path
										d="M36.3,25.5L32.9,29c-0.6,0.6-0.9,1.3-0.9,2.1v11.4c0,0.8-0.7,1.5-1.5,1.5h-21C8.7,44,8,43.3,8,42.5v-21   C8,20.7,8.7,20,9.5,20H21c0.8,0,1.6-0.3,2.1-0.9l3.4-3.4c0.6-0.6,0.2-1.7-0.7-1.7H6c-2.2,0-4,1.8-4,4v28c0,2.2,1.8,4,4,4h28   c2.2,0,4-1.8,4-4V26.2C38,25.3,36.9,24.9,36.3,25.5z"
									/>
								</g>
							</svg>
						</p>
						GitHub</a
					>
				</li>
			</ul>
		</nav>
		
		<!-- Mobile Menu Button -->
		<button
			class="md:hidden p-2 text-foreground hover:text-primary transition"
			on:click={toggleMobileMenu}
			aria-label="Toggle menu"
		>
			{#if mobileMenuOpen}
				<!-- Close Icon -->
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			{:else}
				<!-- Hamburger Icon -->
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			{/if}
		</button>
	</div>
	
	<!-- Mobile Menu Dropdown -->
	{#if mobileMenuOpen}
		<div class="md:hidden border-t border-border bg-card">
			<nav class="px-4 py-4">
				<ul class="space-y-4 text-sm font-medium text-foreground">
					<li>
						<a href="#features" class="block transition hover:text-primary" on:click={closeMobileMenu}>
							Features
						</a>
					</li>
					<li>
						<a href="#how-it-works" class="block transition hover:text-primary" on:click={closeMobileMenu}>
							How It Works
						</a>
					</li>
					<li>
						<a href="#status" class="block transition hover:text-primary" on:click={closeMobileMenu}>
							Status
						</a>
					</li>
					<li>
						<a
							href="https://github.com/gandlafbtc/open-pleb"
							target="_blank"
							class="flex items-center gap-2 transition hover:text-primary"
							rel="noreferrer noopener"
							on:click={closeMobileMenu}
						>
							<svg class="h-5 w-5" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
								<g>
									<path
										d="M48.7,2H29.6C28.8,2,28,2.5,28,3.3v3C28,7.1,28.7,8,29.6,8h7.9c0.9,0,1.4,1,0.7,1.6l-17,17   c-0.6,0.6-0.6,1.5,0,2.1l2.1,2.1c0.6,0.6,1.5,0.6,2.1,0l17-17c0.6-0.6,1.6-0.2,1.6,0.7v7.9c0,0.8,0.8,1.7,1.6,1.7h2.9   c0.8,0,1.5-0.9,1.5-1.7v-19C50,2.5,49.5,2,48.7,2z"
									/>
									<path
										d="M36.3,25.5L32.9,29c-0.6,0.6-0.9,1.3-0.9,2.1v11.4c0,0.8-0.7,1.5-1.5,1.5h-21C8.7,44,8,43.3,8,42.5v-21   C8,20.7,8.7,20,9.5,20H21c0.8,0,1.6-0.3,2.1-0.9l3.4-3.4c0.6-0.6,0.2-1.7-0.7-1.7H6c-2.2,0-4,1.8-4,4v28c0,2.2,1.8,4,4,4h28   c2.2,0,4-1.8,4-4V26.2C38,25.3,36.9,24.9,36.3,25.5z"
									/>
								</g>
							</svg>
							GitHub
						</a>
					</li>
				</ul>
			</nav>
		</div>
	{/if}
</header>

<!-- Hero -->
<section class="bg-gradient-to-br from-background to-muted pt-32 pb-20 text-center">
	<div class="mx-auto max-w-4xl px-4">
		{#if mode.current === 'light'}
			<img
				src="/logo/logo-txt-black.svg"
				alt="OpenPleb Logo"
				class="mx-auto mb-8 h-auto w-32 sm:w-60 md:w-60 lg:w-120"
			/>
		{:else}
			<img
				src="/logo/logo-txt.svg"
				alt="OpenPleb Logo"
				class="mx-auto mb-8 h-auto w-32 sm:w-60 md:w-60 lg:w-120"
			/>
		{/if}
		<h1 class="mb-4 text-4xl font-extrabold text-foreground">Connect Banking QRs with Bitcoin</h1>
		<p class="mb-8 text-lg text-muted-foreground">
			OpenPleb bridges traditional banking and Bitcoin, enabling users to pay banking QR codes with
			Bitcoin while earners receive Bitcoin for handling those payments.
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a
				href="https://openpleb.cash"
				class="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:bg-primary/90"
				>Try it Now</a
			>
			<a
				href="#how-it-works"
				class="rounded-xl border border-accent px-6 py-3 font-medium text-accent transition hover:bg-primary/10"
				>Learn How It Works</a
			>
			<a
				href="#status"
				class="rounded-xl border border-accent px-6 py-3 font-medium text-accent transition hover:bg-primary/10"
				>Check Project Status</a
			>
		</div>
	</div>
</section>

<!--features-->
<section id="features" class="bg-background py-20">
	<div class="mx-auto max-w-6xl px-4">
		<h2 class="mb-12 text-center text-3xl font-bold text-foreground">Key Features</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-lg border border-border bg-card p-6 transition hover:shadow-lg">
				<h3 class="mb-2 text-xl font-semibold text-card-foreground">Ecash Mint Clearing</h3>
				<p class="text-muted-foreground">
					Fast and reliable clearing through Ecash mints, perfect for low volume passthrough payments.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-6 transition hover:shadow-lg">
				<h3 class="mb-2 text-xl font-semibold text-card-foreground">Privacy Preservation</h3>
				<p class="text-muted-foreground">
					Protecting users through blinded identity, blinded reputation, and blinded payments.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-6 transition hover:shadow-lg">
				<h3 class="mb-2 text-xl font-semibold text-card-foreground">Secure Bond System</h3>
				<p class="text-muted-foreground">
					Using Cashu tokens as bonds to ensure incentives are aligned.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-6 transition hover:shadow-lg">
				<h3 class="mb-2 text-xl font-semibold text-card-foreground">QR Code Integration</h3>
				<p class="text-muted-foreground">
					Easily scan banking QR codes and create offers for payment.
				</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-6 transition hover:shadow-lg">
				<h3 class="mb-2 text-xl font-semibold text-card-foreground">Lightning Payments</h3>
				<p class="text-muted-foreground">Fast and low-cost Bitcoin transactions using Lightning.</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-6 transition hover:shadow-lg">
				<h3 class="mb-2 text-xl font-semibold text-card-foreground">Dispute Resolution</h3>
				<p class="text-muted-foreground">
					Mechanisms for resolving conflicts and ensuring fairness.
				</p>
			</div>
		</div>
	</div>
</section>

<!--How it Works-->
<section id="how-it-works" class="bg-muted py-20">
	<div class="mx-auto max-w-5xl px-4">
		<h2 class="mb-12 text-center text-3xl font-bold text-foreground">How it Works</h2>
		<ol class="space-y-8">
			<li class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-1 text-lg font-semibold text-card-foreground">1. Maker Creates Offer</h3>
				<p class="text-muted-foreground">
					User scans QR, enters amount, submits bond to open offer.
				</p>
			</li>
			<li class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-1 text-lg font-semibold text-card-foreground">2. Taker Claims Offer</h3>
				<p class="text-muted-foreground">Another user claims the offer and stakes their bond.</p>
			</li>
			<li class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-1 text-lg font-semibold text-card-foreground">3. Payment Execution</h3>
				<p class="text-muted-foreground">Taker pays through their bank and uploads a receipt.</p>
			</li>
			<li class="rounded-lg border border-border bg-card p-6">
				<h3 class="mb-1 text-lg font-semibold text-card-foreground">4. Settlement</h3>
				<p class="text-muted-foreground">
					Maker verifies, approves, bonds return.
				</p>
			</li>
		</ol>
	</div>
</section>

<!-- project Status -->
<section id="status" class="bg-background py-20">
	<div class="mx-auto max-w-6xl px-4">
		<h2 class="mb-12 text-center text-3xl font-bold text-foreground">Project Status</h2>
		<div class="grid gap-6 md:grid-cols-3">
			<div class="rounded border-l-4 border-accent bg-card p-4">
				<h4 class="mb-1 font-semibold text-card-foreground">Bond Creation</h4>
				<p class="text-sm text-muted-foreground">✅ Complete</p>
			</div>
			<div class="rounded border-l-4 border-accent bg-card p-4">
				<h4 class="mb-1 font-semibold text-card-foreground">Offer Creation</h4>
				<p class="text-sm text-muted-foreground">✅ Complete</p>
			</div>
			<div class="rounded border-l-4 border-accent bg-card p-4">
				<h4 class="mb-1 font-semibold text-card-foreground">Lightning Integration</h4>
				<p class="text-sm text-muted-foreground">✅ Complete</p>
			</div>
			<div class="rounded border-l-4 border-accent bg-card p-4">
				<h4 class="mb-1 font-semibold text-card-foreground">Claiming Offers</h4>
				<p class="text-sm text-muted-foreground">✅ Complete</p>
			</div>
			<div class="rounded border-l-4 border-secondary bg-card p-4">
				<h4 class="mb-1 font-semibold text-card-foreground">Receipt Handling</h4>
				<p class="text-sm text-muted-foreground">✅ Complete</p>
			</div>
			<div class="rounded border-l-4 border-secondary bg-card p-4">
				<h4 class="mb-1 font-semibold text-card-foreground">Dispute Resolution</h4>
				<p class="text-sm text-muted-foreground">✅ Complete</p>
			</div>
		</div>
	</div>
</section>

<!--Call to Action-->
<section class="bg-gradient-to-br from-background to-muted py-20 text-center">
	<div class="mx-auto max-w-3xl px-4">
		<h2 class="mb-4 text-3xl font-bold text-foreground">Join the OpenPleb Project</h2>
		<p class="mb-6 text-lg text-muted-foreground">
			OpenPlen is an open-source initiative. Developers, Designers, and Bitcoiners are welcome to
			contribute!
		</p>
		<a
			href="https://githuib.com/gandlafbtc/open-pleb"
			target="_blank"
			class="rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:bg-primary/90"
			>View on Github</a
		>
	</div>
</section>
