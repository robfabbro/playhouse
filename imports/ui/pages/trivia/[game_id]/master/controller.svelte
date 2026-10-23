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
  const completeRound = () => {
    if (currentQuestion) {
      Meteor.call("trivia.completeRound", currentRound._id, (error, result) => {
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
{:else}
  <div class="flex flex-col items-center gap-4">
    <div class="flex justify-center items-center py-2 gap-4 cursor-pointer w-full">
      <button class="btn btn-lg min-w-[135px]" on:click={() => $goto(`/trivia/${game_id}/master/display`)}
        >Go To Display</button
      >
    </div>
    <!-- CURRENT ROUND -->
    <div class="flex flex-col items-center py-12 gap-4 cursor-pointer">
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
      <div class="flex justify-center items-center py-2 gap-4 cursor-pointer w-full">
        <button
          class="btn btn-lg min-w-[135px]"
          on:click={completeRound}
          class:btn-disabled={currentQuestion?.order !== roundQuestions?.length}>Complete Round</button
        >
      </div>
    </div>
    <!-- CURRENT ROUND -->

    <div class="flex justify-center items-center py-2 gap-4 cursor-pointer w-full">
      <button
        class="btn btn-lg min-w-[135px]"
        on:click={previousQuestion}
        class:btn-disabled={currentQuestion?.order === 1}>Prev. Question</button
      >
      <button
        class="btn btn-lg min-w-[135px]"
        on:click={nextQuestion}
        class:btn-disabled={currentQuestion?.order === roundQuestions?.length}>Next Question</button
      >
    </div>

    <!-- CURRENT QUESTION -->
    <div class="flex flex-col items-center py-6 gap-4 cursor-pointer">
      <h1 class="font-poppins text-2xl font-black uppercase text-center">Current Question</h1>
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
          <div class="w-full gap-2 flex flex-row flex-wrap items center">
            {#each currentQuestion?.answers || [] as answer, idx (`answer-${idx}`)}
              {#if currentQuestion?.question_type === "multiple_choice"}
                <div class="flex items-center justify-center gap-2 p-4 rounded-lg shadow-lg border w-full">
                  <span class="text-2xl font-semibold">{answer.value}</span>
                  {#if answer.correct}
                    <span class="text-green-500 font-bold">✓</span>
                  {:else}
                    <span class="text-red-500 font-bold">✗</span>
                  {/if}
                </div>
              {:else}
                <div class="flex items-center justify-center gap-2 p-4 rounded-lg shadow-lg border w-full">
                  {#if answer.label}
                    <span class="text-lg font-light">{answer.label}</span>
                  {/if}
                  <span class="text-2xl font-semibold">{answer.value}</span>
                  {#if currentQuestion.question_type === "sort_items"}
                    <span class="text-lg font-semibold">{answer.order || "0"}</span>
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

    <div class="flex justify-center items-center py-2 gap-4 cursor-pointer w-full">
      <button class="btn btn-lg min-w-[135px]" on:click={revealAnswer}
        >{currentQuestion?.revealed ? "Hide Answer" : "Reveal Answer"}</button
      >
    </div>

    <!-- SUBMITTED ANSWERS -->
    <div class="flex flex-col items-center py-6 gap-4 cursor-pointer w-full">
      <h1 class="font-poppins text-2xl font-black uppercase text-center">Submitted Answers</h1>
      {#each teams || [] as team, idx (`submittedAnswer-${idx}`)}
        <div class="flex items-center w-full min-h-12 gap-2 p-8 rounded-lg shadow-lg border relative">
          <div class="flex flex-col items-center w-full gap-2">
            <!-- TEAM NAME + EDIT -->
            <div class="flex items-center w-full justify-between">
              <div class="flex items-center w-full gap-2">
                <h2 class="font-poppins text-3xl font-bold">{team?.name}</h2>
              </div>
            </div>
            <!-- TEAM NAME + EDIT -->

            <!-- allegiantTeam PLAYERS -->
            <div class="font-light flex items-center gap-2 w-full">
              {#each team?.players || [] as player, idx (`allegiantTeam-player-${idx}`)}
                <span class="badge badge-primary badge-lg">{player.name}</span>
              {/each}
            </div>
            <!-- allegiantTeam PLAYERS -->

            <!-- ANSWERS -->
            <div class="w-full gap-2 flex flex-row flex-wrap items center">
              {#each currentQuestion?.answers || [] as answer, idx (`answer-${idx}`)}
                {#if currentQuestion?.question_type === "multiple_choice" && !currentQuestion?.revealed}
                  <div
                    class="flex items-center justify-center gap-2 p-4 rounded-lg shadow-lg border w-full {team
                      ?.submittedAnswer?.answer?.value === answer.value
                      ? 'bg-blue-400 text-white'
                      : 'bg-white'}"
                  >
                    <span class="text-xl font-semibold">{answer.value}</span>
                  </div>
                {:else if currentQuestion?.question_type === "multiple_choice" && currentQuestion?.revealed}
                  <div
                    class="flex items-center justify-center gap-2 p-4 h-auto border pointer-events-none {team
                      .submittedAnswer.correct && team.submittedAnswer?.answer?.value === answer?.value
                      ? 'text-green-100 bg-green-400'
                      : !team.submittedAnswer.correct && team?.submittedAnswer?.answer?.value === answer?.value
                        ? 'text-red-100 bg-red-400'
                        : !team.submittedAnswer.correct && currentQuestion?.correctAnswer?.value === answer?.value
                          ? 'text-green-500 border-green-500 border-4'
                          : 'bg-gray-400 text-gray-100'} rounded-lg shadow-lg w-full btn flex-shrink"
                  >
                    <span class="text-xl font-semibold">{answer.value}</span>
                  </div>
                {/if}
              {/each}
            </div>
            <!-- submittedAnswerS -->
          </div>
        </div>
      {/each}
    </div>
    <!-- SUBMITTED ANSWERS -->
  </div>
{/if}
