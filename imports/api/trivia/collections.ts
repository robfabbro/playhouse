import { Mongo } from "meteor/mongo";

export const TriviaGameCollection = new Mongo.Collection("trivia_games");
export const TriviaTeamCollection = new Mongo.Collection("trivia_teams");
export const TriviaRoundCollection = new Mongo.Collection("trivia_rounds");
export const TriviaQuestionCategoryCollection = new Mongo.Collection("trivia_question_categories");
export const TriviaGameCategoryCollection = new Mongo.Collection("trivia_game_categories");

interface Question {
  _id: string;
  game_id: string;
  round_id: string;
  category_id: string;
  category_name: string;
  difficulty: string;
  question_type: "single_answer" | "multiple_answer" | "multiple_choice" | "sort_items" | "closest_guess";
  question: string;
  answers: string[];
  labels_required: boolean;
}

export const TriviaQuestionCollection = new Mongo.Collection<Question>("trivia_questions");

interface Answer {
  _id: string;
  team_id: string;
  team_name: string;
  game_id: string;
  question_id: string;
  answer: {};
}

export const TriviaAnswerCollection = new Mongo.Collection<Answer>("trivia_answers");
