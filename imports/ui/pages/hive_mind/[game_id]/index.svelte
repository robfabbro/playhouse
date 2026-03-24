<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { redirect, goto } from "@roxi/routify";
  import moment from "moment";
  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  import {
    HiveMindGameCollection,
    HiveMindGamePlayerCollection,
    HiveMindPlayerCollection,
    HiveMindRoundCollection,
  } from "/imports/api/hive_mind/collections";
  import PlayerAvatar from "/imports/ui/components/hive_mind/PlayerAvatar.svelte";
  import Countdown from "/imports/ui/components/hive_mind/Countdown.svelte";
  import GameSettingsModal from "/imports/ui/components/hive_mind/GameSettingsModal.svelte";
  import HowToPlayModal from "/imports/ui/components/hive_mind/HowToPlayModal.svelte";
  import AddBotsModal from "/imports/ui/components/hive_mind/AddBotsModal.svelte";
  import { textfit } from "svelte-textfit";
  import { onMount } from "svelte";
  import _ from "lodash";
  import { fade, draw } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";

  export let scoped;
  $: ({ player_code, your_player, your_game_player, game_id } = scoped);
  $m: {
    console.log("%c PROPS ON /hive_mind_index: ", "color: yellow; font-weight: bold;");
    console.log({ ...scoped });
  }

  let show = false;
  const options: Options = {
    rootMargin: "0px",
    unobserveOnEnter: true,
    threshold: 0,
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => (show = detail.inView);

  let game;
  let first_round = null;
  let all_players = [];
  let other_players = [];
  let loading = false;
  let howToPlayOpen = false;
  let settingsOpen = false;
  let addBotsOpen = false;
  let pointsToWin = null;

  $m: {
    game = HiveMindGameCollection.findOne({ _id: game_id });
    first_round = HiveMindRoundCollection.findOne({ game_id: game_id }, { sort: { createdAt: 1 } });
    all_players = HiveMindGamePlayerCollection.find({ game_id: game_id }).fetch();
    other_players = HiveMindGamePlayerCollection.find({
      player_id: { $ne: your_player?._id },
      game_id: game_id,
    }).fetch();

    pointsToWin = game?.points_to_win || 5 * (all_players?.length - 1);
    if (game?.game_start || game?.cancelling) {
      settingsOpen = false;
      addBotsOpen = false;
      howToPlayOpen = false;
    }

    console.log({ all_players, other_players });
  }

  let startGame = () => {
    loading = true;
    Meteor.call("hive_mind.start_game", game_id, player_code, (err, res) => {
      if (err) {
        console.log("ERROR STARTING GAME: ", err);
      }
      console.log("STARTED GAME: ", res);
      loading = false;
    });
  };

  let cancelGame = () => {
    Meteor.call("hive_mind.cancel_start_game", game_id, player_code, (err, res) => {
      if (err) {
        console.log("ERROR CANCELING GAME: ", err);
      } else {
        console.log("CANCELED GAME: ", res);
      }
    });
  };

  let startRound = () => {
    if (first_round) {
      $goto(`/hive_mind/${game_id}/${first_round._id}`);
    }
  };

  let openSettings = () => {
    settingsOpen = true;
  };
  let closeSettings = () => {
    settingsOpen = false;
  };
  let openHowToPlay = () => {
    howToPlayOpen = true;
  };
  let closeHowToPlay = () => {
    howToPlayOpen = false;
  };
  let openAddBots = () => {
    addBotsOpen = true;
  };
  let closeAddBots = () => {
    addBotsOpen = false;
  };
</script>

<div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-20 pb-4">
  <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
    <div class="flex flex-col items-center">
      <h1 class="text-xl font-black uppercase text-center">Hive Mind</h1>
      <h1 class="font-poppins text-5xl font-black uppercase text-center">
        {game?.name}
      </h1>
      <div class="btn btn-ghost">
        <span class="text-lg font-light"> code: </span>
        <span class="text-lg font-bold">
          {game?.code}
        </span>
      </div>
      <!-- How to play -->
      <div
        class="btn btn-ghost border-gray-500 {loading || all_players?.length < 3
          ? 'invisible'
          : all_players?.length < 3 || game?.game_start || game?.cancelling
            ? 'hidden'
            : ''}"
        on:click={openHowToPlay}
        on:keydown={openHowToPlay}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="h-6 w-6"
          stroke-width="1.5"
        >
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clip-rule="evenodd"
          />
        </svg>

        <span class="text-lg font-light"> How To Play </span>
      </div>
      <!-- How to play -->
    </div>

    <a class="btn btn-link btn-sm absolute top-8 left-8" href={`/hive_mind`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="h-8 w-8"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </a>
    <button
      class="btn btn-link btn-sm absolute top-6 right-6"
      on:click={openSettings}
      disabled={all_players?.length < 3 || game?.game_start || game?.cancelling}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-12 w-12">
        <path
          fill-rule="evenodd"
          d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 0 1-.517.608 7.45 7.45 0 0 0-.478.198.798.798 0 0 1-.796-.064l-.453-.324a1.875 1.875 0 0 0-2.416.2l-.243.243a1.875 1.875 0 0 0-.2 2.416l.324.453a.798.798 0 0 1 .064.796 7.448 7.448 0 0 0-.198.478.798.798 0 0 1-.608.517l-.55.092a1.875 1.875 0 0 0-1.566 1.849v.344c0 .916.663 1.699 1.567 1.85l.549.091c.281.047.508.25.608.517.06.162.127.321.198.478a.798.798 0 0 1-.064.796l-.324.453a1.875 1.875 0 0 0 .2 2.416l.243.243c.648.648 1.67.733 2.416.2l.453-.324a.798.798 0 0 1 .796-.064c.157.071.316.137.478.198.267.1.47.327.517.608l.092.55c.15.903.932 1.566 1.849 1.566h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 0 1 .517-.608 7.52 7.52 0 0 0 .478-.198.798.798 0 0 1 .796.064l.453.324a1.875 1.875 0 0 0 2.416-.2l.243-.243c.648-.648.733-1.67.2-2.416l-.324-.453a.798.798 0 0 1-.064-.796c.071-.157.137-.316.198-.478.1-.267.327-.47.608-.517l.55-.091a1.875 1.875 0 0 0 1.566-1.85v-.344c0-.916-.663-1.699-1.567-1.85l-.549-.091a.798.798 0 0 1-.608-.517 7.507 7.507 0 0 0-.198-.478.798.798 0 0 1 .064-.796l.324-.453a1.875 1.875 0 0 0-.2-2.416l-.243-.243a1.875 1.875 0 0 0-2.416-.2l-.453.324a.798.798 0 0 1-.796.064 7.462 7.462 0 0 0-.478-.198.798.798 0 0 1-.517-.608l-.091-.55a1.875 1.875 0 0 0-1.85-1.566h-.344ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</div>

{#if !game?.game_start && !game?.cancelling}
  <!-- GAME WAIT LOBBY -->
  <!-- MAIN ACTION BUTTON -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        {#if loading}
          <button
            class="btn btn-lg rounded-full border-2 border-gray-800 bg-gray-200 font-bold text-xl text-gray-600 pointer-events-none"
            ><span class="loading loading-spinner loading-lg"></span></button
          >
        {:else if all_players?.length >= 3}
          <button
            class="btn btn-lg rounded-full border-2 border-black bg-blue-400 font-bold text-xl text-black"
            on:click={startGame}>Start Game</button
          >
        {:else}
          <button
            class="btn btn-lg rounded-full border-2 border-gray-800 bg-gray-200 font-bold text-xl text-gray-600 pointer-events-none"
            >Requires 3+ Players</button
          >
        {/if}
        <div
          class="btn btn-ghost -mb-4 {loading || all_players?.length < 3 ? 'invisible' : ''}"
          on:click={openSettings}
          on:keydown={openSettings}
        >
          <span class="text-lg font-light"> <b class="font-bold">{pointsToWin}</b> points to win </span>
        </div>
      </div>
    </div>
  </div>
  <!-- MAIN ACTION BUTTON -->

  <!-- YOUR PLAYER -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <PlayerAvatar
          game_player={your_game_player}
          iconClass="w-20 h-20 stroke-blue-400 fill-blue-800"
          textClass={"text-3xl"}
        />
      </div>
    </div>
  </div>
  <!-- YOUR PLAYER -->

  <!-- OTHER PLAYERS -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <h1 class="text-md font-medium uppercase text-center">OTHER PLAYERS</h1>
        <div class="flex flex-row justify-center items-center flex-wrap gap-4">
          {#each other_players as player (player._id)}
            <PlayerAvatar
              game_player={player}
              iconClass="w-12 h-12 stroke-blue-800 fill-blue-400"
              textClass={player?.player_name?.length === 3
                ? "text-xl"
                : player?.player_name?.length === 4
                  ? "text-lg"
                  : player?.player_name?.length <= 6
                    ? "text-base"
                    : player?.player_name?.length <= 8
                      ? "text-sm"
                      : "text-xs"}
            />
          {/each}

          {#if other_players.length === 0}
            <p class="text-gray-500 italic">No other players yet...</p>
          {/if}
        </div>
        <!-- ADDING BOTS -->
        <button
          class="btn rounded-full border-2 border-blue-600 bg-blue-100 font-bold text-xl text-blue-600"
          on:click={() => openAddBots()}
        >
          <span>+</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            class="h-8 w-8"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1"
          >
            <g class="" transform="translate(0,1)" style=""
              ><path
                d="M81 21.499c-12.81 0-23 10.192-23 23.002 0 12.81 10.19 23 23 23s23.002-10.19 23.002-23S93.81 21.499 81 21.499zm350 0c-12.81 0-23.002 10.192-23.002 23.002 0 12.81 10.192 23 23.002 23 12.81 0 23-10.19 23-23s-10.19-23.002-23-23.002zM110.18 73.212a41.25 41.25 0 0 1-15.11 9.781l28.666 45.867 14.983-9.988zm291.64 0-28.539 45.66 14.983 9.988 28.666-45.867a41.25 41.25 0 0 1-15.11-9.781zm-242.966 53.87-36.143 24.095 6.652 19.955c9.215-12.422 23.339-21.987 39.614-28.912 1.172-.5 2.37-.973 3.568-1.448zm194.292 0-13.69 13.69c1.197.475 2.395.949 3.567 1.448 16.275 6.925 30.399 16.49 39.614 28.912l6.652-19.955zM256 144.5c-29 0-58.021 4.939-79.977 14.281-21.898 9.319-35.908 22.38-39.164 38.364L106.28 426.5h299.442l-30.58-229.355c-3.256-15.984-17.266-29.045-39.164-38.364C314.02 149.44 285 144.501 256 144.501zm-64 58c31.373 0 57 25.627 57 57s-25.627 57-57 57-57-25.627-57-57 25.627-57 57-57zm128 0c31.373 0 57 25.627 57 57s-25.627 57-57 57-57-25.627-57-57 25.627-57 57-57zm-128.549 16.023c-22.754 0-41.547 18.366-41.547 40.977 0 22.611 18.793 40.977 41.547 40.977 22.754 0 41.549-18.366 41.549-40.977 0-22.611-18.795-40.977-41.549-40.977zm128 0c-22.754 0-41.547 18.366-41.547 40.977 0 22.611 18.793 40.977 41.547 40.977 22.754 0 41.549-18.366 41.549-40.977 0-22.611-18.795-40.977-41.549-40.977zm-128 17.998c13.198 0 23.549 10.269 23.549 22.979 0 12.71-10.35 22.978-23.549 22.978-13.198 0-23.549-10.268-23.549-22.978s10.351-22.979 23.55-22.979zm128 0c13.198 0 23.549 10.269 23.549 22.979 0 12.71-10.35 22.978-23.549 22.978-13.198 0-23.549-10.268-23.549-22.978s10.351-22.979 23.55-22.979zM208 330.501h96v18h-96zm-16 32h128v18H192zm-16 32h160v18H176zm-103 50v46h46v-46zm64 0v46h46v-46zm64 0v46h46v-46zm64 0v46h46v-46zm64 0v46h46v-46zm64 0v46h46v-46z"
              ></path></g
            ></svg
          >
        </button>
        <!-- ADDING BOTS -->
      </div>
    </div>
  </div>
  <!-- OTHER PLAYERS -->

  <!-- GAME WAIT LOBBY -->
{:else if !game?.cancelling}
  <!-- GAME LOADING -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center gap-4">
      <div class="btn btn-ghost pointer-events-none border-gray-200 bg-gray-200">
        <span class="text-lg font-light"> <b class="font-bold">{pointsToWin}</b> points to win </span>
      </div>
      {#if game?.started_by}
        <h1 class="text-base font-medium font-poppins -mb-3 uppercase">
          {game?.started_by} started the game
        </h1>
      {/if}
      <h1 class="text-2xl font-bold">Starting game in...</h1>
      <Countdown
        referenceTimestamp={game?.game_start}
        secondsToLast={10}
        onComplete={() => {
          console.log("COUNTDOWN COMPLETE, STARTING ROUND");
          startRound();
        }}
      />
      <button
        class="btn btn-lg rounded-full border-2 border-black bg-red-600 font-bold text-xl text-black"
        on:click={cancelGame}>Cancel</button
      >
    </div>
  </div>
  <!-- GAME LOADING -->
{:else}
  <!-- GAME CANCELLING -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center gap-4">
      <div class="btn btn-ghost pointer-events-none border-gray-200 bg-gray-200">
        <span class="text-lg font-light"> <b class="font-bold">{pointsToWin}</b> points to win </span>
      </div>
      {#if game?.cancelled_by}
        <h1 class="text-base font-medium font-poppins -mb-3 uppercase">
          {game?.cancelled_by} cancelled the game
        </h1>
      {/if}
      <h1 class="text-2xl font-bold">Returning to lobby...</h1>
      <!-- CANCEL -->
      <div class="flex justify-center items-center gap-2 rounded-full border-4 border-black h-24 w-24 p-2 border-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-20 w-20 text-red-600 fill-white stroke-orange-600 stroke-2"
        >
          <path
            in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <!-- CANCEL -->
      <!-- CANCELLING BUTTON -->
      <button
        class="btn btn-lg rounded-full border-2 border-black bg-orange-600 font-bold text-xl text-white pointer-events-none"
        >Cancelling</button
      >
      <!-- CANCELLING BUTTON -->
    </div>
  </div>
  <!-- GAME CANCELLING -->
{/if}

<HowToPlayModal gameId={game_id} modalOpen={howToPlayOpen} closeModal={closeHowToPlay} />
<GameSettingsModal gameId={game_id} modalOpen={settingsOpen} closeModal={closeSettings} />
<AddBotsModal gameId={game_id} modalOpen={addBotsOpen} closeModal={closeAddBots} />
