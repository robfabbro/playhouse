import { Mongo } from 'meteor/mongo';

export const CardsCollection = new Mongo.Collection('cards');
export const CardOptionsCollection = new Mongo.Collection('card_options');
