import { Meteor } from "meteor/meteor"
import { KellyPlayerCollection, KellyGameCollection } from "/imports/api/kelly_pool/collections"

Meteor.publish('kelly.players', function(game_id){
  return [KellyPlayerCollection.find({game_id:game_id})]
})

Meteor.publish('kelly.games', function(){
  return KellyGameCollection.find()
})