import { Meteor } from "meteor/meteor";
import {
  TriviaGameCollection,
  TriviaTeamCollection,
  TriviaQuestionCategoryCollection,
  TriviaRoundCollection,
  TriviaQuestionCollection,
  TriviaAnswerCollection,
  TriviaGameCategoryCollection,
} from "/imports/api/trivia/collections";
import _ from "lodash";

Meteor.publish("trivia.teams", function (game_id) {
  return TriviaTeamCollection.find({ game_id: game_id });
});

Meteor.publish("trivia.games", function () {
  return TriviaGameCollection.find({});
});

Meteor.publish("trivia.game", function (game_id) {
  return TriviaGameCollection.find({ _id: game_id });
});

Meteor.publish("trivia.rounds", function (game_id) {
  return TriviaRoundCollection.find({ game_id: game_id }, { sort: { order: 1 } });
});

Meteor.publish("trivia.question_categories", function () {
  return TriviaQuestionCategoryCollection.find({ is_custom: false });
});
Meteor.publish("trivia.game_categories", function (game_id) {
  const game_category_cursor = TriviaGameCategoryCollection.find({ game_id: game_id });
  const unique_question_category_ids = _.uniq(game_category_cursor.fetch().map((category) => category.category_id));
  const question_category_cursor = TriviaQuestionCategoryCollection.find({
    _id: { $in: unique_question_category_ids },
  });

  return [game_category_cursor, question_category_cursor];
});
Meteor.publish("trivia.questions", function (game_id) {
  return TriviaQuestionCollection.find({ game_id: game_id });
});

Meteor.publish("trivia.answersForQuestion", function (question_id) {
  return TriviaAnswerCollection.find({ question_id: question_id });
});

Meteor.publish("trivia.answersForTeam", function (team_id) {
  return TriviaAnswerCollection.find({ team_id: team_id });
});
