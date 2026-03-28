<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import noUiSlider from "nouislider";
  import _ from "lodash";

  export let min = 0;
  export let max = 5;
  export let step = 1;
  export let value = [0, 5]; // initial values
  export let onUpdate = () => {};

  let valueMap = ["A1", "A2", "B1", "B2", "C1", "C2"];

  let sliderEl;
  let sliderInstance;
  const dispatch = createEventDispatcher();

  onMount(() => {
    const slider = noUiSlider.create(sliderEl, {
      start: value,
      connect: true,
      step,
      range: { min, max },
    });

    slider.on("update", (values) => {
      dispatch("change", {
        min: Number(values[0]),
        max: Number(values[1]),
      });
      console.log("slider update: ", values);
      onUpdate(values);
    });

    // Apply custom colors after slider mounts
    sliderEl.querySelectorAll(".noUi-connect").forEach((el) => {
      el.style.background = "#60a6fa";
    });
    sliderEl.querySelectorAll(".noUi-handle").forEach((el) => {
      el.style.background = "#1e40af";
      el.style.borderColor = "#1e40af";
    });
    sliderEl.querySelectorAll(".noUi-target").forEach((el) => {
      el.style.background = "#e5e7eb";
    });
  });
</script>

<div class="w-full">
  <div class="px-2 w-full flex flex-col items-center text-gray-">
    <div class="w-full" bind:this={sliderEl}></div>
  </div>
  <div class="w-full flex flex-row justify-between items-center">
    {#each _.range(max + 1) as i}
      <div
        class="flex flex-col items-center {parseInt(value[0]) <= i && parseInt(value[1]) >= i
          ? 'font-bold text-blue-600'
          : ''}"
      >
        <span class="text-xs">|</span>
        <span>{valueMap[i]}</span>
      </div>
    {/each}
  </div>
</div>
