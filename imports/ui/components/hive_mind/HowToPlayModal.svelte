<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut, backIn } from "svelte/easing";
  import { HiveMindGameCollection, HiveMindGamePlayerCollection } from "/imports/api/hive_mind/collections";
  import CounterInput from "/imports/ui/components/hive_mind/CounterInput.svelte";
  import WordResult from "/imports/ui/components/hive_mind/WordResult.svelte";

  export let closeModal = () => {};
  export let modalOpen = false;
  export let gameId = null;
  let game = null;
  let playerCount = null;
  let pointsToWin = null;
  let defaultPointsToWin = null;
  let currentPanel = 0;
  let selectedWord = null;
  let round_words = [
    {
      word: "BANANA",
      word_id: "BANANA",
      revealed: true,
      reveal_answerers: true,
      order: 1,
    },
    {
      word: "CASTLE",
      word_id: "CASTLE",
      revealed: true,
      reveal_answerers: true,
      order: 2,
    },
    {
      word: "DRUM",
      word_id: "DRUM",
      revealed: true,
      reveal_answerers: true,
      order: 3,
    },
    {
      word: "LAPTOP",
      word_id: "LAPTOP",
      revealed: true,
      reveal_answerers: true,
      order: 4,
    },
    {
      word: "NO ANSWER",
      word_id: "no_answer",
      revealed: true,
      reveal_answerers: true,
      order: 5,
    },
  ];

  $m: {
    game = HiveMindGameCollection.findOne({ _id: gameId });
    playerCount = HiveMindGamePlayerCollection.find({ game_id: gameId }).count();
    defaultPointsToWin = 5 * (playerCount - 1);
    pointsToWin = game?.points_to_win || defaultPointsToWin;
  }

  let onSelectWord = (word, index) => {
    selectedWord = word;
    round_words[index].answered_by = [
      { player_name: "You", player_id: "you" },
      { player_name: "P1", player_id: "player_1", is_robot: true },
      { player_name: "P2", player_id: "player_2", is_robot: true },
    ];
    round_words[index].answer_count = 3;

    let nextIndex = index + 1;

    if (nextIndex > round_words.length - 1) {
      nextIndex = 0;
    }

    round_words[nextIndex].answered_by = [
      { player_name: "P3", player_id: "player_3", is_robot: true },
      { player_name: "P4", player_id: "player_4", is_robot: true },
    ];
    round_words[nextIndex].answer_count = 2;

    let thirdIndex = nextIndex + 1;

    if (thirdIndex > round_words.length - 1) {
      thirdIndex = 0;
    }

    round_words[thirdIndex].answered_by = [{ player_name: "Rob", player_id: "rob" }];
    round_words[thirdIndex].answer_count = 1;

    round_words = round_words.map((rw) => {
      let ansBy = [];
      let ansCnt = 0;
      return {
        word: rw.word,
        revealed: true,
        reveal_answerers: true,
        answered_by: rw.answered_by || ansBy,
        answer_count: rw.answer_count || ansCnt,
      };
    });
  };

  let sortRoundWords = () => {
    round_words = round_words.sort((a, b) => b.answer_count - a.answer_count);
  };

  let resetRoundWords = () => {
    round_words = round_words
      .map((rw) => {
        return {
          word: rw.word,
          revealed: false,
          reveal_answerers: false,
          word_id: rw.word_id,
        };
      })
      .sort((a, b) => a.order - b.order);
    selectedWord = null;
  };

  let incrementPanel = () => {
    if (currentPanel == 2) {
      if (!selectedWord || selectedWord === "NO ANSWER") {
        onSelectWord("NO ANSWER", 4);
      }
      sortRoundWords();
    }
    currentPanel = Math.min(4, currentPanel + 1);
  };

  let decrementPanel = () => {
    if (currentPanel == 3) {
      resetRoundWords();
    }
    currentPanel = Math.max(0, currentPanel - 1);
  };

  let closeHowToPlay = () => {
    closeModal();
    resetRoundWords();
    currentPanel = 0;
  };

  // UP TO DESIGNING THIS MODAL, SPECIFICALLY THE SPLIT SCORE BOARD
</script>

{#if !!modalOpen}
  <dialog class="modal {modalOpen ? 'modal-open' : ''}">
    <div class="modal-box border border-black relative">
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeHowToPlay}> ✕ </button>
      <!-- BOTTOM RIGHT CLOSE BUTTON -->

      <div class="pt-4 flex flex-col justify-center items-center gap-8 py-4">
        <!-- NAVIGATIONAL PANEL -->
        <div class="flex items-center justify-center w-full rounded-lg">
          <!-- CONTENT -->
          <div class="w-full flex flex-col items-center text-center gap-2">
            {#if currentPanel === 0}
              <h2 class="font-bold text-2xl mb-2 font-poppins">WELCOME TO HIVE MIND</h2>
              <p class="text-lg">Welcome to the game where winning means thinking like everyone else.</p>
            {:else if currentPanel === 1}
              <h2 class="font-bold text-2xl mb-2 font-poppins">THE OBJECTIVE</h2>
              <p class="text-lg font-thin italic">“Guess the crowd, beat the crowd.”</p>
              <p class="text-lg">Continually pick the word you think most players will choose.</p>
            {:else if currentPanel === 2}
              <h2 class="font-bold text-2xl mb-2 font-poppins">GAMEPLAY</h2>
              <p class="text-lg">Each round shows one target word and four unrelated options</p>
              <div class="flex flex-col gap-2 p-2 border rounded-lg bg-gray-50">
                <h1 class="font-poppins text-xs font-lightt uppercase text-center -mb-2">TARGET WORD</h1>
                <h1 class="text-lg font-black font-poppins uppercase text-center">OCEAN</h1>
                <div class="grid grid-cols-2 grid-flow-row p-4 gap-2">
                  {#each round_words as word, i (word)}
                    <div class="w-full h-full {word.word === 'NO ANSWER' ? 'hidden' : ''}">
                      <button
                        class="btn btn-sm w-full border-black border-2 rounded-lg h-full {selectedWord === word.word
                          ? 'bg-green-500 pointer-events-none'
                          : 'bg-white'}"
                        on:click={() => onSelectWord(word.word, i)}
                      >
                        <h1 class="text-sm font-bold font-poppins text-black text-center">
                          {word.word}
                        </h1>
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
              <p class="text-lg">
                Pick one of the five words, <span
                  in:fade={{ duration: 5000, easing: backIn }}
                  class="underline font-bold">or don't...</span
                >
              </p>
            {:else if currentPanel === 3}
              <h2 class="font-bold text-2xl mb-2 font-poppins">SCORING</h2>
              <p class="text-lg">Once every player has chosen, or the timer runs out, the game reveals the results.</p>
              <div class="flex flex-col gap-2 p-2 border rounded-lg bg-gray-50 w-full">
                <h1 class="font-poppins text-xs font-lightt uppercase text-center -mb-2">TARGET WORD</h1>
                <h1 class="text-lg font-black font-poppins uppercase text-center">OCEAN</h1>
                <div class="flex flex-col gap-2 w-full">
                  {#each round_words as rw, i}
                    {#if rw.answer_count > 0}
                      <WordResult word={rw} {round_words} howToPlay={true} />
                    {/if}
                  {/each}
                </div>
              </div>
              <p class="text-lg">
                The more players that pick the <b class="font-bold">same word</b> as you, the
                <b class="font-bold">more points</b> you earn.
              </p>
            {:else if currentPanel === 4}
              <h2 class="font-bold text-2xl mb-2 font-poppins">ENDING THE GAME</h2>
              <p class="text-lg">You keep playing rounds until a player reaches the target score.</p>
              <p class="text-lg">
                The player with the highest total score wins and becomes the <b class="font-bold">Hive Mind Champion.</b
                >
              </p>

              <div class="flex flex-col items-center" in:fade={{ duration: 5000, easing: backIn }}>
                <!-- SVG -->
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 512 512"
                  class="h-16 w-16 stroke-yellow-600 fill-yellow-500 animate-shake"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    d="M75.371 28.377L27.027 52.549C42.623 99.323 61.451 155.606 80.44 206.875c19.925 53.796 40.201 101.86 55.05 124.133l1.243 1.865L152.145 487h91.267C226.978 481.65 215 466.15 215 448c0-4.871.865-9.551 2.445-13.896-1.628-3.134-3.22-6.442-4.812-9.913-7.642-16.655-14.483-37.267-20.32-58.84-10.19-37.656-17.3-77.733-18.946-104.525-9-14.793-17.445-31.369-25.547-49.025-26.904-58.636-49.91-129.09-72.449-183.424zm361.258 0c-22.54 54.335-45.545 124.788-72.45 183.424-8.1 17.656-16.546 34.232-25.546 49.025-1.645 26.792-8.756 66.87-18.945 104.526-5.838 21.572-12.679 42.184-20.32 58.84-1.593 3.47-3.185 6.778-4.813 9.912A40.593 40.593 0 0 1 297 448c0 18.15-11.978 33.65-28.412 39h91.267l15.413-154.127 1.244-1.865c14.848-22.272 35.124-70.337 55.049-124.133 18.988-51.269 37.816-107.552 53.412-154.326l-48.344-24.172zM256 105c-18.687 0-36.025 10.529-49.244 29.035C193.537 152.541 185 178.81 185 208c0 29.19 8.537 55.459 21.756 73.965S237.313 311 256 311s36.025-10.529 49.244-29.035C318.463 263.459 327 237.19 327 208c0-29.19-8.537-55.459-21.756-73.965S274.687 105 256 105zm-59.787 192.8c3.19 19.66 7.752 41.702 13.475 62.848 5.662 20.928 12.321 40.816 19.304 56.036.062.134.126.26.188.394a41.119 41.119 0 0 1 13.547-7.844c-6.666-14.749-12.609-33.366-17.422-51.416-4.294-16.1-7.53-30.494-9.094-41.494-7.36-4.977-14.082-11.254-19.998-18.523zm119.574 0c-5.916 7.27-12.639 13.547-19.998 18.524-1.565 11-4.8 25.393-9.094 41.494-4.813 18.05-10.756 36.667-17.422 51.416a41.12 41.12 0 0 1 13.547 7.844c.062-.134.126-.26.188-.394 6.983-15.22 13.642-35.108 19.305-56.036 5.722-21.146 10.284-43.189 13.474-62.847zm-79.375 28.259c1.624 8.15 3.737 17.575 6.283 27.123 3.799 14.245 8.528 29.19 13.305 41.347 4.777-12.157 9.506-27.102 13.305-41.347 2.546-9.548 4.66-18.972 6.283-27.123-6.28 1.91-12.833 2.941-19.588 2.941-6.755 0-13.307-1.031-19.588-2.941zM256 425c-12.81 0-23 10.19-23 23s10.19 23 23 23 23-10.19 23-23-10.19-23-23-23z"
                  ></path></svg
                >
                <!-- SVG -->

                <!-- PLAYER NAME -->
                <span class="text-center uppercase font-black font-poppins text-lg animate-shake text-yellow-600">
                  THIS COULD BE YOU
                </span>
                <!-- PLAYER NAME -->
              </div>
              <p class="text-lg">Celebrate your victory and enjoy!</p>
            {/if}
          </div>
          <!-- CONTENT -->

          <!-- NAVIGATIONAL PANEL -->
        </div>

        <!-- NAVIGATION SUMMARY -->
        <div class="flex items-center gap-2">
          <!-- LEFT BUTTON -->
          <button
            class="btn border-none border-b rounded-none rounded-l-lg"
            class:btn-disabled={currentPanel === 0}
            disabled={currentPanel === 0}
            on:click={() => decrementPanel()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6 flex-shrink-0"
            >
              <path
                fill-rule="evenodd"
                d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <!-- LEFT BUTTON -->
          <!-- PROGRESS DOTS -->
          {#each [0, 1, 2, 3, 4] as panelIndex}
            <div class="w-3 h-3 rounded-full {currentPanel == panelIndex ? 'bg-blue-600' : 'bg-gray-300'}"></div>
          {/each}
          <!-- PROGRESS DOTS -->
          <!-- RIGHT BUTTON -->
          <button
            class="btn border-none border-b rounded-none rounded-r-lg"
            class:btn-disabled={currentPanel === 4}
            disabled={currentPanel === 4}
            on:click={() => incrementPanel()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6 flex-shrink-0"
            >
              <path
                fill-rule="evenodd"
                d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <!-- RIGHT BUTTON -->
        </div>
        <!-- NAVIGATION SUMMARY -->
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </div>
  </dialog>
{/if}
