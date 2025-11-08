<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import PlayerAvatar from "/imports/ui/components/hive_mind/PlayerAvatar.svelte";
  import DrawableNumber from "/imports/ui/components/hive_mind/DrawableNumber.svelte";

  export let howToPlay = false;
  export let round;
  export let round_words;
  export let word = {
    _id: "adsjfkalsdjfa",
    answer_count: 2,
    word: "Example",
    answered_by: [
      {
        player_id: "asdjfklasjdf",
        name: "One",
      },
      {
        player_id: "asdjfklasjdf2",
        name: "Two",
      },
      {
        player_id: "asdjfklasjdf3",
        name: "Three",
      },
    ],
    revealed: true,
    reveal_answerers: true,
  };

  let loadingAnimation = false;
  $: {
    let unrevealedWords = round_words.filter((w) => !w.revealed);
    let unrevealedWordsCount = unrevealedWords.length;
    // if the current word is the last unrevealed word, show loading animation
    if (!word.revealed && round?.round_answer_reveal && unrevealedWords[unrevealedWordsCount - 1]?._id === word?._id) {
      loadingAnimation = true;
    } else {
      loadingAnimation = false;
    }
  }
</script>

<div class="flex flex-row justify-end items-center w-full gap-1">
  <!-- EMPTY SPACE -->
  <div class="w-1/5 flex-shrink-0 flex justify-center items-center font-poppins text-lg text-white font-bold">
    {#if loadingAnimation}
      <div class="loading loading-spinner loading-md text-blue-600"></div>
    {/if}
  </div>
  <!-- EMPTY SPACE -->

  <div class="flex flex-col w-full items-stretch">
    <!-- BUTTON TITLE -->
    <button
      class="btn w-full min-w-auto max-w-auto h-auto bg-white pointer-events-none
      {!word.revealed ? 'border-blue-600' : 'border-black'}  {word?.reveal_answerers && word?.answered_by?.length > 0
        ? 'border-t-2 border-r-2 border-l-2 rounded-t-lg rounded-b-none'
        : 'border-2 rounded-lg'} {word?.word_id === 'no_answer' && word.revealed ? 'border-dashed' : ''} {howToPlay
        ? 'h-auto px-1 py-0.5'
        : 'min-h-[52px] py-2'}"
      in:fade={{ duration: 1000, easing: cubicOut }}
    >
      {#if !word.revealed}
        <div class="w-full flex flex-row justify-between items-center">
          <!-- LEFT MEDIUM -->
          <div class="flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 stroke-blue-800 fill-blue-200"
            >
              <path
                in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <!-- LEFT MEDIUM -->
          <!-- LEFT 4X SMALL -->
          <div class="grid grid-cols-2 grid-rows-2">
            {#each [1, 2, 3, 4] as n}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 stroke-blue-800 fill-blue-200"
              >
                <path
                  in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
            {/each}
          </div>
          <!-- LEFT 4X SMALL -->
          <!-- MIDDLE LARGE -->
          <div class="flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8 stroke-blue-800 fill-blue-200"
            >
              <path
                in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <!-- MIDDLE LARGE -->
          <!-- RIGHT 4X SMALL -->
          <div class="grid grid-cols-2 grid-rows-2">
            {#each [1, 2, 3, 4] as n}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 stroke-blue-800 fill-blue-200"
              >
                <path
                  in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                />
              </svg>
            {/each}
          </div>
          <!-- RIGHT 4X SMALL -->
          <!-- RIGHT MEDIUM -->
          <div class="flex justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6 stroke-blue-800 fill-blue-200"
            >
              <path
                in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
          </div>
          <!-- RIGHT MEDIUM -->
        </div>
      {:else}
        <div class="w-full flex flex-row justify-center items-center" in:fade={{ duration: 1000, easing: cubicOut }}>
          <!-- EMPTY SPACE -->
          <div class="w-1/5 flex justify-center items-center font-poppins text-lg font-bold"></div>
          <!-- EMPTY SPACE -->
          <!-- WORD -->
          <div
            class="w-3/5 flex justify-center items-center {howToPlay
              ? 'text-xs'
              : word?.word?.length >= 12
                ? 'text-base'
                : word?.word?.length >= 10
                  ? 'text-lg'
                  : word?.word_id === 'no_answer' || word?.word?.length >= 8
                    ? 'text-xl'
                    : 'text-2xl'} font-poppins font-bold"
          >
            {word.word}
          </div>
          <!-- WORD -->
          <!-- ANSWER COUNT -->
          <div class="w-1/5 flex justify-center items-center gap-1">
            <span class="-ml-1">x</span>
            <span class="{howToPlay ? 'text-sm' : 'text-xl'} font-bold">{word.answer_count}</span>
          </div>
          <!-- ANSWER COUNT -->
        </div>
      {/if}
    </button>
    <!-- BUTTON TITLE -->

    <!-- COLLAPSABLE ANSWERERS -->
    {#if word?.reveal_answerers && word?.answered_by?.length > 0}
      <div
        class="{howToPlay
          ? 'p-2'
          : 'p-4'} bg-gray-100 rounded-b-lg border-black border-t-0 border-r-2 border-l-2 border-b-2"
        in:fade={{ duration: 1000, delay: 500, easing: quintOut }}
      >
        <div class="flex flex-row flex-wrap justify-center items-center {howToPlay ? 'gap-2' : 'gap-4'}">
          {#each word?.answered_by || [] as player (player?.player_id)}
            <PlayerAvatar
              game_player={player}
              iconClass="w-6 h-6 stroke-gray-800 fill-gray-400"
              textClass={howToPlay
                ? "text-xs"
                : player?.player_name?.length === 3
                  ? "text-base"
                  : player?.player_name?.length === 4
                    ? "text-sm"
                    : "text-xs"}
            />
          {/each}
        </div>
      </div>
    {/if}
    <!-- COLLAPSABLE ANSWERERS -->
  </div>

  <!-- SCORE ON THE RIGHT OF WORD -->
  <div class="w-1/5 flex justify-center items-center font-poppins text-3xl font-bold flex-shrink-0">
    {#if word.revealed && word?.answer_count > 1}
      <!-- plus -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-6 w-6 fill-green-600 text-green-600 -mr-1"
      >
        <path
          in:draw={{ duration: 1000, delay: 1000, easing: quintOut }}
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      <!-- plus -->

      <!-- drawable number -->
      <DrawableNumber
        number={(word?.answer_count || 1) - 1}
        svgClass="h-6 w-6 {word.revealed ? 'stroke-green-600 fill-green-600' : 'stroke-white fill-white'}"
        containerClass=""
        drawAnimationParams={{ duration: 1000, delay: 1000, easing: quintOut }}
      />
      <!-- drawable number -->
    {/if}
  </div>
  <!-- SCORE ON THE RIGHT OF WORD -->
</div>
