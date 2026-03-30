<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import { params } from "@roxi/routify";

  import {
    HiveMindGameCollection,
    HiveMindGamePlayerCollection,
    HiveMindPlayerCollection,
    HiveMindRoundCollection,
    HiveMindRoundWordCollection,
    HiveMindRoundAnswerCollection,
    HiveMindWordCollection,
  } from "/imports/api/hive_mind/collections";
  import DrawableNumber from "/imports/ui/components/hive_mind/DrawableNumber.svelte";

  export let closeModal = () => {};
  export let wordIdToView = null;

  let word = null;
  let game = null;
  $: ({ game_id } = $params);

  $m: {
    console.log("word TO VIEW ID: ", wordIdToView);
    game = HiveMindGameCollection.findOne({ _id: game_id });
    word = HiveMindWordCollection.findOne({ _id: wordIdToView });
    console.log("word TO VIEW: ", word);
  }

  // UP TO DESIGNING THIS MODAL, SPECIFICALLY THE SPLIT SCORE BOARD
</script>

{#if !!wordIdToView}
  <dialog class="modal {wordIdToView ? 'modal-open' : ''}">
    <div class="modal-box border border-black relative">
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeModal}> ✕ </button>
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <h3 class="font-bold text-lg">Word Information</h3>
      {#if word}
        <div class="pt-4 flex flex-col justify-center items-center gap-6">
          <!-- WORD + TRANSLATION -->
          <div class="flex flex-col items-center text-center mt-4 break-words">
            <h1 class="text-3xl font-bold break-normal hyphens-auto">{word?.word}</h1>
            {#if !word?.is_english}
              <span class="text-2xl font-normal italic">{word?.english_translation.replaceAll(";", ", ")}</span>
            {/if}
            <!-- LITTLE LANGUAGE FLAG IDENTIFIER -->
            {#if game?.language_mode?.length > 1}
              <span class="text-3xl">
                {#if word?.is_english}
                  🇬🇧
                {:else if word?.is_deutsch}
                  🇩🇪
                {:else if word?.is_français}
                  🇫🇷
                {:else if word?.is_español}
                  🇪🇸
                {:else if word?.is_italiano}
                  🇮🇹
                {/if}
              </span>
            {/if}
            <!-- LITTLE LANGUAGE FLAG IDENTIFIER -->
          </div>
          <!-- WORD + TRANSLATION -->

          <!-- WORD INFORMATION -->
          <div class="flex justify-between items-center gap-10">
            <!-- GENDER -->
            <div class="flex flex-col items-center text-center {!word?.gender ? 'hidden' : ''}">
              {#if word?.gender === "masculine"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  class="h-7 w-7 text-blue-600 stroke-blue-600"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M384 96C384 78.3 398.3 64 416 64L544 64C561.7 64 576 78.3 576 96L576 224C576 241.7 561.7 256 544 256C526.3 256 512 241.7 512 224L512 173.3L417 268.3C436.5 296.7 448 331 448 368.1C448 465.3 369.2 544.1 272 544.1C174.8 544.1 96 465.2 96 368C96 270.8 174.8 192 272 192C309 192 343.4 203.4 371.8 223L466.8 128L416.1 128C398.4 128 384.1 113.7 384.1 96zM272 480C333.9 480 384 429.9 384 368C384 306.1 333.9 256 272 256C210.1 256 160 306.1 160 368C160 429.9 210.1 480 272 480z"
                  />
                </svg>
              {:else if word?.gender === "feminine"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  class="h-7 w-7 text-red-500 stroke-red-500"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M208 240C208 178.1 258.1 128 320 128C381.9 128 432 178.1 432 240C432 301.9 381.9 352 320 352C258.1 352 208 301.9 208 240zM351.9 413.1C433.9 398.1 496 326.3 496 240C496 142.8 417.2 64 320 64C222.8 64 144 142.8 144 240C144 326.3 206.1 398.1 288.1 413.1C288 414.1 288 415 288 416L288 480L256 480C238.3 480 224 494.3 224 512C224 529.7 238.3 544 256 544L288 544L288 576C288 593.7 302.3 608 320 608C337.7 608 352 593.7 352 576L352 544L384 544C401.7 544 416 529.7 416 512C416 494.3 401.7 480 384 480L352 480L352 416C352 415 352 414.1 351.9 413.1z"
                  />
                </svg>
              {:else if word?.gender === "neuter"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  class="h-7 w-7 text-green-500 stroke-green-500"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M208 240C208 178.1 258.1 128 320 128C381.9 128 432 178.1 432 240C432 301.9 381.9 352 320 352C258.1 352 208 301.9 208 240zM351.9 413.1C433.9 398.1 496 326.3 496 240C496 142.8 417.2 64 320 64C222.8 64 144 142.8 144 240C144 326.3 206.1 398.1 288.1 413.1C288 414.1 288 415 288 416L288 576C288 593.7 302.3 608 320 608C337.7 608 352 593.7 352 576L352 416C352 415 352 414.1 351.9 413.1z"
                  />
                </svg>
              {/if}

              <span class="text-sm font-light italic">Gender</span>
            </div>
            <!-- GENDER -->
            <!-- POS -->
            <div class="flex flex-col items-center text-center">
              <span class="text-lg font-semibold uppercase">{word?.pos}</span>
              <span class="text-sm font-light italic">Part of Speech</span>
            </div>
            <!-- POS -->
            <!-- CEFR -->
            <div class="flex flex-col items-center text-center">
              <span class="text-lg font-semibold uppercase">{word?.cefr_level}</span>
              <span class="text-sm font-light italic">CEFR Level</span>
            </div>
            <!-- CEFR -->
          </div>
          <!-- WORD INFORMATION -->

          <!-- EXAMPLE SENTENCE -->
          <div class="flex flex-col items-center text-center mt-2">
            <span class="text-lg font-bold">{word?.example_sentence_native || word?.example_sentence_english}</span>
            {#if !word?.is_english}
              <span class="text-base font-normal italic">{word?.example_sentence_english}</span>
            {/if}
          </div>
          <!-- EXAMPLE SENTENCE -->
        </div>
      {/if}
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
