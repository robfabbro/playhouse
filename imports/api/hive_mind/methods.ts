import { Meteor } from "meteor/meteor";
import {
  HiveMindGameCollection,
  HiveMindGamePlayerCollection,
  HiveMindPlayerCollection,
  HiveMindRoundCollection,
  HiveMindRoundWordCollection,
  HiveMindWordCollection,
  HiveMindRoundAnswerCollection,
} from "/imports/api/hive_mind/collections";
import { Random } from "meteor/random";
import _ from "lodash";
import { pl } from "@faker-js/faker/.";

const robot_names = [
  "Bender",
  "R2-D2",
  "Optimus",
  "Terminator",
  "C-3PO",
  "Gideon",
  "WALL-E",
  "Baymax",
  "Android 18",
  "BMO",
  "TARS",
  "RoboCop",
  "Megatron",
];

Meteor.methods({
  "hive_mind.find_game"(searchName, player_code) {
    if (!player_code || player_code.trim() === "") {
      throw new Meteor.Error("Player code is required");
    }

    let player = HiveMindPlayerCollection.findOne({ code: player_code });

    if (!player) {
      throw new Meteor.Error("Player not found");
    }

    let game = HiveMindGameCollection.findOne({
      $or: [{ name: searchName.toLowerCase() }, { code: searchName.toLowerCase() }],
    });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    if (game?.game_start) {
      throw new Meteor.Error("Game already started");
    }

    HiveMindGamePlayerCollection.upsert(
      {
        game_id: game._id,
        player_code: player_code,
      },
      {
        $set: {
          game_id: game._id,
          game_name: game.name,
          player_id: player._id,
          player_code: player_code,
          player_name: player.name,
        },
      }
    );

    return game?._id;
  },
  "hive_mind.new_game"(name, player_code) {
    if (!name || name.trim() === "") {
      throw new Meteor.Error("Name is required");
    }

    if (!player_code || player_code.trim() === "") {
      throw new Meteor.Error("Player code is required");
    }

    let player = HiveMindPlayerCollection.findOne({ code: player_code });
    if (!player) {
      throw new Meteor.Error("Player not found");
    }

    let code = Random.id(4);
    let game_id = HiveMindGameCollection.insert({
      name: name.toLowerCase(),
      code: code.toLowerCase(),
      language_mode: ["english"],
    });

    HiveMindGamePlayerCollection.insert({
      game_id: game_id,
      game_name: name,
      player_id: player._id,
      player_code: player_code,
      player_name: player.name,
    });

    return game_id;
  },
  "hive_mind.add_player"(name, code) {
    if (!name || name.trim() === "") {
      throw new Meteor.Error("Name is required");
    }

    if (!code || code.trim() === "") {
      throw new Meteor.Error("Code is required");
    }

    HiveMindPlayerCollection.insert({ name: name, code: code });
  },
  "hive_mind.edit_player"(name, code) {
    if (!name || name.trim() === "") {
      throw new Meteor.Error("Name is required");
    }

    if (!code || code.trim() === "") {
      throw new Meteor.Error("Code is required");
    }

    let player = HiveMindPlayerCollection.findOne({ code: code });
    if (!player) {
      throw new Meteor.Error("Player not found");
    }

    HiveMindPlayerCollection.update({ code: code }, { $set: { name: name } });
    HiveMindGamePlayerCollection.update({ player_code: code }, { $set: { player_name: name } }, { multi: true });
    HiveMindRoundAnswerCollection.update({ player_code: code }, { $set: { player_name: name } }, { multi: true });
  },
  "hive_mind.start_game"(game_id, player_code) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    if (game.game_start) {
      throw new Meteor.Error("Game already started");
    }

    let player = HiveMindPlayerCollection.findOne({ code: player_code });

    HiveMindGameCollection.update(
      { _id: game_id },
      { $set: { game_start: new Date(), cancelling: false, cancelled_by: null, started_by: player?.name } }
    );

    Meteor.call("hive_mind.create_first_round", game_id);
  },
  "hive_mind.cancel_start_game"(game_id, player_code) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    // if the game has a game_start timestamp, and it is less that 10 seconds ago, allow cancel
    if (!game.game_start || new Date().getTime() - new Date(game.game_start).getTime() > 10000) {
      throw new Meteor.Error("Game cannot be cancelled");
    }

    if (game.cancelling) {
      throw new Meteor.Error("Game is already being cancelled");
    }

    let player = HiveMindPlayerCollection.findOne({ code: player_code });

    HiveMindGameCollection.update(
      { _id: game_id },
      { $set: { game_start: null, cancelling: true, cancelled_by: player?.name, started_by: null } }
    );

    Meteor.call("hive_mind.remove_game_data", game_id);
    Meteor.call("hive_mind.reset_cancel", game_id);
  },
  "hive_mind.reset_cancel"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    console.log("Resetting cancel for game ", game_id, game);
    console.log("Game cancelling status: ", game?.cancelling);
    console.log("Game start status: ", game?.game_start);

    if (game?.game_start || !game?.cancelling) {
      throw new Meteor.Error("Cancel cannot be reset");
    }

    // wait 3 seconds, then reset cancelling to false
    Meteor.setTimeout(() => {
      HiveMindGameCollection.update({ _id: game_id }, { $set: { cancelling: false, cancelled_by: null } });
    }, 3000);
  },
  "hive_mind.remove_game_data"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    HiveMindGameCollection.update({ _id: game_id }, { $set: { used_words: [] } });
    HiveMindRoundCollection.remove({ game_id: game_id });
    HiveMindRoundWordCollection.remove({ game_id: game_id });
    HiveMindRoundAnswerCollection.remove({ game_id: game_id });
  },
  "hive_mind.reset_game"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    HiveMindGameCollection.update(
      { _id: game_id },
      {
        $set: {
          game_start: null,
          cancelling: false,
          cancelled_by: null,
          ended_at: null,
          final_leaderboard_revealed: null,
        },
      }
    );
    HiveMindRoundCollection.remove({ game_id: game_id });
    HiveMindRoundWordCollection.remove({ game_id: game_id });
    HiveMindRoundAnswerCollection.remove({ game_id: game_id });
    HiveMindGamePlayerCollection.update(
      { game_id: game_id },
      { $set: { total_points: 0, final_position_revealed: false, final_position_revealed_at: null } },
      { multi: true }
    );
  },
  "hive_mind.create_first_round"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    if (!game?.points_to_win) {
      let game_players = HiveMindGamePlayerCollection.find({ game_id: game_id }).count();
      let calculated_points_to_win = 5 * (game_players - 1);

      HiveMindGameCollection.update({ _id: game_id }, { $set: { points_to_win: calculated_points_to_win } });
    }

    let existing_first_round = HiveMindRoundCollection.findOne({ game_id: game_id, round_number: 1 });

    if (existing_first_round) {
      return existing_first_round._id;
    }

    let already_used_round_words = HiveMindRoundWordCollection.find({
      game_id: game_id,
      word_id: { $ne: "no_answer" },
    }).fetch();

    let language_modifier = {};

    if (game?.language_mode.includes("deutsch") && !game?.language_mode.includes("english")) {
      language_modifier.is_deutsch = true;
    } else if (game?.language_mode.includes("english") && !game?.language_mode.includes("deutsch")) {
      language_modifier.is_english = true;
    }

    let words = HiveMindWordCollection.find({
      _id: { $nin: already_used_round_words.map((w) => w._id) },
      ...language_modifier,
    }).fetch();
    let random_five_words = _.sampleSize(words, 5);

    let game_rounds = HiveMindRoundCollection.find({ game_id: game_id }).fetch();
    let round_number = game_rounds.length + 1;

    let round_id = HiveMindRoundCollection.insert({
      game_id: game_id,
      round_number: round_number,
      created_at: new Date(),
    });

    for (let idx in random_five_words) {
      let word = random_five_words[idx];
      HiveMindRoundWordCollection.insert({
        game_id: game_id,
        round_id: round_id,
        word_id: word._id, // use the same ID as the word
        word: word.word,
        target: idx === "0",
        order: parseInt(idx) + 1,
      });
    }

    // Assign robot answers for this round
    Meteor.call("hive_mind.assign_robot_answers", round_id);

    return round_id;
  },
  "hive_mind.assign_robot_answers"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    let robots_in_game = HiveMindGamePlayerCollection.find({ game_id: round.game_id, is_robot: true }).fetch();

    if (robots_in_game.length > 0) {
      let round_words = HiveMindRoundWordCollection.find({ round_id: round_id, target: false }).fetch();
      for (let robot of robots_in_game) {
        let random_word = _.sample(round_words);
        Meteor.call("hive_mind.select_word", robot.player_code, round_id, random_word._id);
      }
    }
  },
  "hive_mind.start_round"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_start: new Date() } });
  },
  "hive_mind.end_round"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    if (!round.round_start) {
      throw new Meteor.Error("Round has not started");
    }

    if (round.round_end) {
      console.log("~~~ Round has already ended ~~~");
      return;
    }

    let answers = HiveMindRoundAnswerCollection.find({ round_id: round_id }).fetch();
    let game_players = HiveMindGamePlayerCollection.find({ game_id: round.game_id })
      .fetch()
      .map((gp) => {
        let did_answer = answers.find((a) => a.player_id === gp._id);

        return {
          ...gp,
          did_answer: !!did_answer,
        };
      });

    // Step 1: Identify non-answering players, add that as a special entry onto the unrelated_words array
    let non_answering_players = game_players.filter((gp) => !gp.did_answer);
    if (non_answering_players.length > 0) {
      let round_words = HiveMindRoundWordCollection.findOne({ round_id: round_id });
      let random_word = _.sample(round_words);

      for (let gp of non_answering_players) {
        Meteor.call("hive_mind.select_word", gp.player_code, round_id, random_word?._id);
      }

      answers = HiveMindRoundAnswerCollection.find({ round_id: round_id }).fetch();
    }

    let unrelated_words = HiveMindRoundWordCollection.find({ round_id: round_id, target: false }).fetch();

    // Step 2: Calculate answer counts and answered_by for each unrelated word
    unrelated_words.forEach((w) => {
      let matching_answers = answers.filter((a) => a.round_word_id === w._id);
      let answer_count = matching_answers.length;
      let answered_by = matching_answers.map((a) => {
        let player = game_players.find((gp) => gp._id === a.player_id);
        return {
          player_name: player?.player_name,
          player_code: player?.player_code,
          player_id: player?._id,
          answer_id: a._id,
          is_robot: player?.is_robot || false,
        };
      });

      HiveMindRoundWordCollection.update(
        { _id: w._id },
        { $set: { answer_count: answer_count, answered_by: answered_by, revealed: false } }
      );
    });

    HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_end: new Date() } });

    Meteor.call("hive_mind.schedule_reveal_round_answers", round_id);
  },
  "hive_mind.schedule_end_round"(round_id, timeout = 15000) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    Meteor.setTimeout(() => {
      Meteor.call("hive_mind.end_round", round_id);
    }, timeout);
  },
  "hive_mind.select_word"(player_code, round_id, word_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    if (!word_id) {
      throw new Meteor.Error("Word ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    let game = HiveMindGameCollection.findOne({ _id: round?.game_id });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    let game_player = HiveMindGamePlayerCollection.findOne({ player_code: player_code, game_id: round.game_id });

    if (!game_player) {
      throw new Meteor.Error("Player not found in game");
    }

    if (!round.round_start && !game_player.is_robot) {
      HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_start: new Date() } });
      Meteor.call("hive_mind.schedule_end_round", round_id);
    }

    let word = HiveMindRoundWordCollection.findOne({ _id: word_id });

    if (!word) {
      throw new Meteor.Error("Word not found");
    }

    HiveMindRoundAnswerCollection.upsert(
      { round_id, player_id: game_player._id, game_id: round.game_id },
      {
        $set: {
          round_word_id: word._id,
          word_id: word_id,
          word: word.word,
          game_name: game.name,
          round_number: round.number,
          player_name: game_player.player_name,
          player_code: game_player.player_code,
        },
      }
    );

    if (!round?.round_end) {
      let now = new Date();
      round = HiveMindRoundCollection.findOne({ _id: round_id });
      let round_start = round?.round_start || now;
      let elapsed = Math.floor((now.getTime() - round_start.getTime()) / 1000);
      let time_remaining = Math.ceil(15 - elapsed);

      if (time_remaining > 3) {
        // next check if all players have answered
        let answers = HiveMindRoundAnswerCollection.find({ round_id: round_id }).fetch();
        let game_players = HiveMindGamePlayerCollection.find({ game_id: round.game_id })
          .fetch()
          .map((gp) => {
            let did_answer = answers.find((a) => a.player_id === gp._id);

            return {
              ...gp,
              did_answer: !!did_answer,
            };
          });

        let non_answering_players = game_players.filter((gp) => !gp.did_answer);
        let all_players_have_answered = non_answering_players.length === 0;

        if (all_players_have_answered) {
          let new_now = new Date();
          let twelve_seconds_ago = new Date(new_now.getTime() - 12000);
          HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_start: twelve_seconds_ago } });
          Meteor.call("hive_mind.schedule_end_round", round_id, 3000);
        }
      }
    }
  },
  "hive_mind.reveal_round_answers"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }
    if (!round.round_end) {
      throw new Meteor.Error("Round hasn't ended");
    }

    let words_to_reveal = HiveMindRoundWordCollection.find(
      { round_id: round_id, target: false, revealed: false },
      { sort: { answer_count: 1, order: -1 } }
    ).fetch();

    if (!round?.round_answer_reveal) {
      HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_answer_reveal: new Date() } });
    }

    if (words_to_reveal.length) {
      let word_to_reveal = words_to_reveal[0];
      let revealling_answer_count = word_to_reveal.answer_count;

      Meteor.setTimeout(() => {
        console.log(`${word_to_reveal.word}: ${new Date().getSeconds()}`);
        HiveMindRoundWordCollection.update(
          { round_id: round_id, answer_count: revealling_answer_count },
          { $set: { revealling_answer: true } },
          { multi: true }
        );
        Meteor.setTimeout(() => {
          HiveMindRoundWordCollection.update(
            { round_id: round_id, answer_count: revealling_answer_count },
            { $set: { revealed: true } },
            { multi: true }
          );
          Meteor.setTimeout(() => {
            HiveMindRoundWordCollection.update(
              { round_id: round_id, answer_count: revealling_answer_count },
              { $set: { reveal_answerers: true, revealling_answer: false } },
              { multi: true }
            );
            Meteor.call("hive_mind.reveal_round_answers", round_id);
          }, 500);
        }, 1500);
      }, 1000);
    } else {
      HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_revealed: new Date() } });
      Meteor.call("hive_mind.score_round", round_id);
    }
  },
  "hive_mind.schedule_reveal_round_answers"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    Meteor.setTimeout(() => {
      Meteor.call("hive_mind.reveal_round_answers", round_id);
    }, 5000);
  },
  "hive_mind.score_round"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });

    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    let round_words = HiveMindRoundWordCollection.find({ round_id: round_id, target: false }).fetch();

    let some_word_is_not_revealed = round_words.find((w) => !w.revealed);

    if (some_word_is_not_revealed) {
      throw new Meteor.Error("Some words not revealed yet");
    }

    for (let word of round_words) {
      let points_scored = Math.max(0, word.answer_count - 1);
      HiveMindRoundAnswerCollection.update(
        { round_word_id: word._id },
        { $set: { points_scored: points_scored } },
        { multi: true }
      );
    }

    // Mark Answers as Majorities (if they got the most points)
    let max_points = Math.max(...round_words.map((w) => w.answer_count));
    HiveMindRoundAnswerCollection.update(
      { round_id: round_id, points_scored: max_points - 1 },
      { $set: { is_majority: true } },
      { multi: true }
    );

    // Mark Answers as Minorities (if they got the least points but more than 0)
    let non_zero_points = round_words.map((w) => w.answer_count).filter((p) => p > 0);
    if (non_zero_points.length > 0) {
      let min_points = Math.min(...non_zero_points);
      HiveMindRoundAnswerCollection.update(
        { round_id: round_id, points_scored: min_points - 1, is_majority: { $ne: true } },
        { $set: { is_minority: true } },
        { multi: true }
      );
    }

    // At this point, we need to check if any player has reached the barrier of points to win the game, so collect all the players and their points
    let game = HiveMindGameCollection.findOne({ _id: round.game_id });
    let points_to_win = game?.points_to_win || 5 * (game_players.length - 1);
    let game_answers = HiveMindRoundAnswerCollection.find({ game_id: round.game_id }).fetch();
    let game_players = HiveMindGamePlayerCollection.find({ game_id: round.game_id })
      .fetch()
      .map((player) => {
        let player_answers = game_answers.filter((answer) => answer.player_id === player._id);
        let total_points = _.sumBy(player_answers, (a) => a.points_scored);
        return {
          ...player,
          total_points: total_points,
        };
      });

    // next we need to check if any player has reached the points to win, and that we only have one winner
    let most_points = Math.max(...game_players.map((p) => p.total_points));
    let first_place_players = game_players.filter((p) => p.total_points === most_points);
    let game_finished = false;

    if (most_points >= points_to_win && first_place_players.length === 1) {
      game_finished = true;
    }

    if (!game_finished) {
      Meteor.setTimeout(() => {
        HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_scored: new Date() } });
      }, 5000);
    } else {
      // Game has finished
      Meteor.setTimeout(() => {
        HiveMindRoundCollection.update({ _id: round_id }, { $set: { round_scored: new Date(), final_round: true } });
        Meteor.call("hive_mind.end_game", round.game_id);
      }, 5000);
    }
  },
  "hive_mind.start_next_round"(round_id, player_code) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });
    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    if (round.next_round_start) {
      throw new Meteor.Error("Next round already started");
    }

    let player = HiveMindPlayerCollection.findOne({ code: player_code });

    HiveMindRoundCollection.update(
      { _id: round_id },
      {
        $set: {
          next_round_start: new Date(),
          next_round_cancelling: false,
          next_round_cancelled_by: null,
          next_round_started_by: player?.name,
        },
      }
    );

    Meteor.call("hive_mind.create_next_round", round.game_id);
  },
  "hive_mind.cancel_start_next_round"(round_id, player_code) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });
    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    // if the game has a game_start timestamp, and it is less that 10 seconds ago, allow cancel
    if (!round.next_round_start || new Date().getTime() - new Date(round.next_round_start).getTime() > 3000) {
      throw new Meteor.Error("Round start cannot be cancelled");
    }

    if (round.next_round_cancelling) {
      throw new Meteor.Error("Next Round is already being cancelled");
    }

    let player = HiveMindPlayerCollection.findOne({ code: player_code });

    HiveMindRoundCollection.update(
      { _id: round_id },
      {
        $set: {
          next_round_start: null,
          next_round_cancelling: true,
          next_round_cancelled_by: player?.name,
          next_round_started_by: null,
        },
      }
    );

    Meteor.call("hive_mind.reset_cancel_next_round", round_id);

    let next_round_id = Meteor.call("hive_mind.get_next_round", round_id);
    Meteor.call("hive_mind.delete_round_data", next_round_id);
  },
  "hive_mind.reset_cancel_next_round"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });
    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    if (round?.next_round_start || !round?.next_round_cancelling) {
      throw new Meteor.Error("Cancel cannot be reset");
    }

    // wait 3 seconds, then reset cancelling to false
    Meteor.setTimeout(() => {
      HiveMindRoundCollection.update(
        { _id: round_id },
        { $set: { next_round_cancelling: false, next_round_cancelled_by: null } }
      );
    }, 3000);
  },
  "hive_mind.get_next_round"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });
    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    let game_id = round.game_id;
    let next_round_number = round.round_number + 1;

    let next_round = HiveMindRoundCollection.findOne({ game_id: game_id, round_number: next_round_number });

    if (!next_round) {
      throw new Meteor.Error("Next Round not found");
    }

    return next_round._id;
  },
  "hive_mind.get_current_round"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let current_round = HiveMindRoundCollection.findOne({ game_id: game_id }, { sort: { round_number: -1 } });

    if (!current_round) {
      throw new Meteor.Error("Current Round not found");
    }

    return current_round._id;
  },
  "hive_mind.create_next_round"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    let already_used_game_words = HiveMindRoundWordCollection.find({
      game_id: game_id,
      word_id: { $ne: "no_answer" },
    }).fetch();

    let language_modifier = {};

    if (game?.language_mode.includes("deutsch") && !game?.language_mode.includes("english")) {
      language_modifier.is_deutsch = true;
    } else if (game?.language_mode.includes("english") && !game?.language_mode.includes("deutsch")) {
      language_modifier.is_english = true;
    }

    let words = HiveMindWordCollection.find(
      {
        _id: { $nin: already_used_game_words.map((w) => w.word_id) },
        ...language_modifier,
      },
      { limit: 20 }
    ).fetch();

    console.log({ words_to_choose: words.length });

    let random_five_words = _.sampleSize(words, 5);

    let game_rounds = HiveMindRoundCollection.find({ game_id: game_id }).fetch();
    let round_number = game_rounds.length + 1;

    let round_id = HiveMindRoundCollection.insert({
      game_id: game_id,
      round_number: round_number,
      created_at: new Date(),
    });

    for (let idx in random_five_words) {
      let word = random_five_words[idx];
      HiveMindRoundWordCollection.insert({
        game_id: game_id,
        round_id: round_id,
        word_id: word._id, // use the same ID as the word
        word: word.word,
        target: idx === "0",
        order: parseInt(idx) + 1,
      });
    }

    // Assign robot answers for this round
    Meteor.call("hive_mind.assign_robot_answers", round_id);

    return round_id;
  },
  "hive_mind.delete_round_data"(round_id) {
    if (!round_id) {
      throw new Meteor.Error("Round ID is required");
    }

    let round = HiveMindRoundCollection.findOne({ _id: round_id });
    if (!round) {
      throw new Meteor.Error("Round not found");
    }

    HiveMindRoundCollection.remove({ _id: round_id });
    HiveMindRoundWordCollection.remove({ round_id: round_id });
    HiveMindRoundAnswerCollection.remove({ round_id: round_id });
  },
  "hive_mind.update_game_settings"(game_id, settings) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    HiveMindGameCollection.update({ _id: game_id }, { $set: settings });
  },
  "hive_mind.add_robots_to_game"(game_id, robot_count) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    let existing_robots = HiveMindGamePlayerCollection.find({ game_id: game_id, is_robot: true }).fetch();
    let used_robot_names = existing_robots.map((r) => r.player_name);
    let robot_names_available = _.shuffle(robot_names.filter((rn) => !used_robot_names.includes(rn)));

    if (robot_count > existing_robots?.length) {
      let robots_to_add = robot_count - existing_robots?.length;
      for (let i = 0; i < robots_to_add; i++) {
        HiveMindGamePlayerCollection.insert({
          game_id: game_id,
          game_name: game.name,
          player_id: null,
          player_code: `robot_${Random.id(6)}`,
          player_name: robot_names_available[i % robot_names_available.length],
          is_robot: true,
          created_at: new Date(),
        });
      }
    } else if (robot_count < existing_robots?.length) {
      let robots_to_remove = existing_robots.length - robot_count;
      let robots_sorted_by_created = _.sortBy(existing_robots, (r) => r.created_at);
      let robots_to_delete = robots_sorted_by_created.slice(-robots_to_remove);
      for (let robot of robots_to_delete) {
        HiveMindGamePlayerCollection.remove({ _id: robot._id });
      }
    }
  },
  "hive_mind.end_game"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }
    // Step 1:
    // So we will set a timestamp here and add a property to the round indicating that this was the final round
    let final_round = HiveMindRoundCollection.findOne({ game_id: game_id, final_round: true });

    if (!final_round) {
      throw new Meteor.Error("Final round not found");
    }

    HiveMindGameCollection.update({ _id: game_id }, { $set: { ended_at: new Date() } });
    // Step 2: Add the total_points property to each game_player object
    let game_players = HiveMindGamePlayerCollection.find({ game_id: game_id }).fetch();
    let game_answers = HiveMindRoundAnswerCollection.find({ game_id: game_id }).fetch();

    for (let gp of game_players) {
      let player_answers = game_answers.filter((answer) => answer.player_id === gp._id);
      let total_points = _.sumBy(player_answers, (a) => a.points_scored);

      HiveMindGamePlayerCollection.update({ _id: gp._id }, { $set: { total_points: total_points } });
    }

    // Next we will be able to reveal the players positions one by one in the UI
    Meteor.call("hive_mind.schedule_reveal_final_leaderboard", game_id);
  },
  "hive_mind.schedule_reveal_final_leaderboard"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    Meteor.setTimeout(() => {
      Meteor.call("hive_mind.reveal_final_leaderboard", game_id);
    }, 5000);
  },
  "hive_mind.reveal_final_leaderboard"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    let unrevealed_players = HiveMindGamePlayerCollection.find(
      { game_id: game_id, final_position_revealed: { $ne: true } },
      { sort: { total_points: 1, player_name: 1 } }
    ).fetch();

    if (unrevealed_players.length > 0) {
      let player_to_reveal = unrevealed_players[0];
      let player_to_reveal_points = player_to_reveal?.total_points;
      HiveMindGamePlayerCollection.update(
        { game_id: game_id, total_points: player_to_reveal_points, final_position_revealed: { $ne: true } },
        { $set: { revealling_final_position: true } },
        { multi: true }
      );

      Meteor.setTimeout(() => {
        HiveMindGamePlayerCollection.update(
          { game_id: game_id, total_points: player_to_reveal_points, final_position_revealed: { $ne: true } },
          {
            $set: {
              revealling_final_position: false,
              final_position_revealed: true,
              final_position_revealed_at: new Date(),
            },
          },
          { multi: true }
        );
        console.log(`Points Revealed: ${player_to_reveal_points}: ${new Date().getSeconds()}`);
        Meteor.call("hive_mind.reveal_final_leaderboard", game_id);
      }, 3000);
    } else {
      // All players revealed
      HiveMindGameCollection.update({ _id: game_id }, { $set: { final_leaderboard_revealed: new Date() } });
    }
  },
  "hive_mind.restart_final_leaderboard_reveal"(game_id) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });

    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    HiveMindGameCollection.update({ _id: game_id }, { $set: { final_leaderboard_revealed: false } });
    HiveMindGamePlayerCollection.update(
      { game_id: game_id, final_position_revealed: true },
      { $set: { final_position_revealed: false, final_position_revealed_at: null, revealing_final_position: false } },
      { multi: true }
    );

    Meteor.call("hive_mind.reveal_final_leaderboard", game_id);
  },
  "hive_mind.choose_language"(game_id, language) {
    if (!game_id) {
      throw new Meteor.Error("Game ID is required");
    }

    let game = HiveMindGameCollection.findOne({ _id: game_id });
    if (!game) {
      throw new Meteor.Error("Game not found");
    }

    if (!language || !["english", "deutsch"].includes(language)) {
      throw new Meteor.Error("Language not valid");
    }

    let current_language_mode = game?.language_mode || [];

    if (current_language_mode?.length === 1 && current_language_mode.includes(language)) {
      return;
    } else if (current_language_mode.includes(language)) {
      let new_language_mode = current_language_mode.filter((lm) => lm !== language);

      HiveMindGameCollection.update({ _id: game_id }, { $set: { language_mode: new_language_mode } });
    } else {
      let new_language_mode = [...current_language_mode, language];

      HiveMindGameCollection.update({ _id: game_id }, { $set: { language_mode: new_language_mode } });
    }
  },
});
