import { Meteor } from "meteor/meteor";
import {
	WolfGameCollection,
	WolfPlayerCollection,
	WolfRoundCollection,
} from "/imports/api/werewolf/collections";

Meteor.publish("wolf.players", function (game_id) {
	return [WolfPlayerCollection.find({ game_id: game_id })];
});

Meteor.publish("wolf.rounds", function (game_id) {
	return [WolfRoundCollection.find({ game_id: game_id })];
});

Meteor.publish("wolf.games", function () {
	return WolfGameCollection.find();
});
