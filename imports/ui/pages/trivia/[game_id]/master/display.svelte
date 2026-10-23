<script lang="ts">
  import {
    TriviaRoundCollection,
    TriviaQuestionCollection,
    TriviaGameCollection,
    TriviaAnswerCollection,
    TriviaTeamCollection,
  } from "/imports/api/trivia/collections";
  import { params, goto } from "@roxi/routify";

  const game_id = $params.game_id;

  let currentRound;
  let currentQuestion;
  let roundQuestions = [];
  let submittedAnswers = [];
  let teams;
  let game;

  // Methods
  const revealAnswer = () => {
    if (currentQuestion) {
      Meteor.call("trivia.toggleRevealAnswer", currentQuestion._id, (error, result) => {
        if (error) {
          console.error("Error revealing answer:", error);
        } else {
          console.log("Answer revealed successfully:", result);
        }
      });
    }
  };
  const nextQuestion = () => {
    if (currentQuestion) {
      Meteor.call("trivia.nextQuestion", currentQuestion._id, (error, result) => {
        if (error) {
          console.error("Error revealing answer:", error);
        } else {
          console.log("Answer revealed successfully:", result);
        }
      });
    }
  };
  const previousQuestion = () => {
    if (currentQuestion) {
      Meteor.call("trivia.previousQuestion", currentQuestion._id, (error, result) => {
        if (error) {
          console.error("Error revealing answer:", error);
        } else {
          console.log("Answer revealed successfully:", result);
        }
      });
    }
  };
  // Methods

  $m: {
    game = TriviaGameCollection.findOne({ _id: game_id });
    teams = TriviaTeamCollection.find({ game_id: game_id }).fetch() || [];
    currentRound = TriviaRoundCollection.findOne({ current: true, game_id: game_id });
    if (currentRound) {
      roundQuestions = TriviaQuestionCollection.find({ game_id: game_id, round_id: currentRound?._id }).fetch() || [];
      currentQuestion = roundQuestions.find((q) => q.current);

      if (currentQuestion) {
        currentQuestion.correctAnswer = currentQuestion.answers.find((q) => q.correct);
      }

      currentRound.questions = roundQuestions;
      currentRound.completed_questions = roundQuestions.filter((q) => q.completed);
      submittedAnswers = TriviaAnswerCollection.find({ question_id: currentQuestion?._id }).fetch();

      teams = teams.map((team) => {
        const teamAnswer = TriviaAnswerCollection.findOne({
          team_id: team._id,
          question_id: currentQuestion?._id,
        });
        return {
          ...team,
          submittedAnswer: teamAnswer,
        };
      });
      console.log("Teams with submitted answers:", teams);
    }

    Meteor.subscribe("trivia.answersForQuestion", currentQuestion?._id);
  }
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
{:else if currentRound?.completed}
  <div class="flex flex-col items-center py-12 gap-4">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="w-24 h-24 text-green-600 stroke-green-600"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>

    <h1 class="font-poppins text-3xl font-black uppercase text-center">This round is complete</h1>
  </div>
{:else}
  <div class="flex flex-col items-center gap-4">
    <div class="flex justify-center items-center py-2 gap-4 cursor-pointer w-full">
      <button class="btn btn-lg min-w-[135px]" on:click={() => $goto(`/trivia/${game_id}/master/controller`)}
        >Go To Controller</button
      >
    </div>
    <!-- CURRENT ROUND -->
    <div class="flex flex-col items-center py-12 gap-4 cursor-pointer">
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

    <!-- CURRENT QUESTION -->
    <div class="flex flex-col items-center py-6 gap-4 cursor-pointer">
      <h1 class="font-poppins text-2xl font-black uppercase text-center">Question #{currentQuestion?.order}</h1>
      <div class="flex items-center w-full min-h-12 gap-2 p-8 rounded-lg shadow-lg border relative">
        <div class="flex flex-col items-center w-full gap-2">
          <p class="w-full text-sm text-right font-light">{currentQuestion?.question_type}</p>
          <!-- TEAM NAME + EDIT -->
          <div class="flex items-center w-full justify-between">
            <div class="flex items-center w-full gap-2">
              <h2 class="font-poppins text-3xl font-bold">{currentQuestion?.question}</h2>
            </div>
          </div>
          <!-- TEAM NAME + EDIT -->

          <!-- ANSWERS -->
          <div class="w-full gap-2 flex flex-row flex-wrap items center">
            {#each currentQuestion?.answers || [] as answer, idx (`answer-${idx}`)}
              {#if currentQuestion?.question_type === "multiple_choice"}
                <div class="flex flex-wrap items-center justify-center gap-2 p-4 rounded-lg shadow-lg border w-full">
                  <span class="text-2xl font-semibold">{answer.value}</span>
                  {#if currentQuestion?.revealed}
                    {#if answer.correct}
                      <span class="text-green-500 font-bold">✓</span>
                    {:else}
                      <span class="text-red-500 font-bold">✗</span>
                    {/if}
                  {/if}
                </div>
              {:else if answer.label || currentQuestion?.revealed}
                <div class="flex flex-wrap items-center justify-center gap-2 p-4 rounded-lg shadow-lg border w-full">
                  {#if answer.label}
                    <span class="text-lg font-light">{answer.label || `Item ${idx + 1}`}</span>
                  {/if}
                  {#if currentQuestion?.revealed}
                    <span class="text-2xl font-semibold">{answer.value}</span>
                  {/if}
                  {#if currentQuestion.question_type === "sort_items"}
                    <span class="text-lg font-semibold">{idx + 1 || "0"}</span>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
          <!-- ANSWERS -->
        </div>
      </div>
    </div>
    <!-- CURRENT QUESTION -->
  </div>
{/if}
