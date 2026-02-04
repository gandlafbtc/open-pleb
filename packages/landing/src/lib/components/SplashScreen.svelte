<script lang="ts">
  import { onMount } from 'svelte';
  import { DotLottie } from '@lottiefiles/dotlottie-web';

  let { onComplete = () => {} }: { onComplete?: () => void } = $props();
  
  let container: HTMLDivElement;
  let visible = $state(true);
  let fadeOut = $state(false);

  onMount(() => {
    const dotLottie = new DotLottie({
      canvas: container.querySelector('canvas')!,
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
      }, 500); // Match this with the CSS transition duration
    });

    return () => {
      dotLottie.destroy();
    };
  });
</script>

{#if visible}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500"
    class:opacity-0={fadeOut}
    class:opacity-100={!fadeOut}
  >
    <div bind:this={container} class="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lottie-container">
      <canvas class="opacity-65"></canvas>
    </div>
  </div>
{/if}

<style>
  canvas {
    width: 100%;
    height: 100%;
  }
  
  .lottie-container canvas {
    filter: brightness(0) saturate(100%) invert(88%) sepia(73%) saturate(1352%) hue-rotate(25deg) brightness(104%) contrast(106%);
  }
</style>
