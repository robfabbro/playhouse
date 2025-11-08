<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import { HiveMindGameCollection, HiveMindGamePlayerCollection } from "/imports/api/hive_mind/collections";
  import CounterInput from "/imports/ui/components/hive_mind/CounterInput.svelte";

  export let closeModal = () => {};
  export let modalOpen = false;
  export let gameId = null;
  let game = null;
  let robotCount;
  let robots = 0;

  const onCounterSave = (newValue) => {
    robotCount = newValue;
  };

  const addBots = () => {
    console.log("Editing bots: ", robotCount);
    Meteor.call("hive_mind.add_robots_to_game", gameId, robotCount, (err, res) => {
      if (err) {
        console.error("Error adding robots: ", err);
      } else {
        console.log("Successfully added robots: ", res);
        closeAddBots();
      }
    });
  };

  const closeAddBots = () => {
    closeModal();
    robotCount = robots;
  };

  $m: {
    game = HiveMindGameCollection.findOne({ _id: gameId });
    robots = HiveMindGamePlayerCollection.find({ game_id: gameId, is_robot: true }).count();
    robotCount = robotCount || robotCount === 0 ? robotCount : robots;
    console.log({ robots, robotCount });
    if (game?.game_start || game?.cancelling) {
      closeAddBots();
    }
  }
</script>

{#if !!modalOpen}
  <dialog class="modal {modalOpen ? 'modal-open' : ''}">
    <div class="modal-box border border-black relative">
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeAddBots}> ✕ </button>
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <h3 class="font-bold text-lg">Add Bots? (<span class="uppercase">{game?.name}</span>)</h3>

      <div class="pt-4 flex flex-col justify-center items-center gap-4 py-4">
        <span class="text-xl">Bots To Include In Game:</span>
        <CounterInput
          value={robotCount}
          onSave={onCounterSave}
          incrementBy={1}
          decrementBy={1}
          minValue={0}
          maxValue={10}
          disableInput={true}
        />
        <span class="text-sm font-light italic text-center">Current Bot Count: <b class="font-bold">{robots}</b></span>
        <span class="text-sm font-light italic text-center"
          >Bots will randomly guess an answer at the start of each round</span
        >
        <span class="text-sm font-light italic text-center">You can add up to <b class="font-bold">10</b> bots</span>
        <button
          class="btn mt-4 bg-blue-400 text-black rounded-full border-2 border-black font-bold"
          disabled={robotCount === robots}
          on:click={() => addBots()}>CONFIRM</button
        >
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
