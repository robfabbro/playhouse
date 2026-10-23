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

  let submitLoading = false;
  let addCategoryModal;
  let addQuestionModal;
  let editQuestionModal;
  let deleteQuestionModal;
  let addRoundModal;
  let deleteRoundModal;
  let deleteCategoryModal;
  let roundToEdit = null;
  let roundToDelete = null;
  let newRoundName = "";
  let newCategoryName = "";
  let selectedQuestionCategoryToAdd = null;
  let selectedQuestionCategoryDropdownOpen = false;
  let existingCategorySearchString = "";
  let gameCategoryToEdit = null;
  let gameCategoryToDelete = null;
  let roundToAddQuestion = null;
  let newQuestion = {
    question: "",
    category_id: null,
    difficulty: "easy",
    labels_required: true,
    question_type: "single_answer",
    answers: [{ label: "", value: "", correct: false }],
  };
  let questionToEdit = null;
  let questionToDelete = null;

  // let updateSortMode = (mode: "category" | "difficulty") => {
  //   Meteor.call("trivia.updateGameSortMode", game_id, mode, (error: Error | undefined) => {
  //     if (error) {
  //       console.error("Error updating sort mode:", error);
  //     } else {
  //       console.log("Sort mode updated successfully to:", mode);
  //     }
  //   });
  // };

  let openAddRoundModal = () => {
    newRoundName = `Round ${rounds.length + 1}`;
    addRoundModal.showModal();
  };

  let addRound = () => {
    if (!newRoundName.trim()) {
      console.error("Round name cannot be empty");
      return;
    }
    submitLoading = true;
    Meteor.call("trivia.addRound", game_id, newRoundName, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error adding round:", error);
      } else {
        console.log("Round added successfully:", result);
        addRoundModal.close();
        newRoundName = "";
      }
    });
  };

  let editRoundName = (round) => {
    newRoundName = round.name;
    roundToEdit = round._id;
  };

  let saveRoundName = (round_id) => {
    Meteor.call("trivia.saveRoundName", round_id, newRoundName, (error: Error | undefined, result: any) => {
      if (error) {
        console.error("Error saving round name:", error);
      } else {
        console.log("Round name saved successfully:", result);
        newRoundName = "";
        roundToEdit = null;
      }
    });
  };

  let openDeleteRoundModal = (round) => {
    roundToDelete = round;
    deleteRoundModal.showModal();
  };

  let deleteRound = () => {
    submitLoading = true;
    Meteor.call("trivia.deleteRound", roundToDelete._id, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error deleting round:", error);
      } else {
        console.log("Round deleted successfully:", result);
        deleteRoundModal.close();
        setTimeout(() => {
          roundToDelete = null;
        }, 500);
      }
    });
  };

  let orderRound = (round_id, order_direction: "up" | "down") => {
    submitLoading = true;
    Meteor.call("trivia.orderRound", round_id, order_direction, (error: Error | undefined) => {
      if (error) {
        console.error("Error ordering round:", error);
      } else {
        console.log("Round ordered successfully");
      }
      submitLoading = false;
    });
  };

  let addNewGameCategory = () => {
    if (!newCategoryName.trim()) {
      console.error("Category name cannot be empty");
      return;
    }
    submitLoading = true;
    Meteor.call("trivia.addNewGameCategory", game_id, newCategoryName, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error adding game category:", error);
      } else {
        console.log("Game category added successfully:", result);
        addCategoryModal.close();
        newCategoryName = "";
      }
    });
  };

  let addExistingGameCategory = () => {
    if (!selectedQuestionCategoryToAdd) {
      console.error("Category needs to be selected");
      return;
    }
    submitLoading = true;
    Meteor.call(
      "trivia.addExistingGameCategory",
      game_id,
      selectedQuestionCategoryToAdd?._id,
      (error: Error | undefined, result: any) => {
        submitLoading = false;
        if (error) {
          console.error("Error adding game category:", error);
        } else {
          console.log("Game category added successfully:", result);
          addCategoryModal.close();
          selectedQuestionCategoryToAdd = null;
          existingCategorySearchString = "";
        }
      }
    );
  };

  let editGameCategoryName = (category) => {
    newCategoryName = category.category_name;
    gameCategoryToEdit = category._id;
  };

  let saveCategoryName = (category_id) => {
    Meteor.call("trivia.saveCategoryName", category_id, newCategoryName, (error: Error | undefined, result: any) => {
      if (error) {
        console.error("Error saving round name:", error);
      } else {
        console.log("Round name saved successfully:", result);
        newCategoryName = "";
        gameCategoryToEdit = null;
      }
    });
  };

  let openDeleteCategoryModal = (category) => {
    gameCategoryToDelete = category;
    deleteCategoryModal.showModal();
  };

  let deleteGameCategory = () => {
    submitLoading = true;
    Meteor.call("trivia.deleteGameCategory", gameCategoryToDelete._id, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error deleting game category:", error);
      } else {
        console.log("Game category deleted successfully:", result);
        deleteCategoryModal.close();
        setTimeout(() => {
          gameCategoryToDelete = null;
        }, 500);
      }
    });
  };

  let openAddQuestionModal = (round) => {
    roundToAddQuestion = round;
    console.log("Open Add Question Modal for Round:", round);
    addQuestionModal.showModal();
  };

  let selectQuestionType = (question_type) => {
    newQuestion.question_type = question_type;

    if (["single_answer", "closest_guess"].includes(question_type)) {
      newQuestion.answers = [{ label: "", value: "" }];
      newQuestion.answers = [{ label: "", value: "" }];
    } else if (question_type === "multiple_choice") {
      newQuestion.answers = [{ label: "", value: "", correct: false }];
      newQuestion.answers = [{ label: "", value: "" }];
    }
  };

  let saveQuestion = () => {
    let questionToSave = { ...newQuestion, game_id, round_id: roundToAddQuestion?._id };
    Meteor.call("trivia.saveQuestion", questionToSave, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error saving question:", error);
      } else {
        console.log("Saved question successfully:", result);
        addQuestionModal.close();
        setTimeout(() => {
          roundToAddQuestion = null;
          newQuestion = {
            question: "",
            category_id: null,
            difficulty: "easy",
            labels_required: true,
            question_type: "single_answer",
            answers: [{ label: "", value: "", correct: false }],
          };
        }, 500);
      }
    });
  };

  let orderQuestion = (question_id, order_direction: "up" | "down") => {
    submitLoading = true;
    Meteor.call("trivia.orderQuestion", question_id, order_direction, (error: Error | undefined) => {
      if (error) {
        console.error("Error ordering questions:", error);
      } else {
        console.log("Question ordered successfully");
      }
      submitLoading = false;
    });
  };

  let randomiseQuestionOrder = (round_id) => {
    submitLoading = true;
    Meteor.call("trivia.randomiseQuestionOrder", round_id, (error: Error | undefined) => {
      if (error) {
        console.error("Error randomising question order:", error);
      } else {
        console.log("Question order randomised successfully");
      }
      submitLoading = false;
    });
  };

  let openEditQuestionModal = (question) => {
    questionToEdit = question;
    console.log("Open Edit Question Modal for Round:", question);
    editQuestionModal.showModal();
  };

  let editQuestion = () => {
    Meteor.call("trivia.editQuestion", questionToEdit, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error editing question:", error);
      } else {
        console.log("Edited question successfully:", result);
        editQuestionModal.close();
        setTimeout(() => {
          questionToEdit = null;
        }, 500);
      }
    });
  };

  let openDeleteQuestionModal = (question) => {
    questionToDelete = question;
    deleteQuestionModal.showModal();
  };

  let deleteQuestion = () => {
    submitLoading = true;
    Meteor.call("trivia.deleteQuestion", questionToDelete._id, (error: Error | undefined, result: any) => {
      submitLoading = false;
      if (error) {
        console.error("Error deleting question:", error);
      } else {
        console.log("question deleted successfully:", result);
        deleteQuestionModal.close();
        setTimeout(() => {
          questionToDelete = null;
        }, 500);
      }
    });
  };

  // END OF METHODS

  $m: {
    game = TriviaGameCollection.findOne({ _id: game_id });
    questions = TriviaQuestionCollection.find({ game_id }).fetch();
    question_categories = TriviaQuestionCategoryCollection.find(
      { name: { $regex: existingCategorySearchString, $options: "i" } },
      { sort: { name: 1 } }
    ).fetch();

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

  $: console.log({ newQuestion });
  $: console.log({ questionToEdit });
</script>

<div class="flex flex-col items-center gap-10">
  <!-- QUESTION CATEGORIES -->
  <div class="flex flex-col items-center gap-2">
    <h1 class="font-poppins text-3xl font-black uppercase text-center">Trivia Categories</h1>
    {#if game_categories.length === 0}
      <div class="flex flex-col items-center justify-center gap-2">
        <p class="text-lg font-light">No categories have been added to this game.</p>
        <button
          class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
          on:click={() => addCategoryModal.showModal()}
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
          Add a category
        </button>
      </div>
    {/if}

    <div class="flex flex-col items-center justify-center gap-4">
      {#each game_categories as category (category._id)}
        <div class="flex items-center w-full min-h-12 gap-2 p-4 rounded-lg shadow-lg border">
          <div class="flex items-center w-full gap-2">
            {#if gameCategoryToEdit !== category?._id}
              <!-- CATEGORY NAME NO EDIT -->
              <h2 class="font-poppins text-3xl font-bold">{category.category_name}</h2>
              <!-- EDIT ROUND NAME BUTTON -->
              <button
                class="btn p-1 m-0 min-h-0 w-auto h-full font-bold bg-transparent border-none"
                on:click={() => editGameCategoryName(category)}
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
              <!-- CATEGORY NAME NO EDIT -->
            {:else}
              <!-- EDITING ROUND NAME -->
              <input
                type="text"
                class="input input-bordered input-primary text-xl font-bold"
                bind:value={newCategoryName}
                placeholder="Category Name"
              />
              <!-- SAVE BUTTON -->
              <button
                class="self-end btn px-1 py-0 m-0 w-12 h-10 bg-green-600 text-white text-sm rounded-lg border-white"
                on:click={() => saveCategoryName(category._id)}
              >
                SAVE
              </button>
              <!-- SAVE BUTTON -->
              <!-- EDITING ROUND NAME -->
            {/if}
          </div>
          <!-- DELETE CATEGORY -->
          <button
            class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
            on:click={() => openDeleteCategoryModal(category)}
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
          <!-- DELETE CATEGORY -->
        </div>
      {/each}

      <!-- ADD ANOTHER CATEGORY -->
      {#if game_categories.length > 0}
        <div class="flex flex-col items-center justify-center gap-2 my-4">
          <p class="text-lg font-light">You can add more question categories to this game.</p>
          <button
            class="flex items-center gap-2 text-sm bg-white btn text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
            on:click={() => addCategoryModal.showModal()}
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
            Add another category
          </button>
        </div>
      {/if}
      <!-- ADD ANOTHER CATEGORY -->
    </div>
  </div>
  <!-- QUESTION CATEGORIES -->

  <!-- TRIVIA ROUNDS -->
  <div class="flex flex-col items-center gap-2">
    <h1 class="font-poppins text-3xl font-black uppercase text-center">Question Rounds</h1>

    {#if rounds.length === 0}
      <div class="flex flex-col items-center justify-center gap-2">
        <p class="text-lg font-light">No rounds have been added to this game.</p>
        <button
          class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
          on:click={() => openAddRoundModal()}
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
          Add a round
        </button>
      </div>
    {/if}

    <!-- EACH ROUND -->
    {#each rounds as round, round_idx (round._id)}
      <div class="flex flex-col items-center justify-center border rounded-lg shadow-lg my-2 w-full">
        <!-- ORDER UP -->
        <button
          class="btn w-full border-none border-b rounded-none rounded-t-lg"
          class:btn-disabled={round_idx === 0 || submitLoading}
          disabled={round_idx === 0 || submitLoading}
          on:click={() => orderRound(round._id, "up")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 flex-shrink-0"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <!-- ORDER UP -->

        <!-- ROUND CONTENT -->
        <div class="flex flex-col items-center justify-center gap-4 px-8 py-4 w-full">
          <!-- ROUND TITLE -->
          <div class="flex items-center w-full min-h-12 gap-2">
            <div class="flex items-center w-full gap-2">
              {#if roundToEdit !== round._id}
                <!-- ROUND NAME NO EDIT -->
                <h2 class="font-poppins text-3xl font-bold">{round.name}</h2>
                <!-- EDIT ROUND NAME BUTTON -->
                <button
                  class="btn p-1 m-0 min-h-0 w-auto h-full font-bold bg-transparent border-none"
                  on:click={() => editRoundName(round)}
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
                <!-- ROUND NAME NO EDIT -->
              {:else}
                <!-- EDITING ROUND NAME -->
                <input
                  type="text"
                  class="input input-bordered input-primary text-xl font-bold"
                  bind:value={newRoundName}
                  placeholder="Round Name"
                />
                <!-- SAVE BUTTON -->
                <button
                  class="self-end btn px-1 py-0 m-0 w-12 h-10 bg-green-600 text-white text-sm rounded-lg border-white"
                  on:click={() => saveRoundName(round._id)}
                >
                  SAVE
                </button>
                <!-- SAVE BUTTON -->
                <!-- EDITING ROUND NAME -->
              {/if}
            </div>
            <!-- DELETE ROUND BUTTON -->
            <button
              class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
              on:click={() => openDeleteRoundModal(round)}
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
            <!-- DELETE ROUND BUTTON -->
          </div>
          <!-- ROUND TITLE -->

          <!-- QUESTIONS -->
          <div class="flex flex-col items-center gap-2 w-full">
            {#if round.questions.length === 0}
              <div class="flex flex-col items-center justify-center gap-2">
                {#if game_categories.length === 0}
                  <p class="text-lg font-light">
                    You must add some categories to the game before you can add questions.
                  </p>
                {:else}
                  <p class="text-lg font-light">No questions have been added to this round.</p>
                {/if}
                <button
                  class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
                  on:click={() => openAddQuestionModal(round)}
                  class:btn-disabled={game_categories.length === 0 || submitLoading}
                  disabled={game_categories.length === 0 || submitLoading}
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
                  Add a question
                </button>
              </div>
            {:else}
              <div class="flex justify-between items-center gap-2 w-full">
                <p class="text-lg font-light text-left w-full">
                  Questions: {round.questions.length}
                </p>
                <button
                  class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
                  on:click={() => randomiseQuestionOrder(round._id)}
                  class:btn-disabled={submitLoading}
                  disabled={submitLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-6 w-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>
                  Randomise Order
                </button>
              </div>
            {/if}

            <!-- QUESTION CONTENT -->
            {#each round.questions as question, question_idx (question._id)}
              <div class="flex flex-col items-center justify-center gap-4 p-4 rounded-md border w-full">
                <div class="flex items-center w-full min-h-12 gap-2">
                  <!-- REORDER QUESTION BUTTON -->
                  <div class="flex flex-col -mt-4 -ml-4 -mb-4">
                    <!-- ORDER UP -->
                    <button
                      class="btn w-full border-none border-b rounded-none rounded-t-lg"
                      class:btn-disabled={question_idx === 0 || submitLoading}
                      disabled={question_idx === 0 || submitLoading}
                      on:click={() => orderQuestion(question._id, "up")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 flex-shrink-0"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <!-- ORDER UP -->
                    <!-- ORDER DOWN -->
                    <button
                      class="btn w-full border-none border-t rounded-none rounded-b-lg"
                      class:btn-disabled={question_idx === round.questions.length - 1 || submitLoading}
                      disabled={question_idx === round.questions.length - 1 || submitLoading}
                      on:click={() => orderQuestion(question._id, "down")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-6 h-6 flex-shrink-0"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <!-- ORDER DOWN -->
                  </div>
                  <!-- REORDER QUESTION BUTTON -->
                  <div class="flex flex-col w-full gap-2">
                    <h2 class="font-poppins text-xl font-bold">{question.question}</h2>
                    <p class="text-sm font-light text-gray-600">
                      {question.category_name} - {question.question_type} - {question.difficulty}
                    </p>
                  </div>
                  <!-- EDIT QUESTION BUTTON -->
                  <button
                    class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
                    on:click={() => openEditQuestionModal(question)}
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
                  <!-- EDIT QUESTION  BUTTON -->
                  <!-- DELETE ROUND BUTTON -->
                  <button
                    class="btn p-1 m-0 w-auto min-h-12 font-bold bg-transparent border-none self-end flex-shrink-0"
                    on:click={() => openDeleteQuestionModal(question)}
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
                  <!-- DELETE QUESTION BUTTON -->
                </div>
              </div>
            {/each}
            <!-- QUESTION CONTENT -->

            <!-- ADD ANOTHER QUESTION -->
            {#if round.questions.length > 0}
              <div class="flex flex-col items-center justify-center gap-2">
                <p class="text-lg font-light">You can add more questions to this round.</p>
                <button
                  class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
                  on:click={() => openAddQuestionModal(round)}
                  class:btn-disabled={game_categories.length === 0 || submitLoading}
                  disabled={game_categories.length === 0 || submitLoading}
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
                  Add a question
                </button>
              </div>
            {/if}
            <!-- ADD ANOTHER QUESTION -->
          </div>
          <!-- QUESTIONS -->
        </div>
        <!-- ROUND CONTENT -->
        <!-- ORDER DOWN -->
        <button
          class="btn w-full border-none border-t rounded-none rounded-b-lg"
          class:btn-disabled={round_idx === rounds.length - 1 || submitLoading}
          disabled={round_idx === rounds.length - 1 || submitLoading}
          on:click={() => orderRound(round._id, "down")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 flex-shrink-0"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        <!-- ORDER DOWN -->
      </div>
    {/each}
    <!-- EACH ROUND -->

    <!-- ADD ANOTHER ROUND -->
    {#if rounds.length > 0}
      <div class="flex flex-col items-center justify-center gap-2 my-4">
        <p class="text-lg font-light">You can add more rounds to this game.</p>
        <button
          class="flex items-center gap-2 text-sm bg-white btn text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
          on:click={() => openAddRoundModal()}
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
          Add another round
        </button>
      </div>
    {/if}
    <!-- ADD ANOTHER ROUND -->
  </div>
  <!-- TRIVIA ROUNDS -->
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

<!-- ADD ROUND MODAL -->
<dialog class="modal" bind:this={addRoundModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Add Round</h3>
    <div class="flex flex-col gap-2">
      <span class="flex-shrink-0">Round Name:</span>
      <input
        bind:value={newRoundName}
        type="text"
        placeholder="Enter the name of your round"
        class="input input-bordered input-primary w-full"
      />
    </div>
    <div class="pt-4">
      <button
        class="btn bg-blue-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={addRound}
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
<!-- ADD ROUND MODAL -->

<!-- DELETE ROUND MODAL -->
<dialog class="modal" bind:this={deleteRoundModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Delete Round</h3>
    <div class="flex flex-col gap-2 items-center">
      <span class="text-sm text-red-600 font-bold uppercase">This action cannot be undone.</span>
      <span class="flex-shrink-0">Are you sure you want to delete this round?</span>
      <div class="flex flex-col gap-2 items-center py-4">
        <p class="font-bold text-3xl">{roundToDelete?.name}</p>
        {#if roundToDelete?.categories.length > 0}
          <p class="font-bold">with <b>{roundToDelete?.categories.length}</b> categories</p>
        {/if}
        {#if roundToDelete?.total_question_count > 0}
          <p class="font-bold">
            and also all <b>{roundToDelete?.total_question_count}</b> questions
          </p>
        {/if}
      </div>
    </div>
    <div class="pt-4">
      <button
        class="btn bg-red-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={deleteRound}
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
<!-- DELETE ROUND MODAL -->

<!-- ADD QUESTION CATEGORY MODAL -->
<dialog class="modal" bind:this={addCategoryModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg">Add Question Category</h3>
    <div class="p-4 flex flex-col gap-4 items-center">
      <!-- CHOOSE FROM EXISTING -->
      <span>Choose an existing category to add:</span>
      <div class="flex items-center gap-2">
        <!-- DROPDOWN -->
        <div class="dropdown dropdown-open">
          <div
            tabindex="0"
            role="button"
            class="btn p-0 m-1"
            on:keydown={() => {}}
            on:click={() => (selectedQuestionCategoryDropdownOpen = !selectedQuestionCategoryDropdownOpen)}
          >
            <div class="flex items-center gap-2">
              {#if !selectedQuestionCategoryToAdd}
                <input
                  type="text"
                  placeholder="Search a category"
                  class="input input-bordered input-primary w-full font-normal"
                  bind:value={existingCategorySearchString}
                  on:blur={() => {
                    selectedQuestionCategoryDropdownOpen = false;
                    existingCategorySearchString = "";
                  }}
                />
              {:else}
                <div
                  class="input input-bordered input-primary input-disabled w-full font-normal flex justify-between items-center pr-0 min-w-[218px]"
                >
                  {selectedQuestionCategoryToAdd.name}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="btn p-1 h-8 w-8 flex-shrink-0 text-gray-500"
                    on:keydown={() => {}}
                    on:click={() => (selectedQuestionCategoryToAdd = null)}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
              {/if}
            </div>
          </div>
          <ul
            tabindex="0"
            class:hidden={selectedQuestionCategoryToAdd || !selectedQuestionCategoryDropdownOpen}
            class="dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm max-h-40 overflow-y-scroll flex flex-col border-x border-b rounded-b-lg"
          >
            {#each question_categories as category, category_idx (category._id)}
              <li class="" class:border-t={category_idx > 0}>
                <span
                  class="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100"
                  on:keypress={() => {}}
                  on:click={() => (selectedQuestionCategoryToAdd = category)}
                >
                  <span>{category.name}</span>
                  {#if selectedQuestionCategoryToAdd === category._id}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6 flex-shrink-0 text-green-600"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                  {/if}
                </span>
              </li>
            {/each}
          </ul>
        </div>
        <!-- DROPDOWN -->
        <button
          class="self-end btn px-1 py-0 m-0 w-12 h-10 bg-green-600 text-white text-sm rounded-lg border-white"
          disabled={submitLoading || !selectedQuestionCategoryToAdd}
          class:btn-disabled={submitLoading || !selectedQuestionCategoryToAdd}
          on:click|stopPropagation={addExistingGameCategory}
        >
          ADD
        </button>
      </div>
      <!-- CHOOSE FROM EXISTING -->
      <span class="divider">OR</span>
      <!-- ADD YOUR OWN -->
      <span>Add your own:</span>
      <div class="flex items-center gap-2">
        <input
          type="text"
          class="input input-bordered input-primary"
          placeholder="New Category Name"
          bind:value={newCategoryName}
        />
        <button
          class="self-end btn px-1 py-0 m-0 w-12 h-10 bg-green-600 text-white text-sm rounded-lg border-white"
          disabled={submitLoading || !newCategoryName}
          class:btn-disabled={submitLoading || !newCategoryName}
          on:click={addNewGameCategory}
        >
          ADD
        </button>
      </div>
      <!-- ADD YOUR OWN -->
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
<!-- ADD QUESTION CATEGORY MODAL -->

<!-- DELETE CATEGORY MODAL -->
<dialog class="modal" bind:this={deleteCategoryModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Delete Category</h3>
    <div class="flex flex-col gap-2 items-center">
      <span class="text-sm text-red-600 font-bold uppercase">This action cannot be undone.</span>
      <span class="flex-shrink-0">Are you sure you want to delete this category?</span>
      <div class="flex flex-col gap-2 items-center py-4">
        <p class="font-bold text-3xl">{gameCategoryToDelete?.category_name}</p>
        {#if gameCategoryToDelete?.questions.length > 0}
          <p class="font-bold">with <b>{gameCategoryToDelete?.questions.length}</b> questions</p>
        {/if}
      </div>
    </div>
    <div class="pt-4">
      <button
        class="btn bg-red-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={deleteGameCategory}
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
<!-- DELETE CATEGORY MODAL -->

<!-- ADD QUESTION MODAL -->
<dialog class="modal" bind:this={addQuestionModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg">Add Question</h3>
    <!-- ADD QUESTION FORM -->
    <div class="p-4 flex flex-col gap-4 items-center">
      <!-- DIFFICULTY -->
      <div class="flex flex-col gap-2 w-full">
        <span class="flex-shrink-0">Category:</span>
        <select class="select select-bordered" on:change={(e) => (newQuestion.category_id = e.target.value)}>
          <option value="" disabled selected>Select a category</option>
          {#each game_categories as category (category._id)}
            <option selected={newQuestion.category_id === category._id} value={category._id}>
              {category.category_name}
            </option>
          {/each}
        </select>
      </div>
      <!-- DIFFICULTY -->
      <!-- QUESTION -->
      <div class="flex flex-col gap-2 w-full">
        <span class="flex-shrink-0">Question:</span>
        <input
          bind:value={newQuestion.question}
          type="text"
          placeholder="Enter the question"
          class="input input-bordered input-primary w-full"
        />
      </div>
      <!-- QUESTION -->
      <!-- QUESTION TYPE -->
      <div class="flex flex-col gap-2 w-full">
        <span class="flex-shrink-0">Question Type:</span>
        <select class="select select-bordered" on:change={(e) => (newQuestion.question_type = e.target.value)}>
          <option selected={newQuestion.question_type === "single_answer"} value="single_answer">Single Answer</option>
          <option selected={newQuestion.question_type === "multiple_choice"} value="multiple_choice">
            Multiple Choice
          </option>
          <option selected={newQuestion.question_type === "multiple_answer"} value="multiple_answer">
            Multiple Answer
          </option>
          <option selected={newQuestion.question_type === "sort_items"} value="sort_items">Sort Items</option>
          <option selected={newQuestion.question_type === "closest_guess"} value="closest_guess">Closest Guess</option>
        </select>
      </div>
      <!-- QUESTION TYPE -->
      <!-- ANSWERS -->
      {#if ["single_answer", "closest_guess"].includes(newQuestion.question_type)}
        <div class="flex flex-col gap-2 w-full">
          <span class="flex-shrink-0">Answer:</span>
          <input
            bind:value={newQuestion.answers[0].value}
            type="text"
            placeholder="Enter the answer"
            class="input input-bordered input-primary w-full"
          />
        </div>
      {:else if newQuestion.question_type === "multiple_choice"}
        <div class="flex flex-col gap-2 w-full">
          <span class="flex-shrink-0">Multiple Choice Options:</span>
          <div class="flex items-center gap-2 w-full justify-between">
            <span>Value</span>
            <span>Correct?</span>
          </div>
          {#each newQuestion.answers as answer, idx (`multiple-choice-${idx}`)}
            <div class="flex items-center gap-2 w-full justify-between">
              <input
                bind:value={newQuestion.answers[idx].value}
                type="text"
                placeholder="Enter the option"
                class="input input-bordered input-primary w-full"
              />
              <input
                type="checkbox"
                class="checkbox checkbox-info h-8 w-8 flex-shrink-0"
                bind:checked={newQuestion.answers[idx].correct}
                aria-checked={newQuestion.answers[idx].correct}
                on:change={() => {
                  // Ensure only one answer can be correct
                  if (newQuestion.answers[idx].correct) {
                    newQuestion.answers = [
                      ...newQuestion.answers.map((ans, i) => ({
                        ...ans,
                        correct: i === idx ? true : false,
                      })),
                    ];
                  }
                }}
              />
              <!-- DELETE MULTIPLE CHOICE OPTION -->
              <div
                class="btn btn-sm p-1 flex items-center justify-center flex-shrink-0 w-8 h-8"
                class:invisible={newQuestion.answers.length === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6 flex-shrink-0 text-gray-500"
                  on:keydown={() => {}}
                  on:click={() => {
                    newQuestion.answers = [...newQuestion.answers.filter((_, i) => i !== idx)];
                  }}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <!-- DELETE MULTIPLE CHOICE OPTION -->
            </div>
          {/each}
          <!-- ADD ANOTHER MULTIPLE CHOICE OPTION -->
          <div class="flex items-center w-full justify-center">
            <button
              class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
              on:click={() => (newQuestion.answers = [...newQuestion.answers, { value: "", correct: false }])}
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
              Add another option
            </button>
          </div>
          <!-- ADD ANOTHER MULTIPLE CHOICE OPTION -->
        </div>
      {:else if newQuestion.question_type === "multiple_answer"}
        <div class="flex flex-col gap-2 w-full">
          <div class="flex items-center gap-2 w-full justify-between">
            <span class="">Multiple Answers Options:</span>
            <div class="flex items-center gap-2">
              <span class="">Labels Required:</span>
              <input
                type="checkbox"
                class="checkbox checkbox-info h-6 w-6 flex-shrink-0"
                bind:checked={newQuestion.labels_required}
                aria-checked={newQuestion.labels_required}
              />
            </div>
          </div>
          <div class="flex items-center gap-2 w-full justify-between">
            {#if newQuestion.labels_required}
              <span>Label</span>
            {/if}
            <span>Answer</span>
          </div>
          <!-- MULTIPLE ANSWER OPTIONS -->
          {#each newQuestion.answers as answer, idx (`multiple-answer-${idx}`)}
            <div class="flex items-center gap-2 w-full justify-between">
              {#if newQuestion.labels_required}
                <input
                  bind:value={newQuestion.answers[idx].label}
                  type="text"
                  placeholder="Label the answer"
                  class="input input-bordered input-primary w-full"
                />
              {/if}
              <input
                bind:value={newQuestion.answers[idx].value}
                type="text"
                placeholder="Enter the answer"
                class="input input-bordered input-primary w-full"
              />
              <!-- DELETE MULTIPLE ANSWER OPTION -->
              <div
                class="btn btn-sm p-1 flex items-center justify-center flex-shrink-0 w-8 h-8"
                class:invisible={newQuestion.answers.length === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6 flex-shrink-0 text-gray-500"
                  on:keydown={() => {}}
                  on:click={() => {
                    newQuestion.answers = [...newQuestion.answers.filter((_, i) => i !== idx)];
                  }}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <!-- DELETE MULTIPLE ANSWER OPTION -->
            </div>
          {/each}
          <!-- MULTIPLE ANSWER OPTIONS -->
          <!-- ADD ANOTHER MULTIPLE ANSWER OPTION -->
          <div class="flex items-center w-full justify-center">
            <button
              class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
              on:click={() => (newQuestion.answers = [...newQuestion.answers, { label: "", value: "" }])}
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
              Add another option
            </button>
          </div>
          <!-- ADD ANOTHER MULTIPLE ANSWER OPTION -->
        </div>
      {:else if newQuestion.question_type === "sort_items"}
        <div class="flex flex-col gap-2 w-full">
          <span class="flex-shrink-0">Sort Items Options:</span>
          <div class="flex items-center gap-2 w-full justify-between">
            <span>Label</span>
            <span>Order</span>
          </div>
          <!-- SORT ITEMS OPTIONS -->
          {#each newQuestion.answers as answer, idx (`sort-items-${idx}`)}
            <div class="flex items-center gap-2 w-full justify-between">
              <input
                bind:value={newQuestion.answers[idx].value}
                type="text"
                placeholder="Enter the answer"
                class="input input-bordered input-primary w-full"
              />
              <div class="flex flex-col items-center">
                <div class="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
                  {idx + 1}
                </div>
              </div>
              <!-- DELETE SORT ITEM OPTION -->
              <div
                class="btn btn-sm p-1 flex items-center justify-center flex-shrink-0 w-8 h-8"
                class:invisible={newQuestion.answers.length === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-6 w-6 flex-shrink-0 text-gray-500"
                  on:keydown={() => {}}
                  on:click={() => {
                    newQuestion.answers = [...newQuestion.answers.filter((_, i) => i !== idx)];
                  }}
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
              <!-- DELETE SORT ITEM OPTION -->
            </div>
          {/each}
          <!-- SORT ITEMS OPTIONS -->
          <!-- ADD ANOTHER SORT LABEL OPTION -->
          <div class="flex items-center w-full justify-center">
            <button
              class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
              on:click={() =>
                (newQuestion.answers = [
                  ...newQuestion.answers,
                  { label: "", value: "", order: newQuestion.answers.length + 1 },
                ])}
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
              Add another item
            </button>
          </div>
          <!-- ADD ANOTHER SORT LABEL ANSWER OPTION -->
        </div>
      {/if}
      <!-- ANSWERS -->
      <!-- DIFFICULTY -->
      <div class="flex flex-col gap-2 w-full">
        <span class="flex-shrink-0">Difficulty:</span>
        <select class="select select-bordered" on:change={(e) => (newQuestion.difficulty = e.target.value)}>
          <option selected={newQuestion.difficulty === "Easy"} value="Easy">Easy</option>
          <option selected={newQuestion.difficulty === "Medium"} value="Medium">Medium</option>
          <option selected={newQuestion.difficulty === "Hard"} value="Hard">Hard</option>
        </select>
      </div>
      <!-- DIFFICULTY -->
    </div>
    <!-- ADD QUESTION FORM -->
    <!-- CONFIRM BUTTON -->
    <div class="pt-4">
      <button
        class="btn bg-blue-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={() => saveQuestion()}
      >
        Add Question
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
    <!-- CONFIRM BUTTON -->
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
<!-- ADD QUESTION MODAL -->

<!-- EDIT QUESTION MODAL -->
<dialog class="modal" bind:this={editQuestionModal}>
  {#if questionToEdit}
    <div class="modal-box border border-black">
      <h3 class="font-bold text-lg">Edit Question</h3>
      <!-- ADD QUESTION FORM -->
      <div class="p-4 flex flex-col gap-4 items-center">
        <!-- DIFFICULTY -->
        <div class="flex flex-col gap-2 w-full">
          <span class="flex-shrink-0">Category:</span>
          <select class="select select-bordered" on:change={(e) => (questionToEdit.category_id = e.target.value)}>
            <option value="" disabled selected>Select a category</option>
            {#each game_categories as category (category._id)}
              <option selected={questionToEdit.category_id === category._id} value={category._id}>
                {category.category_name}
              </option>
            {/each}
          </select>
        </div>
        <!-- DIFFICULTY -->
        <!-- QUESTION -->
        <div class="flex flex-col gap-2 w-full">
          <span class="flex-shrink-0">Question:</span>
          <input
            bind:value={questionToEdit.question}
            type="text"
            placeholder="Enter the question"
            class="input input-bordered input-primary w-full"
          />
        </div>
        <!-- QUESTION -->
        <!-- QUESTION TYPE -->
        <div class="flex flex-col gap-2 w-full">
          <span class="flex-shrink-0">Question Type:</span>
          <select class="select select-bordered" on:change={(e) => (questionToEdit.question_type = e.target.value)}>
            <option selected={questionToEdit.question_type === "single_answer"} value="single_answer"
              >Single Answer</option
            >
            <option selected={questionToEdit.question_type === "multiple_choice"} value="multiple_choice">
              Multiple Choice
            </option>
            <option selected={questionToEdit.question_type === "multiple_answer"} value="multiple_answer">
              Multiple Answer
            </option>
            <option selected={questionToEdit.question_type === "sort_items"} value="sort_items">Sort Items</option>
            <option selected={questionToEdit.question_type === "closest_guess"} value="closest_guess"
              >Closest Guess</option
            >
          </select>
        </div>
        <!-- QUESTION TYPE -->
        <!-- ANSWERS -->
        {#if ["single_answer", "closest_guess"].includes(questionToEdit.question_type)}
          <div class="flex flex-col gap-2 w-full">
            <span class="flex-shrink-0">Answer:</span>
            <input
              bind:value={questionToEdit.answers[0].value}
              type="text"
              placeholder="Enter the answer"
              class="input input-bordered input-primary w-full"
            />
          </div>
        {:else if questionToEdit.question_type === "multiple_choice"}
          <div class="flex flex-col gap-2 w-full">
            <span class="flex-shrink-0">Multiple Choice Options:</span>
            <div class="flex items-center gap-2 w-full justify-between">
              <span>Value</span>
              <span>Correct?</span>
            </div>
            {#each questionToEdit.answers as answer, idx (`multiple-choice-${idx}`)}
              <div class="flex items-center gap-2 w-full justify-between">
                <input
                  bind:value={questionToEdit.answers[idx].value}
                  type="text"
                  placeholder="Enter the option"
                  class="input input-bordered input-primary w-full"
                />
                <input
                  type="checkbox"
                  class="checkbox checkbox-info h-8 w-8 flex-shrink-0"
                  bind:checked={questionToEdit.answers[idx].correct}
                  aria-checked={questionToEdit.answers[idx].correct}
                  on:change={() => {
                    // Ensure only one answer can be correct
                    if (questionToEdit.answers[idx].correct) {
                      questionToEdit.answers = [
                        ...questionToEdit.answers.map((ans, i) => ({
                          ...ans,
                          correct: i === idx ? true : false,
                        })),
                      ];
                    }
                  }}
                />
                <!-- DELETE MULTIPLE CHOICE OPTION -->
                <div
                  class="btn btn-sm p-1 flex items-center justify-center flex-shrink-0 w-8 h-8"
                  class:invisible={questionToEdit.answers.length === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-6 w-6 flex-shrink-0 text-gray-500"
                    on:keydown={() => {}}
                    on:click={() => {
                      questionToEdit.answers = [...questionToEdit.answers.filter((_, i) => i !== idx)];
                    }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <!-- DELETE MULTIPLE CHOICE OPTION -->
              </div>
            {/each}
            <!-- ADD ANOTHER MULTIPLE CHOICE OPTION -->
            <div class="flex items-center w-full justify-center">
              <button
                class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
                on:click={() => (questionToEdit.answers = [...questionToEdit.answers, { value: "", correct: false }])}
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
                Add another option
              </button>
            </div>
            <!-- ADD ANOTHER MULTIPLE CHOICE OPTION -->
          </div>
        {:else if questionToEdit.question_type === "multiple_answer"}
          <div class="flex flex-col gap-2 w-full">
            <div class="flex items-center gap-2 w-full justify-between">
              <span class="">Multiple Answers Options:</span>
              <div class="flex items-center gap-2">
                <span class="">Labels Required:</span>
                <input
                  type="checkbox"
                  class="checkbox checkbox-info h-6 w-6 flex-shrink-0"
                  bind:checked={questionToEdit.labels_required}
                  aria-checked={questionToEdit.labels_required}
                />
              </div>
            </div>
            <div class="flex items-center gap-2 w-full justify-between">
              {#if questionToEdit.labels_required}
                <span>Label</span>
              {/if}
              <span>Answer</span>
            </div>
            <!-- MULTIPLE ANSWER OPTIONS -->
            {#each questionToEdit.answers as answer, idx (`multiple-answer-${idx}`)}
              <div class="flex items-center gap-2 w-full justify-between">
                {#if questionToEdit.labels_required}
                  <input
                    bind:value={questionToEdit.answers[idx].label}
                    type="text"
                    placeholder="Label the answer"
                    class="input input-bordered input-primary w-full"
                  />
                {/if}
                <input
                  bind:value={questionToEdit.answers[idx].value}
                  type="text"
                  placeholder="Enter the answer"
                  class="input input-bordered input-primary w-full"
                />
                <!-- DELETE MULTIPLE ANSWER OPTION -->
                <div
                  class="btn btn-sm p-1 flex items-center justify-center flex-shrink-0 w-8 h-8"
                  class:invisible={questionToEdit.answers.length === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-6 w-6 flex-shrink-0 text-gray-500"
                    on:keydown={() => {}}
                    on:click={() => {
                      questionToEdit.answers = [...questionToEdit.answers.filter((_, i) => i !== idx)];
                    }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <!-- DELETE MULTIPLE ANSWER OPTION -->
              </div>
            {/each}
            <!-- MULTIPLE ANSWER OPTIONS -->
            <!-- ADD ANOTHER MULTIPLE ANSWER OPTION -->
            <div class="flex items-center w-full justify-center">
              <button
                class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
                on:click={() => (questionToEdit.answers = [...questionToEdit.answers, { label: "", value: "" }])}
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
                Add another option
              </button>
            </div>
            <!-- ADD ANOTHER MULTIPLE ANSWER OPTION -->
          </div>
        {:else if questionToEdit.question_type === "sort_items"}
          <div class="flex flex-col gap-2 w-full">
            <span class="flex-shrink-0">Sort Items Options:</span>
            <div class="flex items-center gap-2 w-full justify-between">
              <span>Label</span>
              <span>Order</span>
            </div>
            <!-- SORT ITEMS OPTIONS -->
            {#each questionToEdit.answers as answer, idx (`sort-items-${idx}`)}
              <div class="flex items-center gap-2 w-full justify-between">
                <input
                  bind:value={questionToEdit.answers[idx].value}
                  type="text"
                  placeholder="Enter the answer"
                  class="input input-bordered input-primary w-full"
                />
                <div class="flex flex-col items-center">
                  <div class="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
                    {idx + 1}
                  </div>
                </div>
                <!-- DELETE SORT ITEM OPTION -->
                <div
                  class="btn btn-sm p-1 flex items-center justify-center flex-shrink-0 w-8 h-8"
                  class:invisible={questionToEdit.answers.length === 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-6 w-6 flex-shrink-0 text-gray-500"
                    on:keydown={() => {}}
                    on:click={() => {
                      questionToEdit.answers = [...questionToEdit.answers.filter((_, i) => i !== idx)];
                    }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <!-- DELETE SORT ITEM OPTION -->
              </div>
            {/each}
            <!-- SORT ITEMS OPTIONS -->
            <!-- ADD ANOTHER SORT LABEL OPTION -->
            <div class="flex items-center w-full justify-center">
              <button
                class="flex items-center gap-2 text-sm bg-white btn btn-sm text-left shadow-sm border-2 border-blue-400 text-blue-400 hover:text-white hover:bg-blue-400"
                on:click={() =>
                  (questionToEdit.answers = [
                    ...questionToEdit.answers,
                    { label: "", value: "", order: questionToEdit.answers.length + 1 },
                  ])}
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
                Add another item
              </button>
            </div>
            <!-- ADD ANOTHER SORT LABEL ANSWER OPTION -->
          </div>
        {/if}
        <!-- ANSWERS -->
        <!-- DIFFICULTY -->
        <div class="flex flex-col gap-2 w-full">
          <span class="flex-shrink-0">Difficulty:</span>
          <select class="select select-bordered" on:change={(e) => (questionToEdit.difficulty = e.target.value)}>
            <option selected={questionToEdit.difficulty === "Easy"} value="Easy">Easy</option>
            <option selected={questionToEdit.difficulty === "Medium"} value="Medium">Medium</option>
            <option selected={questionToEdit.difficulty === "Hard"} value="Hard">Hard</option>
          </select>
        </div>
        <!-- DIFFICULTY -->
      </div>
      <!-- ADD QUESTION FORM -->
      <!-- CONFIRM BUTTON -->
      <div class="pt-4">
        <button
          class="btn bg-blue-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
          disabled={submitLoading}
          on:click={() => editQuestion()}
        >
          Edit Question
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
      <!-- CONFIRM BUTTON -->
    </div>
  {/if}
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
<!-- ADD QUESTION MODAL -->

<!-- DELETE QUESTION MODAL -->
<dialog class="modal" bind:this={deleteQuestionModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg mb-4">Delete Question</h3>
    <div class="flex flex-col gap-2 items-center">
      <span class="text-sm text-red-600 font-bold uppercase">This action cannot be undone.</span>
      <span class="flex-shrink-0">Are you sure you want to delete this question?</span>
      <div class="flex flex-col gap-2 items-center py-4 px-2 text-center">
        <p class="font-bold text-2xl">{questionToDelete?.question}</p>
        <p class="text-xl font-light text-gray-600">
          {questionToDelete?.category_name} - {questionToDelete?.question_type} - {questionToDelete?.difficulty}
        </p>
      </div>
    </div>
    <div class="pt-4">
      <button
        class="btn bg-red-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        disabled={submitLoading}
        on:click={deleteQuestion}
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
<!-- DELETE QUESTION MODAL -->
