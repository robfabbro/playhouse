<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { params, redirect, goto } from "@roxi/routify";
  import moment from "moment";
  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  import { ZilcheGameCollection, ZilchePlayerCollection } from "/imports/api/zilche/collections";
  import PlayerScoringCard from "/imports/ui/components/zilche/PlayerScoringCard.svelte";
  import { textfit } from "svelte-textfit";
  import { onMount } from "svelte";
  import _ from "lodash";

  let show = false;
  const options: Options = {
    rootMargin: "50px",
    unobserveOnEnter: true,
    threshold: 0.1,
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => (show = detail.inView);

  let { game_id, name } = $params;

  let addPlayerModal;
  let viewPlayerModal;
  let startGameModal;
  let loading = false;
  let playerToViewId = null;
  let playerToView = null;
  let ballToSink;
  let isAdmin = false;

  let players = [];
  let nonCurrentPlayers = [];
  let currentPlayer;
  let newPlayerName;
  let choosePoisonModal;
  let pickYourPoison = "";
  let game;
  let player_parents = [];
  let editingScore = false;
  let editingScoreValue = null;
  let editingIndividualScore = null;
  let editingNameValue = null;
  let editingName = null;

  const closeAddPlayerModal = () => {
    newPlayerName = "";
    newPlayerCode = null;
    addPlayerModal.close();
  };

  const closeViewPlayerModal = () => {
    playerToViewId = null;
    playerToView = null;
    editingIndividualScore = null;
    editingScore = false;
    editingScoreValue = null;
    editingName = false;
    editingNameValue = null;
    viewPlayerModal.close();
  };

  const openAddPlayerModal = () => {
    if (!game?.finished) {
      addPlayerModal.showModal();
    }
  };

  const openChoosePoisonModal = (ball) => {
    if (!game?.finished) {
      choosePoisonModal.showModal();
    }
  };

  const closeChoosePoisonModal = () => {
    pickYourPoison = "";
    choosePoisonModal.close();
  };

  let choosePoison = () => {
    loading = true;
    Meteor.call("zilche.choose_poison", game_id, pickYourPoison, (err, res) => {
      if (!err) {
        loading = false;
        closeChoosePoisonModal();
      }
    });
  };

  const openViewPlayerModal = (player) => {
    playerToViewId = player._id;
    playerToView = player;
    viewPlayerModal.showModal();
  };

  const editScore = () => {
    editingScoreValue = playerToView.score;
    editingScore = true;
  };

  const saveInitialScore = () => {
    Meteor.call("zilche.saveInitialScore", playerToView._id, editingScoreValue, (err, res) => {
      if (!err) {
        editingScoreValue = null;
        editingScore = false;
      }
    });
  };

  const editName = () => {
    editingNameValue = playerToView.name;
    editingName = true;
  };

  const savePlayerName = () => {
    Meteor.call("zilche.savePlayerName", playerToView._id, editingNameValue, (err, res) => {
      if (!err) {
        editingNameValue = null;
        editingName = false;
      }
    });
  };

  let removePlayer = () => {
    loading = true;
    Meteor.call("zilche.delete_player", player_id, (err, res) => {
      if (err) {
        loading = false;
        closeViewPlayerModal();
      }
    });
    closeViewPlayerModal();
  };

  const saveIndividualScore = () => {
    Meteor.call(
      "zilche.editIndividualScore",
      playerToView._id,
      editingIndividualScore._id,
      editingIndividualScore.value,
      (err, res) => {
        if (!err) {
          editingIndividualScore = null;
        }
      }
    );
  };

  const changePlayerOrder = (newOrder) => {
    if (newOrder !== playerToView?.order) {
      Meteor.call("zilche.changePlayerOrder", playerToView._id, newOrder, (err, res) => {
        console.log({ err, res });
      });
    }
  };

  const placingth = (placing) => {
    if ([11, 12, 13].includes(placing)) {
      return `${placing}` + "th";
    } else {
      return `${placing}` + (placing % 10 === 1 ? "st" : placing % 10 === 2 ? "nd" : placing % 10 === 3 ? "rd" : "th");
    }
  };

  let savePlayer = () => {
    loading = true;
    Meteor.call("zilche.add_player", game_id, newPlayerName, (err, res) => {
      if (!err) {
        newPlayerName = "";
        loading = false;
        closeAddPlayerModal();
      }
    });
  };

  let startGame = () => {
    loading = true;
    Meteor.call("zilche.start_game", game_id, pickYourPoison, (err, res) => {
      if (!err) {
        loading = false;
        pickYourPoison = "";
        startGameModal.close();
      }
    });
  };

  $m: {
    Meteor.subscribe("zilche.players", game_id);
    Meteor.subscribe("zilche.games");
    game = ZilcheGameCollection.findOne({ _id: game_id });
    players = ZilchePlayerCollection.find({ game_id: game_id }, { sort: { order: 1 } }).fetch();
    currentPlayer = players.find((player) => player?.turn);
    let currentPlayerCard = document.getElementById(`${currentPlayer?._id}`);
    if (currentPlayerCard) {
      currentPlayerCard.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
    nonCurrentPlayers = players.filter((player) => !player?.turn);
    playerToView = players.find((player) => player?._id === playerToViewId);

    if (localStorage.getItem("zilche_admin_games")) {
      let adminGames = JSON.parse(localStorage.getItem("zilche_admin_games"));
      isAdmin = adminGames.includes(game_id);
    }

    if (game) {
      let games = localStorage.getItem("zilche_past_games");
      if (games) {
        games = JSON.parse(games);
        games.push(game);
        games = _.uniqBy(games, "_id");
        localStorage.setItem("zilche_past_games", JSON.stringify(games));
      } else {
        localStorage.setItem("zilche_past_games", JSON.stringify([game]));
      }
    }

    console.log({ playerToView });
  }
</script>

<div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-20 pb-4">
  <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
    <div class="flex flex-col items-center">
      <p class="text-center text-sm font-light mb-1">ZILCHE</p>
      <h1 class="font-poppins text-5xl font-black uppercase text-center">
        {game?.name}
      </h1>
      <div class="btn btn-ghost">
        <span class="text-lg font-light"> code: </span>
        <span class="text-lg font-bold">
          {game?.code}
        </span>
      </div>
    </div>

    <a class="btn btn-link btn-sm absolute top-8 left-8" href={`/`}>
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
  </div>
</div>

{#if game}
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center">
    <!-- Players Before Game Start -->
    {#if !game?.start_time}
      <div class:invisible={!show} class:fade-in={show} class="flex items-center justify-center gap-5">
        <div class="mt-6 grid gap-1 grid-cols-3 mb-10 px-1">
          {#each players as player, idx}
            <div
              class="w-full bg-base-100 px-1 shadow-sm container rounded-lg text-center flex flex-col gap-4 items-center border border-black min-h-32"
            >
              <div
                class="text-center my-auto flex flex-col items-center justify-center text-auto"
                bind:this={player_parents[idx]}
              >
                <h2
                  class="font-poppins capitalize"
                  class:text-sm={player?.name?.length >= 11}
                  class:text-lg={player?.name?.length === 10}
                  class:text-xl={player?.name?.length === 9}
                  class:text-2xl={[8, 7].includes(player?.name?.length)}
                  class:text-3xl={player?.name?.length === 6}
                  class:text-4xl={player?.name?.length === 5}
                  class:text-5xl={player?.name?.length <= 4}
                >
                  {player?.name}
                </h2>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    <!-- Players Before Game Start -->

    <!-- Game When Started -->
    {#if game?.start_time}
      <!-- Game Meta Data -->
      <div class:invisible={!show} class:fade-in={show} class="w-full flex items-center justify-between gap-2 md:px-8">
        <button
          class="flex items-center gap-1 justify-center btn bg-transparent border border-gray-50 hover:bg-gray-100 hover:border-gray-400"
          on:click={openChoosePoisonModal}
        >
          <!-- Poison Icon -->
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            height="32px"
            width="32px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M181.78 33v51.53h149.407V33H181.78zm14.19 70.22c-.66 2.9-1.554 5.263-2.75 6.936-2.684 3.75-7.033 6.594-19.5 6.594-21.54 0-40.804 5.862-55.157 16.094-14.353 10.232-23.907 25.398-23.907 42.5V426.75c0 32.34 26.255 58.625 58.594 58.625h213.47c32.338 0 58.592-26.286 58.592-58.625V175.344c0-17.102-9.527-32.2-23.593-42.438-14.067-10.237-32.83-16.156-53.44-16.156-16.69 0-23.62-3.488-26.874-7.188-1.41-1.604-2.43-3.698-3.156-6.343h-19.125c1.073 6.658 3.37 13.137 8.25 18.686 8.11 9.223 21.523 13.53 40.906 13.53 16.978 0 32.056 5.008 42.44 12.564 10.38 7.556 15.905 17.1 15.905 27.344V426.75c0 22.355-17.55 39.938-39.906 39.938H153.25c-22.355 0-39.906-17.583-39.906-39.938V175.344c0-10.245 5.455-19.72 16.062-27.28 10.607-7.563 26.22-12.626 44.313-12.626 15.962 0 28.056-5.142 34.686-14.407 3.904-5.455 5.733-11.545 6.625-17.81h-19.06zm66.093 45.405c-30.545 0-50.062 12.865-63.282 32.313-12.295 18.09-18.387 42.315-19.186 66.062 25.033 12.795 39.555 27.632 43.844 44.97.734 2.967 1.173 5.942 1.312 8.905 9.01 5.134 23.22 8.44 37.813 8.438 12.935-.002 26.08-2.538 36.093-6.875.152-3.325.617-6.662 1.47-10 4.486-17.583 19.028-33.2 44.405-45.563-.838-22.46-6.793-46.595-19-64.938-13.2-19.84-32.745-33.312-63.467-33.312zM232.188 223.5c9.157 0 16.593 7.405 16.593 16.563 0 9.157-7.435 16.593-16.593 16.593-9.157 0-16.562-7.436-16.562-16.594 0-9.157 7.405-16.562 16.563-16.562zm55.437 0c9.158 0 16.594 7.405 16.594 16.563 0 9.157-7.438 16.593-16.595 16.593-9.158 0-16.563-7.436-16.563-16.594 0-9.157 7.405-16.562 16.563-16.562zm-28.844 33.594c6.275 13.248 11.25 26.503 13.72 39.75-9.148-3.022-18.29-3.426-27.438 0 3.34-13.25 7.352-26.504 13.72-39.75zm-37.03 63.47c-2.136 6.42-5.285 12.778-9.188 19.03 11.93 7.99 31.58 12.81 50.875 12.594 18.97-.214 36.878-5.57 46.22-12.407-3.55-5.764-6.412-11.8-8.344-18-11.947 4.416-25.424 6.375-38.75 6.376-14.447.002-28.77-2.222-40.813-7.594zm-70.656 17.06c-8.9 11.268-12.694 22.493-10.03 36.313 68.925 5.54 164.194 31.92 226.686 60.75 9.16-11.166 12.518-22.67 9.97-36.78-67.77-6.867-164.135-28.736-226.626-60.282zm216.594 0c-20.79 10.496-45.326 19.907-71.313 28.063 20.298 4.434 40.253 8.04 58.72 10.688 7.782-1.026 15.357-1.853 22.624-2.438 2.66-13.82-1.133-25.045-10.033-36.312zm-203.75 57.532c-7.904 1.084-15.56 2.01-22.875 2.75-2.55 14.11.81 25.615 9.968 36.78 21.375-9.86 46.575-19.447 73.25-27.998-20.87-4.912-41.385-8.868-60.343-11.532z"
            >
            </path>
          </svg>
          <!-- Poison Icon -->

          <!-- Poison Value -->
          <span class="font-poppins text-lg md:text-2xl font-bold capitalize">
            {game?.poison}
          </span>
          <!-- Poison Value -->
        </button>

        <p class="font-poppins text-lg md:text-2xl">
          ZILCHES:
          <span class="font-bold">
            {game?.zilche_count}
          </span>
        </p>
        <p class="font-poppins text-lg md:text-2xl px-4">
          Round:
          <span class="font-bold">
            {game?.round || 1}
          </span>
        </p>
      </div>
      <!-- Game Meta Data -->

      <!-- Add Player Header -->
      <div class:invisible={!show} class:fade-in={show} class="mt-4 flex items-center justify-center gap-5">
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">Players</h1>
        <button
          class="btn bg-indigo-400 btn-circle rounded-lg font-poppins shadow-lg border-black flex items-center justify-center p-2"
          on:click={openAddPlayerModal}
        >
          {#if !loading}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-8 w-8"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          {:else}
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
      </div>
      <!-- Add Player Header -->

      <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center gap-2">
        {#if players.length > 0}
          <div class="flex flex-row flex-wrap justify-center content-start items-start">
            {#each players as player, idx (player._id)}
              <PlayerScoringCard {idx} {player} {openViewPlayerModal} />
            {/each}
          </div>
        {/if}
      </div>
    {/if}
    <!-- Game When Started -->
  </div>

  <!-- Start Game Button -->
  {#if !game?.start_time && players?.length > 1}
    <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center">
      <div class:invisible={!show} class:fade-in={show} class="flex items-center justify-center gap-5">
        {#if !game?.start_time}
          <button
            class="btn bg-indigo-400 btn-lg rounded-lg font-poppins shadow-lg border-black flex items-center justify-center"
            on:click={() => startGameModal.showModal()}
          >
            Start Game
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
        {/if}
      </div>
    </div>
  {/if}
  <!-- Start Game Button -->

  <!-- Scoring Mode Button -->
  {#if game?.start_time}
    <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center">
      <div class:invisible={!show} class:fade-in={show} class="flex items-center justify-center gap-5">
        {#if game?.start_time}
          <button
            class="btn bg-yellow-400 btn-lg rounded-lg font-poppins shadow-lg border-black flex items-center justify-center mb-16"
            on:click={() => $goto(`/zilche/${game_id}`)}
          >
            Swap to Scoreboard Mode
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
        {/if}
      </div>
    </div>
  {/if}
  <!-- Scoring Mode Button -->
{/if}

<!-- Add Player Modal -->
<dialog class="modal" bind:this={addPlayerModal}>
  {#if game}
    <div class="modal-box border border-black flex flex-col gap-4">
      <h3 class="font-bold text-lg">Add a player</h3>
      <p class="">Press ESC key or click outside to close</p>
      <input
        bind:value={newPlayerName}
        type="text"
        placeholder="Enter the name of your player"
        class="input input-bordered input-primary w-full"
      />

      <div class="pt-2">
        <button
          class="btn bg-indigo-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
          on:click={savePlayer}
        >
          Add Player
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
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button on:click={closeAddPlayerModal}>close</button>
    </form>
  {/if}
</dialog>
<!-- Add Player Modal -->

<!-- View Player Modal -->
<dialog class="modal" bind:this={viewPlayerModal}>
  {#if game}
    <div class="modal-box border border-black flex flex-col gap-4">
      <button class="btn btn-sm btn-circle absolute bg-white border-none top-5 right-5" on:click={closeViewPlayerModal}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 class="font-bold text-lg">Viewing Player {playerToView?.name ? `(${playerToView?.name})` : ""}</h3>

      <!-- Player Name -->
      <div class="flex justify-center items-center gap-2" class:invisible={!playerToView}>
        <div class="w-10 h-10 invisible"></div>
        <div class="flex flex-col items-center gap-0.5 justify-center">
          {#if !editingName}
            <span class="font-bold text-4xl">{playerToView?.name || 0}</span>
          {:else}
            <input
              type="text"
              class="input input-bordered input-primary"
              bind:value={editingNameValue}
              placeholder="Enter score"
            />
          {/if}
        </div>
        {#if !editingName}
          <button
            class="btn p-0 m-0 min-h-0 w-auto h-auto font-bold bg-transparent border-none self-end"
            on:click={editName}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-10 w-10 flex-shrink-0"
            >
              <path
                d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
              />
              <path
                d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"
              />
            </svg>
          </button>
        {:else}
          <button
            class="self-end btn px-1 py-0 m-0 w-12 h-10 bg-green-600 text-white text-sm rounded-lg border-white"
            on:click={savePlayerName}>SAVE</button
          >
        {/if}
      </div>
      <!-- Player Name -->

      <!-- Total Score -->
      <div class="flex justify-center items-center gap-2" class:invisible={!playerToView}>
        <div class="w-10 h-10 invisible"></div>
        <div class="flex flex-col items-center gap-0.5 justify-center">
          <span class="font-normal text-2xl">Score:</span>
          {#if !editingScore}
            <span class="font-bold text-4xl">{playerToView?.score || 0}</span>
          {:else}
            <input
              type="number"
              class="input input-bordered input-primary"
              bind:value={editingScoreValue}
              placeholder="Enter score"
            />
          {/if}
        </div>
        {#if !editingScore}
          <button
            class="btn p-0 m-0 min-h-0 w-auto h-auto font-bold bg-transparent border-none self-end"
            on:click={editScore}
            class:invisible={playerToView?.scores?.length > 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-10 w-10 flex-shrink-0"
            >
              <path
                d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
              />
              <path
                d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"
              />
            </svg>
          </button>
        {:else}
          <button
            class="self-end btn px-1 py-0 m-0 w-12 h-10 bg-green-600 text-white text-sm rounded-lg border-white"
            on:click={saveInitialScore}>SAVE</button
          >
        {/if}
      </div>
      <!-- Total Score -->

      <!-- Show Scores -->
      <div class="flex flex-col flex-wrap items-center justify-center gap-1">
        {#each playerToView?.scores || [] as score, scoreIdx}
          <p class="flex items-center gap-2" class:h-10={editingIndividualScore?._id === score?._id}>
            <span>{`${editingIndividualScore?._id !== score?._id ? "Round " : "R"}${scoreIdx + 1}: `}</span>
            {#if editingIndividualScore?._id === score?._id}
              <input
                type="number"
                class="input input-bordered input-primary"
                bind:value={editingIndividualScore.value}
                placeholder="Enter score"
              />
              <button
                class="btn px-1 py-0 m-0 min-h-0 w-auto h-10 bg-green-600 text-white text-sm rounded-lg border-white"
                on:click={saveIndividualScore}>SAVE</button
              >
            {:else}
              <span class="font-bold">{score.value || "ZILCHE"}</span>
              <button
                class="btn p-0 m-0 min-h-0 w-auto h-auto font-bold bg-transparent border-none"
                on:click={() => (editingIndividualScore = score)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="h-5 w-5 flex-shrink-0"
                >
                  <path
                    d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
                  />
                  <path
                    d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"
                  />
                </svg>
              </button>
            {/if}
          </p>
        {/each}
      </div>
      <!-- Show Scores -->

      <!-- Change to This Person's Turn -->
      {#if !playerToView?.turn && !game?.finished}
        <div class="mt-6" class:invisible={!playerToView}>
          <button
            class="btn bg-indigo-300 hover:bg-indigo-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
            on:click={() => Meteor.call("zilche.change_turn", game_id, playerToView?._id)}
          >
            Change to this person's turn
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
        </div>
      {/if}
      <!-- Change to This Person's Turn -->

      <!-- Change The Player's Order -->
      {#if !game?.finished}
        <div class="flex flex-col justify-center p-2 border border-indigo-800 bg-indigo-50 rounded-lg">
          <span class="font-poppins text-base text-center font-medium">Change this player's order</span>
          <div class="flex gap-2 items-center justify-center" class:invisible={!playerToView}>
            {#each players as player, idx}
              <button
                class={`btn btn-circle ${playerToView?.order - 1 == idx ? "bg-indigo-400 border-indigo-800 text-white" : "bg-white text-indigo-800"} rounded-full font-poppins shadow-lg`}
                on:click={() => changePlayerOrder(idx + 1)}
              >
                <p class="flex flex-col items-center">
                  <span class="text-xxs font-light">
                    {idx + 1}
                  </span>
                  <span class="text-xs">
                    {player?.name}
                  </span>
                </p>
              </button>
            {/each}
          </div>
        </div>
      {/if}
      <div></div>
      <!-- Change The Players Order -->
      <div>
        <button on:Click={removePlayer} class="btn btn-sm bg-red-400 border-red-800 w-[68px]">Delete Player</button>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button on:click={closeViewPlayerModal}>close</button>
    </form>
  {/if}
</dialog>
<!-- View Player Modal -->

<!-- Start Game Modal -->
<dialog class="modal" bind:this={startGameModal}>
  {#if game}
    <div class="modal-box border border-black flex flex-col gap-4">
      <button
        class="btn btn-sm btn-circle absolute bg-white border-none top-5 right-5"
        on:click={() => startGameModal.close()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 class="font-bold text-lg">Pick your poison:</h3>

      <div class="flex items-center gap-2 justify-center w-full">
        <input
          bind:value={pickYourPoison}
          type="text"
          placeholder="Enter your zilche punishment"
          class="input input-bordered input-primary w-full"
        />
      </div>
      <div class="mt-6">
        <button
          class="btn bg-indigo-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
          on:click={startGame}
        >
          Begin!
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
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  {/if}
</dialog>
<!-- Start Game Modal -->

<!-- Choose Poison Modal -->
<dialog class="modal" bind:this={choosePoisonModal}>
  {#if game}
    <div class="modal-box border border-black flex flex-col gap-4">
      <button
        class="btn btn-sm btn-circle absolute bg-white border-none top-5 right-5"
        on:click={closeChoosePoisonModal}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-6 w-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 class="font-bold text-lg">Pick your poison:</h3>

      <div class="flex items-center gap-2 justify-center w-full">
        <input
          bind:value={pickYourPoison}
          type="text"
          placeholder="Enter your zilche punishment"
          class="input input-bordered input-primary w-full"
        />
      </div>

      <div class="mt-6">
        <button
          class="btn bg-indigo-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
          on:click={choosePoison}
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
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button on:click={closeChoosePoisonModal}>close</button>
    </form>
  {/if}
</dialog>
<!-- Choose Poison Modal -->
