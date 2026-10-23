import { Meteor } from "meteor/meteor";
import { ZilcheGameCollection, ZilchePlayerCollection } from "/imports/api/zilche/collections";
import { Random } from "meteor/random";
import _ from "lodash";
import { HTTP } from "meteor/http";

const placingth = (n) => {
  let s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const giphy = {
  baseURL: "https://api.giphy.com/v1/gifs/",
  apiKey: "0UTRbFtkMxAplrohufYco5IY74U8hOes",
  type: "random",
  rating: "pg-13",
  robGif: "bRKmwTzInZtN2hd1hL",
};

Meteor.methods({
  "zilche.new_game"(name) {
    let code = Random.id(4);
    let id = ZilcheGameCollection.insert({
      name: name.toLowerCase(),
      code: code.toLowerCase(),
      scores: [],
      zilche_count: 0,
      round: 1,
    });
    return id;
  },
  "zilche.add_player"(game_id, name) {
    // Step 1: Find the count of current players added in this game
    let player_count = ZilchePlayerCollection.find({
      game_id: game_id,
    }).count();

    // Step 2: Insert the new player with the order as the player count + 1
    let order = player_count + 1;

    // Step 3: Determine if the player is the first player
    let is_first_player = player_count == 0;

    // Step 3: Insert the player
    ZilchePlayerCollection.insert({
      game_id: game_id,
      name: name,
      order: order,
      turn: is_first_player,
      score: 0,
      lost_scores: [],
      scores: [],
      stored_score: 0,
      counter: 0,
      zilches: 0,
      placing: "--",
    });
  },
  "zilche.delete_player"(player_id) {
    // Step 1: Get the player
    let player = ZilchePlayerCollection.findOne({
      _id: player_id,
    });
    if (!player) {
      throw new Meteor.Error("player-not-found", "Player not found");
    }

    // Step 2: Delete the player
    ZilchePlayerCollection.remove({
      _id: player_id,
    });

    // Step 3: Reorder the remaining players
    let remainingPlayers = ZilchePlayerCollection.find({ game_id: player.game_id }, { sort: { order: 1 } }).fetch();

    remainingPlayers.forEach((p, index) => {
      ZilchePlayerCollection.update({ _id: p.id }, { $set: { order: index + 1 } });
    });

    // Step 4: Update the turn if the deleted player had the turn
    if (player.turn) {
      let nextPlayer = ZilchePlayerCollection.findOne({ game_id: player.game_id, order: 1 }, { sort: { order: 1 } });
      if (nextPlayer) {
        ZilchePlayerCollection.update({ _id: nextPlayer._id }, { $set: { turn: true } });
      }
    }
  },
  "zilche.start_game"(game_id, poison) {
    // Step 1: Update the game with a start time, game mode and sunk balls array
    ZilcheGameCollection.update({ _id: game_id }, { $set: { poison, start_time: new Date(), zilche_count: 0 } });
  },
  "zilche.choose_poison"(game_id, poison) {
    // Step 1: Update the game with a start time, game mode and sunk balls array
    ZilcheGameCollection.update({ _id: game_id }, { $set: { poison } });
  },
  "zilche.stealScore": function (game_id, player_id) {
    // Step 1: Get the last score of the game
    let game = ZilcheGameCollection.findOne({ _id: game_id });
    let stolenScore = game?.last_score.value;
    let stolenCounter = game?.last_score.counter || 0;

    // Step 2: Update the player with the stolen score and counter
    ZilchePlayerCollection.update({ _id: player_id }, { $set: { stored_score: stolenScore, counter: stolenCounter } });

    // Step 4: Find the players rankings based on the players score + stored score
    let players = ZilchePlayerCollection.find({ game_id: game_id }).map((p) => {
      p.scoreToRank = p.score + p.stored_score;
      return p;
    });
    players = _.orderBy(players, ["scoreToRank"], ["desc"]);

    //Step 5: Update the player placings
    players.forEach((p, idx) => {
      let placing = placingth(idx + 1);
      let tiedPlayer = players
        .filter((pl) => p._id !== pl._id)
        .findIndex((player) => player.scoreToRank == p.scoreToRank);

      if (tiedPlayer >= 0) {
        placing = "T-" + placingth(tiedPlayer + 1);
      }

      if (p.turn || p.placing != "--") {
        ZilchePlayerCollection.update({ _id: p._id }, { $set: { placing: placing } });
      }
    });
  },
  "zilche.storeScore": function (player_id, score) {
    let player = ZilchePlayerCollection.findOne({ _id: player_id });

    // Step 1: If the player already has a stored score, add the new score to it
    if (player.stored_score) {
      player.stored_score = player.stored_score + score;
    } else {
      player.stored_score = score;
    }

    // Step 2: If the player already has a counter, increment it
    if (player.counter) {
      player.counter = player.counter + 1;
    } else {
      player.counter = 1;
    }

    // Step 4: Update the current player with the new stored score and counter
    ZilchePlayerCollection.update(
      { _id: player_id },
      { $set: { stored_score: player.stored_score, counter: player.counter } }
    );

    // Step 4: Find the players rankings based on the players score + stored score
    let players = ZilchePlayerCollection.find({ game_id: player?.game_id }).map((p) => {
      p.scoreToRank = p.score + p.stored_score;
      return p;
    });
    players = _.orderBy(players, ["scoreToRank"], ["desc"]);

    //Step 5: Update the player placings
    players.forEach((p, idx) => {
      let placing = placingth(idx + 1);
      let tiedPlayer = players
        .filter((pl) => p._id !== pl._id)
        .findIndex((player) => player.scoreToRank == p.scoreToRank);

      if (tiedPlayer >= 0) {
        placing = "T-" + placingth(tiedPlayer + 1);
      }

      if (p.turn || p.placing != "--") {
        ZilchePlayerCollection.update({ _id: p._id }, { $set: { placing: placing } });
      }
    });
  },
  "zilche.addScore": function (game_id, player_id, counter, score) {
    console.log({ score });

    // Step 1: Get Game Data
    let game = ZilcheGameCollection.findOne({ _id: game_id });
    let player = ZilchePlayerCollection.findOne({ _id: player_id });
    let allPlayers = ZilchePlayerCollection.find({
      game_id: player?.game_id,
    }).fetch();

    // Step 2: Determine if the score is a zilche, first score, big score, triple zilche, or over ten thousand
    score = parseInt(score);
    let score_id = Random.id();
    let first_score = false;
    let big_score = false;
    let triple_zilche = false;
    let over_ten_thousand = false;

    // Step 2.1:
    // 1. If the score is a zilche, increment the zilche count (player and game) and add the score to the player's lost scores
    // 2. If the score is a score, add the score to the player's scores, and determine if the score is a big score
    if (score == 0) {
      game.zilche_count = (game.zilche_count || 0) + 1;
      player.zilches = player.zilches + 1;
      player.lost_scores.push({
        _id: score_id,
        value: player.stored_score,
      });
      if (game.zilche_count % 3 == 0 && player.zilches != 0) {
        console.log("we've got a triple zilche");
        triple_zilche = true;
      }
    } else if (score > 0) {
      if (score > 0 && !player.first_score) {
        player.first_score = true;
        first_score = true;
      }
      if (score > 1500) {
        big_score = true;
      }
    }
    player.scores.push({
      _id: score_id,
      value: score,
    });

    // Step 3: Reset the players score
    player.score = player.score + score;
    player.stored_score = 0;
    player.counter = 0;

    // Step 4: If the player has reached over 10,000 points, set the final round to true
    if (player.score >= 10000) {
      over_ten_thousand = true;
      game.final_round = true;
      if (!game.order_of_first_finished) {
        game.order_of_first_finished = player.order;
      }
    }

    //Step 5: Increment the Round this is the last player of the round, and if the round is final, mark the game as finished
    if (player.order == allPlayers.length) {
      if (game?.final_round) {
        game.finished = true;
      } else {
        game.round = game?.round + 1;
      }
    }

    //Step 6: Update the Scores in the Game Object
    if (score >= 0) {
      game?.scores.push({
        _id: score_id,
        player: player_id,
        value: score,
      });

      game.last_score = {
        _id: score_id,
        player: player_id,
        counter: counter,
        value: score,
      };
    }

    // Step 7: Update the Game Object
    ZilcheGameCollection.update(
      { _id: game_id },
      {
        $set: {
          last_score: game?.last_score,
          scores: game?.scores,
          round: game?.round,
          final_round: game?.final_round,
          finished: game?.finished,
          order_of_first_finished: game?.order_of_first_finished,
          zilche_count: game?.zilche_count,
        },
      }
    );

    // Step 8: Update the Player Object
    ZilchePlayerCollection.update(
      { _id: player_id },
      {
        $set: {
          score: player?.score,
          scores: player?.scores,
          lost_scores: player?.lost_scores,
          stored_score: player?.stored_score,
          counter: player?.counter,
          zilches: player?.zilches,
          first_score: player?.first_score,
          turn: false,
        },
      }
    );

    // Step 9: Change the turn to the next player
    let nextPlayer = ZilchePlayerCollection.findOne({
      game_id: game_id,
      order: player.order + 1,
    });

    if (!nextPlayer) {
      nextPlayer = ZilchePlayerCollection.update(
        {
          game_id: game_id,
          order: 1,
        },
        { $set: { turn: true } }
      );
    } else {
      ZilchePlayerCollection.update({ _id: nextPlayer._id }, { $set: { turn: true } });
    }

    let players = ZilchePlayerCollection.find({ game_id: game_id }, { sort: { score: -1 } }).fetch();

    // Step 10: Rerank the players
    players.forEach((p, idx) => {
      let placing = placingth(idx + 1);
      let tiedPlayer = players.filter((pl) => pl._id !== p._id).findIndex((player) => player.score == p.score);

      if (tiedPlayer >= 0) {
        placing = "T-" + placingth(tiedPlayer + 1);
      }

      ZilchePlayerCollection.update({ _id: p._id }, { $set: { placing: placing } });
    });

    // Step 11: Get the Giphy
    if (Meteor.isServer) {
      if (over_ten_thousand) {
        let gifurl = encodeURI(giphy.baseURL + giphy.robGif + "?api_key=" + giphy.apiKey);
        let res = HTTP.get(gifurl);
        let newGiphy = res.data.data.images.original.url;
        ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: true, giph: newGiphy } });
        Meteor.setTimeout(() => {
          ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: false } });
        }, 6000);
      } else if (triple_zilche) {
        console.log(`triple zilche with poison: ${game?.poison}`);
        let gifurl = encodeURI(giphy.baseURL + giphy.type + "?api_key=" + giphy.apiKey + "&tag=" + game?.poison);
        let res = HTTP.get(gifurl);
        let newGiphy = res.data.data.images.original.url;
        ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: true, giph: newGiphy } });
        Meteor.setTimeout(() => {
          ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: false } });
        }, 6000);
      } else if (score == 0) {
        console.log("zilche with zilch+zero+nothing");
        let gifurl = encodeURI(
          giphy.baseURL + giphy.type + "?api_key=" + giphy.apiKey + "&tag=" + "zilch+zero+nothing"
        );
        let res = HTTP.get(gifurl);
        let newGiphy = res.data.data.images.original.url;
        ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: true, giph: newGiphy } });
        Meteor.setTimeout(() => {
          ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: false } });
        }, 6000);
      } else if (first_score) {
        let gifurl = encodeURI(giphy.baseURL + giphy.type + "?api_key=" + giphy.apiKey + "&tag=" + "scoreboard+party");
        let res = HTTP.get(gifurl);
        let newGiphy = res.data.data.images.original.url;
        ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: true, giph: newGiphy } });
        Meteor.setTimeout(() => {
          ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: false } });
        }, 6000);
      } else if (big_score) {
        let gifurl = encodeURI(
          giphy.baseURL + giphy.type + "?api_key=" + giphy.apiKey + "&tag=" + "bangarang+winning+crushing+slay"
        );
        let res = HTTP.get(gifurl);
        let newGiphy = res.data.data.images.original.url;
        ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: true, giph: newGiphy } });
        Meteor.setTimeout(() => {
          ZilcheGameCollection.update({ _id: game_id }, { $set: { showGif: false } });
        }, 6000);
      }
    }
  },
  "zilche.editIndividualScore": function (player_id, score_id, value) {
    // Step 1: Get the player
    let player = ZilchePlayerCollection.findOne({ _id: player_id });

    // Step 2: Get the scores of the player
    let scores = player.scores;

    // Step 3: Find the score that needs to be updated and update the score
    let scoreIndex = scores.findIndex((s) => s._id == score_id);
    scores[scoreIndex].value = value;

    // Step 5: Recalcutate the player's score
    let score = _.sumBy(scores, "value");

    // Step 6: Update the player
    ZilchePlayerCollection.update({ _id: player_id }, { $set: { score, scores } });
  },
  "zilche.saveInitialScore": function (player_id, value) {
    // Step 1: Get the player
    let player = ZilchePlayerCollection.findOne({ _id: player_id });

    if (!player) {
      throw new Meteor.Error("Player not found");
    }

    // Step 2: Update the player with the score
    ZilchePlayerCollection.update({ _id: player_id }, { $set: { score: parseInt(value) } });
  },
  "zilche.savePlayerName": function (player_id, value) {
    // Step 1: Get the player
    let player = ZilchePlayerCollection.findOne({ _id: player_id });

    if (!player) {
      throw new Meteor.Error("Player not found");
    }

    // Step 2: Update the player with the score
    ZilchePlayerCollection.update({ _id: player_id }, { $set: { name: value } });
  },
  "zilche.changePlayerOrder": function (player_id, new_order) {
    // Step 1: Get the player
    let player = ZilchePlayerCollection.findOne({ _id: player_id });

    if (!player) {
      throw new Meteor.Error("Player not found");
    }

    // Step 2: Update the player in the new order with the player's current order
    ZilchePlayerCollection.update({ game_id: player.game_id, order: new_order }, { $set: { order: player.order } });

    // Step 3: Update the player with the new order
    ZilchePlayerCollection.update({ _id: player_id }, { $set: { order: new_order } });
  },
});
