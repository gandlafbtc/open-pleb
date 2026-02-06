<script lang="ts">
  import { onMount } from 'svelte';
  import { DotLottie } from '@lottiefiles/dotlottie-web';

  let { onComplete = () => {} }: { onComplete?: () => void } = $props();
  
  let container: HTMLDivElement|undefined = $state()
  let visible = $state(true);
  let fadeOut = $state(false);

  onMount(() => {
    const dotLottie = new DotLottie({
      canvas: container?.querySelector('canvas')!,
      src: '/anim/logo.lottie',
      loop: false,
      autoplay: true,
      renderConfig: {
        devicePixelRatio: window.devicePixelRatio || 1,
      },
    });

    dotLottie.addEventListener('complete', () => {
      // Start fade out animation
      fadeOut = true;
      
      // Wait for fade out to complete, then hide and call onComplete
      setTimeout(() => {
        visible = false;
        onComplete();
      }, 200); // Match this with the CSS transition duration
    });

    return () => {
      dotLottie.destroy();
    };
  });
</script>

{#if visible}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-200"
    class:opacity-0={fadeOut}
    class:opacity-100={!fadeOut}
  >
  <div class="flex flex-col gap-5 items-center">

    <div bind:this={container} class="w-20 h-20 lottie-container">
      <canvas class=""></canvas>
    </div>
    <p class="font-bold text-xl text-center dark:text-[#b6ff00]">
      OPENPLEB
    </p>
  </div>
</div>
{/if}

<style>
  canvas {
    width: 100%;
    height: 100%;
  }
  
  :global(.dark) .lottie-container canvas {
    filter: brightness(0) saturate(100%) invert(88%) sepia(73%) saturate(1352%) hue-rotate(25deg) brightness(104%) contrast(106%);
  }
</style>
