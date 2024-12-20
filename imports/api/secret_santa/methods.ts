import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import _ from "lodash";
import { SantaGameCollection, SantaPlayerCollection } from "/imports/api/secret_santa/collections";

Meteor.methods({
  "santa.new_game"(name) {
    let code = Random.id(4);
    let id = SantaGameCollection.insert({
      name: name.toLowerCase(),
      code: code.toLowerCase(),
    });
    return id;
  },
  "santa.add_player"(game_id, name, code) {
    SantaPlayerCollection.insert({ game_id: game_id, name: name, code: code });
  },
  "santa.remove_player"(game_id, player_id) {
    let playerToRemove = SantaPlayerCollection.findOne({ game_id: game_id, _id: player_id });

    if (!playerToRemove) {
      throw new Meteor.Error("player-not-found", "Player not found");
    }

    SantaPlayerCollection.remove({ game_id: game_id, _id: player_id });
  },
  "santa.start_game"(game_id, gifts_per_person) {
    // Step 1: Get all the players for the game
    let players = SantaPlayerCollection.find({ game_id: game_id }).fetch();
    let player_names = players.map((player) => player.name);

    // Step 2: Generate the array of giftees
    let giftees = player_names;

    let duplicateCounter = 1;
    while (duplicateCounter < gifts_per_person) {
      giftees = [...giftees, ...player_names];
      duplicateCounter++;
    }

    // Step 3: Generate the list of shuffled draws
    let shuffled_giftees = _.shuffle(giftees);
    let shuffled_draws = _.chunk(shuffled_giftees, gifts_per_person);

    // Step 4: Ensure that no draw is allowed to contain the same player more than once
    let reattemptCounter = 0;
    let ineligibleDrawExists = shuffled_draws.some((draw) =>
      draw.some((player, index) => draw.indexOf(player) !== index)
    );

    while (ineligibleDrawExists) {
      shuffled_giftees = _.shuffle(giftees);
      shuffled_draws = _.chunk(shuffled_giftees, gifts_per_person);
      ineligibleDrawExists = shuffled_draws.some((draw) =>
        draw.some((player, index) => draw.indexOf(player) !== index)
      );
      reattemptCounter++;

      if (reattemptCounter > 30) {
        SantaPlayerCollection.update({ game_id: game_id }, { $set: { giftees: [] } });
        throw new Meteor.Error("draw-error", "Unable to generate a valid draw");
      }
    }

    // Step 6: Update the players with their giftees
    players.forEach((player, index) => {
      let eligibleDraws = _.shuffle(shuffled_draws.filter((draw) => !draw.includes(player.name)));

      let playerGiftees = [];
      if (eligibleDraws.length) {
        // If there are any eligible draws, assign the first one
        playerGiftees = eligibleDraws[0];
        // Remove the assigned draw from the list of draws
        shuffled_draws = shuffled_draws.filter((draw) => !_.isEqual(draw, playerGiftees));
      } else {
        // If there are no eligible draws, reset the current game
        SantaPlayerCollection.update({ game_id: game_id }, { $set: { giftees: [] } });
        throw new Meteor.Error("draw-error", "Unable to generate a valid draw");
      }

      SantaPlayerCollection.update({ _id: player._id }, { $set: { giftees: playerGiftees } });
    });

    // Step 5: Update the game with a start time, game mode and sunk balls array
    SantaGameCollection.update(
      { _id: game_id },
      { $set: { gifts_per_person: gifts_per_person, start_time: new Date() } }
    );
  },
});
