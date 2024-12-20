<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { params, redirect, goto } from "@roxi/routify";
  import moment from "moment";
  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  import { SantaGameCollection, SantaPlayerCollection } from "/imports/api/secret_santa/collections";
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

  let newOptionValue;
  let addPlayerModal;
  let viewPlayerModal;
  let startGameModal;
  let loading = false;
  let selectedGiftsPerPerson = 1;
  let showPlayerCode = false;
  let unlockAddPlayer = false;
  let playerToView;
  let playerToViewCodeOptions;
  let playerToViewShowGiftees = false;
  let isAdmin = false;
  let playerAffectedBySink = null;

  let player_parents = [];
  let option_parents = [];

  const playerCodes = ["🍎", "🍊", "⚽️", "🏀", "🏈", "🎾", "🎱", "🍓", "🍆", "🌞", "🌝", "🐸", "🐷", "🚗", "💎"];

  const closeAddPlayerModal = () => {
    newPlayerName = "";
    newPlayerCode = null;
    showPlayerCode = false;
    unlockAddPlayer = false;
    addPlayerModal.close();
  };

  const closeViewPlayerModal = () => {
    playerToView = null;
    playerToViewCodeOptions = null;
    playerToViewShowGiftees = false;
    viewPlayerModal.close();
  };

  const openAddPlayerModal = () => {
    if (!game?.end_time) {
      showPlayerCode = false;
      unlockAddPlayer = false;
      let unclaimedCodes = playerCodes.filter((code) => {
        return !SantaPlayerCollection.find({
          game_id: game_id,
          code: code,
        }).count();
      });
      newPlayerCode = unclaimedCodes[Math.floor(Math.random() * unclaimedCodes.length)];
      addPlayerModal.showModal();
    }
  };

  const openViewPlayerModal = (player) => {
    if (!game?.end_time) {
      playerToView = player;
      let nonPlayerCodes = playerCodes.filter((code) => {
        return code !== player.code;
      });
      //limit the number of options to 7
      let limitedOptions = _.sampleSize(nonPlayerCodes, 7);
      playerToViewCodeOptions = _.shuffle([...limitedOptions, playerToView.code]);
      viewPlayerModal.showModal();
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
    Meteor.call("santa.add_player", game_id, newPlayerName, newPlayerCode, (err, res) => {
      if (!err) {
        newPlayerName = "";
        loading = false;
        closeAddPlayerModal();
      }
    });
  };

  let removePlayer = () => {
    loading = true;
    Meteor.call("santa.remove_player", game_id, playerToView._id, (err, res) => {
      if (!err) {
        closeViewPlayerModal();
      }
      loading = false;
    });
  };

  let startGame = () => {
    loading = true;
    Meteor.call("santa.start_game", game_id, selectedGiftsPerPerson, (err, res) => {
      if (!err) {
        loading = false;
        selectedGiftsPerPerson = 1;
        startGameModal.close();
      } else {
        console.log("start_game error:", err);
      }
    });
  };

  let players = [];
  let alivePlayers = [];
  let deadPlayers = [];
  let newPlayerName;
  let newPlayerCode;
  let game_options = [];
  let game;
  let ballsAlive = _.range(1, 16);

  $m: {
    Meteor.subscribe("santa.players", game_id);
    Meteor.subscribe("santa.games");
    players = SantaPlayerCollection.find({ game_id: game_id }).fetch();
    alivePlayers = players.filter((player) => !player?.balls?.every((ball) => ball?.status === "sunk"));
    deadPlayers = players
      .filter((player) => player?.balls?.every((ball) => ball?.status === "sunk"))
      .sort((a, b) => b.finished_at - a.finished_at);
    game = SantaGameCollection.findOne({ _id: game_id });

    if (localStorage.getItem("secret_santa_admin_games")) {
      let adminGames = JSON.parse(localStorage.getItem("secret_santa_admin_games"));
      isAdmin = adminGames.includes(game_id);
    }

    ballsAlive = _.range(1, 16).filter((ball) => {
      let sunkBalls = game?.sunk_balls || [];
      return !sunkBalls.includes(ball);
    });

    if (game) {
      let games = localStorage.getItem("secret_santa_past_games");
      if (games) {
        games = JSON.parse(games);
        games.push(game);
        games = _.uniqBy(games, "_id");
        localStorage.setItem("secret_santa_past_games", JSON.stringify(games));
      } else {
        localStorage.setItem("secret_santa_past_games", JSON.stringify([game]));
      }
    }

    console.log({ player_parents });
  }
</script>

<div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-20 pb-4">
  <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
    <div class="flex flex-col items-center">
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
    <div class:invisible={!show} class:fade-in={show} class="flex items-center justify-center gap-5">
      <!-- Add Player Header -->
      {#if !game?.start_time && players?.length < 15}
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">Players</h1>
        <button
          class="btn bg-[#50B9AB] btn-circle rounded-lg font-poppins shadow-lg border-black flex items-center justify-center p-2"
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
      {/if}
      <!-- Add Player Header -->
    </div>

    <!-- Players Before Game Start -->
    {#if !game?.start_time}
      <div class:invisible={!show} class:fade-in={show} class="flex items-center justify-center gap-5">
        <div class="mt-6 grid gap-1 grid-cols-3 mb-10 px-1">
          {#each players as player, idx}
            <div
              class="w-full bg-base-100 px-1 shadow-sm container rounded-lg text-center flex flex-col gap-4 items-center border border-black min-h-32 cursor-pointer"
              on:click={() => openViewPlayerModal(player)}
              on:keydown={() => {}}
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
              {#if player?.balls?.length}
                <div
                  use:inview={options}
                  on:inview_change={handleChange}
                  class="flex flex-col items-center justify-center"
                >
                  <div class:invisible={!show} class:fade-in={show} class={`flex gap-1 mb-4 px-1`}>
                    {#each player?.balls || [] as ball, idx}
                      <button
                        class="bg-base-200 px-1 shadow-sm container rounded-full"
                        class:bg-green-500={game?.game_mode === "sink_all" && ball?.status === "alive"}
                        class:bg-red-500={game?.game_mode === "stay_alive" && ball?.status === "sunk"}
                      >
                        <div class="text-center h-5 w-3 my-auto flex items-center">
                          <h2 class="font-poppins hidden">{idx}</h2>
                        </div>
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
    <!-- Players Before Game Start -->
    <!-- Game When Started -->
    {#if game?.start_time}
      <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center gap-2">
        <!-- Remaining Players -->
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">
          Secret Santas
        </h1>

        <div
          class:invisible={!show}
          class:fade-in={show}
          class="mt-6 grid gap-1 grid-cols-3 mb-10 px-1 w-full"
          class:grid-cols-2={alivePlayers?.length === 2}
          class:grid-cols-1={alivePlayers?.length === 1}
          class:grid-cols-3={alivePlayers?.length > 2}
        >
          {#each alivePlayers as player, idx}
            <button
              class="w-full bg-base-100 px-1 shadow-sm container rounded-lg text-center flex flex-col gap-4 items-center border border-black min-h-32"
              on:click={() => openViewPlayerModal(player)}
            >
              <div
                class="text-center my-auto flex flex-col items-center justify-center text-auto gap-2"
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
                {#if alivePlayers?.length === 1}
                  <p>1st</p>
                {/if}
              </div>
              {#if player?.balls?.length}
                <div
                  use:inview={options}
                  on:inview_change={handleChange}
                  class="flex flex-col items-center justify-center"
                >
                  <div class:invisible={!show} class:fade-in={show} class={`flex flex-wrap gap-1 mb-4 px-1`}>
                    {#each player?.balls || [] as ball, idx}
                      {#if alivePlayers?.length === 1 || ball.status === "sunk"}
                        <div
                          class:w-12={player?.balls?.length < 3}
                          class:h-12={player?.balls?.length < 3}
                          class:h-8={player?.balls?.length >= 3}
                          class:w-8={player?.balls?.length >= 3}
                        >
                          <img
                            src={`/assets/pool_balls/${ball?.ball}.svg`}
                            alt={`Ball ${ball?.ball}`}
                            class="h-full w-full"
                          />
                        </div>
                      {:else}
                        <button
                          class="bg-base-200 px-1 shadow-sm container rounded-full"
                          class:w-12={player?.balls?.length < 3}
                          class:h-12={player?.balls?.length < 3}
                          class:h-8={player?.balls?.length >= 3}
                          class:w-8={player?.balls?.length >= 3}
                          class:bg-green-500={game?.game_mode === "sink_all" && ball?.status === "alive"}
                          class:bg-red-500={game?.game_mode === "stay_alive" && ball?.status === "sunk"}
                        >
                          <span class="text-gray-600 font-bold"> ? </span>
                        </button>
                      {/if}
                    {/each}
                  </div>
                </div>
              {/if}
            </button>
          {/each}
        </div>
        <!-- Remaining Players -->
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
            class="btn bg-[#50B9AB] btn-lg rounded-lg font-poppins shadow-lg border-black flex items-center justify-center"
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
{/if}
<!-- Start Game Button -->

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

      {#if !showPlayerCode}
        <button
          class="btn rounded-lg font-poppins shadow-lg border-black w-full bg-black text-white"
          on:click={() => {
            showPlayerCode = true;
            unlockAddPlayer = true;
          }}
        >
          Show Code
        </button>
        <div class="w-full flex items-center justify-center">
          <button
            class="rounded-full bg-black text-white btn btn-lg btn-circle text-3xl"
            on:click={() => {
              showPlayerCode = true;
              unlockAddPlayer = true;
            }}>?</button
          >
        </div>
      {:else}
        <button
          class="btn rounded-lg font-poppins shadow-lg border-black w-full bg-white text-black"
          on:click={() => {
            showPlayerCode = false;
          }}
        >
          Hide Code
        </button>
        <div class="w-full flex items-center justify-center text-7xl">
          {newPlayerCode}
        </div>
      {/if}

      <div class="pt-2">
        <button
          class="btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
          on:click={savePlayer}
          class:btn-disabled={!unlockAddPlayer}
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
      <h3 class="font-bold text-lg">View {playerToView?.name || " Player"}</h3>

      {#if !game?.start_time}
        {#if !showPlayerCode}
          <button
            class="btn rounded-lg font-poppins shadow-lg border-black w-full bg-black text-white"
            on:click={() => {
              showPlayerCode = true;
              unlockAddPlayer = true;
            }}
          >
            Show Code
          </button>
          <div class="w-full flex items-center justify-center">
            <button
              class="rounded-full bg-black text-white btn btn-lg btn-circle text-3xl"
              on:click={() => {
                showPlayerCode = true;
                unlockAddPlayer = true;
              }}>?</button
            >
          </div>
        {:else}
          <button
            class="btn rounded-lg font-poppins shadow-lg border-black w-full bg-white text-black"
            on:click={() => {
              showPlayerCode = false;
            }}
          >
            Hide Code
          </button>
          <div class="w-full flex items-center justify-center text-7xl">
            {playerToView?.code}
          </div>
        {/if}

        <button
          class="btn rounded-lg font-poppins shadow-lg border-red-600 w-full bg-white text-red-600 hover:bg-red-200 hover:text-red-800 hover:border-red-800"
          on:click={removePlayer}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-6 w-6 text-red-600 stroke-red-600 mr-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>

          Remove Player
        </button>
      {:else if !playerToViewShowGiftees}
        <p class="">Enter the correct code to view this player</p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          {#each playerToViewCodeOptions || [] as code}
            <button
              class="btn btn-lg rounded-lg font-poppins shadow-lg border-black min-w-12 text-5xl"
              on:click={() => {
                if (code === playerToView.code) {
                  playerToViewShowGiftees = true;
                } else {
                  alert("Incorrect code");
                  closeViewPlayerModal();
                }
              }}
            >
              {code}
            </button>
          {/each}
        </div>
      {:else}
        <div class="flex flex-wrap items-center justify-center gap-2">
          <div class="flex flex-col p-4 items-center justify-center gap-2">
              {#each playerToView.giftees || [] as giftee, idx}
              <span>{idx + 1}: {giftee}</span>
              {/each}
            </div>
        </div>
      {/if}
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

      <h3 class="font-bold text-lg">Choose number of gift(s) given per person:</h3>

      <div class="flex items-center gap-2 justify-center w-full flex-wrap">
        {#each players as player, idx}
          {#if idx !== players.length - 1}
            <button
              class="btn md:btn-lg rounded-lg font-poppins shadow-lg border-black min-w-36 {selectedGiftsPerPerson ===
              idx + 1
                ? 'bg-[#E6A64C] hover:bg-[#d6b381]'
                : 'bg-white'}"
              on:click={() => {
                selectedGiftsPerPerson = idx + 1;
              }}
            >
              {idx + 1}
            </button>
          {/if}
        {/each}
      </div>
      <div class="mt-6">
        <button
          class="btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
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
