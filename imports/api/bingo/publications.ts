import { Meteor } from 'meteor/meteor';
import { BingoGameCollection, BingoPlayerCollection, BingoPlayerCardCollection, BingoCardCollection } from '/imports/api/bingo/collections';
import _ from 'lodash'

Meteor.publish('bingo.players', function(game_id){ //cards
  return [BingoPlayerCollection.find({game_id:game_id}), BingoPlayerCardCollection.find({game_id:game_id})]
})

Meteor.publish('bingo.cards', function(game_id){ //options
  return BingoCardCollection.find({game_id:game_id})
})

Meteor.publish('bingo.games', function(){ //bingos
  return BingoGameCollection.find()
})