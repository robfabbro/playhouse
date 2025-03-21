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
    let player_id = WolfPlayerCollection.insert({
      game_id: game_id,
      name: name,
      code: code,
      dead: false,
      ready: false,
    });
    return player_id;
  },
  "wolf.ready_player"(player_id) {
    let player = WolfPlayerCollection.findOne({ _id: player_id });
    if (!player) {
      return;
    }

    WolfPlayerCollection.update({ _id: player_id }, { $set: { ready: !player.ready } });
  },
  "wolf.vote_player"(game_id, voter_id, nominated_id) {
    let voter = WolfPlayerCollection.findOne({ _id: voter_id });
    let nominated = WolfPlayerCollection.findOne({ _id: nominated_id });
    let game = WolfGameCollection.findOne({ _id: game_id });
    let last_round = WolfRoundCollection.findOne({
      game_id: game_id,
      completed: false,
    });

    let can_vote = false;

    if (last_round?.end_at) {
      can_vote = moment().isBefore(moment(last_round?.end_at));
    } else {
      can_vote = true;
    }

    if (voter?.dead) {
      return false;
    }

    if (can_vote) {
      if (voter?.role == "werewolf" && last_round?.cycle == "night") {
        if (Object.values(last_round.werewolf_nominated).length == 0) {
          Meteor.setTimeout(() => {
            Meteor.call("wolf.end_last_round", game_id);
          }, 40000);
        }
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
        let living_villagers = WolfPlayerCollection.find({
          game_id: game_id,
          role: "villager",
          dead: false,
        }).fetch();
        let living_wolves = WolfPlayerCollection.find({
          game_id: game_id,
          role: "werewolf",
          dead: false,
        }).fetch();
        if (Object.values(last_round.villager_nominated).length == 0) {
          Meteor.setTimeout(() => {
            Meteor.call("wolf.end_last_round", game_id);
          }, 120000);
        }
        if (living_villagers.length + living_wolves.length == Object.values(last_round.villager_nominated).length) {
          Meteor.setTimeout(() => {
            Meteor.call("wolf.end_last_round", game_id);
          }, 100);
        }
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
    } else {
      Meteor.call("wolf.end_last_round", game_id);
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
      role: "villager",
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
      console.log(max_votes, "Max Votes");
      console.log(max_duplicate, "Max Duplicate");
      console.log(killed_vill, "Killed Villager");
      console.log(living_villagers.length / 2, "Living Villagers");
      console.log(grouped, "Grouped");
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
      role: "villager",
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
  "wolf.start_game"(game_id) {
    // Step 1: Get all the players for the game
    WolfPlayerCollection.remove({ game_id: game_id, ready: { $ne: true } }, { multi: true });
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
    WolfGameCollection.update({ _id: game_id }, { $set: { start_time: new Date() } });

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
