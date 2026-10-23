<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { params, redirect, goto, route } from "@roxi/routify";
  import { TriviaGameCollection, TriviaTeamCollection } from "/imports/api/trivia/collections";
  let game_id = $params.game_id;
  let team_id = $params.team_id;
  let game;
  let team;
  let editTeamModal;
  let teamToEdit = null;
  let submitLoading = false;
  let isAdmin = false;
  let subscriptionLoading = true;
  let backUrl = "/";
  let allegianceHasBeenReset = false;

  let resetCount = 0;

  $m: {
    gameSubcription = Meteor.subscribe("trivia.game", game_id);
    roundSubscription = Meteor.subscribe("trivia.rounds", game_id);
    questionCategorySubscription = Meteor.subscribe("trivia.question_categories", game_id);
    questionSubscription = Meteor.subscribe("trivia.questions", game_id);
    gameCategorySubscription = Meteor.subscribe("trivia.game_categories", game_id);
    teamsSubscription = Meteor.subscribe("trivia.teams", game_id);

    subscriptionLoading =
      !gameSubcription.ready() || !roundSubscription.ready() || !questionCategorySubscription.ready();

    if (!subscriptionLoading) {
      game = TriviaGameCollection.findOne({ _id: game_id });

      if (team_id) {
        team = TriviaTeamCollection.findOne({ _id: team_id, game_id });
      }

      let adminGames = localStorage.getItem("trivia_admin_games");
      if (adminGames) {
        let games = JSON.parse(adminGames);
        isAdmin = games.includes(game_id);
      }
    }

    let route_id = $route?.id;
    console.log("Current route ID:", route_id);
    if (["_trivia__game_id_index"].includes(route_id)) {
      backUrl = `/trivia`;
    } else if (
      [
        "_trivia__game_id_setup_index",
        "_trivia__game_id_playerManagement_index",
        "_trivia__game_id_master_index",
        "_trivia__game_id_play__team_id",
      ].includes(route_id)
    ) {
      backUrl = `/trivia/${game_id}`;
    } else if (
      [
        "_trivia__game_id_master_controller",
        "_trivia__game_id_master_display",
        "_trivia__game_id_answerSheet_index",
      ].includes(route_id)
    ) {
      backUrl = `/trivia/${game_id}/master`;
    }
  }

  // METHODS
  let openEditTeamModal = (team) => {
    teamToEdit = team;
    editTeamModal.showModal();
  };

  let editTeam = () => {
    submitLoading = true;
    Meteor.call("trivia.editTeam", teamToEdit, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error adding team:", error);
      } else {
        console.log("Team edited successfully:", result);
        editTeamModal.close();
        setTimeout(() => {
          teamToEdit = null;
        }, 500);
      }
    });
  };

  let resetTeamAllegiance = () => {
    resetCount += 1;
    if (resetCount >= 10) {
      let triviaTeams = localStorage.getItem("trivia_teams");
      if (triviaTeams) {
        let teams = JSON.parse(triviaTeams);
        console.log({ teams, team_id });
        if (teams.includes(team_id)) {
          teams = teams.filter((t) => t !== team_id);
          console.log("Resetting allegiance for team:", teams);
          localStorage.setItem("trivia_teams", JSON.stringify(teams));
          console.log("Allegiance reset successfully", localStorage.getItem("trivia_teams"));
          allegianceHasBeenReset = true;
        }
      }
      setTimeout(() => {
        resetCount = 0;
        $goto(`/trivia/${game_id}`);
      }, 1500);
    }
  };
  // METHODS
</script>

{#if subscriptionLoading}
  <div class="flex flex-col items-center p-20 py-40 gap-4">
    <span class="loading w-12 loading-spinner"></span>
    <h1 class="font-poppins text-3xl font-black uppercase text-center">Loading...</h1>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center p-20 pb-4 gap-8">
    <div class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center">
        <h1 class="font-poppins text-5xl font-black uppercase text-center">
          {game?.name}
        </h1>
        <div class="btn btn-ghost">
          <span class="text-lg font-light"> game: </span>
          <span class="text-lg font-bold">
            {game?.code}
          </span>
        </div>
        {#if team_id && team}
          <div class="flex items-center w-full min-h-12 gap-2 p-4 rounded-lg shadow-lg border relative">
            <div class="flex flex-col items-center w-full gap-2">
              <!-- TEAM NAME + EDIT -->
              <div class="flex items-center w-full justify-between">
                <div class="flex items-center w-full gap-2">
                  <h2 class="font-poppins text-3xl font-bold">{team.name}</h2>
                  <!-- EDIT ROUND NAME BUTTON -->
                  <button
                    class="btn p-1 m-0 min-h-0 w-auto h-full font-bold bg-transparent border-none"
                    on:click={() => openEditTeamModal(team)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="h-8 w-8 flex-shrink-0"
                    >
                      <path
                        d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
                      />
                      <path
                        d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"
                      />
                    </svg>
                  </button>
                  <!-- EDIT ROUND NAME BUTTON -->
                </div>
                <!-- DELETE PLAYER -->
                <button
                  class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
                  class:animate-winner-font={resetCount >= 10}
                  on:click={resetTeamAllegiance}
                >
                  <span class="text-lg font-light"> code: </span>
                  <span class="text-lg font-bold">
                    {team?.team_code}
                  </span>
                </button>
                <!-- DELETE PLAYER -->
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
              <!-- SCORE -->
              {#if game?.started}
                <div class="font-light flex justify-center items-center gap-2 w-full mt-2">
                  <span class="text-3xl text-gray-500">Score:</span>
                  <span class="text-3xl font-bold">{team.score || 0}</span>
                </div>
              {/if}
              <!-- SCORE -->
            </div>
          </div>
        {/if}
      </div>

      <a class="btn btn-link btn-sm absolute top-8 left-8" href={backUrl}>
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
    {#if !isAdmin && !game.ready}
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
        <h1 class="font-poppins text-3xl font-black uppercase text-center">This game is not ready yet</h1>
        <button class="text-sm bg-white btn btn-sm text-left border-none shadow-none" on:click={() => $goto("/trivia")}>
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
      </div>
    {:else}
      <slot />
    {/if}
  </div>
{/if}

<!-- EDIT PLAYER MODAL -->
<dialog class="modal" bind:this={editTeamModal}>
  {#if teamToEdit}
    <div class="modal-box border border-black">
      <h3 class="font-bold text-lg mb-4">Edit Team</h3>
      <div class="flex flex-col gap-2">
        <!-- TEAM NAME -->
        <span class="flex-shrink-0">Team Name:</span>
        <input
          bind:value={teamToEdit.name}
          type="text"
          placeholder="Enter the name of your team"
          class="input input-bordered input-primary w-full"
        />
        <!-- TEAM NAME -->
        <span class="divider">OPTIONAL</span>
        <!-- CURRENT PLAYERS -->
        <span class="flex-shrink-0">Team players:</span>
        {#each teamToEdit.players as player, idx (`new-player-${idx}`)}
          <div class="flex items-center gap-2 w-full justify-between">
            <input
              bind:value={player.name}
              type="text"
              placeholder="Enter the player name"
              class="input input-bordered input-primary w-full"
            />
            <!-- DELETE PLAYER OPTION -->
            <div class="btn btn-sm p-1 flex items-center justify-center flex-shrink-0 w-8 h-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6 flex-shrink-0 text-gray-500"
                on:keydown={() => {}}
                on:click={() => {
                  teamToEdit.players = [...teamToEdit.players.filter((_, i) => i !== idx)];
                }}
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <!-- DELETE PLAYER OPTION -->
          </div>
        {/each}
        <!-- CURRENT PLAYERS -->
        <!-- ADD PLAYER OPTION -->
        <div class="flex items-center w-full justify-center">
          <button
            class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
            on:click={() => (teamToEdit.players = [...teamToEdit.players, { name: "" }])}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 512 512"
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm90.5 224H272v74.5c0 8.8-7.2 16-16 16-4.4 0-8.4-1.8-11.3-4.7-2.9-2.9-4.7-6.9-4.7-11.3V272h-74.5c-4.4 0-8.4-1.8-11.3-4.7-2.9-2.9-4.7-6.9-4.7-11.3 0-8.8 7.2-16 16-16H240v-74.5c0-8.8 7.2-16 16-16s16 7.2 16 16V240h74.5c8.8 0 16 7.2 16 16s-7.2 16-16 16z"
              />
            </svg>
            Add {teamToEdit.players.length === 0 ? "a player" : "another player"}
          </button>
        </div>
        <!-- ADD PLAYER OPTION -->
        <!-- ADD PLAYERS -->
      </div>
      <div class="pt-4">
        <button
          class="btn bg-blue-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
          disabled={submitLoading}
          on:click={editTeam}
        >
          Go
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
  {/if}
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
<!-- EDIt PLAYER MODAL -->
