import { Meteor } from "meteor/meteor";
import {
  HiveMindGameCollection,
  HiveMindGamePlayerCollection,
  HiveMindPlayerCollection,
  HiveMindRoundAnswerCollection,
  HiveMindRoundCollection,
  HiveMindRoundWordCollection,
  HiveMindWordCollection,
} from "./collections";

Meteor.publish("hive_mind.game", function (game_id) {
  if (!game_id) {
    return this.ready();
  }

  let game = HiveMindGameCollection.findOne({ _id: game_id });

  if (!game) {
    return this.ready();
  }

  return [
    HiveMindGameCollection.find({ _id: game_id }),
    HiveMindGamePlayerCollection.find({ game_id: game._id }),
    HiveMindRoundCollection.find({ game_id: game._id }),
    HiveMindRoundAnswerCollection.find({ game_id: game._id }),
    HiveMindRoundWordCollection.find({ game_id: game._id }),
  ];
});

Meteor.publish("hive_mind.player", function (player_code) {
  if (!player_code) {
    return this.ready();
  }

  let player_cursor = HiveMindPlayerCollection.find({ code: player_code });
  let player = player_cursor.fetch()[0];

  if (!player) {
    console.log("No player found");
    return [player_cursor];
  }

  let game_players = HiveMindGamePlayerCollection.find({ player_id: player?._id }).fetch();

  if (!game_players || game_players.length === 0) {
    console.log("No game players found");
    return [player_cursor];
  }

  let game_ids = game_players.map((gp) => gp.game_id);

  let game_cursor = HiveMindGameCollection.find({ _id: { $in: game_ids } }, { sort: { createdAt: -1 } });
  console.log("Publishing player and games ", player_code, " with ids  ", game_ids);
  return [player_cursor, game_cursor];
});

Meteor.publish("hive_mind.round", function (round_id) {
  if (!round_id) {
    return this.ready();
  }

  let round = HiveMindRoundCollection.findOne({ _id: round_id });

  if (!round) {
    return this.ready();
  }

  let game_id = round?.game_id;

  if (!game_id) {
    return this.ready();
  }

  let game = HiveMindGameCollection.findOne({ _id: game_id });

  if (!game) {
    return this.ready();
  }

  let round_words = HiveMindRoundWordCollection.find({ game_id: game._id, round_id: round_id });

  let word_ids = round_words.map((rw) => rw.word_id);

  return HiveMindWordCollection.find({ _id: { $in: word_ids } });
});
