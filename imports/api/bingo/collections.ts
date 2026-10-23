import { Mongo } from 'meteor/mongo';

export const BingoGameCollection = new Mongo.Collection('bingo_games'); //BingoCollection
export const BingoPlayerCollection = new Mongo.Collection('bingo_players'); //CardsCollection
export const BingoCardCollection = new Mongo.Collection('bingo_cards'); //OptionsCollection
export const BingoPlayerCardCollection = new Mongo.Collection('bingo_player_cards'); //CardOptionsCollection