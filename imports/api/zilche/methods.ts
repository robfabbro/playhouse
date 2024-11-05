import { Meteor } from "meteor/meteor";
import {
	ZilcheGameCollection,
	ZilchePlayerCollection,
} from "/imports/api/zilche/collections";
import { Random } from "meteor/random";

Meteor.methods({
	"zilche.new_game"(name) {
		let code = Random.id(4);
		let id = ZilcheGameCollection.insert({
			name: name.toLowerCase(),
			code: code.toLowerCase(),
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
			scores: [],
			zilches: 0,
			placing: "--",
		});
	},
	"zilche.start_game"(game_id, poison) {
		// Step 1: Update the game with a start time, game mode and sunk balls array
		ZilcheGameCollection.update(
			{ _id: game_id },
			{ $set: { poison, start_time: new Date(), zilcheCount: 0 } }
		);
	},
	"zilche.choose_poison"(game_id, poison) {
		// Step 1: Update the game with a start time, game mode and sunk balls array
		ZilcheGameCollection.update({ _id: game_id }, { $set: { poison } });
	},

	"zilche.editPlayer": function (game_id, player_id, name) {
		let game = ZilcheGameCollection.findOne({ _id: game_id });
		game?.players.map((p) => {
			if (p._id == player_id) {
				name ? (p.name = name) : (p.name = "Player");
			}
			return p;
		});
		return ZilcheGameCollection.update(
			{ _id: game_id },
			{ $set: { players: game?.players } }
		);
	},
	"zilche.stealScore": function (game_id, player_id) {
		let game = ZilcheGameCollection.findOne({ _id: game_id });
		let stolenScore = game?.last_score.value;
		let stolenCounter = game?.last_score.counter;
		game?.players.map((p) => {
			if (p._id == player_id) {
				p.stored_score = stolenScore;
				p.counter = stolenCounter;
			}
			return p;
		});
		ZilcheGameCollection.update(
			{ _id: game_id },
			{ $set: { players: game.players } }
		);
	},
	"zilche.storeScore": function (player_id, score) {
    let player = ZilchePlayerCollection.findOne({_id: player_id});

    if (player.stored_score) {
      player.stored_score = player.stored_score + score;
    } else {
      player.stored_score = score;
    }

    if (player.counter) {
      player.counter = player.counter + 1;
    } else {
      player.counter = 1;
    }

    ZilchePlayerCollection.update(
      { _id: player_id },
      { $set: { stored_score: player.stored_score, counter: player.counter } }
    );
	},
	"zilche.addScore": function (game_id, player_id, counter, score) {
		let game = ZilcheGameCollection.findOne({ _id: game_id });
		score = parseInt(score);
		let score_id = Random.id();
		let first_score = false;
		let big_score = false;
		let triple_zilche = false;
		let over_ten_thousand = false;
		game?.players.map((p, idx) => {
			if (p._id == player_id) {
				if (score == 0) {
					p.zilches = p.zilches + 1;
					p.total_zilches = p.total_zilches + 1;
					p.lost_scores.push({
						_id: score_id,
						value: p.stored_score,
					});
					if (p.zilches >= 3) {
						p.score = p.score - 500 * (p.zilches - 2);
					}
					if (p.zilches % 3 == 0 && p.zilches != 0) {
						triple_zilche = true;
					}
				} else if (score > 0) {
					p.zilches = 0;
					if (score > 0 && !p.first_score) {
						p.first_score = true;
						first_score = true;
					}
					if (score > 1000) {
						big_score = true;
					}

					p.scores.push({
						_id: score_id,
						value: score,
					});
				}
				p.score = p.score + score;
				p.stored_score = 0;
				p.counter = 0;

				if (p.score >= 10000) {
					over_ten_thousand = true;
					game.final_round = true;
				}

				//update round if the player scoring is the last player
				if (idx + 1 == game?.players.length) {
					if (game?.final_round) {
						game.finished = true;
					} else {
						game.round = game?.round + 1;
					}
				}

				//only update the turn if player scored is there turn (for editing reasons)
				if (game?.turn % game?.players.length == idx) {
					game.turn = game?.turn + 1;
				}
			}
			return p;
		});

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

		ZilcheGameCollection.update(
			{ _id: game_id },
			{
				$set: {
					last_score: game?.last_score,
					scores: game?.scores,
					players: game?.players,
					turn: game?.turn,
					round: game?.round,
					final_round: game?.final_round,
					finished: game?.finished,
				},
			}
		);

		if (Meteor.isServer) {
			if (over_ten_thousand) {
				let gifurl = encodeURI(
					giphy.baseURL + giphy.robGif + "?api_key=" + giphy.apiKey
				);
				let res = HTTP.get(gifurl);
				let newGiphy = res.data.data.images.original.url;
				ZilcheGameCollection.update(
					{ _id: game_id },
					{ $set: { showGif: true, giph: newGiphy } }
				);
				Meteor.setTimeout(() => {
					ZilcheGameCollection.update(
						{ _id: game_id },
						{ $set: { showGif: false } }
					);
				}, 6000);
			} else if (triple_zilche) {
				let gifurl = encodeURI(
					giphy.baseURL +
						giphy.type +
						"?api_key=" +
						giphy.apiKey +
						"&tag=" +
						game?.poison
				);
				let res = HTTP.get(gifurl);
				let newGiphy = res.data.data.images.original.url;
				ZilcheGameCollection.update(
					{ _id: game_id },
					{ $set: { showGif: true, giph: newGiphy } }
				);
				Meteor.setTimeout(() => {
					ZilcheGameCollection.update(
						{ _id: game_id },
						{ $set: { showGif: false } }
					);
				}, 6000);
			} else if (score == 0) {
				let gifurl = encodeURI(
					giphy.baseURL +
						giphy.type +
						"?api_key=" +
						giphy.apiKey +
						"&tag=" +
						"zilch+zero+nothing"
				);
				let res = HTTP.get(gifurl);
				let newGiphy = res.data.data.images.original.url;
				ZilcheGameCollection.update(
					{ _id: game_id },
					{ $set: { showGif: true, giph: newGiphy } }
				);
				Meteor.setTimeout(() => {
					ZilcheGameCollection.update(
						{ _id: game_id },
						{ $set: { showGif: false } }
					);
				}, 6000);
			} else if (first_score) {
				let gifurl = encodeURI(
					giphy.baseURL +
						giphy.type +
						"?api_key=" +
						giphy.apiKey +
						"&tag=" +
						"scoreboard+party"
				);
				let res = HTTP.get(gifurl);
				let newGiphy = res.data.data.images.original.url;
				ZilcheGameCollection.update(
					{ _id: game_id },
					{ $set: { showGif: true, giph: newGiphy } }
				);
				Meteor.setTimeout(() => {
					ZilcheGameCollection.update(
						{ _id: game_id },
						{ $set: { showGif: false } }
					);
				}, 6000);
			} else if (big_score) {
				let gifurl = encodeURI(
					giphy.baseURL +
						giphy.type +
						"?api_key=" +
						giphy.apiKey +
						"&tag=" +
						"bangarang+winning+crushing+slay"
				);
				let res = HTTP.get(gifurl);
				let newGiphy = res.data.data.images.original.url;
				ZilcheGameCollection.update(
					{ _id: game_id },
					{ $set: { showGif: true, giph: newGiphy } }
				);
				Meteor.setTimeout(() => {
					ZilcheGameCollection.update(
						{ _id: game_id },
						{ $set: { showGif: false } }
					);
				}, 6000);
			}
		}
	},
});
