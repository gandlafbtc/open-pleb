<script lang="ts">
    import "../app.css";
  </script>
  
  <main class="font-sans text-gray-800">
    <!-- Hero Section -->
    <section class="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6 py-24">
      <h1 class="text-5xl font-extrabold mb-4">Connect Banking QRs with Bitcoin</h1>
      <p class="text-lg max-w-2xl mb-8">
        OpenPleb bridges traditional banking and Bitcoin, enabling users to pay banking QR codes with Bitcoin while earners receive Bitcoin for handling those payments.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="#how-it-works" class="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition">Learn How It Works</a>
        <a href="#project-status" class="border border-black text-black px-6 py-3 rounded-xl hover:bg-gray-100 transition">Check Project Status</a>
      </div>
    </section>
  
    <!-- What is OpenPleb -->
    <section class="bg-gray-50 px-6 py-16 text-center">
      <h2 class="text-3xl font-bold mb-4">What is OpenPleb?</h2>
      <p class="text-lg max-w-3xl mx-auto">
        OpenPleb is a platform that connects users who want to pay Korean banking QR codes using Bitcoin with those who want to earn Bitcoin by helping them do so.
      </p>
    </section>
  
    <!-- Key Features -->
    <section class="px-6 py-16 bg-white">
      <h2 class="text-3xl font-bold text-center mb-12">Key Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div><h3 class="text-xl font-semibold mb-2">Cashu-based Bond System</h3><p>Incentivizes fairness between users with token bonds.</p></div>
        <div><h3 class="text-xl font-semibold mb-2">QR Integration</h3><p>Easy banking QR scanning and offer creation.</p></div>
        <div><h3 class="text-xl font-semibold mb-2">Lightning Payments</h3><p>Fast and low-cost Bitcoin settlements.</p></div>
        <div><h3 class="text-xl font-semibold mb-2">Dispute Resolution</h3><p>Built-in process to resolve transaction conflicts.</p></div>
        <div><h3 class="text-xl font-semibold mb-2">Offer Expiry</h3><p>Ensures offers remain fresh and timely.</p></div>
      </div>
    </section>
  
    <!-- How It Works -->
    <section id="how-it-works" class="bg-gray-50 px-6 py-16">
      <h2 class="text-3xl font-bold text-center mb-12">How It Works</h2>
      <ol class="space-y-6 max-w-3xl mx-auto list-decimal list-inside">
        <li><strong>Maker Creates Offer:</strong> Scan QR, enter amount, submit bond.</li>
        <li><strong>Taker Claims Offer:</strong> Browse, claim, and submit bond.</li>
        <li><strong>Payment Execution:</strong> Taker pays via bank and uploads receipt.</li>
        <li><strong>Verification & Settlement:</strong> Maker approves, Lightning payout happens.</li>
      </ol>
    </section>
  
    <!-- Project Status -->
    <section id="project-status" class="px-6 py-16 bg-white">
      <h2 class="text-3xl font-bold text-center mb-8">Project Status</h2>
      <ul class="max-w-2xl mx-auto space-y-4 list-disc list-inside">
        <li><strong>Bond Creation:</strong> Implemented with Cashu tokens.</li>
        <li><strong>Offer Creation:</strong> UX and validation in progress.</li>
        <li><strong>Lightning Integration:</strong> Partially done.</li>
        <li><strong>Claiming Offers:</strong> In development.</li>
        <li><strong>Receipt Handling:</strong> Coming soon.</li>
        <li><strong>Dispute Resolution:</strong> Planned.</li>
      </ul>
    </section>
  
    <!-- Join Us -->
    <section class="bg-gray-50 px-6 py-16 text-center">
      <h2 class="text-3xl font-bold mb-4">Join the OpenPleb Project</h2>
      <p class="text-lg mb-6 max-w-2xl mx-auto">
        OpenPleb is an open-source initiative. Developers, designers, and Bitcoiners are welcome to contribute!
      </p>
      <a href="https://github.com/openpleb" class="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition">
        View on GitHub
      </a>
    </section>
  </main>
  