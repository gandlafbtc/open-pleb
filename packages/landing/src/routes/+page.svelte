<script>
    // 필요한 경우 JavaScript 코드 작성
  </script>
  
  <!-- Header -->
  <header class="bg-card shadow fixed w-full z-50 border-b border-border">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" class="flex items-center space-x-2">
            <img src="/openpleb.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
            <span class="sr-only">OpenPleb</span>
        </a>
      <nav>
        <ul class="flex space-x-6 text-sm font-medium text-foreground">
          <li><a href="#features" class="hover:text-primary transition">Features</a></li>
          <li><a href="#how-it-works" class="hover:text-primary transition">How It Works</a></li>
          <li><a href="#status" class="hover:text-primary transition">Status</a></li>
          <li><a href="https://github.com/gandlafbtc/open-pleb" target="_blank" class="hover:text-primary transition">GitHub</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <!-- Hero -->
  <section class="pt-32 pb-20 text-center bg-gradient-to-br from-background to-muted">
    <div class="max-w-4xl mx-auto px-4">

        <img src="/openpleb.svg" alt="OpenPleb Logo" class="mx-auto mb-8 w-32 h-auto sm:w-60 md:w-60 lg:w-120" />
      <h1 class="text-4xl font-extrabold mb-4 text-foreground">Connect Banking QRs with Bitcoin</h1>
      <p class="text-lg text-muted-foreground mb-8">
        OpenPleb bridges traditional banking and Bitcoin, enabling users to pay banking QR codes with Bitcoin while earners receive Bitcoin for handling those payments.
      </p>
      <div class="flex justify-center gap-4 flex-wrap">
        <a href="https://openpleb.cash" class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition">Try it Now</a>
        <a href="#how-it-works" class="border border-primary text-primary px-6 py-3 rounded-xl font-medium hover:bg-primary/10 transition">Learn How It Works</a>
        <a href="#status" class="border border-primary text-primary px-6 py-3 rounded-xl font-medium hover:bg-primary/10 transition">Check Project Status</a>
      </div>
    </div>
</section>

<!--features-->
<section id="features" class="py-20 bg-background">
    <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-foreground">Key Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2 text-card-foreground">Secure Bond System</h3>
                <p class="text-muted-foreground">Using Cashu tokens as bonds to ensure incentives are aligned.</p>
            </div>
            <div class="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2 text-card-foreground">QR code Intergration</h3>
                <p class="text-muted-foreground">Easily scan banking QR codes and create offers for payment.</p>
            </div>
            <div class="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2 text-card-foreground">Lightning Payments</h3>
                <p class="text-muted-foreground">Fast and low-cost Bitcoin transactions using Lightning.</p>
            </div>
            <div class="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2 text-card-foreground">Dispute Resolution</h3>
                <p class="text-muted-foreground">Mechanisms for resolving conflicts and ensuring fairness.</p>
            </div>
            <div class="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2 text-card-foreground">Platform Matching</h3>
                <p class="text-muted-foreground">Connects payers and earners in a trust-minimized way.</p>
            </div>
            <div class="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2 text-card-foreground">Offer Expiry</h3>
                <p class="text-muted-foreground">Time-based controls prevent stale or outdated offers.</p>
            </div>
        </div>
    </div>
</section>

<!--How it Works-->
<section id="how-it-works" class="py-20 bg-muted">
    <div class="max-w-5xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-foreground">How it Works</h2>
        <ol class="space-y-8">
            <li class="bg-card p-6 rounded-lg border border-border">
                <h3 class="font-semibold text-lg mb-1 text-card-foreground">1. Maker Creates Offer</h3>
                <p class="text-muted-foreground">User scans QR, enters amount, submits bond to open offer.</p>
            </li>
            <li class="bg-card p-6 rounded-lg border border-border">
                <h3 class="font-semibold text-lg mb-1 text-card-foreground">2. Taker Claims Offer</h3>
                <p class="text-muted-foreground">Another user claims the offer and stakes their bond.</p>
            </li>
            <li class="bg-card p-6 rounded-lg border border-border">
                <h3 class="font-semibold text-lg mb-1 text-card-foreground">3. Payment Execution</h3>
                <p class="text-muted-foreground">Taker pays through their bank and uploads a receipt.</p>
            </li>
            <li class="bg-card p-6 rounded-lg border border-border">
                <h3 class="font-semibold text-lg mb-1 text-card-foreground">4. Settlement</h3>
                <p class="text-muted-foreground">Maker verifies, Lightning payout completes, bonds return.</p>
            </li>

        </ol>
    </div>
</section>

<!-- project Status -->
<section id="status" class="py-20 bg-background">
    <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12 text-foreground">Project Status</h2>
        <div class="grid md:grid-cols-3 gap-6">
            <div class="border-l-4 border-accent bg-card p-4 rounded">
                <h4 class="font-semibold mb-1 text-card-foreground">Bond Creation</h4>
                <p class="text-sm text-muted-foreground">✅ Complete</p>
            </div>
            <div class="border-l-4 border-accent bg-card p-4 rounded">
                <h4 class="font-semibold mb-1 text-card-foreground">Offer Creation</h4>
                <p class="text-sm text-muted-foreground">✅ Complete</p>
            </div>
            <div class="border-l-4 border-accent bg-card p-4 rounded">
                <h4 class="font-semibold mb-1 text-card-foreground">Lightning Integration</h4>
                <p class="text-sm text-muted-foreground">✅ Complete</p>
            </div>
            <div class="border-l-4 border-accent bg-card p-4 rounded">
                <h4 class="font-semibold mb-1 text-card-foreground">Claiming Offers</h4>
                <p class="text-sm text-muted-foreground">✅ Complete</p>
            </div>
            <div class="border-l-4 border-secondary bg-card p-4 rounded">
                <h4 class="font-semibold mb-1 text-card-foreground">Receipt Handling</h4>
                <p class="text-sm text-muted-foreground">✅ Complete</p>
            </div>
            <div class="border-l-4 border-secondary bg-card p-4 rounded">
                <h4 class="font-semibold mb-1 text-card-foreground">Dispute Resolution</h4>
                <p class="text-sm text-muted-foreground">✅ Complete</p>
            </div>
        </div>
    </div>
</section>

<!--Call to Action-->
<section class="py-20 text-center bg-gradient-to-br from-background to-muted">
    <div class="max-w-3xl mx-auto px-4">
        <h2 class="text-3xl font-bold mb-4 text-foreground">Join the OpenPleb Project</h2>
        <p class="text-lg text-muted-foreground mb-6">OpenPlen is an open-source initiative. Developers, Designers, and Bitcoiners are welcome to contribute!</p>
        <a href="https://githuib.com/gandlafbtc/open-pleb" target="_blank" class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition">View on Github</a>
    </div>
</section>
