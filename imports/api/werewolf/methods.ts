import { Meteor } from 'meteor/meteor';
import { WolfGameCollection, WolfPlayerCollection } from '/imports/api/werewolf/collections';
import { Random } from 'meteor/random';

Meteor.methods({
  "wolf.new_game"(name){
    let code = Random.id(4)
    let id = WolfGameCollection.insert({name:name.toLowerCase(), code:code.toLowerCase()})
    return id
  }
})