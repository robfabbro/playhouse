import { Meteor } from "meteor/meteor"
import { SantaPlayerCollection, SantaGameCollection } from "/imports/api/secret_santa/collections"

Meteor.publish('santa.players', function(game_id){
  return [SantaPlayerCollection.find({game_id:game_id})]
})

Meteor.publish('santa.games', function(){
  return SantaGameCollection.find()
})