<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { onMount, onDestroy } from "svelte";
  import { fade, draw } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";

  export let countdownTitle = "";
  export let circleSize = "h-24 w-24";
  export let textSize = "text-4xl";
  export let referenceTimestamp = null;
  export let secondsToLast = 0;
  export let onComplete = () => {
    console.log("COUNTDOWN COMPLETE");
  };

  let remaining = null;
  let now = null;
  let countdownInterval = null;

  onMount(() => {
    if (referenceTimestamp) {
      now = new Date();
      let elapsed = Math.floor((now.getTime() - referenceTimestamp.getTime()) / 1000);
      remaining = Math.ceil(secondsToLast - elapsed);
      if (remaining <= 0) {
        clearInterval(countdownInterval);
        onComplete();
      } else {
        countdownInterval = setInterval(() => {
          now = new Date();
          let elapsed = Math.floor((now.getTime() - referenceTimestamp.getTime()) / 1000);
          remaining = Math.ceil(secondsToLast - elapsed);
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            onComplete();
          }
        }, 1000);
      }
    }
  });

  onDestroy(() => {
    if (countdownInterval) {
      console.log("ON DESTROY, CLEARING INTERVAL");
      clearInterval(countdownInterval);
    }
  });
</script>

<div class="flex flex-col justify-center items-center gap-1 max-w-16 md:max-w-24">
  <div class="flex justify-center items-center gap-2 rounded-full border-4 border-black {circleSize} p-2">
    {#if remaining !== null && remaining !== undefined && remaining >= 1}
      <p class="text-center uppercase font-black font-poppins {textSize}">
        {remaining}
      </p>
    {:else}
      <span class="text-center uppercase font-black font-poppins {textSize} no-underline loading loading-sm"></span>
    {/if}
  </div>

  {#if countdownTitle}
    <p class="text-center uppercase font-black text-xs font-poppins text-wrap">
      {countdownTitle}
    </p>
  {/if}
</div>
