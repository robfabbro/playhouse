import { Meteor } from "meteor/meteor";
import { FactsFactCollection, FactsVoteCollection } from "/imports/api/fun_facts/collections";
import { Random } from "meteor/random";

Meteor.methods({
  "facts.new_fact"(user_id, fact) {
    let fact_id = FactsFactCollection.find().count() + 1;

    // Add Fact
    let _id = FactsFactCollection.insert({
      fact_id: fact_id,
      content: fact,
      owner: user_id,
      createdAt: new Date(),
    });

    // Add Owner's Vote of Fact
    FactsVoteCollection.insert({
      fact_id: fact_id,
      voter: user_id,
      vote: 1,
      createdAt: new Date(),
    });

    return FactsFactCollection.findOne({ _id });
  },
  "facts.add_vote"(user_id, fact_id, vote) {
    if (vote === 0) {
      FactsVoteCollection.remove({
        fact_id: fact_id,
        voter: user_id,
      });
    } else {
      FactsVoteCollection.upsert(
        {
          fact_id: fact_id,
          voter: user_id,
        },
        {
          $set: {
            vote: vote,
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        }
      );
    }
  },
  "facts.get_random_fact"(existingFactId = null) {
    let totalFacts = FactsFactCollection.find().count();

    let query = {};

    if (existingFactId) {
      query.fact_id = { $ne: existingFactId };
      totalFacts = totalFacts - 1;
    }

    let randomFactID = Math.floor(Random.fraction() * totalFacts);

    return FactsFactCollection.findOne(query, { skip: randomFactID });
  },
});
