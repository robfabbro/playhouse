import { Meteor } from "meteor/meteor";
import { FactsVoteCollection } from "/imports/api/fun_facts/collections";

Meteor.publish("facts.fact_votes", function (fact_id) {
  if (!fact_id) {
    return [];
  }

  console.log({ fact_id });

  console.log(
    FactsVoteCollection.find({ fact_id: fact_id })
      .fetch()
      .map((f) => f.fact_id)
  );

  return FactsVoteCollection.find({ fact_id: fact_id });
});
