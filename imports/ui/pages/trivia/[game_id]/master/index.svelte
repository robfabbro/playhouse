<script lang="ts">
  import {
    TriviaRoundCollection,
    TriviaQuestionCollection,
    TriviaGameCollection,
  } from "/imports/api/trivia/collections";
  import { params, goto } from "@roxi/routify";

  const game_id = $params.game_id;
  let rounds = [];
  let questions = [];
  let startRoundModal;
  let resetGameModal;
  let roundToStart;
  let submitLoading = false;
  let game;

  const startRound = () => {
    submitLoading = true;
    Meteor.call("trivia.startRound", roundToStart._id, (error) => {
      submitLoading = false;
      if (error) {
        console.error("Error starting round:", error);
        return;
      }
      startRoundModal.close();
      $goto(`/trivia/${game_id}/master/display`);
    });
  };

  const resetGame = () => {
    submitLoading = true;
    Meteor.call("trivia.resetGame", game_id, (error) => {
      submitLoading = false;
      if (error) {
        console.error("Error starting round:", error);
        return;
      }
      resetGameModal.close();
    });
  };

  const openStartRoundModal = (round) => {
    if (game?.started && round.started) {
      $goto(`/trivia/${game_id}/master/display`);
    } else {
      roundToStart = round;
      startRoundModal.showModal();
    }
  };

  $m: {
    game = TriviaGameCollection.findOne({ _id: game_id });
    questions = TriviaQuestionCollection.find({ game_id: game_id }).fetch();
    rounds = TriviaRoundCollection.find({ game_id: game_id })
      .fetch()
      .map((round) => {
        const roundQuestions = questions.filter((q) => q.round_id === round._id);
        return {
          ...round,
          questions: roundQuestions,
          completed_questions: roundQuestions.filter((q) => q.completed),
        };
      });
  }
</script>

<div class="flex flex-col items-center gap-4">
  <div class="flex flex-col items-center py-12 gap-4 cursor-pointer">
    <h1 class="font-poppins text-2xl font-black uppercase text-center">Trivia Rounds</h1>
    {#each rounds as round, round_idx (round._id)}
      <div
        class="flex items-center w-full min-h-12 gap-2 p-8 rounded-lg shadow-lg border relative {round_idx !== 0 &&
        !rounds[round_idx - 1]?.completed
          ? 'btn-disabled pointer-events-none bg-gray-100 text-gray-800'
          : ''}"
      >
        <div class="flex flex-col items-center w-full gap-2">
          <!-- TEAM NAME + EDIT -->
          <div class="flex items-center w-full justify-between">
            <div class="flex items-center w-full gap-2">
              <h2 class="font-poppins text-3xl font-bold">{round.name}</h2>
            </div>
          </div>
          <!-- TEAM NAME + EDIT -->

          <!-- TEAM PLAYERS -->
          <div class="font-light flex flex-col items-center justify-center gap-2 w-full">
            <span class="text-sm text-gray-500"
              >Completed: {round.completed_questions.length} / {round.questions.length}</span
            >
            <progress class="progress w-full" value={round.completed_questions.length} max={round.questions.length}
            ></progress>
          </div>
          <!-- TEAM PLAYERS -->
        </div>
        <!-- DOUBLE CHEVRON -->
        <button
          class="btn p-1 m-0 w-auto min-h-12 h-full font-bold bg-transparent border-none self-end flex-shrink-0 flex items-center"
          on:click={() => openStartRoundModal(round)}
          class:hidden={round_idx !== 0 && !rounds[round_idx - 1]?.completed}
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
    <!-- GO TO ANSWER SHEET -->
    <h1 class="font-poppins text-2xl font-black uppercase text-center mt-4">ANSWER SHEET</h1>
    <a
      class="flex items-center w-full min-h-12 gap-2 p-8 rounded-lg shadow-lg border relative btn bg-white h-auto"
      href={`/trivia/${game_id}/answer-sheet`}
    >
      <h2 class="font-poppins text-3xl font-bold">Go To Answer Sheet</h2>
    </a>
    <!-- GO TO ANSWER SHEET -->
  </div>

  <button
    class="btn bg-red-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
    on:click={() => resetGameModal.showModal()}
    class:btn-disabled={!game?.started}
  >
    Reset Game
  </button>
</div>

<!-- START ROUND MODAL -->
<dialog class="modal" bind:this={startRoundModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Start Round</h3>
    <div class="flex flex-col gap-2 items-center">
      <span class="flex-shrink-0">Are you sure you want to start this round?</span>
      <span class="flex-shrink-0">Once you start this round, you will start the trivia</span>
      <div class="flex flex-col gap-2 items-center py-4">
        <p class="font-bold text-3xl">{roundToStart?.name}</p>
      </div>
    </div>
    <div class="pt-4">
      <button
        class="btn bg-blue-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={startRound}
      >
        Start Round
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
<!-- START ROUND MODAL -->

<!-- RESET GAME MODAL -->
<dialog class="modal" bind:this={resetGameModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Start Round</h3>
    <div class="flex flex-col gap-2 items-center">
      <span class="flex-shrink-0">Are you sure you want to restart this trivia?</span>
      <span class="flex-shrink-0">This action cannot be undone</span>
    </div>
    <div class="pt-4">
      <button
        class="btn bg-error-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={resetGame}
      >
        Reset Game
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
<!-- RESET GAME MODAL -->
