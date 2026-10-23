<script lang="ts">
  import { params } from "@roxi/routify";
  import {
    TriviaGameCollection,
    TriviaQuestionCategoryCollection,
    TriviaRoundCollection,
    TriviaQuestionCollection,
    TriviaGameCategoryCollection,
  } from "/imports/api/trivia/collections";
  import _ from "lodash";

  console.log("%c Hi Setup", "color: orange; font-size: 32px; font-weight: bold;");

  let game_id = $params.game_id;
  let game;
  let rounds = [];
  let question_categories = [];
  let game_categories = [];
  let questions = [];

  // END OF METHODS

  $m: {
    game = TriviaGameCollection.findOne({ _id: game_id });
    questions = TriviaQuestionCollection.find({ game_id }).fetch();
    question_categories = TriviaQuestionCategoryCollection.find().fetch();

    console.log("%c Game Categories", "color: cyan; font-size: 16px; font-weight: bold;", question_categories.length);
    game_categories = TriviaGameCategoryCollection.find({ game_id })
      .fetch()
      .map((category) => {
        category.questions = questions.filter((question) => question.category_id === category._id);
        return category;
      });
    rounds = TriviaRoundCollection.find({ game_id }, { sort: { order: 1 } })
      .fetch()
      .map((round) => {
        const round_questions = questions
          .filter((question) => question.round_id === round._id)
          .sort((a, b) => a.order - b.order);
        round.questions = round_questions;
        const unique_round_game_category_ids = _.uniq(round_questions.map((question) => question.category_id));
        const round_game_categories = question_categories.filter((category) =>
          unique_round_game_category_ids.includes(category._id)
        );
        round.categories = round_game_categories;
        return round;
      });
  }
</script>

<div class="flex flex-col gap-8 py-12">
  {#each rounds as round (round._id)}
    <div class="flex flex-col items-start gap-4">
      <h1 class="text-left text-3xl font-bold font-poppins">{round.name}</h1>
      {#each round.questions as question (question._id)}
        <div class="flex flex-col items-center justify-center gap-4 p-4 rounded-md border w-full">
          <div class="flex flex-col w-full gap-2">
            <h2 class="font-poppins text-xl font-bold">{question.question}</h2>
            <p class="text-sm font-light text-gray-600">
              {question.category_name} - {question.question_type} - {question.difficulty}
            </p>
            <!-- ANSWERS -->
            <div class="w-full gap-2 flex flex-row flex-wrap items center">
              {#each question?.answers || [] as answer, idx (`answer-${idx}`)}
                {#if question?.question_type === "multiple_choice"}
                  <div class="flex flex-wrap items-center justify-center gap-2 p-4 rounded-lg shadow-lg border">
                    <span class="text-base font-semibold">{answer.value}</span>
                    {#if answer.correct}
                      <span class="text-green-500 font-bold">✓</span>
                    {:else}
                      <span class="text-red-500 font-bold">✗</span>
                    {/if}
                  </div>
                {:else}
                  <div class="flex flex-wrap items-center justify-center gap-2 p-4 rounded-lg shadow-lg border">
                    {#if answer.label || question?.question_type === "sort_items"}
                      <span class="text-base font-light">{answer.label || `Item ${idx + 1}`}</span>
                    {/if}
                    <span class="text-base font-semibold">{answer.value}</span>
                  </div>
                {/if}
              {/each}
            </div>
            <!-- ANSWERS -->
          </div>
        </div>
      {/each}
    </div>
  {/each}
</div>
