<script lang="ts">
  import { params, redirect, goto } from "@roxi/routify";
  import {
    TriviaGameCollection,
    TriviaTeamCollection,
    TriviaQuestionCategoryCollection,
    TriviaRoundCollection,
    TriviaQuestionCollection,
    TriviaGameCategoryCollection,
  } from "/imports/api/trivia/collections";
  console.log("%c Hi Game", "color: red; font-size: 32px; font-weight: bold;");

  let isAdmin = false;
  let game_id = $params.game_id;
  let game;
  let teams = [];
  let submitLoading = false;
  let allegianceAlreadyExists = false;
  let allegiantTeam = null;
  let teamToChoose = null;
  let chooseTeamModal;

  // METHODS
  const toggleGameReady = () => {
    submitLoading = true;
    Meteor.call("trivia.toggleGameReady", game_id, (error) => {
      if (error) {
        console.error("Error toggling game ready state:", error);
      } else {
        console.log("Game ready state toggled successfully");
      }
      submitLoading = false;
    });
  };

  let openChooseTeamModal = (team) => {
    teamToChoose = team;
    chooseTeamModal.showModal();
  };
  let chooseTeam = (team_id) => {
    $goto(`/trivia/${game_id}/play/${team_id}`);
    teamToChoose = null;
    chooseTeamModal.close();
  };
  // METHODS

  $m: {
    game = TriviaGameCollection.findOne({ _id: game_id });
    teams = TriviaTeamCollection.find({ game_id }).fetch();

    // Allegiance check
    let triviaTeams = localStorage.getItem("trivia_teams");
    if (triviaTeams) {
      let allegianceTeams = JSON.parse(triviaTeams);
      allegianceAlreadyExists = allegianceTeams.some((allegiance) => teams.map((t) => t._id).includes(allegiance));
      if (allegianceAlreadyExists) {
        allegiantTeam = teams.find((team) => allegianceTeams.includes(team._id));
      }
    }
    // Allegiance check
  }

  $: adminMenuOptions = [
    {
      label: "Question Setup",
      href: `/trivia/${game_id}/setup`,
      admin: true,
    },
    {
      label: "Manage Players",
      href: `/trivia/${game_id}/player-management`,
      admin: true,
    },
    {
      label: "Play Trivia",
      href: `/trivia/${game_id}/master`,
      admin: true,
    },
  ];

  $: {
    let adminGames = localStorage.getItem("trivia_admin_games");
    if (adminGames) {
      let games = JSON.parse(adminGames);
      isAdmin = games.includes(game_id);
    }
  }
</script>

{#if isAdmin}
  <div class="flex flex-col items-center gap-10 w-full">
    <div class="flex flex-col gap-4 items-center">
      {#if game?.ready}
        <h1 class="text-2xl font-bold text-green-600">GAME IS READY</h1>
      {:else}
        <h1 class="text-2xl font-bold text-red-600">GAME IS NOT READY</h1>
      {/if}
      <input
        disabled={submitLoading}
        type="checkbox"
        checked={game?.ready}
        on:change={toggleGameReady}
        class={`toggle ${game?.ready ? "border-green-600 bg-green-500 text-green-600 hover:text-green-400" : "border-red-600 bg-red-500 text-red-600 hover:text-red-400"} toggle-lg`}
      />
    </div>

    {#each adminMenuOptions as option}
      <button
        disabled={submitLoading || (option.requires_game_start && !game?.started)}
        class="btn btn-primary btn-lg min-w-[200px]"
        on:click={() => {
          $goto(option.href);
        }}
      >
        {option.label}
      </button>
    {/each}
  </div>
{/if}

{#if !isAdmin}
  {#if !game?.started}
    <div class="flex flex-col items-center py-12 gap-4">
      <svg
        stroke="currentColor"
        fill="currentColor"
        stroke-width="2"
        viewBox="0 0 512 512"
        class="w-24 h-24 text-red-600 stroke-red-600"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
        ></path></svg
      >
      <h1 class="font-poppins text-3xl font-black uppercase text-center">This game has not started yet</h1>
    </div>
  {/if}

  {#if teams.length && !allegianceAlreadyExists}
    <div class="flex flex-col items-center py-12 gap-4 cursor-pointer">
      <h1 class="font-poppins text-2xl font-black uppercase text-center">CHOOSE YOUR TEAM</h1>
      {#each teams as team}
        <div
          class="flex items-center w-full min-h-12 gap-2 p-4 rounded-lg shadow-lg border relative"
          on:click={() => openChooseTeamModal(team)}
          on:keydown={() => {}}
        >
          <div class="flex flex-col items-center w-full gap-2">
            <!-- TEAM NAME + EDIT -->
            <div class="flex items-center w-full justify-between">
              <div class="flex items-center w-full gap-2">
                <h2 class="font-poppins text-3xl font-bold">{team.name}</h2>
              </div>
            </div>
            <!-- TEAM NAME + EDIT -->

            <!-- TEAM PLAYERS -->
            <div class="font-light flex items-center gap-2 w-full">
              {#each team.players as player, idx (`team-player-${idx}`)}
                <span class="badge badge-primary badge-lg">{player.name}</span>
              {/each}
              {#if team.players.length === 0}
                <span class="text-gray-500">No players added</span>
              {/if}
            </div>
            <!-- TEAM PLAYERS -->
          </div>
          <!-- DOUBLE CHEVRON -->
          <button
            class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
            on:click={() => {}}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-8 w-8 flex-shrink-0"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <!-- DOUBLE CHEVRON -->
        </div>
      {/each}
    </div>
  {:else if teams.length}
    <div class="flex flex-col items-center py-12 gap-4 cursor-pointer">
      <h1 class="font-poppins text-2xl font-black uppercase text-center">YOUR TEAM</h1>

      <div
        class="flex items-center w-full min-h-12 gap-2 p-4 rounded-lg shadow-lg shadow-blue-100 relative bg-blue-100 border-blue-600 border-2"
        on:click={() => $goto(`/trivia/${game_id}/play/${allegiantTeam._id}`)}
        on:keydown={() => {}}
      >
        <div class="flex flex-col items-center w-full gap-2">
          <!-- allegiantTeam NAME + EDIT -->
          <div class="flex items-center w-full justify-between">
            <div class="flex items-center w-full gap-2">
              <h2 class="font-poppins text-3xl font-bold">{allegiantTeam.name}</h2>
            </div>
          </div>
          <!-- allegiantTeam NAME + EDIT -->

          <!-- allegiantTeam PLAYERS -->
          <div class="font-light flex items-center gap-2 w-full">
            {#each allegiantTeam?.players || [] as player, idx (`allegiantTeam-player-${idx}`)}
              <span class="badge badge-primary badge-lg">{player.name}</span>
            {/each}
          </div>
          <!-- allegiantTeam PLAYERS -->
        </div>
        <!-- DOUBLE CHEVRON -->
        <button
          class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
          on:click={() => {}}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-8 w-8 flex-shrink-0"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <!-- DOUBLE CHEVRON -->
      </div>

      <h1 class="font-poppins text-2xl font-black uppercase text-center mt-4">OTHER TEAMS</h1>
      {#each teams as team}
        <div
          class="flex items-center w-full min-h-12 gap-2 p-4 rounded-lg shadow-lg border relative btn-disabled pointer-events-none bg-gray-100 text-gray-800"
          class:hidden={team._id === allegiantTeam?._id}
          aria-disabled="true"
          disabled
          on:click={() => $goto(`/trivia/${game_id}/play/${team._id}`)}
          on:keydown={() => {}}
        >
          <div class="flex flex-col items-center w-full gap-2">
            <!-- TEAM NAME + EDIT -->
            <div class="flex items-center w-full justify-between">
              <div class="flex items-center w-full gap-2">
                <h2 class="font-poppins text-3xl font-bold">{team.name}</h2>
              </div>
            </div>
            <!-- TEAM NAME + EDIT -->

            <!-- TEAM PLAYERS -->
            <div class="font-light flex items-center gap-2 w-full">
              {#each team.players as player, idx (`team-player-${idx}`)}
                <span class="badge badge-primary badge-lg">{player.name}</span>
              {/each}
              {#if team.players.length === 0}
                <span class="text-gray-500">No players added</span>
              {/if}
            </div>
            <!-- TEAM PLAYERS -->
          </div>
        </div>
      {/each}
    </div>
  {/if}
{/if}

<!-- CHOOSE TEAM MODAL -->
<dialog class="modal" bind:this={chooseTeamModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Select Team</h3>
    <div class="flex flex-col gap-2 items-center">
      <span class="flex-shrink-0">Are you sure you want your allegiances to lie with this team?</span>
      <div class="flex flex-col gap-2 items-center py-4">
        <p class="font-bold text-3xl">{teamToChoose?.name}</p>
        <div class="flex items-center gap-2">
          {#each teamToChoose?.players || [] as player, idx (`team-player-${idx}`)}
            <span class="badge badge-primary badge-lg">{player.name}</span>
          {/each}
        </div>
      </div>
      <div class="pt-4">
        <button
          class="btn bg-blue-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
          disabled={submitLoading}
          on:click={() => chooseTeam(teamToChoose._id)}
        >
          Confirm Selection
          {#if submitLoading}
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
  </div>
</dialog>
<!-- CHOOSE TEAM MODAL -->
