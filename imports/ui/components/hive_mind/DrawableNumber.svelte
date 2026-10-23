<script lang="ts">
  import { draw, fade } from "svelte/transition";

  export let number = null;
  export let drawAnimationParams = {};
  export let svgClass = "w-12 h-12";
  export let containerClass = "gap-1";

  $: console.log("DRAWABLE NUMBER: ", drawAnimationParams);

  let arrayofDigits = [];

  $: {
    if (number !== null && number !== undefined) {
      arrayofDigits = number.toString().split("");
    } else {
      arrayofDigits = [];
    }
  }
</script>

{#if arrayofDigits?.length}
  <div class="flex flex-row justify-center items-center {containerClass}">
    {#each arrayofDigits as digit}
      {#if digit == 0}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
        >
          <path in:draw={drawAnimationParams} d="M12 1.5C13.3212 1.5 14.4839 1.84812 15.4468 2.49362C16.4098 3.13913 17.1731 4.08202 17.6956 5.27156C18.2182 6.4611 18.5 7.8973 18.5 9.52941V14.4706C18.5 16.1027 18.2182 17.5389 17.6956 18.7284C17.1731 19.918 16.4098 20.8609 15.4468 21.5064C14.4839 22.1519 13.3212 22.5 12 22.5C10.6788 22.5 9.51613 22.1519 8.55317 21.5064C7.5902 20.8609 6.82691 19.918 6.30436 18.7284C5.78181 17.5389 5.5 16.1027 5.5 14.4706V9.52941C5.5 7.8973 5.78181 6.4611 6.30436 5.27156C6.82691 4.08202 7.5902 3.13913 8.55317 2.49362C9.51613 1.84812 10.6788 1.5 12 1.5ZM12 3.5C11.084 3.5 10.3059 3.72649 9.66678 4.15491C9.02961 4.58202 8.50949 5.22453 8.13547 6.07594C7.72283 7.01528 7.5 8.18343 7.5 9.52941V14.4706C7.5 15.8166 7.72283 16.9847 8.13547 17.9241C8.50949 18.7755 9.02961 19.418 9.66678 19.8451C10.3059 20.2735 11.084 20.5 12 20.5C12.916 20.5 13.6941 20.2735 14.3332 19.8451C14.9704 19.418 15.4905 18.7755 15.8645 17.9241C16.2772 16.9847 16.5 15.8166 16.5 14.4706V9.52941C16.5 8.18343 16.2772 7.01528 15.8645 6.07594C15.4905 5.22453 14.9704 4.58202 14.3332 4.15491C13.6941 3.72649 12.916 3.5 12 3.5Z"></path>
        </svg>
      {:else if digit == 1}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
        >
          <path in:draw={drawAnimationParams} d="M14 1.5V22H12V3.704L7.5 4.91V2.839L12.5 1.5H14Z"></path>
        </svg>
      {:else if digit == 2}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
        >
          <path
            in:draw={drawAnimationParams}
            d="M16.0002 7.5C16.0002 5.29086 14.2094 3.5 12.0002 3.5C9.7911 3.5 8.00024 5.29086 8.00024 7.5H6.00024C6.00024 4.18629 8.68653 1.5 12.0002 1.5C15.314 1.5 18.0002 4.18629 18.0002 7.5C18.0002 8.93092 17.4993 10.2448 16.6633 11.276L9.344 19.9991L18.0002 20V22H6.00024L6 20.8731L15.0642 10.071C15.6485 9.37595 16.0002 8.47905 16.0002 7.5Z"
          >
          </path>
        </svg>
      {:else if digit == 3}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
          ><path
            in:draw={drawAnimationParams}
            d="M18.0001 2V3.36217L12.8087 9.54981C16.0169 9.94792 18.5001 12.684 18.5001 16C18.5001 19.5899 15.5899 22.5 12.0001 22.5C8.95434 22.5 6.39789 20.4052 5.69287 17.5778L7.63351 17.0922C8.12156 19.0497 9.89144 20.5 12.0001 20.5C14.4853 20.5 16.5001 18.4853 16.5001 16C16.5001 13.5147 14.4853 11.5 12.0001 11.5C11.2795 11.5 10.5985 11.6694 9.99465 11.9705L9.76692 12.0923L9.07705 10.8852L14.8551 3.99917L6.50006 4V2H18.0001Z"
          ></path></svg
        >
      {:else if digit == 4}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
          ><path
            in:draw={drawAnimationParams}
            d="M16.0001 1.5L16 16H19.0001V18H16L16.0001 22H14.0001L14 18H4V16.898L14.0001 1.5H16.0001ZM14 16V5.171L6.968 16H14Z"
          ></path></svg
        >
      {:else if digit == 5}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
          ><path
            in:draw={drawAnimationParams}
            d="M18.0001 2V4H9.30024L8.62337 10.4448C9.6075 9.84532 10.7634 9.5 12.0001 9.5C15.5899 9.5 18.5001 12.4101 18.5001 16C18.5001 19.5899 15.5899 22.5 12.0001 22.5C8.95434 22.5 6.39789 20.4052 5.69287 17.5778L7.63351 17.0922C8.12156 19.0497 9.89144 20.5 12.0001 20.5C14.4853 20.5 16.5001 18.4853 16.5001 16C16.5001 13.5147 14.4853 11.5 12.0001 11.5C9.97783 11.5 8.72237 12.139 8.03985 13.0293L6.46487 11.848L7.50006 2H18.0001Z"
          ></path></svg
        >
      {:else if digit == 6}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
          ><path
            in:draw={drawAnimationParams}
            d="M14.886 2L10.4482 9.6864C10.9454 9.56459 11.4652 9.5 12 9.5C15.5899 9.5 18.5 12.4101 18.5 16C18.5 19.5899 15.5899 22.5 12 22.5C8.41015 22.5 5.5 19.5899 5.5 16C5.5 14.7949 5.82793 13.6665 6.39941 12.699L12.576 2H14.886ZM12 11.5C9.51472 11.5 7.5 13.5147 7.5 16C7.5 18.4853 9.51472 20.5 12 20.5C14.4853 20.5 16.5 18.4853 16.5 16C16.5 13.5147 14.4853 11.5 12 11.5Z"
          ></path></svg
        >
      {:else if digit == 7}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
          ><path in:draw={drawAnimationParams} d="M19 2V3.5L10.763 21.9995H8.574L16.587 4H6V2H19Z"></path></svg
        >
      {:else if digit == 8}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="1"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
          ><path
            in:draw={drawAnimationParams}
            d="M12 1.5C15.0376 1.5 17.5 3.96243 17.5 7C17.5 8.77579 16.6584 10.355 15.3523 11.3606C17.2389 12.4091 18.5 14.3186 18.5 16.5C18.5 19.8137 15.5899 22.5 12 22.5C8.41015 22.5 5.5 19.8137 5.5 16.5C5.5 14.3186 6.7611 12.4091 8.64703 11.3589C7.34158 10.355 6.5 8.77579 6.5 7C6.5 3.96243 8.96243 1.5 12 1.5ZM12 12.5C9.48055 12.5 7.5 14.3282 7.5 16.5C7.5 18.6718 9.48055 20.5 12 20.5C14.5194 20.5 16.5 18.6718 16.5 16.5C16.5 14.3282 14.5194 12.5 12 12.5ZM12 3.5C10.067 3.5 8.5 5.067 8.5 7C8.5 8.933 10.067 10.5 12 10.5C13.933 10.5 15.5 8.933 15.5 7C15.5 5.067 13.933 3.5 12 3.5Z"
          ></path></svg
        >
      {:else if digit == 9}
        <svg
          stroke="currentColor"
          fill="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          class={svgClass}
          xmlns="http://www.w3.org/2000/svg"
          in:fade={drawAnimationParams}
          ><path
            in:draw={drawAnimationParams}
            d="M12 1.5C15.5899 1.5 18.5 4.41015 18.5 8C18.5 9.19219 18.179 10.3094 17.6188 11.27L11.423 21.999H9.114L13.5528 14.3134C13.0553 14.4353 12.5352 14.5 12 14.5C8.41015 14.5 5.5 11.5899 5.5 8C5.5 4.41015 8.41015 1.5 12 1.5ZM12 3.5C9.51472 3.5 7.5 5.51472 7.5 8C7.5 10.4853 9.51472 12.5 12 12.5C14.4853 12.5 16.5 10.4853 16.5 8C16.5 5.51472 14.4853 3.5 12 3.5Z"
          ></path></svg
        >
      {/if}
    {/each}
  </div>
{/if}
