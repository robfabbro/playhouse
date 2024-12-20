import { Mongo } from 'meteor/mongo';

export const SantaGameCollection = new Mongo.Collection('santa_games');
export const SantaPlayerCollection = new Mongo.Collection('santa_players');
