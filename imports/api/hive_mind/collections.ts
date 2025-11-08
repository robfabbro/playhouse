import { Mongo } from "meteor/mongo";

export const HiveMindGameCollection = new Mongo.Collection("hive_mind_games");
export const HiveMindPlayerCollection = new Mongo.Collection("hive_mind_players");
export const HiveMindGamePlayerCollection = new Mongo.Collection("hive_mind_game_players");
export const HiveMindWordCollection = new Mongo.Collection("hive_mind_words");
export const HiveMindRoundWordCollection = new Mongo.Collection("hive_mind_round_words");
export const HiveMindRoundCollection = new Mongo.Collection("hive_mind_rounds");
export const HiveMindRoundAnswerCollection = new Mongo.Collection("hive_mind_round_answers");
