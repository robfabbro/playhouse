import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import _ from "lodash";
import {
  TriviaGameCollection,
  TriviaQuestionCategoryCollection,
  TriviaGameCategoryCollection,
  TriviaRoundCollection,
  TriviaQuestionCollection,
  TriviaTeamCollection,
  TriviaAnswerCollection,
} from "/imports/api/trivia/collections";

Meteor.methods({
  "trivia.new_game"(name) {
    let code = Random.id(4);
    let admin_code = Random.id(4);
    let id = TriviaGameCollection.insert({
      name: name.toLowerCase(),
      code: code.toLowerCase(),
      admin_code: admin_code.toLowerCase(),
      sort_mode: "category",
      ready: false,
    });
    return id;
  },
  "trivia.toggleGameReady"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("trivia.updateGameSortMode", "No game_id provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.updateGameSortMode", "Game not found");
    }

    TriviaGameCollection.update({ _id: game_id }, { $set: { ready: !game?.ready } });
  },
  "trivia.updateGameSortMode"(game_id, sort_mode) {
    if (!game_id) {
      throw new Meteor.Error("trivia.updateGameSortMode", "No game_id provided");
    }
    if (!sort_mode) {
      throw new Meteor.Error("trivia.updateGameSortMode", "No sort_mode provided");
    }
    if (!["category", "difficulty", "random"].includes(sort_mode)) {
      throw new Meteor.Error("trivia.updateGameSortMode", "Invalid sort mode provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.updateGameSortMode", "Game not found");
    }

    TriviaGameCollection.update({ _id: game_id }, { $set: { sort_mode: sort_mode } });
  },
  "trivia.addRound"(game_id, round_name) {
    if (!game_id) {
      throw new Meteor.Error("trivia.updateGameSortMode", "No game_id provided");
    }
    if (!round_name) {
      throw new Meteor.Error("trivia.addRound", "No round_name provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.updateGameSortMode", "Game not found");
    }

    const existing_rounds = TriviaRoundCollection.find({ game_id }).fetch();

    TriviaRoundCollection.insert({
      game_id,
      game_name: game.name,
      name: round_name,
      sort_mode: "order",
      order: existing_rounds.length + 1,
    });
  },
  "trivia.saveRoundName"(round_id, round_name) {
    if (!round_id) {
      throw new Meteor.Error("trivia.saveRoundName", "No round_id provided");
    }

    if (!round_name) {
      throw new Meteor.Error("trivia.addRound", "No round_name provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("trivia.saveRoundName", "Round not found");
    }

    TriviaRoundCollection.update({ _id: round_id }, { $set: { name: round_name, edit_name: false } });
  },
  "trivia.deleteRound"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("trivia.deleteRound", "No round_id provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("trivia.deleteRound", "Round not found");
    }

    TriviaRoundCollection.remove({ _id: round_id });
  },
  "trivia.orderRound"(round_id, order_direction: "up" | "down") {
    if (!round_id) {
      throw new Meteor.Error("trivia.orderRound", "No round_id provided");
    }

    if (!["up", "down"].includes(order_direction)) {
      throw new Meteor.Error("trivia.orderRound", "Invalid order direction provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });
    const game_id = round?.game_id;

    if (!round) {
      throw new Meteor.Error("trivia.orderRound", "Round not found");
    }

    // Step 1: get current order and calculate new order
    const current_order = round.order;
    const all_rounds = TriviaRoundCollection.find({ game_id }, { sort: { order: 1 } }).fetch();
    const new_order =
      order_direction === "up" ? current_order - 1 || 0 : Math.min(current_order + 1, all_rounds.length);

    // Step 2: update the round with the new order, with the current order
    TriviaRoundCollection.update({ game_id, order: new_order }, { $set: { order: current_order } });

    // Step 3: update the round with the new order
    TriviaRoundCollection.update({ _id: round_id }, { $set: { order: new_order } });
  },
  "trivia.addNewGameCategory"(game_id, new_category_name) {
    if (!game_id) {
      throw new Meteor.Error("trivia.addNewGameCategory", "No game_id provided");
    }

    if (!new_category_name) {
      throw new Meteor.Error("trivia.addNewGameCategory", "Invalid new_category_name provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.addNewGameCategory", "Game not found");
    }

    // Step 1: Check if the category already exists
    const existing_category = TriviaQuestionCategoryCollection.findOne({
      name: new_category_name.toUpperCase(),
    });

    // Step 2: If is already exists, use the existing category, and add it to the game categories
    if (existing_category) {
      TriviaGameCategoryCollection.insert({
        game_id: game._id,
        game_name: game.name,
        category_id: existing_category._id,
        category_name: existing_category.name,
      });
      return existing_category._id;
    } else {
      // Step 3: If it does not exist, create a new category and add it to the game categories
      const new_category_id = TriviaQuestionCategoryCollection.insert({
        name: new_category_name,
        is_custom: true,
        created_at: new Date(),
      });

      TriviaGameCategoryCollection.insert({
        game_id: game._id,
        game_name: game.name,
        category_id: new_category_id,
        category_name: new_category_name,
      });

      return new_category_id;
    }
  },
  "trivia.addExistingGameCategory"(game_id, existing_category_id) {
    if (!game_id) {
      throw new Meteor.Error("trivia.addNewGameCategory", "No game_id provided");
    }

    if (!existing_category_id) {
      throw new Meteor.Error("trivia.addNewGameCategory", "Invalid new_category_name provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.addNewGameCategory", "Game not found");
    }

    // Step 1: Check if the category already exists
    const existing_category = TriviaQuestionCategoryCollection.findOne({
      _id: existing_category_id,
    });

    // Step 2: If is already exists, use the existing category, and add it to the game categories
    if (!existing_category) {
      throw new Meteor.Error("trivia.addExistingGameCategory", "Category not found");
    }

    TriviaGameCategoryCollection.insert({
      game_id: game._id,
      game_name: game.name,
      category_id: existing_category._id,
      category_name: existing_category.name,
    });
  },
  "trivia.saveCategoryName"(category_id, category_name) {
    if (!category_id) {
      throw new Meteor.Error("trivia.saveCategoryName", "No category_id provided");
    }

    if (!category_name) {
      throw new Meteor.Error("trivia.saveCategoryName", "No category_name provided");
    }

    const category = TriviaGameCategoryCollection.findOne({ _id: category_id });

    if (!category) {
      throw new Meteor.Error("trivia.saveCategoryName", "Category not found");
    }

    const existing_question_category = TriviaQuestionCategoryCollection.findOne({ _id: category.category_id });

    TriviaGameCategoryCollection.update({ _id: category_id }, { $set: { category_name: category_name } });
    TriviaQuestionCategoryCollection.update({ _id: existing_question_category._id }, { $set: { name: category_name } });
    TriviaQuestionCollection.update(
      { category_id: category_id },
      { $set: { category_name: category_name } },
      { multi: true }
    );
  },
  "trivia.deleteGameCategory"(category_id) {
    if (!category_id) {
      throw new Meteor.Error("trivia.deleteGameCategory", "No category_id provided");
    }

    const category = TriviaGameCategoryCollection.findOne({ _id: category_id });

    if (!category) {
      throw new Meteor.Error("trivia.deleteGameCategory", "Round not found");
    }

    TriviaGameCategoryCollection.remove({ _id: category_id });
  },
  "trivia.saveQuestion"(questionData) {
    const game_id = questionData.game_id;
    if (!game_id) {
      throw new Meteor.Error("trivia.saveQuestion", "No game_id provided");
    }
    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.saveQuestion", "Game not found");
    }

    const round_id = questionData.round_id;
    if (!round_id) {
      throw new Meteor.Error("trivia.saveQuestion", "No round_id provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });
    if (!round) {
      throw new Meteor.Error("trivia.saveQuestion", "Round not found");
    }
    const category_id = questionData.category_id;
    if (!category_id) {
      throw new Meteor.Error("trivia.saveQuestion", "No category_id provided");
    }
    const category = TriviaGameCategoryCollection.findOne({
      _id: category_id,
      game_id: game._id,
    });
    if (!category) {
      throw new Meteor.Error("trivia.saveQuestion", "Category not found");
    }

    if (!questionData.question) {
      throw new Meteor.Error("trivia.saveQuestion", "No question provided");
    }

    if (questionData.answers.some((a) => !a.value)) {
      throw new Meteor.Error("trivia.saveQuestion", "Not all answers have a value");
    }

    if (
      ["multiple_answer", "multiple_choice", "sort_items"].includes(questionData.question_type) &&
      questionData.answers.length <= 1
    ) {
      throw new Meteor.Error(
        "trivia.saveQuestion",
        `${questionData.question_type} questions must have at least 2 answers`
      );
    }

    if (
      questionData.question_type == "multiple_answer" &&
      questionData.labels_required &&
      questionData.answers.some((a) => !a.label)
    ) {
      throw new Meteor.Error("trivia.saveQuestion", "Multiple answer questions must have labels for all answers");
    }

    if (questionData.question_type == "multiple_choice" && questionData.answers.filter((a) => a.correct).length != 1) {
      throw new Meteor.Error("trivia.saveQuestion", "Multiple choice questions must have exactly one correct answer");
    }

    let current_questions = TriviaQuestionCollection.find({
      game_id: game._id,
      round_id: round._id,
    }).count();

    TriviaQuestionCollection.insert({
      ...questionData,
      category_name: category.category_name,
      order: current_questions + 1,
    });
  },
  "trivia.orderQuestion"(question_id, order_direction: "up" | "down") {
    if (!question_id) {
      throw new Meteor.Error("trivia.orderQuestion", "No question_id provided");
    }

    if (!["up", "down"].includes(order_direction)) {
      throw new Meteor.Error("trivia.orderQuestion", "Invalid order direction provided");
    }

    const question = TriviaQuestionCollection.findOne({ _id: question_id });
    const game_id = question?.game_id;
    const round_id = question?.round_id;

    if (!question) {
      throw new Meteor.Error("trivia.orderQuestion", "question not found");
    }

    // Step 1: get current order and calculate new order
    const current_order = question.order;
    const all_questions = TriviaQuestionCollection.find({ game_id, round_id }, { sort: { order: 1 } }).fetch();
    const new_order =
      order_direction === "up" ? current_order - 1 || 0 : Math.min(current_order + 1, all_questions.length);

    // Step 2: update the question with the new order, with the current order
    TriviaQuestionCollection.update({ game_id, order: new_order }, { $set: { order: current_order } });

    // Step 3: update the question with the new order
    TriviaQuestionCollection.update({ _id: question_id }, { $set: { order: new_order } });
  },
  "trivia.randomiseQuestionOrder"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("trivia.orderRound", "No round_id provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });
    const game_id = round?.game_id;

    if (!round) {
      throw new Meteor.Error("trivia.orderRound", "Round not found");
    }

    const all_questions = TriviaQuestionCollection.find({ game_id, round_id }, { sort: { order: 1 } })
      .fetch()
      .map((q) => q._id);
    const shuffled_questions = _.shuffle(all_questions);
    for (let question_index in shuffled_questions) {
      const question_id = shuffled_questions[question_index];
      TriviaQuestionCollection.update({ _id: question_id }, { $set: { order: parseInt(question_index) + 1 } });
    }
  },
  "trivia.editQuestion"(questionData) {
    const question_id = questionData._id;
    if (!question_id) {
      throw new Meteor.Error("trivia.editQuestion", "No question_id provided");
    }
    const question = TriviaQuestionCollection.findOne({ _id: question_id });
    if (!question) {
      throw new Meteor.Error("trivia.editQuestion", "Question not found");
    }

    const game_id = questionData.game_id;
    if (!game_id) {
      throw new Meteor.Error("trivia.editQuestion", "No game_id provided");
    }
    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.editQuestion", "Game not found");
    }

    const round_id = questionData.round_id;
    if (!round_id) {
      throw new Meteor.Error("trivia.editQuestion", "No round_id provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });
    if (!round) {
      throw new Meteor.Error("trivia.editQuestion", "Round not found");
    }
    const category_id = questionData.category_id;
    if (!category_id) {
      throw new Meteor.Error("trivia.editQuestion", "No category_id provided");
    }
    const category = TriviaGameCategoryCollection.findOne({
      _id: category_id,
      game_id: game._id,
    });
    if (!category) {
      throw new Meteor.Error("trivia.editQuestion", "Category not found");
    }

    if (!questionData.question) {
      throw new Meteor.Error("trivia.editQuestion", "No question provided");
    }

    if (questionData.answers.some((a) => !a.value)) {
      throw new Meteor.Error("trivia.editQuestion", "Not all answers have a value");
    }

    if (
      ["multiple_answer", "multiple_choice", "sort_items"].includes(questionData.question_type) &&
      questionData.answers.length <= 1
    ) {
      throw new Meteor.Error(
        "trivia.editQuestion",
        `${questionData.question_type} questions must have at least 2 answers`
      );
    }

    if (
      questionData.question_type == "multiple_answer" &&
      questionData.labels_required &&
      questionData.answers.some((a) => !a.label)
    ) {
      throw new Meteor.Error("trivia.editQuestion", "Multiple answer questions must have labels for all answers");
    }

    if (questionData.question_type == "multiple_choice" && questionData.answers.filter((a) => a.correct).length != 1) {
      throw new Meteor.Error("trivia.editQuestion", "Multiple choice questions must have exactly one correct answer");
    }

    TriviaQuestionCollection.update(
      { _id: question_id },
      {
        ...questionData,
      }
    );
  },
  "trivia.deleteQuestion"(question_id) {
    if (!question_id) {
      throw new Meteor.Error("trivia.deleteQuestion", "No question_id provided");
    }

    const category = TriviaQuestionCollection.findOne({ _id: question_id });

    if (!category) {
      throw new Meteor.Error("trivia.deleteQuestion", "Question not found");
    }

    TriviaQuestionCollection.remove({ _id: question_id });
  },
  "trivia.addTeam"(game_id, new_team) {
    if (!game_id) {
      throw new Meteor.Error("trivia.addTeam", "No game_id provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.addTeam", "Game not found");
    }

    if (!new_team || !new_team.name) {
      throw new Meteor.Error("trivia.addTeam", "No team name provided");
    }

    let team_code = Random.id(4);

    TriviaTeamCollection.insert({
      game_id: game._id,
      name: new_team.name,
      team_code: team_code.toLowerCase(),
      players: new_team.players || [],
    });
  },
  "trivia.editTeam"(team) {
    const game_id = team.game_id;

    if (!game_id) {
      throw new Meteor.Error("trivia.editTeam", "No game_id provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.editTeam", "Game not found");
    }

    const team_id = team._id;

    if (!team_id) {
      throw new Meteor.Error("trivia.editTeam", "No team _id provided");
    }

    if (!team.name) {
      throw new Meteor.Error("trivia.editTeam", "No team name provided");
    }

    const existing_team = TriviaTeamCollection.findOne({ _id: team_id });

    if (!existing_team) {
      throw new Meteor.Error("trivia.editTeam", "Team not found");
    }

    TriviaTeamCollection.update(
      { _id: team_id },
      {
        $set: {
          name: team.name,
          players: team.players || [],
        },
      }
    );
  },
  "trivia.deleteTeam"(team_id) {
    if (!team_id) {
      throw new Meteor.Error("trivia.deleteTeam", "No team_id provided");
    }

    const team = TriviaTeamCollection.findOne({ _id: team_id });

    if (!team) {
      throw new Meteor.Error("trivia.deleteTeam", "Team not found");
    }

    TriviaTeamCollection.remove({ _id: team_id });
  },
  "trivia.startRound"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("trivia.deleteRound", "No round_id provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("trivia.deleteRound", "Round not found");
    }

    const game_id = round.game_id;

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.startRound", "Game not found");
    }

    TriviaRoundCollection.update({ _id: round_id }, { $set: { started: true, started_at: new Date(), current: true } });
    TriviaRoundCollection.update(
      { _id: { $ne: round_id }, game_id: game_id },
      { $set: { current: false } },
      { multi: true }
    );

    TriviaQuestionCollection.update({ round_id: round_id, order: 1 }, { $set: { current: true } });
    TriviaGameCollection.update(
      { _id: game_id },
      { $set: { current_round: round?.order, current_question: 1, started: true, started_at: new Date() } }
    );
  },
  "trivia.selectMultipleChoiceAnswer"(team_id, question_id, answer) {
    if (!team_id) {
      throw new Meteor.Error("trivia.selectMultipleChoiceAnswer", "No team_id provided");
    }
    if (!question_id) {
      throw new Meteor.Error("trivia.selectMultipleChoiceAnswer", "No question_id provided");
    }
    if (!answer || !answer.value) {
      throw new Meteor.Error("trivia.selectMultipleChoiceAnswer", "No answer provided");
    }

    const team = TriviaTeamCollection.findOne({ _id: team_id });
    if (!team) {
      throw new Meteor.Error("trivia.selectMultipleChoiceAnswer", "Team not found");
    }

    const game_id = team.game_id;
    if (!game_id) {
      throw new Meteor.Error("trivia.selectMultipleChoiceAnswer", "No game_id provided");
    }

    const game = TriviaGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("trivia.selectMultipleChoiceAnswer", "Game not found");
    }

    const question = TriviaQuestionCollection.findOne({ _id: question_id });
    if (!question) {
      throw new Meteor.Error("trivia.selectMultipleChoiceAnswer", "Question not found");
    }

    TriviaAnswerCollection.upsert(
      { team_id, question_id, game_id },
      {
        $set: { answer: answer, team_name: team.name, question: question.question },
      }
    );
  },
  "trivia.toggleRevealAnswer"(question_id) {
    if (!question_id) {
      throw new Meteor.Error("trivia.toggleRevealAnswer", "No question_id provided");
    }

    const question = TriviaQuestionCollection.findOne({ _id: question_id });
    if (!question) {
      throw new Meteor.Error("trivia.toggleRevealAnswer", "Question not found");
    }

    let teams = TriviaTeamCollection.find({ game_id: question.game_id }).fetch();
    if (question.question_type === "multiple_choice" && !question.revealed) {
      for (let team of teams) {
        const answer = TriviaAnswerCollection.findOne({ team_id: team._id, question_id: question_id });
        if (!answer) {
          TriviaAnswerCollection.insert({
            team_id: team._id,
            question_id: question_id,
            team_name: team.name,
            game_id: question.game_id,
            answer: {},
            correct: false,
          });
        } else {
          let correct_answer = question.answers.find((a) => a.correct);

          TriviaAnswerCollection.update(
            { team_id: team._id, question_id: question_id },
            { $set: { correct: answer.answer.value === correct_answer.value } }
          );

          if (answer.answer.value === correct_answer.value) {
            TriviaTeamCollection.update(
              { _id: team._id },
              {
                $set: {
                  score: (team.score || 0) + 1,
                },
              }
            );
          }
        }
      }
    } else if (question.question_type === "multiple_choice") {
      for (let team of teams) {
        const answer = TriviaAnswerCollection.findOne({ team_id: team._id, question_id: question_id });
        if (answer && answer.correct) {
          TriviaTeamCollection.update(
            { _id: team._id },
            {
              $set: {
                score: (team.score || 0) - 1,
              },
            }
          );
        }
      }
    }

    TriviaQuestionCollection.update({ _id: question_id }, { $set: { revealed: !question.revealed } });
  },
  "trivia.nextQuestion"(question_id) {
    if (!question_id) {
      throw new Meteor.Error("trivia.toggleRevealAnswer", "No question_id provided");
    }

    const question = TriviaQuestionCollection.findOne({ _id: question_id });
    if (!question) {
      throw new Meteor.Error("trivia.toggleRevealAnswer", "Question not found");
    }

    TriviaQuestionCollection.update({ _id: question_id }, { $set: { completed: true, current: false } });

    TriviaQuestionCollection.update(
      { round_id: question.round_id, order: question.order + 1 },
      { $set: { current: true } }
    );
    TriviaGameCollection.update({ _id: question.game_id }, { $set: { current_question: question.order + 1 } });
  },
  "trivia.previousQuestion"(question_id) {
    if (!question_id) {
      throw new Meteor.Error("trivia.toggleRevealAnswer", "No question_id provided");
    }

    const question = TriviaQuestionCollection.findOne({ _id: question_id });
    if (!question) {
      throw new Meteor.Error("trivia.toggleRevealAnswer", "Question not found");
    }

    TriviaQuestionCollection.update({ _id: question_id }, { $set: { completed: false, current: false } });

    TriviaQuestionCollection.update(
      { round_id: question.round_id, order: question.order - 1 },
      { $set: { current: true } }
    );
    TriviaGameCollection.update({ _id: question.game_id }, { $set: { current_question: question.order - 1 } });
  },
  "trivia.resetGame"(game_id) {
    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.startRound", "Game not found");
    }

    TriviaRoundCollection.update(
      { game_id: game_id },
      { $set: { started: false, started_at: null, current: false, completed: false } },
      { multi: true }
    );
    TriviaQuestionCollection.update(
      { game_id: game_id },
      { $set: { current: false, revealed: false, completed: false } },
      { multi: true }
    );
    TriviaGameCollection.update(
      { _id: game_id },
      { $set: { current_round: 1, current_question: 1, started: false, started_at: null } }
    );
    TriviaAnswerCollection.remove({ game_id: game_id });
    TriviaTeamCollection.update({ game_id: game_id }, { $set: { score: 0 } }, { multi: true });
  },
  "trivia.completeRound"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("trivia.completeRound", "No round_id provided");
    }

    const round = TriviaRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("trivia.completeRound", "Round not found");
    }

    const game_id = round.game_id;

    const game = TriviaGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("trivia.completeRound", "Game not found");
    }

    // 1. Mark round as complete and mark all question of round as complete
    TriviaRoundCollection.update({ _id: round_id }, { $set: { completed: true } });
    TriviaQuestionCollection.update(
      { round_id: round_id },
      { $set: { completed: true, current: false } },
      { multi: true }
    );
  },
});
