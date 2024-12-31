// import { inpaint } from "@u4/opencv4nodejs";
import { Meteor } from "meteor/meteor";
import { WolfGameCollection, WolfPlayerCollection, WolfRoundCollection } from "/imports/api/werewolf/collections";
import { Random } from "meteor/random";
import _ from "lodash";
import { faker } from "@faker-js/faker";
import moment, { max } from "moment";

Meteor.methods({
  "wolf.new_game"(name) {
    let code = Random.id(4);
    let id = WolfGameCollection.insert({
      name: name.toLowerCase(),
      code: code.toLowerCase(),
    });
    return id;
  },
  "wolf.add_player"(game_id, name, code) {
    WolfPlayerCollection.insert({
      game_id: game_id,
      name: name,
      code: code,
      dead: false,
    });
  },
  "wolf.sink_ball"(game_id, ball_to_sink) {
    // Step 1: Update the game by adding the ball to the sunk balls array
    WolfGameCollection.update({ _id: game_id }, { $push: { sunk_balls: ball_to_sink } });

    // Step 2: Update the player (who has this ball) balls array so that the ball is marked as sunk
    let player = WolfPlayerCollection.findOne({
      game_id: game_id,
      balls: { $elemMatch: { ball: ball_to_sink } },
    });
    let player_balls = player?.balls || [];

    if (player) {
      player_balls = player.balls.map((ball) => {
        if (ball.ball == ball_to_sink) {
          ball.status = "sunk";
          ball.sunk_time = new Date();
        }
        return ball;
      });
      WolfPlayerCollection.update({ _id: player._id }, { $set: { balls: player_balls } });
    }

    // Step 3: Get the game mode of the game
    let game = WolfGameCollection.findOne({ _id: game_id });
    let game_mode = game.game_mode;

    // Step 4: If the game mode is "stay_alive", mark the player as finished if they have no balls left
    if (game_mode == "stay_alive" && player) {
      let alive_balls = player_balls.filter((ball) => ball.status == "alive");
      if (alive_balls.length == 0) {
        WolfPlayerCollection.update({ _id: player._id }, { $set: { finished_at: new Date() } });
      }
    }

    // Step 5: If the game mode is "sink_all", mark the player as finished if all their balls are sunk
    if (game_mode == "sink_all" && player) {
      let sunk_balls = player_balls.filter((ball) => ball.status == "sunk");
      if (sunk_balls.length == player_balls.length) {
        WolfPlayerCollection.update({ _id: player._id }, { $set: { finished_at: new Date() } });
      }
      player = WolfPlayerCollection.findOne({ _id: player._id });
    }

    // Step 6: If all but one player is finished, end the game
    let players = WolfPlayerCollection.find({ game_id: game_id }).fetch();
    let finished_players = players.filter((player) => player.finished_at);
    if (players.length - finished_players.length <= 1) {
      WolfGameCollection.update({ _id: game_id }, { $set: { end_time: new Date() } });
    }

    return player;
  },
  "wolf.vote_player"(game_id, voter_id, nominated_id) {
    let voter = WolfPlayerCollection.findOne({ _id: voter_id });
    let nomintated = WolfPlayerCollection.findOne({ _id: nominated_id });
    let game = WolfGameCollection.findOne({ _id: game_id });
    let last_round = WolfRoundCollection.findOne({
      game_id: game_id,
      completed: false,
    });

    let end_time = moment(last_round?.end_at);
    let now = moment();
    let can_vote = now.isBefore(end_time);
    if (now.isAfter(end_time)) {
      Meteor.call("wolf.end_last_round", game_id);
    }

    if (can_vote) {
      if (voter?.role == "werewolf" && last_round?.cycle == "night") {
        if (last_round.werewolf_nominated[voter_id] == nominated_id) {
          delete last_round.werewolf_nominated[voter_id];
        } else {
          last_round.werewolf_nominated[voter_id] = nominated_id;
        }

        WolfRoundCollection.update(
          { _id: last_round._id },
          { $set: { werewolf_nominated: last_round.werewolf_nominated } }
        );
      }

      if (voter?.role == "villager" || last_round?.cycle == "day") {
        if (last_round.villager_nominated[voter_id] == nominated_id) {
          delete last_round.villager_nominated[voter_id];
        } else {
          last_round.villager_nominated[voter_id] = nominated_id;
        }

        WolfRoundCollection.update(
          { _id: last_round._id },
          { $set: { villager_nominated: last_round.villager_nominated } }
        );
      }
    }

    if (!last_round?.started_at) {
      let start = moment();
      let end = last_round?.cycle == "night" ? start.add(40, "seconds") : start.add(2, "minutes");
      WolfRoundCollection.update(
        { _id: last_round._id },
        { $set: { started_at: start.toDate(), end_at: end.toDate() } }
      );
    }
  },
  "wolf.end_last_round"(game_id) {
    let last_round = WolfRoundCollection.findOne({
      game_id: game_id,
      completed: false,
    });
    let finish = moment();

    let living_wolves = WolfPlayerCollection.find({
      game_id: game_id,
      role: "werewolf",
      dead: false,
    }).fetch();

    let living_villagers = WolfPlayerCollection.find({
      game_id: game_id,
      role: "werewolf",
      dead: false,
    }).fetch();

    if (last_round?.cycle == "night") {
      let werewolf_votes = last_round.werewolf_nominated;
      let unanimous = false;
      let all_votes = false;
      let killed = null;
      if (Object.values(werewolf_votes).length == living_wolves.length) {
        all_votes = true;
        let grouped = _.groupBy(Object.values(werewolf_votes));
        console.log(grouped);
        Object.keys(grouped).forEach((key) => {
          if (grouped[key].length == living_wolves.length) {
            unanimous = true;
            console.log("Unanimous");
            killed = key;
            WolfPlayerCollection.update({ _id: key }, { $set: { dead: true, killed_at: finish.toDate() } });
          }
        });
      }

      let villager_votes = last_round.villager_nominated;
      let vill_unanimous = false;
      let all_votes_vill = false;
      let killed_vill = null;
      if (Object.values(villager_votes).length == living_villagers.length) {
        all_votes_vill = true;
        let grouped = _.groupBy(Object.values(villager_votes));
        console.log(grouped);
        Object.keys(grouped).forEach((key) => {
          if (grouped[key].length == living_villagers.length) {
            vill_unanimous = true;
            console.log("Unanimous");
            killed_vill = key;
            WolfPlayerCollection.update({ _id: killed_vill }, { $set: { villager_role: last_round.villager_role } });
          }
        });
      }
    }

    if (last_round?.cycle == "day") {
      let villager_votes = last_round.villager_nominated;
      let all_votes_vill = false;
      let killed_vill = null;

      if (Object.values(villager_votes).length == living_villagers.length) {
        all_votes_vill = true;
      }

      let grouped = _.groupBy(Object.values(villager_votes));
      console.log(grouped);
      let max_votes = 0;
      let max_duplicate = false;
      Object.keys(grouped).forEach((key) => {
        if (grouped[key].length >= max_votes) {
          max_duplicate = true;
          if (grouped[key].length > max_votes) {
            max_votes = grouped[key].length;
            killed_vill = key;
            max_duplicate = false;
          }
        }
      });
      if (!max_duplicate && max_votes >= living_villagers.length / 2) {
        WolfPlayerCollection.update({ _id: killed_vill }, { $set: { dead: true, killed_at: finish.toDate() } });
      }
    }

    //post vote, check who is still going.
    living_wolves = WolfPlayerCollection.find({
      game_id: game_id,
      role: "werewolf",
      dead: false,
    }).fetch();

    living_villagers = WolfPlayerCollection.find({
      game_id: game_id,
      role: "werewolf",
      dead: false,
    }).fetch();

    if (living_wolves.length >= living_villagers.length / 2) {
      //wolves win
      WolfGameCollection.update({ _id: game_id }, { $set: { end_time: new Date(), winner: "wolves" } });
    }
    if (living_wolves.length == 0) {
      //villagers win
      WolfGameCollection.update({ _id: game_id }, { $set: { end_time: new Date(), winner: "villagers" } });
    }

    Meteor.call("wolf.start_new_round", game_id);
  },
  "wolf.start_new_round"(game_id) {
    let last_round = WolfRoundCollection.findOne({
      game_id: game_id,
      completed: false,
    });
    WolfRoundCollection.update({ _id: last_round._id }, { $set: { finished_at: new Date(), completed: true } });
    let cycle = last_round?.cycle == "night" ? "day" : "night";
    WolfRoundCollection.insert({
      game_id: game_id,
      cycle: cycle,
      completed: false,
      werewolf_nominated: {},
      villager_nominated: {},
      created_at: new Date(),
      villager_role: faker.person.jobType(),
    });
  },
  "wolf.start_game"(game_id, game_mode) {
    // Step 1: Get all the players for the game
    let players = WolfPlayerCollection.find({ game_id: game_id }).fetch();

    // Step 2: Create number of roles based on number of players
    let roles = [];

    if (players.length < 7) {
      roles.push("werewolf");
      for (let i = 0; i < players.length - 1; i++) {
        roles.push("villager");
      }
    } else {
      roles.push("werewolf");
      roles.push("werewolf");
      for (let i = 0; i < players.length - 2; i++) {
        if (i >= 16 && i % 4 == 0) {
          roles.push("werewolf");
        } else {
          roles.push("villager");
        }
      }
    }

    // Step 3: For each player, add a random ball (1-15) to their hand, no player can have the same ball

    roles = _.shuffle(roles);

    console.log(roles, "0-------------------------Roles");

    _.shuffle(players).forEach((player, index) => {
      WolfPlayerCollection.update({ _id: player._id }, { $set: { role: roles[index] } });
    });

    // Step 4: Update the game with a start time, game mode and roles
    WolfGameCollection.update({ _id: game_id }, { $set: { game_mode: game_mode, start_time: new Date() } });

    // Step 5: Create the first round

    WolfRoundCollection.insert({
      game_id: game_id,
      cycle: "night",
      completed: false,
      werewolf_nominated: {},
      villager_nominated: {},
      created_at: new Date(),
      villager_role: faker.person.jobType(),
    });
  },
});
