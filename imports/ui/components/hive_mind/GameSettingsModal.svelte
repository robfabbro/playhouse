<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import { HiveMindGameCollection, HiveMindGamePlayerCollection } from "/imports/api/hive_mind/collections";
  import CounterInput from "/imports/ui/components/hive_mind/CounterInput.svelte";

  export let closeModal = () => {};
  export let modalOpen = false;
  export let gameId = null;
  let game = null;
  let playerCount = null;
  let pointsToWin = null;
  let defaultPointsToWin = null;

  $m: {
    game = HiveMindGameCollection.findOne({ _id: gameId });
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
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
