import { Mongo } from "meteor/mongo";

export const WolfGameCollection = new Mongo.Collection("wolf_games");
export const WolfPlayerCollection = new Mongo.Collection("wolf_players");
export const WolfRoundCollection = new Mongo.Collection("wolf_rounds");
