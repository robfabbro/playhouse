<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { loadFull } from "tsparticles";
  import particlesHiveMind from "/imports/ui/particles/particlesHiveMind.json";
  import Particles, { particlesInit } from "/imports/ui/particles/particles.ts";
  import { quintOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { fade, fly, draw } from "svelte/transition";
  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  import { goto } from "@roxi/routify";
  import { HiveMindGameCollection, HiveMindPlayerCollection } from "/imports/api/hive_mind/collections";
  import _ from "lodash";

  export let scoped;

  $: ({ player_code, your_player, your_game_player } = scoped);

  $m: {
    console.log("%c PROPS ON /hive_mind_index: ", "color: orange; font-weight: bold;");
    console.log({ ...scoped });
  }

  // let ParticlesComponent: any;
  // onMount(async () => {
  // 	const module = await import("/imports/ui/components/svelte/Particles.svelte");
  // 	ParticlesComponent = module.default;
  // });
  let onParticlesLoaded = (event: any) => {
    const particlesContainer = event.detail.particles;
  };
  // let particlesInit = async (main: any) => {
  // 	await loadFull(main);
  // };

  void particlesInit(async (engine) => {
    // call this once per app
    // you can use main to customize the tsParticles instance adding presets or custom shapes
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    //await loadFull(engine);
    await loadFull(engine);
  });

  let show = false;

  const options: Options = {
    rootMargin: "0px",
    unobserveOnEnter: true,
    threshold: 0,
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => (show = detail.inView);

  let categoryModal;
  let findModal;
  let editPlayerModal;
  let loading = false;
  let editPlayerError = false;
  let editPlayerName = "";
  let newGameName = "";
  let searchName = "";
  let gameNotFound = false;

  let saveGame = (e) => {
    loading = true;
    Meteor.call("hive_mind.new_game", newGameName, player_code, (err, res) => {
      if (!err) {
        $goto(`/hive_mind/${res}`);
      }
      loading = false;
    });
  };

  let findGame = (e) => {
    if (searchName) {
      console.log("SEARCH NAME", searchName.toLowerCase());
      loading = true;
      gameNotFound = false;
      Meteor.call("hive_mind.find_game", searchName.toLowerCase(), player_code, (err, res) => {
        if (!err && res) {
          $goto(`/hive_mind/${res}`);
        } else {
          gameNotFound = true;
        }
        loading = false;
      });
    }
  };

  let editPlayer = (e) => {
    console.log("PLAYER NAME", editPlayerName);
    console.log("PLAYER CODE", player_code.toLowerCase());

    if (!editPlayerName) {
      editPlayerError = "A name is required";
      return;
    }

    if (editPlayerName && player_code) {
      loading = true;
      editPlayerError = false;
      Meteor.call("hive_mind.edit_player", editPlayerName, player_code, (err, res) => {
        loading = false;
        if (!err) {
          editPlayerModal.close();
        } else {
          editPlayerError = "Please try again...";
        }
      });
    }
  };

  let past_games;

  $m: {
    past_games = HiveMindGameCollection.find(
      {},
      {
        sort: { createdAt: -1 },
        limit: 5,
      }
    ).fetch();
  }
</script>

<Particles
  id="tsparticles"
  class="put your classes here"
  style=""
  options={particlesHiveMind}
  on:particlesLoaded={onParticlesLoaded}
/>

<div
  use:inview={options}
  on:inview_change={handleChange}
  id="home"
  class="h-1/2 hero flex justify-center items-center p-0 m-0"
>
  {#if show}
    <div class="hero-content p-0 flex-col lg:flex-row-reverse">
      <div
        class="text-center lg:text-start md:max-w-[50%] xl:max-w-[80%] z-1 flex items-center justify-center z-10"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="flex flex-col">
            <div class="flex justify-between items-center">
              <button class="text-sm bg-white btn btn-sm text-left border-none shadow-none" on:click={() => $goto("/")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>

                Back to home
              </button>
              {#if your_player}
                <button
                  class="text-sm btn btn-sm text-left border-[#3DADFF] bg-[#9fd7ff] hover:bg-[#3DADFF] shadow-none"
                  on:click={() => {
                    editPlayerName = your_player.name;
                    editPlayerModal.showModal();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path
                      fill-rule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  {your_player.name}
                </button>
              {/if}
            </div>
            {#if your_player}
              <h1 class="font-poppins text-3xl font-black uppercase md:text-5xl text-center md:whitespace-nowrap">
                Welcome to
              </h1>
            {/if}
            <h1
              class="font-poppins text-7xl font-black uppercase md:text-7xl text-center hive-mind-text md:whitespace-nowrap"
            >
              Hive Mind
            </h1>
          </div>

          <div class="flex gap-2 max-lg:justify-center">
            <button
              type="button"
              on:click={() => categoryModal.showModal()}
              class="btn bg-[#3DADFF] md:btn-lg rounded-full font-poppins shadow-lg border-black"
            >
              Create Game
            </button>
            <button
              type="button"
              on:click={() => findModal.showModal()}
              class="btn btn-accent md:btn-lg rounded-full font-poppins shadow-lg border-black"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="hero-content flex-col lg:flex-row-reverse min-h-[500px]"></div>
  {/if}
</div>

<dialog class="modal" bind:this={categoryModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg">Start a Game</h3>
    <p class="py-4">Press ESC key or click outside to close</p>
    <input
      bind:value={newGameName}
      type="text"
      placeholder="Enter the name of your game"
      class="input input-bordered input-primary w-full"
    />
    <div class="pt-4">
      <button
        class="btn bg-[#3DADFF] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        on:click={saveGame}
      >
        Go
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
</dialog>

<dialog class="modal" bind:this={findModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg">Find a Game</h3>
    <p class="py-4">Press ESC key or click outside to close</p>
    <input
      bind:value={searchName}
      type="text"
      placeholder="Enter the game code or name"
      class="input input-bordered input-primary w-full"
    />
    <div class="pt-4">
      <button
        class="btn bg-[#3DADFF] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        on:click={findGame}
      >
        Join
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
      {#if gameNotFound}
        <p class="text-red-500 text-sm mt-2">Game not found...</p>
      {/if}
    </div>
    {#if past_games?.length > 0}
      <div class="divider">past games</div>
      <div class="pt-2 flex flex-wrap gap-2">
        {#each past_games as game}
          <a href={`/hive_mind/${game._id}`}>
            <button class="btn btn-md border-black" type="button">
              {game.name}
            </button>
          </a>
        {/each}
      </div>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog class="modal" bind:this={editPlayerModal}>
  <div class="modal-box border border-black relative">
    <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={() => editPlayerModal.close()}>
      ✕
    </button>
    <h3 class="font-bold text-lg">Edit Your Player</h3>
    <div class="flex flex-col items-center w-full py-4">
      <p class="text-left w-full pl-2">Edit your Player Name</p>
      <input
        bind:value={editPlayerName}
        type="text"
        placeholder="Enter your player's name"
        class="input input-bordered input-primary w-full"
      />
    </div>
    <!-- <div class="flex flex-col gap-2 items-center">
      <p class="py-4">Choose your Avatar</p>
    </div> -->
    <div class="pt-4">
      <button
        class="btn bg-[#3DADFF] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        on:click={editPlayer}
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
      {#if !!editPlayerError}
        <p class="text-red-500 text-sm mt-2">{editPlayerError}</p>
      {/if}
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
