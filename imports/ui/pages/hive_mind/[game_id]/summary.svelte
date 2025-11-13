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
    HiveMindRoundWordCollection,
    HiveMindRoundAnswerCollection,
  } from "/imports/api/hive_mind/collections";
  import PlayerAvatar from "/imports/ui/components/hive_mind/PlayerAvatar.svelte";
  import Countdown from "/imports/ui/components/hive_mind/Countdown.svelte";
  import WordResult from "/imports/ui/components/hive_mind/WordResult.svelte";
  import PlayerResult from "/imports/ui/components/hive_mind/PlayerResult.svelte";
  import PlayerScoreModal from "/imports/ui/components/hive_mind/PlayerScoreModal.svelte";
  import { textfit } from "svelte-textfit";
  import { onMount } from "svelte";
  import _ from "lodash";
  import { fade, draw } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";
  import confettiConfig from "/imports/ui/particles/confetti.json";
  import { loadFull } from "tsparticles";

  // PARTICLES STUFF
  let ParticlesComponent: any;
  onMount(async () => {
    const module = await import("/imports/ui/particles/Particles.svelte");
    ParticlesComponent = module.default;
  });
  let onParticlesLoaded = (event: any) => {
    const particlesContainer = event.detail.particles;
  };
  let particlesInit = async (main: any) => {
    await loadFull(main);
  };
  // PARTICLES STUFF

  export let scoped;
  $: ({ player_code, your_player, your_game_player, game_id, round_id } = scoped);
  $m: {
    console.log("%c PROPS ON /hive_mind_index: ", "color: yellow; font-weight: bold;");
    console.log({ ...scoped });
  }

  let showResult = false;
  let timeout = null;

  // let showPlayerTest = true;

  // $: {
  //   setTimeout(() => {
  //     showPlayerTest = !showPlayerTest;
  //   }, 5000);
  // }

  // $m: {
  //   console.log("SHOW RESULT: ", showResult);
  //   timeout = setTimeout(() => {
  //     showResult = !showResult;
  //   }, 3000);
  // }

  let show = false;
  const options: Options = {
    rootMargin: "50px",
    unobserveOnEnter: true,
    threshold: 0.1,
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => (show = detail.inView);

  let game;
  let all_players = [];
  let auspicious_winner;
  let useless_losers = [];
  let all_answers = [];
  let loading = false;
  let answer = [];
  let selectedPlayerId = null;

  $m: {
    game = HiveMindGameCollection.findOne({ _id: game_id });
    all_answers = HiveMindRoundAnswerCollection.find({ game_id: game_id }).fetch();
    all_players = HiveMindGamePlayerCollection.find(
      { game_id: game_id },
      { sort: { total_points: -1, player_name: -1 } }
    )
      .fetch()
      .map((player) => {
        let answer = all_answers.find((a) => a?.player_id === player?._id);

        let game_answers = all_answers.filter((a) => a?.player_id === player?._id);
        let majorities = game_answers.filter((a) => a.is_majority).length;
        let minorities = game_answers.filter((a) => a.is_minority).length;
        let total_points = player.total_points || 0;

        return { ...player, answer, game_answers, majorities, minorities, total_points };
      });

    let unrevealed_players = all_players.filter((p) => !p.final_position_revealed);

    auspicious_winner = all_players[0];
    useless_losers = all_players.slice(1);

    console.log({ all_players });
  }
</script>

<!-- GAME TITLE -->
<div
  use:inview={options}
  on:inview_change={handleChange}
  class="flex flex-col items-center justify-center p-20 pt-8 pb-4"
>
  <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
    <div class="flex flex-col items-center">
      <!-- <button
        class="btn btn-sm btn-error my-2"
        on:click={() => {
          Meteor.call("hive_mind.reset_game", game?._id);
          $goto(`/hive_mind/${game_id}`);
        }}>RESET</button
      > -->
      <p class="text-base font-medium uppercase text-center">Hive Mind</p>
      <h1 class="font-poppins text-lg font-black uppercase text-center">
        {game?.name}
      </h1>
      <div class="btn btn-ghost btn-sm">
        <span class="text-sm font-light"> code: </span>
        <span class="text-sm font-bold">
          {game?.code}
        </span>
      </div>
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
  </div>
</div>
<!-- GAME TITLE -->

<!-- ROUND TITLE -->
<div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
  <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
    <div class="flex flex-col items-center gap-2">
      <h1 class="text-2xl font-black font-poppins uppercase text-center">
        {!game?.final_leaderboard_revealed ? "REVEALING " : ""}FINAL LEADERBOARD
      </h1>
    </div>
    <!-- <button
      class="btn btn-sm btn-error my-2"
      disabled={!game?.final_leaderboard_revealed}
      on:click={() => {
        Meteor.call("hive_mind.restart_final_leaderboard_reveal", game?._id);
      }}>RESTART REVEAL</button
    > -->
  </div>
</div>
<!-- ROUND TITLE -->

<!-- GAME LEADERBOARD -->
<div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center px-8">
  <div class:invisible={!show} class:fade-in={show} class="w-full flex flex-col items-center justify-center">
    <!-- WINNER -->
    <div class="flex flex-col items-center">
      <!-- SVG -->
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 512 512"
        class="h-24 w-24 stroke-yellow-600 fill-yellow-500 {auspicious_winner?.revealling_final_position ||
        auspicious_winner?.final_position_revealed
          ? 'animate-shake'
          : ''}"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M75.371 28.377L27.027 52.549C42.623 99.323 61.451 155.606 80.44 206.875c19.925 53.796 40.201 101.86 55.05 124.133l1.243 1.865L152.145 487h91.267C226.978 481.65 215 466.15 215 448c0-4.871.865-9.551 2.445-13.896-1.628-3.134-3.22-6.442-4.812-9.913-7.642-16.655-14.483-37.267-20.32-58.84-10.19-37.656-17.3-77.733-18.946-104.525-9-14.793-17.445-31.369-25.547-49.025-26.904-58.636-49.91-129.09-72.449-183.424zm361.258 0c-22.54 54.335-45.545 124.788-72.45 183.424-8.1 17.656-16.546 34.232-25.546 49.025-1.645 26.792-8.756 66.87-18.945 104.526-5.838 21.572-12.679 42.184-20.32 58.84-1.593 3.47-3.185 6.778-4.813 9.912A40.593 40.593 0 0 1 297 448c0 18.15-11.978 33.65-28.412 39h91.267l15.413-154.127 1.244-1.865c14.848-22.272 35.124-70.337 55.049-124.133 18.988-51.269 37.816-107.552 53.412-154.326l-48.344-24.172zM256 105c-18.687 0-36.025 10.529-49.244 29.035C193.537 152.541 185 178.81 185 208c0 29.19 8.537 55.459 21.756 73.965S237.313 311 256 311s36.025-10.529 49.244-29.035C318.463 263.459 327 237.19 327 208c0-29.19-8.537-55.459-21.756-73.965S274.687 105 256 105zm-59.787 192.8c3.19 19.66 7.752 41.702 13.475 62.848 5.662 20.928 12.321 40.816 19.304 56.036.062.134.126.26.188.394a41.119 41.119 0 0 1 13.547-7.844c-6.666-14.749-12.609-33.366-17.422-51.416-4.294-16.1-7.53-30.494-9.094-41.494-7.36-4.977-14.082-11.254-19.998-18.523zm119.574 0c-5.916 7.27-12.639 13.547-19.998 18.524-1.565 11-4.8 25.393-9.094 41.494-4.813 18.05-10.756 36.667-17.422 51.416a41.12 41.12 0 0 1 13.547 7.844c.062-.134.126-.26.188-.394 6.983-15.22 13.642-35.108 19.305-56.036 5.722-21.146 10.284-43.189 13.474-62.847zm-79.375 28.259c1.624 8.15 3.737 17.575 6.283 27.123 3.799 14.245 8.528 29.19 13.305 41.347 4.777-12.157 9.506-27.102 13.305-41.347 2.546-9.548 4.66-18.972 6.283-27.123-6.28 1.91-12.833 2.941-19.588 2.941-6.755 0-13.307-1.031-19.588-2.941zM256 425c-12.81 0-23 10.19-23 23s10.19 23 23 23 23-10.19 23-23-10.19-23-23-23z"
        ></path></svg
      >
      <!-- SVG -->

      <!-- PLAYER NAME -->
      <span
        class="text-center uppercase font-black font-poppins text-5xl {auspicious_winner?.final_position_revealed
          ? 'animate-shake'
          : 'blur-md'}"
        in:fade={{ duration: 1000, easing: cubicOut }}
      >
        {auspicious_winner?.player_name}
      </span>
      <!-- PLAYER NAME -->
      <!-- POINTS -->
      <span
        class="text-center uppercase font-black font-poppins text-4xl {auspicious_winner?.final_position_revealed
          ? 'animate-shake'
          : 'blur-md'}"
        in:fade={{ duration: 1000, easing: cubicOut }}
      >
        {auspicious_winner?.total_points}
      </span>
      <!-- POINTS -->
    </div>
    <!-- WINNER -->
    <!-- INDIVIDUAL PLAYERS -->
    <div class="flex flex-col items-stretch py-4 gap-4 w-full">
      {#each useless_losers as player, index (player?._id)}
        <PlayerResult
          {player}
          {all_players}
          {index}
          selectPlayer={() => {
            console.log("SELECTING PLAYER: ", player?._id);
            selectedPlayerId = player._id;
          }}
          hideDrawableNumber={true}
          hidePlayer={!player.final_position_revealed}
          showLoadingAnimation={player.revealling_final_position}
        />
      {/each}
    </div>
    <!-- INDIVIDUAL PLAYERS -->
  </div>
</div>
<!-- GAME LEADERBOARD -->

<!-- NEXT ROUND BUTTON -->
{#if !!game?.final_leaderboard_revealed}
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-4" fade:in={{ duration: 3000, easing: cubicOut }}>
        <a
          class="btn btn-lg rounded-full border-2 border-black bg-yellow-500 font-bold text-xl text-black"
          href={`/hive_mind`}>Go Back Home</a
        >
      </div>
    </div>
  </div>
{/if}
<!-- NEXT ROUND BUTTON -->

<!-- PLAYER SCORE MODAL -->
<PlayerScoreModal
  playerToViewId={selectedPlayerId}
  {all_players}
  closeModal={() => {
    console.log("CLOSING MODAL");
    selectedPlayerId = null;
  }}
/>
<!-- PLAYER SCORE MODAL -->

{#if !!game?.final_leaderboard_revealed}
  <svelte:component
    this={ParticlesComponent}
    id="tsparticles"
    options={confettiConfig.options}
    on:particlesLoaded={onParticlesLoaded}
  />
{/if}
