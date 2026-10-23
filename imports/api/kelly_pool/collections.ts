import { Mongo } from 'meteor/mongo';

export const KellyGameCollection = new Mongo.Collection('kelly_games');
export const KellyPlayerCollection = new Mongo.Collection('kelly_players');
