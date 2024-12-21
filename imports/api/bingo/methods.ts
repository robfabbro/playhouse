import { Meteor } from 'meteor/meteor';
import { BingoGameCollection, BingoPlayerCollection, BingoPlayerCardCollection, BingoCardCollection } from '/imports/api/bingo/collections';
import _ from 'lodash'
import { Random } from 'meteor/random';


Meteor.methods({
  "bingo.new_game"(name, size){
    let code = Random.id(4)
    let id = BingoGameCollection.insert({name:name.toLowerCase(), code:code.toLowerCase(), size: size})
    return id
  },
  'bingo.add_option'(game_id, name){
    BingoCardCollection.insert({game_id: game_id, name:name})
  },
  'bingo.reorder_results'(game_id){
    BingoPlayerCollection.find({game_id:game_id, bingo:true}, {sort: {bingo_at: 1}}).fetch().forEach((player, idx)=>{
      BingoPlayerCollection.update({_id:player._id}, {$set:{bingo_position: idx + 1}})
    })
  },
  'bingo.add_player'(game_id, name){
    let options = _.shuffle(BingoCardCollection.find({game_id:game_id}).fetch())
    let gameSize = BingoGameCollection.findOne({_id: game_id}).size
    let cards = []
    
    let y = 0
    let z = 0
    while(y < gameSize){
      let x = 0
      while(x < gameSize){
        cards.push({
          option:options[z],
          x:x, 
          y:y,
          marked: false
        })
        x = x + 1
        z = z + 1
      }
      y = y + 1
    }
    let card_id = BingoPlayerCollection.insert({game_id: game_id, name:name.toLowerCase()})
    for(let card of cards){
      BingoPlayerCardCollection.insert({
        game_id:game_id,
        card_id: card_id,
        ...card
      })
    }
  }, 
  'bingo.toggle'(card_option, game_id){
    console.log("called toggle", card_option)
    let gameSize = BingoGameCollection.findOne({_id: game_id}).size
    if(card_option && card_option._id){
      BingoPlayerCardCollection.update({_id:card_option._id}, {$set:{marked:!card_option.marked}})
    }
    let player = BingoPlayerCollection.findOne({_id:card_option.card_id})
    let player_cards = BingoPlayerCardCollection.find({card_id:player._id}).fetch()
    let rows = []
    let diags = [0,0]
    for(let x = 0; x < gameSize; x = x+1){
      rows[x] = 0
      for(let y = 0; y < gameSize; y = y+1){
        let val = player_cards.find(p=>(p.x == x && p.y == y))
        rows[x] = val.marked ? rows[x] + 1 : rows[x]
        if(x == y && val.marked){
          diags[0] = diags[0] + 1
        }
        if((x + y) == (gameSize - 1) && val.marked){
          diags[1] = diags[1] + 1
        }
      }
    }
    let cols = []
    for(let y = 0; y < gameSize; y = y+1){
      cols[y] = 0
      for(let x = 0; x < gameSize; x = x+1){
        let val = player_cards.find(p=>(p.x == x && p.y == y))
        cols[y] = val.marked ? cols[y] + 1 : cols[y]
      }
    }
    if(Math.max(...rows, ...cols, ...diags) >= gameSize){
      BingoPlayerCollection.update({_id:card_option.card_id}, {$set:{bingo:true, bingo_at: new Date()}})
    }else{
      BingoPlayerCollection.update({_id:card_option.card_id}, {$set:{bingo:false, bingo_at: null, bingo_position: null}})
    }
    Meteor.call('bingo.reorder_results', game_id)
  }
})