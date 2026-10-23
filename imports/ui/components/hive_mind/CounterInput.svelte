<script lang="ts">
  export let value: number = 0;
  export let incrementBy: number = 1;
  export let decrementBy: number = 1;
  export let onSave = (value: number) => {};
  export let disableInput = false;
  export let minValue = 0;
  export let maxValue = null;

  let allowInput = false;
  let inputRef;

  const increment = () => {
    value += incrementBy;
    onSave(value);
  };

  const decrement = () => {
    if (value - decrementBy >= minValue) {
      value -= decrementBy;
    }
    onSave(value);
  };

  const enableInput = () => {
    if (disableInput) return;
    allowInput = true;
    console.log({ inputRef });
    setTimeout(() => {
      inputRef.focus();
      inputRef.select();
    }, 0);
  };

  const saveValue = () => {
    if (value <= minValue || (maxValue !== null && value >= maxValue)) {
      return;
    }
    onSave(value);
    allowInput = false;
  };
</script>

<div class="flex flex-col items-center justify-center">
  <div class="flex flex-row items-center gap-2">
    <button
      class="btn btn-sm bg-white border-4 border-gray-300 {allowInput ? 'invisible' : ''}"
      disabled={!value || value <= minValue}
      on:click={() => decrement()}>-</button
    >
    <div class="flex flex-col gap-1 items-center justify-center">
      {#if !allowInput}
        <button
          class="btn btn-lg justify-center items-center text-3xl bg-white border-4 border-gray-300 {disableInput ? 'pointer-events-none' : ''}"
          on:click={() => enableInput()}>{value}</button
        >
      {/if}
      <input
        type="number"
        class="font-bold input-bordered input h-20 w-28 text-2xl bg-white border-4 {allowInput ? '' : 'hidden'}"
        bind:this={inputRef}
        bind:value
      />
    </div>
    <button
      class="btn btn-sm bg-white border-4 border-gray-300 {allowInput ? 'invisible' : ''}"
      disabled={maxValue !== null && value >= maxValue}
      on:click={() => increment()}>+</button
    >
  </div>
  {#if allowInput}
    <button
      class="btn btn-sm bg-green-500 text-white w-28"
      disabled={!value || value <= minValue || (maxValue !== null && value >= maxValue)}
      on:click={() => saveValue()}>SAVE</button
    >
  {/if}
</div>
