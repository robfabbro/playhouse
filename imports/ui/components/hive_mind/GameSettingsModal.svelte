<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import { HiveMindGameCollection, HiveMindGamePlayerCollection } from "/imports/api/hive_mind/collections";
  import CounterInput from "/imports/ui/components/hive_mind/CounterInput.svelte";
  import DualRangeSlider from "/imports/ui/components/hive_mind/DualRangeSlider.svelte";

  export let closeModal = () => {};
  export let modalOpen = false;
  export let gameId = null;
  let game = null;
  let playerCount = null;
  let pointsToWin = null;
  let defaultPointsToWin = null;
  let currentPanel = 0;
  let languageError = false;
  let languageErrorTimeout = null;
  let cefrRange = [0, 5];

  $m: {
    game = HiveMindGameCollection.findOne({ _id: gameId });
    cefrRange = game?.cefr_level;
    playerCount = HiveMindGamePlayerCollection.find({ game_id: gameId }).count();
    defaultPointsToWin = 5 * (playerCount - 1);
    pointsToWin = game?.points_to_win || defaultPointsToWin;
  }

  let onCounterSave = (newValue) => {
    let originalPointsToWin = pointsToWin;
    pointsToWin = newValue;
    Meteor.call("hive_mind.update_game_settings", gameId, { points_to_win: newValue }, (err, res) => {
      if (err) {
        console.error("Error updating points to win: ", err);
        pointsToWin = originalPointsToWin;
      } else {
        console.log("Successfully updated points to win to: ", newValue);
      }
    });
  };

  let chooseLanguage = (language) => {
    if (languageErrorTimeout !== null) {
      clearInterval(languageErrorTimeout);
    }

    Meteor.call("hive_mind.choose_language", gameId, language, (err, res) => {
      if (err) {
        console.log("ERROR CHANGING LANGUAGE: ", err);

        languageError = true;
        languageErrorTimeout = setTimeout(() => {
          languageError = false;
        }, 500);
      } else {
        console.log("CHANGED LANGUAGE: ", res);
      }
    });
  };

  let setCefrLevel = (cefr_level) => {
    Meteor.call("hive_mind.set_cefr_level", gameId, cefr_level, (err, res) => {
      if (err) {
        console.log("ERROR SETTING CEFR: ", err);
      } else {
        console.log("CHANGED SETTING CEFR: ", res);
      }
    });
  };

  let incrementPanel = () => {
    currentPanel = Math.min(1, currentPanel + 1);
  };

  let decrementPanel = () => {
    currentPanel = Math.max(0, currentPanel - 1);
  };

  // UP TO DESIGNING THIS MODAL, SPECIFICALLY THE SPLIT SCORE BOARD
</script>

{#if !!modalOpen}
  <dialog class="modal {modalOpen ? 'modal-open' : ''}">
    <div class="modal-box border border-black relative">
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeModal}> ✕ </button>
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <h3 class="font-bold text-lg">Game Settings (<span class="uppercase">{game?.name}</span>)</h3>

      <div class="pt-4 flex flex-col justify-center items-center gap-4 py-4">
        <!-- FIRST PANEL -->
        {#if currentPanel === 0}
          <!-- LANGUAGE SWITCHER -->
          <div class="flex flex-col gap-1 items-center mt-6 mb-4">
            <span class="text-xl mb-2">Current language(s):</span>
            <span class="font-bold text-lg">{game?.language_mode.join(" + ")}</span>
            <div class="flex flex-row gap-1">
              <button
                on:click={() => chooseLanguage("english")}
                class="btn text-3xl border-2 {game?.language_mode?.length && game?.language_mode.includes('english')
                  ? 'bg-blue-400 border-blue-800 hover:bg-blue-200 hover:border-blue-600 focus:bg-blue-400 focus:border-blue-800'
                  : ''} {game?.language_mode?.length && game?.language_mode.includes('english') && languageError
                  ? 'animate-hard-shake'
                  : ''}">🇬🇧</button
              >
              <button
                on:click={() => chooseLanguage("deutsch")}
                class="btn text-3xl border-2 {game?.language_mode?.length && game?.language_mode.includes('deutsch')
                  ? 'bg-blue-400 border-blue-800 hover:bg-blue-200 hover:border-blue-600 focus:bg-blue-400 focus:border-blue-800'
                  : ''} {game?.language_mode?.length && game?.language_mode.includes('deutsch') && languageError
                  ? 'animate-hard-shake'
                  : ''}">🇩🇪</button
              >
            </div>
          </div>
          <!-- LANGUAGE SWITCHER -->
          <!-- CEFR -->
          <div class="flex flex-col gap-1 items-center mt-6 mb-4 w-full px-6">
            <span class="text-xl mb-2">CEFR Vocabulary Levels to Include:</span>

            <DualRangeSlider bind:value={cefrRange} min={0} max={5} step={1} onUpdate={setCefrLevel} />
          </div>
          <!-- CEFR -->
        {/if}
        <!-- FIRST PANEL -->

        <!-- SECOND PANEL -->
        {#if currentPanel === 1}
          <!-- POINTS TO WIN SETTING -->
          <span class="text-xl">Points Required to Win:</span>
          <!-- COUNTER -->
          <CounterInput value={pointsToWin} incrementBy={1} decrementBy={1} onSave={onCounterSave} />
          <!-- COUNTER -->
          <div class="flex flex-col justify-center items-center text-center">
            <span class="text-sm font-light italic">By default, this score is set to the following formula</span>
            <span class="text-sm font-light italic">Current Player Count: <b class="font-bold">{playerCount}</b></span>
            <span class="text-sm font-light italic"
              ><b class="font-bold">5</b> * (<b class="font-bold">players</b> - <b class="font-bold">1</b>) =
              <b class="font-bold">{defaultPointsToWin}</b></span
            >
            <span class="text-sm font-light italic">To ensure that the game lasts for at least <b>5</b> rounds</span>
            <button
              class="btn btn-sm mt-4 bg-gray-400 text-white"
              disabled={pointsToWin === defaultPointsToWin}
              on:click={() => onCounterSave(defaultPointsToWin)}>RESET TO DEFAULT</button
            >
          </div>
          <!-- POINTS TO WIN SETTING -->
        {/if}
        <!-- SECOND PANEL -->
        <!-- NAVIGATION SUMMARY -->
        <div class="flex items-center gap-2 mt-4">
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
          {#each [0, 1] as panelIndex}
            <div class="w-3 h-3 rounded-full {currentPanel == panelIndex ? 'bg-blue-600' : 'bg-gray-300'}"></div>
          {/each}
          <!-- PROGRESS DOTS -->
          <!-- RIGHT BUTTON -->
          <button
            class="btn border-none border-b rounded-none rounded-r-lg"
            class:btn-disabled={currentPanel === 1}
            disabled={currentPanel === 1}
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
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
