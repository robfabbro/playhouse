<script lang="ts">
  import { params } from "@roxi/routify";
  import {
    TriviaGameCollection,
    TriviaQuestionCategoryCollection,
    TriviaRoundCollection,
    TriviaQuestionCollection,
    TriviaTeamCollection,
  } from "/imports/api/trivia/collections";
  import _ from "lodash";

  let submitLoading = false;
  let teams = [];
  let game_id = $params.game_id;
  let addTeamModal;
  let editTeamModal;
  let newTeam = {
    name: "",
    players: [],
  };
  let teamToEdit = null;
  let teamToDelete = null;
  let deleteTeamModal;

  // METHODS
  let openEditTeamModal = (team) => {
    teamToEdit = team;
    editTeamModal.showModal();
  };

  let saveCategoryName = (team_id) => {
    Meteor.call("trivia.saveTeamName", team_id, newTeam, (error: Error | undefined, result: any) => {
      if (error) {
        console.error("Error saving round name:", error);
      } else {
        console.log("Round name saved successfully:", result);
        newTeam = {
          name: "",
          players: [],
        };
        teamToEdit = null;
      }
    });
  };

  let openDeleteTeamModal = (team) => {
    teamToDelete = team;
    deleteTeamModal.showModal();
  };

  let deleteTeam = () => {
    submitLoading = true;
    Meteor.call("trivia.deleteTeam", teamToDelete._id, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error deleting game team:", error);
      } else {
        console.log("Game team deleted successfully:", result);
        deleteTeamModal.close();
        setTimeout(() => {
          teamToDelete = null;
        }, 500);
      }
    });
  };

  let addTeam = () => {
    submitLoading = true;
    Meteor.call("trivia.addTeam", game_id, newTeam, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error adding team:", error);
      } else {
        console.log("Team added successfully:", result);
        addTeamModal.close();
        setTimeout(() => {
          newTeam = {
            name: "",
            players: [],
          };
        }, 500);
      }
    });
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
  // METHODS

  $m: {
    teams = TriviaTeamCollection.find({ game_id }).fetch();
  }
</script>

<div class="flex flex-col items-center gap-2">
  <h1 class="font-poppins text-3xl font-black uppercase text-center">Trivia Teams</h1>

  {#if teams.length === 0}
    <div class="flex flex-col items-center justify-center gap-2">
      <p class="text-lg font-light">No teams have been added to this game.</p>
      <button
        class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
        on:click={() => addTeamModal.showModal()}
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
        Add a team
      </button>
    </div>
  {/if}

  <div class="flex flex-col items-center justify-center gap-4">
    {#each teams as team (team._id)}
      <div class="flex items-center w-full min-h-12 gap-2 p-4 rounded-lg shadow-lg border relative">
        <!-- TEAM CODE -->
        <span class="text-gray-500 text-lg font-light flex-shrink-0 top-2 right-8 absolute">{team.team_code}</span>
        <!-- TEAM CODE -->
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
        <!-- DELETE PLAYER -->
        <button
          class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
          on:click={() => openDeleteTeamModal(team)}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 448 512"
            class="h-8 w-8 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"
            ></path></svg
          >
        </button>
        <!-- DELETE PLAYER -->
      </div>
    {/each}

    <!-- ADD PLAYER -->
    {#if teams.length > 0}
      <div class="flex flex-col items-center justify-center gap-2 my-4">
        <p class="text-lg font-light">You can add more teams to this game.</p>
        <button
          class="flex items-center gap-2 text-sm bg-white btn text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
          on:click={() => addTeamModal.showModal()}
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
          Add Team
        </button>
      </div>
    {/if}
    <!-- ADD PLAYER -->
  </div>
</div>

<!-- 
=========================================================================================
=========================================================================================
=========================================================================================
MODALS BELOW
=========================================================================================
=========================================================================================
=========================================================================================
-->

<!-- ADD PLAYER MODAL -->
<dialog class="modal" bind:this={addTeamModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Add Team</h3>
    <div class="flex flex-col gap-2">
      <!-- TEAM NAME -->
      <span class="flex-shrink-0">Team Name:</span>
      <input
        bind:value={newTeam.name}
        type="text"
        placeholder="Enter the name of your team"
        class="input input-bordered input-primary w-full"
      />
      <!-- TEAM NAME -->
      <span class="divider">OPTIONAL</span>
      <!-- CURRENT PLAYERS -->
      <span class="flex-shrink-0">Add players:</span>
      {#each newTeam.players as player, idx (`new-player-${idx}`)}
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
                newTeam.players = [...newTeam.players.filter((_, i) => i !== idx)];
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
          on:click={() => (newTeam.players = [...newTeam.players, { name: "" }])}
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
          Add {newTeam.players.length === 0 ? "a player" : "another player"}
        </button>
      </div>
      <!-- ADD PLAYER OPTION -->
      <!-- ADD PLAYERS -->
    </div>
    <div class="pt-4">
      <button
        class="btn bg-blue-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={addTeam}
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
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
<!-- ADD PLAYER MODAL -->

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

<!-- DELETE PLAYER MODAL -->
<dialog class="modal" bind:this={deleteTeamModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Delete Team</h3>
    <div class="flex flex-col gap-2 items-center">
      <span class="text-sm text-red-600 font-bold uppercase">This action cannot be undone.</span>
      <span class="flex-shrink-0">Are you sure you want to delete this team?</span>
      <div class="flex flex-col gap-2 items-center py-4">
        <p class="font-bold text-3xl">{teamToDelete?.name}</p>
      </div>
    </div>
    <div class="pt-4">
      <button
        class="btn bg-red-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={deleteTeam}
      >
        Confirm Deletion
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
</dialog>
<!-- DELETE PLAYER MODAL -->
