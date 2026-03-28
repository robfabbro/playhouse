<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import {
    HiveMindGameCollection,
    HiveMindGamePlayerCollection,
    HiveMindPlayerCollection,
    HiveMindRoundCollection,
    HiveMindRoundWordCollection,
    HiveMindRoundAnswerCollection,
  } from "/imports/api/hive_mind/collections";
  import DrawableNumber from "/imports/ui/components/hive_mind/DrawableNumber.svelte";

  export let closeModal = () => {};
  export let playerToViewId = null;
  export let all_players = [];
  let player = null;

  $m: {
    console.log("PLAYER TO VIEW ID: ", playerToViewId);
    player = all_players.find((p) => p._id === playerToViewId);
    console.log("PLAYER TO VIEW: ", player);
  }

  // UP TO DESIGNING THIS MODAL, SPECIFICALLY THE SPLIT SCORE BOARD
</script>

{#if !!playerToViewId}
  <dialog class="modal {playerToViewId ? 'modal-open' : ''}">
    <div class="modal-box border border-black relative">
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeModal}> ✕ </button>
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <h3 class="font-bold text-lg">Viewing Player ({player?.player_name})</h3>
      {#if player}
        <div class="pt-4 flex flex-col justify-center items-center gap-6">
          <!-- TOTAL POINTS -->
          <div class="pt-4 flex flex-col justify-center items-center gap-1">
            <span class="text-xl font-light">Total Points:</span>
            <span class="text-4xl font-bold">{player?.total_points}</span>
          </div>
          <!-- TOTAL POINTS -->
          <!-- SPLIT SCORE BOARD -->
          <div class="flex flex-col justify-between items-stretch w-full gap-1">
            <!-- TOP SIDE -->
            <div class="flex flex-col items-center gap-1 basis-1/2 px-2">
              <div class="flex items-center gap-2">
                <span class="text-left font-poppins font-light">Majorities:</span>
                <span class="font-poppins font-semibold uppercase">{player?.majorities || 0}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-left font-poppins font-light">Minorities:</span>
                <span class="font-poppins font-semibold uppercase">{player?.minorities || 0}</span>
              </div>
            </div>
            <!-- TOP SIDE -->
            <!-- DIVIDER -->
            <div class="self-stretch m-0 my-2 min-w-[240px] h-0.5 w-full bg-gray-400"></div>
            <!-- DIVIDER -->
            <!-- BOTTOM SIDE -->
            <div class="flex flex-col gap-1 basis-1/2">
              {#each player?.game_answers as answer, idx (answer?._id)}
                <div class="w-full flex justify-between items-center gap-4">
                  <div class="flex items-center gap-2">
                    <span class="text-left font-poppins font-light shrink-0">R{idx + 1}:</span>
                    <span
                      class="font-poppins font-semibold uppercase {answer?.word === 'no answer'
                        ? 'text-sm'
                        : ''} flex items-center flex-wrap flex-shrink break-all hyphens-auto">{answer?.word}</span
                    >
                    <span class="flex items-center gap-1 shrink-0">
                      <!-- plus -->
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="3"
                        stroke="currentColor"
                        class="h-3 w-3 {answer?.points_scored > 0
                          ? 'fill-green-600 text-green-600'
                          : 'fill-red-600 text-red-600'} -mr-1"
                      >
                        <path
                          in:draw={{ duration: 1000, delay: 1000, easing: quintOut }}
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      <!-- plus -->

                      <DrawableNumber
                        number={answer?.points_scored}
                        svgClass="h-4 w-4 {answer?.points_scored > 0
                          ? 'stroke-green-600 fill-green-600'
                          : 'stroke-red-600 fill-red-600'}"
                        containerClass=""
                        drawAnimationParams={{ duration: 1000, delay: 1000, easing: quintOut }}
                      />
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="font-poppins font-light shrink-0"
                      >{player?.placement_history[`R${idx + 1}`]?.placing}:</span
                    >
                    <span class="font-poppins font-semibold shrink-0"
                      >{player?.placement_history[`R${idx + 1}`]?.points_at_end_of_round} pts</span
                    >
                  </div>
                </div>
              {/each}
            </div>
            <!-- BOTTOM SIDE -->
          </div>
          <!-- SPLIT SCORE BOARD -->
        </div>
      {/if}
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
{/if}
