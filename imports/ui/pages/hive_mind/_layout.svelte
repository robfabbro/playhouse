<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { onMount } from "svelte";
  import { goto, route, params } from "@roxi/routify";
  import {
    HiveMindPlayerCollection,
    HiveMindGamePlayerCollection,
    HiveMindGameCollection,
    HiveMindRoundCollection,
  } from "/imports/api/hive_mind/collections";
  import _ from "lodash";

  let player_id = null;
  let game_id = null;
  let player_code = null;
  let your_player = null;
  let your_game_player = null;

  let addPlayerModal;
  let addPlayerError = false;
  let addPlayerName = "";
  let loading = false;
  let subReady = false;

  let game;
  let latest_round = null;
  let route_id;

  $: ({ round_id, game_id } = $params);
  $: {
    route_id = $route?.id;
    console.log("%c ROUTE ID: ", "color: yellow; font-weight: bold;", route_id);
  }

  onMount(() => {
    player_code = localStorage.getItem("hive_mind_player_code");
    if (!player_code) {
      player_code = _.random(100000, 999999).toString();
      localStorage.setItem("hive_mind_player_code", player_code);
      addPlayerModal.showModal();
    }
  });

  $m: {
    let playerSub = Meteor.subscribe("hive_mind.player", player_code);
    let gameSub = Meteor.subscribe("hive_mind.game", game_id);
    if (player_code) {
      your_player = HiveMindPlayerCollection.findOne({ code: player_code });
      if (game_id) {
        your_game_player = HiveMindGamePlayerCollection.findOne({ player_id: your_player?._id });
      }
      if (!your_player && playerSub.ready()) {
        console.log("NO PLAYER SHOW MODAL");
        addPlayerModal.showModal();
      }
    }

    subReady = playerSub.ready() && gameSub.ready();
    console.log("%c PROPS ON /hive_mind_layout: ", "color: cyan; font-weight: bold;");
    console.log({ player_code, your_player, your_game_player });
  }

  $m: {
    game = HiveMindGameCollection.findOne({ _id: game_id });
    latest_round = HiveMindRoundCollection.findOne({ game_id: game_id }, { sort: { round_number: -1 } });
    if (subReady) {
      if (!game && game_id && route_id.includes(`_hive_mind__game_id`)) {
        console.log("GAME ID: ", game_id);
        console.log("NO GAME FOUND, GO TO /hive_mind");
        $goto(`/hive_mind`);
      } else if (game && !game?.game_start && route_id !== `_hive_mind__game_id__index`) {
        console.log("GAME NOT STARTED, GO TO /index");
        $goto(`/hive_mind/${game_id}`);
      } else if (
        (game?.ended_at || game?.final_leaderboard_revealed) &&
        route_id !== `_hive_mind__game_id__round_id_summary` &&
        route_id !== `_hive_mind_index`
      ) {
        console.log("GAME ALREADY FINISHED, GO TO /summary ", route_id);
        $goto(`/hive_mind/${game_id}/summary`);
      } else if (latest_round && route_id === `_hive_mind__game_id__route_id_index`) {
        console.log("GAME IN PROGRESS, GO TO /:round_id");
        $goto(`/hive_mind/${game_id}/${latest_round._id}`);
      }
    }
  }

  let addPlayer = (e) => {
    console.log("PLAYER NAME: ", addPlayerName);
    console.log("PLAYER CODE: ", player_code.toLowerCase());

    if (!addPlayerName) {
      addPlayerError = "A name is required";
      return;
    }

    if (addPlayerName && player_code) {
      loading = true;
      addPlayerError = false;
      Meteor.call("hive_mind.add_player", addPlayerName, player_code, (err, res) => {
        loading = false;
        if (!err) {
          addPlayerModal.close();
        } else {
          addPlayerError = "Please try again...";
        }
      });
    }
  };
</script>

<div class="w-screen flex justify-center">
  <div class="w-full max-w-5xl pb-[10vh]">
    {#if subReady}
      <slot
        scoped={{
          your_player: your_player,
          your_game_player: your_game_player,
          player_code: player_code,
          game_id: game_id,
          round_id: round_id,
        }}
      />
    {:else}
      <div class="flex flex-col items-center justify-center h-screen">
        <p class="text-gray-700 font-poppins text-5xl">Loading...</p>
        <div class="loading loading-xl rounded-full border-b-2 border-gray-900"></div>
      </div>
    {/if}
  </div>
</div>

<dialog class="modal" bind:this={addPlayerModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg">Add Your Player</h3>
    <p class="py-4">Before you can join or create a new Hive Mind game, you need to add your player.</p>
    <input
      bind:value={addPlayerName}
      type="text"
      placeholder="Enter your player's name"
      class="input input-bordered input-primary w-full"
    />
    <div class="pt-4">
      <button
        class="btn bg-[#3DADFF] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        on:click={addPlayer}
      >
        Confirm
        {#if loading}
          <svg class="animate-spin ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        {/if}
      </button>
      {#if !!addPlayerError}
        <p class="text-red-500 text-sm mt-2">{addPlayerError}</p>
      {/if}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop pointer-events-none">
    <button>close</button>
  </form>
</dialog>
