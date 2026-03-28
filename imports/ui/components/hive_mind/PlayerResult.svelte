<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import PlayerAvatar from "/imports/ui/components/hive_mind/PlayerAvatar.svelte";
  import DrawableNumber from "/imports/ui/components/hive_mind/DrawableNumber.svelte";

  export let selectPlayer = () => {};
  export let hidePlayer = false;
  export let showLoadingAnimation = false;
  export let hideDrawableNumber = false;
  export let index = 0;
  export let round_number = 0;
  export let all_players = [];
  export let player = {
    _id: "adsjfkalsdjfa",
    game_id: "wGyLGPzqk9Tve76mr",
    player_code: "556917",
    game_name: "game",
    player_id: "qnBBTXpjkq76ty8Ka",
    player_name: "Nat",
    answer: {
      points_scored: 1,
    },
    total_points: 33,
  };

  let placing;
  let ranking;
  let previous_round_ranking;

  const placingth = (placing) => {
    if ([11, 12, 13].includes(placing)) {
      return `${placing}` + "th";
    } else {
      return `${placing}` + (placing % 10 === 1 ? "st" : placing % 10 === 2 ? "nd" : placing % 10 === 3 ? "rd" : "th");
    }
  };

  $: {
    let playersWithMorePoints = all_players.filter(
      (ap) => ap.total_points > player.total_points && ap._id !== player._id
    ).length;
    let playersWithSamePoints = all_players.filter(
      (ap) => ap.total_points === player.total_points && ap._id !== player._id
    ).length;

    ranking = playersWithMorePoints + 1;
    previous_round_ranking = player?.placement_history[`R${round_number - 1}`]?.ranking;

    // save the placing of the player here
    if (playersWithSamePoints > 0) {
      placing = "T-" + placingth(ranking);
    } else {
      placing = placingth(ranking);
    }

    console.log(
      `${player?.player_name}: R${round_number - 1} ${previous_round_ranking} -> R${round_number} ${ranking}`
    );
  }
</script>

<div class="flex flex-row justify-end items-center w-full gap-1">
  <!-- EMPTY SPACE / LOADING ANIMATION -->
  <div class="w-1/5 flex justify-center items-center font-poppins text-lg text-white font-bold">
    {#if showLoadingAnimation}
      <div class="loading loading-spinner loading-md text-blue-600"></div>
    {:else if player?.final_position_revealed && (placing === "2nd" || placing == "T-2nd")}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="w-8 h-8 stroke-slate-600 fill-slate-400">
        <path
          in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
          d="M320.3 192L235.7 51.1C229.2 40.3 215.6 36.4 204.4 42L117.8 85.3C105.9 91.2 101.1 105.6 107 117.5L176.6 256.6C146.5 290.5 128.3 335.1 128.3 384C128.3 490 214.3 576 320.3 576C426.3 576 512.3 490 512.3 384C512.3 335.1 494 290.5 464 256.6L533.6 117.5C539.5 105.6 534.7 91.2 522.9 85.3L436.2 41.9C425 36.3 411.3 40.3 404.9 51L320.3 192zM351.1 334.5C352.5 337.3 355.1 339.2 358.1 339.6L408.2 346.9C415.9 348 418.9 357.4 413.4 362.9L377.1 398.3C374.9 400.5 373.9 403.5 374.4 406.6L383 456.5C384.3 464.1 376.3 470 369.4 466.4L324.6 442.8C321.9 441.4 318.6 441.4 315.9 442.8L271.1 466.4C264.2 470 256.2 464.2 257.5 456.5L266.1 406.6C266.6 403.6 265.6 400.5 263.4 398.3L227.1 362.9C221.5 357.5 224.6 348.1 232.3 346.9L282.4 339.6C285.4 339.2 288.1 337.2 289.4 334.5L311.8 289.1C315.2 282.1 325.1 282.1 328.6 289.1L351 334.5z"
        />
      </svg>
    {:else if player?.final_position_revealed && (placing === "3rd" || placing == "T-3rd")}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="w-8 h-8 stroke-amber-900 fill-amber-950">
        <path
          in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
          d="M320.3 192L235.7 51.1C229.2 40.3 215.6 36.4 204.4 42L117.8 85.3C105.9 91.2 101.1 105.6 107 117.5L176.6 256.6C146.5 290.5 128.3 335.1 128.3 384C128.3 490 214.3 576 320.3 576C426.3 576 512.3 490 512.3 384C512.3 335.1 494 290.5 464 256.6L533.6 117.5C539.5 105.6 534.7 91.2 522.9 85.3L436.2 41.9C425 36.3 411.3 40.3 404.9 51L320.3 192zM351.1 334.5C352.5 337.3 355.1 339.2 358.1 339.6L408.2 346.9C415.9 348 418.9 357.4 413.4 362.9L377.1 398.3C374.9 400.5 373.9 403.5 374.4 406.6L383 456.5C384.3 464.1 376.3 470 369.4 466.4L324.6 442.8C321.9 441.4 318.6 441.4 315.9 442.8L271.1 466.4C264.2 470 256.2 464.2 257.5 456.5L266.1 406.6C266.6 403.6 265.6 400.5 263.4 398.3L227.1 362.9C221.5 357.5 224.6 348.1 232.3 346.9L282.4 339.6C285.4 339.2 288.1 337.2 289.4 334.5L311.8 289.1C315.2 282.1 325.1 282.1 328.6 289.1L351 334.5z"
        />
      </svg>
    {:else if round_number > 1 && ranking < previous_round_ranking}
      <!-- chevron up -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke="currentColor"
        class="h-4 w-4 fill-green-600 text-green-600 -mr-0.5"
        in:fade={{ duration: 1000, delay: 1000, easing: quintOut }}
      >
        <path
          in:draw={{ duration: 1000, delay: 1000, easing: quintOut }}
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m4.5 15.75 7.5-7.5 7.5 7.5"
        />
      </svg>
      <!-- chevron up -->

      <!-- drawable number -->
      <DrawableNumber
        number={ranking - previous_round_ranking}
        svgClass="h-4 w-4 stroke-green-600 fill-green-600"
        containerClass=""
        drawAnimationParams={{ duration: 1000, delay: 1000, easing: quintOut }}
      />
      <!-- drawable number -->
    {:else if round_number > 1 && ranking > previous_round_ranking}
      <!-- chevron down -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="3"
        stroke="currentColor"
        class="h-4 w-4 fill-red-600 text-red-600 -mr-0.5"
        in:fade={{ duration: 1000, delay: 1000, easing: quintOut }}
      >
        <path
          in:draw={{ duration: 1000, delay: 1000, easing: quintOut }}
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>

      <!-- chevron down -->

      <!-- drawable number -->
      <DrawableNumber
        number={ranking - previous_round_ranking}
        svgClass="h-4 w-4 stroke-red-500 fill-red-500"
        containerClass=""
        drawAnimationParams={{ duration: 1000, delay: 1000, easing: quintOut }}
      />
      <!-- drawable number -->
    {/if}
  </div>
  <!-- EMPTY SPACE / LOADING ANIMATION -->

  <div class="flex flex-col w-full justify-center items-stretch">
    <!-- PLAYER TAB -->
    {#if hidePlayer}
      <!-- HIDE PLAYER -->
      <button
        class="btn border-blue-600 border-2 rounded-lg w-full min-w-auto max-w-auto py-2 px-1 h-auto bg-white pointer-events-none min-h-[52px]"
        in:fade={{ duration: 1000, easing: cubicOut }}
      >
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
      </button>
      <!-- HIDE PLAYER -->
    {:else}
      <!-- SHOW PLAYER -->
      <button
        class="btn border-black border-2 rounded-lg w-full min-w-auto max-w-auto py-2 px-1 h-auto bg-white hover:bg-gray-200 min-h-[52px] bg-op"
        class:bg-slate-400={player?.final_position_revealed && (placing === "2nd" || placing == "T-2nd")}
        class:bg-amber-950={player?.final_position_revealed && (placing === "3rd" || placing == "T-3rd")}
        class:bg-opacity-40={player?.final_position_revealed &&
          (placing === "3rd" || placing == "T-3rd" || placing === "2nd" || placing == "T-2nd")}
        in:fade={{ duration: 1000, easing: cubicOut }}
        on:click={selectPlayer}
      >
        <div class="w-full flex flex-row justify-center items-center" in:fade={{ duration: 1000, easing: cubicOut }}>
          <!-- PLACING -->
          <div class="w-1/5 flex justify-center items-center font-poppins text-sm font-bold">{placing}</div>
          <!-- PLACING -->
          <!-- WORD -->
          <div
            class="w-3/5 flex justify-center items-center font-poppins font-bold {player?.player_name?.length === 3
              ? 'text-2xl'
              : player?.player_name?.length === 4
                ? 'text-xl'
                : player?.player_name?.length <= 6
                  ? 'text-lg'
                  : player?.player_name?.length <= 8
                    ? 'text-base'
                    : 'text-sm'}"
          >
            {player.player_name}
          </div>
          <!-- WORD -->
          <!-- ANSWER COUNT -->
          <div class="w-1/5 flex justify-center items-center gap-1">
            <span class="text-4xl font-bold">{player.total_points}</span>
          </div>
          <!-- ANSWER COUNT -->
        </div>
      </button>
      <!-- SHOW PLAYER  -->
    {/if}
    <!-- PLAYER TAB -->
  </div>

  <!-- SCORE ON THE RIGHT OF WORD -->
  <div
    class="w-1/5 flex justify-center items-center font-poppins text-3xl font-bold {hideDrawableNumber
      ? 'invisible'
      : ''}"
  >
    {#if player?.answer?.points_scored > 0}
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
        number={player?.answer?.points_scored}
        svgClass="h-6 w-6 stroke-green-600 fill-green-600"
        containerClass=""
        drawAnimationParams={{ duration: 1000, delay: 1000, easing: quintOut }}
      />
      <!-- drawable number -->
    {/if}
  </div>
  <!-- SCORE ON THE RIGHT OF WORD -->
</div>
