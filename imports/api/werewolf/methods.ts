import { inpaint } from "@u4/opencv4nodejs";
import { Meteor } from "meteor/meteor";
import {
	WolfGameCollection,
	WolfPlayerCollection,
	WolfRoundCollection,
} from "/imports/api/werewolf/collections";
import { Random } from "meteor/random";
import _ from "lodash";

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
		WolfPlayerCollection.insert({ game_id: game_id, name: name, code: code });
	},
	"wolf.sink_ball"(game_id, ball_to_sink) {
		// Step 1: Update the game by adding the ball to the sunk balls array
		WolfGameCollection.update(
			{ _id: game_id },
			{ $push: { sunk_balls: ball_to_sink } }
		);

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
			WolfPlayerCollection.update(
				{ _id: player._id },
				{ $set: { balls: player_balls } }
			);
		}

		// Step 3: Get the game mode of the game
		let game = WolfGameCollection.findOne({ _id: game_id });
		let game_mode = game.game_mode;

		// Step 4: If the game mode is "stay_alive", mark the player as finished if they have no balls left
		if (game_mode == "stay_alive" && player) {
			let alive_balls = player_balls.filter((ball) => ball.status == "alive");
			if (alive_balls.length == 0) {
				WolfPlayerCollection.update(
					{ _id: player._id },
					{ $set: { finished_at: new Date() } }
				);
			}
		}

		// Step 5: If the game mode is "sink_all", mark the player as finished if all their balls are sunk
		if (game_mode == "sink_all" && player) {
			let sunk_balls = player_balls.filter((ball) => ball.status == "sunk");
			if (sunk_balls.length == player_balls.length) {
				WolfPlayerCollection.update(
					{ _id: player._id },
					{ $set: { finished_at: new Date() } }
				);
			}
			player = WolfPlayerCollection.findOne({ _id: player._id });
		}

		// Step 6: If all but one player is finished, end the game
		let players = WolfPlayerCollection.find({ game_id: game_id }).fetch();
		let finished_players = players.filter((player) => player.finished_at);
		if (players.length - finished_players.length <= 1) {
			WolfGameCollection.update(
				{ _id: game_id },
				{ $set: { end_time: new Date() } }
			);
		}

		return player;
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
			WolfPlayerCollection.update(
				{ _id: player._id },
				{ $set: { role: roles[index] } }
			);
		});

		// Step 4: Update the game with a start time, game mode and roles
		WolfGameCollection.update(
			{ _id: game_id },
			{ $set: { game_mode: game_mode, start_time: new Date() } }
		);

		// Step 5: Create the first round

		WolfRoundCollection.insert({
			game_id: game_id,
			cycle: "night",
			completed: false,
			created_at: new Date(),
		});
	},
});
