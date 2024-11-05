import { Meteor } from "meteor/meteor"
import { ZilchePlayerCollection, ZilcheGameCollection } from "/imports/api/zilche/collections"

Meteor.publish('zilche.players', function(game_id){
  return [ZilchePlayerCollection.find({game_id:game_id})]
})

Meteor.publish('zilche.games', function(){
  return ZilcheGameCollection.find()
})