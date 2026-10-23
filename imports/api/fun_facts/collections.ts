import { Mongo } from "meteor/mongo";

export const FactsFactCollection = new Mongo.Collection("facts_facts");
export const FactsVoteCollection = new Mongo.Collection("facts_votes");
