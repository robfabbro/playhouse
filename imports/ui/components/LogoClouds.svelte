<script lang='ts'>
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { inview } from 'svelte-inview';
  import type { ObserverEventDetails, Options } from 'svelte-inview';

  let show = false
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .7
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

</script>


<div
  use:inview={options}
  on:inview_change="{handleChange}"
  class="flex w-full items-center justify-center py-10 bg-slate-50">
  {#if show}
  <div
    transition:fade={{ delay: 250, duration: 300}} 
    >
    <h2 class="text-base-400 mb-12 text-center font-poppins text-lg font-semibold leading-8">
      Trusted by these fantastic organisations!
    </h2>
    <div class="wrap flex flex-wrap justify-center gap-10 xl:gap-32">
      <img class="w-32 grayscale" src="/logo/AMF.jpg" alt="amf" />
      <img class="w-32 grayscale" src="/logo/lsv-logo.png" alt="lsv" />
      <img class="w-32 grayscale" src="/logo/Tetris-Capital_JPG.jpg" alt="tc" />
      <img class="w-32 grayscale" src="/logo/dpc.jpg" alt="dpc" />
      <img class="w-32 grayscale" src="/logo/MFL.jpg" alt="mfl" />
      <img class="w-32 grayscale" src="/logo/mihaly.jpg" alt="mislo" />
    </div>
  </div>
  {/if}
</div>

