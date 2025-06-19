<script lang="ts">
  import { onMount } from "svelte";
  import {
    TriviaTeamCollection,
    TriviaGameCollection,
    TriviaQuestionCollection,
    TriviaRoundCollection,
    TriviaAnswerCollection,
  } from "/imports/api/trivia/collections";
  import { params } from "@roxi/routify";

  const { game_id, team_id } = $params;
  let teams = [];
  let game;
  let currentRound;
  let currentQuestion;
  let currentAnswer;
  let questions = [];
  let submitLoading = false;

  // METHODS
  const selectMultipleChoiceAnswer = (answer) => {
    submitLoading = true;
    Meteor.call("trivia.selectMultipleChoiceAnswer", team_id, currentQuestion?._id, answer, (error, result) => {
      submitLoading = false;
      if (error) {
        console.error("Error selecting answer:", error);
        return;
      }
      console.log("Answer selected successfully:", result);
      // Optionally, you can navigate to a different page or update the UI
    });
  };
  // METHODS

  $m: {
    Meteor.subscribe("trivia.answersForTeam", team_id);

    game = TriviaGameCollection.findOne({ _id: game_id });
    teams = TriviaTeamCollection.find({ game_id: game_id }).fetch();
    questions = TriviaQuestionCollection.find({ game_id: game_id }).fetch() || [];
    currentRound = TriviaRoundCollection.findOne({ current: true, game_id: game_id });
    currentQuestion = TriviaQuestionCollection.findOne({ current: true, game_id: game_id });
    currentAnswer = TriviaAnswerCollection.findOne({ team_id: team_id, question_id: currentQuestion?._id });

    if (currentRound) {
      currentRound.questions = questions.filter((q) => q.round_id === currentRound._id);
      currentRound.completed_questions = currentRound.questions.filter((q) => q.completed);
      if (currentQuestion) {
        currentQuestion.correctAnswer = currentQuestion.answers.find((q) => q.correct);
      }
    }
  }

  onMount(() => {
    console.log("Mounting trivia team page for game_id:", game_id, "and team_id:", team_id);
    let triviaTeamsJSON = localStorage.getItem("trivia_teams") || "[]";
    if (triviaTeamsJSON) {
      let triviaTeams = JSON.parse(triviaTeamsJSON);
      console.log("Current trivia teams in localStorage:", triviaTeams);
      if (!triviaTeams.includes(team_id)) {
        triviaTeams.push(team_id);
        localStorage.setItem("trivia_teams", JSON.stringify(triviaTeams));
      }
    } else {
      localStorage.setItem("trivia_teams", JSON.stringify([team_id]));
    }
  });
</script>

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
{:else}
  <!-- CURRENT ROUND -->
  <div class="flex flex-col items-center py-6 gap-4 cursor-pointer">
    <h1 class="font-poppins text-2xl font-black uppercase text-center">Current Round</h1>
    <div class="flex items-center w-full min-h-12 gap-2 p-8 rounded-lg shadow-lg border relative">
      <div class="flex flex-col items-center w-full gap-2">
        <!-- TEAM NAME + EDIT -->
        <div class="flex items-center w-full justify-between">
          <div class="flex items-center w-full gap-2">
            <h2 class="font-poppins text-3xl font-bold">{currentRound?.name}</h2>
          </div>
        </div>
        <!-- TEAM NAME + EDIT -->

        <!-- Completion Summary -->
        <div class="font-light flex flex-col items-center justify-center gap-2 w-full">
          <span class="text-sm text-gray-500"
            >Completed: {currentRound?.completed_questions?.length} / {currentRound?.questions?.length}</span
          >
          {#if currentRound?.completed_questions?.length || currentRound?.questions?.length}
            <progress
              class="progress w-full"
              value={currentRound?.completed_questions?.length || 0}
              max={currentRound?.questions?.length || 1}
            ></progress>
          {/if}
        </div>
        <!-- Completion Summary -->
      </div>
    </div>
  </div>
  <!-- CURRENT ROUND -->

  {#if currentQuestion?.revealed && false}
    <!-- ANSWER REVEAL -->
    <div class="flex flex-col items-center py-6 gap-4 cursor-pointer">
      <h1 class="font-poppins text-2xl font-black uppercase text-center">ANSWER</h1>
      <div class="flex items-center w-full min-h-12 gap-2 p-8 rounded-lg shadow-lg border relative">
        <div class="flex flex-col items-center w-full gap-2">
          <!-- TEAM NAME + EDIT -->
          <div class="flex items-center w-full justify-between">
            <div class="flex items-center w-full gap-2">
              <h2 class="font-poppins text-3xl font-bold">{currentQuestion?.question}</h2>
            </div>
          </div>
          <!-- TEAM NAME + EDIT -->

          <!-- ANSWERS -->
          <div class="w-full gap-2 flex flex-row items center">
            {#each currentQuestion?.answers || [] as answer, idx (`answer-${idx}`)}
              {#if currentQuestion?.question_type === "multiple_choice"}
                <div class="flex items-center justify-center gap-2 p-4 rounded-lg shadow-lg border w-full">
                  <span class="text-sm font-semibold">{answer.value}</span>
                  {#if answer.correct}
                    <span class="text-green-500 font-bold">✓</span>
                  {:else}
                    <span class="text-red-500 font-bold">✗</span>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
          <!-- ANSWERS -->
        </div>
      </div>
    </div>
    <!-- ANSWER REVEAL -->
  {/if}

  <!-- CURRENT QUESTION -->
  <div class="flex flex-col items-center py-6 gap-4 cursor-pointer">
    <h1 class="font-poppins text-2xl font-black uppercase text-center">Question #{currentQuestion?.order}</h1>
    <div class="flex items-center w-full min-h-12 gap-2 p-8 rounded-lg shadow-lg border relative">
      <div class="flex flex-col items-center w-full gap-4">
        <!-- TEAM NAME + EDIT -->
        <div class="flex items-center w-full justify-between">
          <div class="flex items-center w-full gap-2">
            <h2 class="font-poppins text-3xl font-bold">{currentQuestion?.question}</h2>
          </div>
        </div>
        <!-- TEAM NAME + EDIT -->

        <!-- ANSWERS -->
        <div class="w-full gap-4 flex flex-row items center">
          {#each currentQuestion?.answers || [] as answer, idx (`answer-${idx}`)}
            {#if currentQuestion?.question_type === "multiple_choice" && !currentQuestion?.revealed}
              <div
                class="flex items-center justify-center gap-2 p-4 h-auto border {currentAnswer?.answer?.value ===
                answer?.value
                  ? 'text-white bg-blue-500'
                  : 'bg-white'} rounded-lg shadow-lg w-full btn flex-shrink"
                class:btn-disabled={submitLoading}
                on:click={() => {
                  selectMultipleChoiceAnswer(answer);
                }}
                on:keydown={() => {}}
              >
                <span class="text-xl font-semibold">{answer.value}</span>
              </div>
            {:else if currentQuestion?.question_type === "multiple_choice" && currentQuestion?.revealed}
              <div
                class="flex items-center justify-center gap-2 p-4 h-auto border pointer-events-none {currentAnswer.correct &&
                currentAnswer?.answer?.value === answer?.value
                  ? 'text-green-100 bg-green-400'
                  : !currentAnswer.correct && currentQuestion?.correctAnswer?.value === answer?.value
                    ? 'border-green-500 text-green-500 border-4'
                    : !currentAnswer.correct && currentAnswer?.answer.value === answer?.value
                      ? 'text-red-100 bg-red-400'
                      : 'bg-gray-400 text-gray-100'} rounded-lg shadow-lg w-full btn flex-shrink"
              >
                <span class="text-xl font-semibold">{answer.value}</span>
              </div>
            {/if}
          {/each}
        </div>
        <!-- ANSWERS -->
      </div>
    </div>
  </div>
  <!-- CURRENT QUESTION -->
{/if}
