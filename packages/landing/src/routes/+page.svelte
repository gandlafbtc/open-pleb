<script>
    // 필요한 경우 JavaScript 코드 작성
  </script>
  
  <!-- Header -->
  <header class="bg-white shadow fixed w-full z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" class="flex items-center space-x-2">
            <img src="/openpleb.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
            <span class="sr-only">OpenPleb</span>
        </a>
      <nav>
        <ul class="flex space-x-6 text-sm font-medium">
          <li><a href="#features" class="hover:text-orange-500">Features</a></li>
          <li><a href="#how-it-works" class="hover:text-orange-500">How It Works</a></li>
          <li><a href="#status" class="hover:text-orange-500">Status</a></li>
          <li><a href="https://github.com/gandlafbtc/open-pleb" target="_blank" class="hover:text-orange-500">GitHub</a></li>
        </ul>
      </nav>
    </div>
  </header>
  
  <!-- Hero -->
  <section class="pt-32 pb-20 text-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-4xl mx-auto px-4">

        <img src="/openpleb.svg" alt="OpenPleb Logo" class="mx-auto mb-8 w-32 h-auto sm:w-60 md:w-60 lg:w-120" />
      <h1 class="text-4xl font-extrabold mb-4">Connect Banking QRs with Bitcoin</h1>
      <p class="text-lg text-gray-600 mb-8">
        OpenPleb bridges traditional banking and Bitcoin, enabling users to pay banking QR codes with Bitcoin while earners receive Bitcoin for handling those payments.
      </p>
      <div class="flex justify-center gap-4 flex-wrap">
        <a href="https://openpleb.cash" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition">Try it Now</a>
        <a href="#how-it-works" class="border border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-medium hover:bg-orange-50 transition">Learn How It Works</a>
        <a href="#status" class="border border-orange-500 text-orange-500 px-6 py-3 rounded-xl font-medium hover:bg-orange-50 transition">Check Project Status</a>
      </div>
    </div>
</section>

<!--features-->
<section id="features" class="py-20 bg-white">
    <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2">Secure Bond System</h3>
                <p class="text-gray-600">Using Cashu tokens as bonds to ensure incentives are aligned.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2">QR code Integration</h3>
                <p class="text-gray-600">Easily scan banking QR codes and create offers for payment.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2">Lightning Payments</h3>
                <p class="text-gray-600">Fast and low-cost Bitcoin transactions using Lightning.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2">Dispute Resolution</h3>
                <p class="text-gray-600">Mechanisms for resolving conflicts and ensuring fairness.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2">Platform Matching</h3>
                <p class="text-gray-600">Connects payers and earners in a trust-minimized way.</p>
            </div>
            <div class="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
                <h3 class="text-xl font-semibold mb-2">Offer Expiry</h3>
                <p class="text-gray-600">Time-based controls prevent stale or outdated offers.</p>
            </div>
        </div>
    </div>
</section>

<!--How it Works-->
<section id="how-it-works" class="py-20 bg-gray-100">
    <div class="max-w-5xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">How It Works</h2>
        <ol class="space-y-8">
            <li class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-1">1. Maker Creates Offer</h3>
                <p class="text-gray-600">User scans QR, enters amount, submits bond to open offer.</p>
            </li>
            <li class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-1">2. Taker Claims Offer</h3>
                <p class="text-gray-600">Another user claims the offer and stakes their bond.</p>
            </li>
            <li class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-1">3. Payment Execution</h3>
                <p class="text-gray-600">Taker pays through their bank and uploads a receipt.</p>
            </li>
            <li class="bg-white p-6 rounded-lg shadow">
                <h3 class="font-semibold text-lg mb-1">4. Settlement</h3>
                <p class="text-gray-600">Maker verifies, Lightning payout completes, bond returns.</p>
            </li>

        </ol>
    </div>
</section>

<!-- project Status -->
<section id="status" class="py-20 bg-white">
    <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Project Status</h2>
        <div class="grid md:grid-cols-3 gap-6">
            <div class="border-l-4 border-green-500 bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-1">Bond Creation</h4>
                <p class="text-sm text-gray-600">✅ Complete</p>
            </div>
            <div class="border-l-4 border-green-500 bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-1">Offer Creation</h4>
                <p class="text-sm text-gray-600">✅ Complete</p>
            </div>
            <div class="border-l-4 border-green-500 bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-1">Lightning Integration</h4>
                <p class="text-sm text-gray-600">✅ Complete</p>
            </div>
            <div class="border-l-4 border-green-500 bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-1">Claiming Offers</h4>
                <p class="text-sm text-gray-600">✅ Complete</p>
            </div>
            <div class="border-l-4 border-gray-400 bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-1">Receipt Handling</h4>
                <p class="text-sm text-gray-600">✅ Complete</p>
            </div>
            <div class="border-l-4 border-gray-400 bg-gray-50 p-4 rounded">
                <h4 class="font-semibold mb-1">Dispute Resolution</h4>
                <p class="text-sm text-gray-600">✅ Complete</p>
            </div>
        </div>
    </div>
</section>

<!--Call to Action-->
<section class="py-20 text-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-3xl mx-auto px-4">
        <h2 class="text-3xl font-bold mb-4">Join the OpenPleb Project</h2>
        <p class="text-lg text-gray-600 mb-6">OpenPleb is an open-source initiative. Developers, Designers, and Bitcoiners are welcome to contribute!</p>
        <a href="https://githuib.com/gandlafbtc/open-pleb" target="_blank" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition">View on Github</a>
    </div>
</section>
