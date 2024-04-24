import { Meteor } from 'meteor/meteor';
import webpush  from 'web-push';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import {HTTP} from 'meteor/http'
import { BingoCollection } from '/imports/api/bingos';
import { CardOptionsCollection, CardsCollection } from '/imports/api/cards';
import { OptionsCollection } from '/imports/api/options';
import _ from 'lodash'
import { Random } from 'meteor/random';

dayjs.extend(utc)
dayjs.extend(timezone)

webpush.setVapidDetails(
  `mailto:${'ben@techreative.com.au'}`,
  Meteor.settings.public.vapid,
  Meteor.settings.private.vapid
)

let melbourne = 'Australia/Melbourne'

const calcDiffWeeks = (rubbish)=>{
  if(!rubbish){
    return false
  }

  if(rubbish.schedule == 'weekly'){
    return true
  }

  if(rubbish.schedule == 'fortnightly'){
    const tomorrow = dayjs().tz(melbourne).add(1, 'day')
    let diff = tomorrow.diff(dayjs(rubbish.start_date).tz(melbourne),'weeks')
    return diff % 2 == 0
  }

  return false
}

Meteor.publish('cards', function(game_id){
  return [CardsCollection.find({game_id:game_id}), CardOptionsCollection.find({game_id:game_id})]
})

Meteor.publish('options', function(game_id){
  return OptionsCollection.find({game_id:game_id})
})

Meteor.publish('bingos', function(){
  return BingoCollection.find()
})

Meteor.methods({
  "form_fill"(name, email, message){
    HTTP.post("https://techreative.webhook.office.com/webhookb2/cea742d6-3ea8-4616-9d0b-8f464c433f76@89f77634-b5c8-46e8-b522-4d8fe636eed2/IncomingWebhook/89d9069cdf5947aba18df9c427fc1cee/da573cb8-c5cb-41cd-aed2-c280113454a0",
      {data:{
        "type":"message",
        "attachments":[
            {
              "contentType":"application/vnd.microsoft.card.adaptive",
              "contentUrl":null,
              "content":{
                "type": "AdaptiveCard",
                "body": [
                    {
                        "type": "TextBlock",
                        "size": "Medium",
                        "weight": "Bolder",
                        "text": "Website Form Filled"
                    },
                    {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "weight": "Bolder",
                                        "text": `${name}`,
                                        "wrap": true
                                    },
                                    {
                                      "type": "TextBlock",
                                      "spacing": "None",
                                      "text": `${email}`,
                                      "isSubtle": true,
                                      "wrap": true
                                  }
                                ],
                                "width": "stretch"
                            }
                        ]
                    },
                    {
                        "type": "TextBlock",
                        "text": `This user has just filled out the contact form!`,
                        "wrap": true
                    }
                    {
                      "type": "TextBlock",
                      "text": `${message}`,
                      "wrap": true
                  }
                ],
                "actions": [
                    {
                        "type": "Action.OpenUrl",
                        "title": "Wohoo",
                        "url": `https://techreative.com.au`
                    },
                ],
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "1.4"
              }
            }
          ]
        }
    })
  },
  "new_game"(name, size){
    let code = Random.id(4)
    let id = BingoCollection.insert({name:name.toLowerCase(), code:code.toLowerCase(), size: size})
    return id
  },
  'add_option'(game_id, name){
    OptionsCollection.insert({game_id: game_id, name:name})
  },
  'reorder_results'(game_id){
    CardsCollection.find({game_id:game_id, bingo:true}, {sort: {bingo_at: 1}}).fetch().forEach((player, idx)=>{
      CardsCollection.update({_id:player._id}, {$set:{bingo_position: idx + 1}})
    })
  },
  'add_player'(game_id, name){
    let options = _.shuffle(OptionsCollection.find({game_id:game_id}).fetch())
    let gameSize = BingoCollection.findOne({_id: game_id}).size
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
    let card_id = CardsCollection.insert({game_id: game_id, name:name.toLowerCase()})
    for(let card of cards){
      CardOptionsCollection.insert({
        game_id:game_id,
        card_id: card_id,
        ...card
      })
    }
  }, 
  'toggle'(card_option, game_id){
    console.log("called toggle", card_option)
    let gameSize = BingoCollection.findOne({_id: game_id}).size
    if(card_option && card_option._id){
      CardOptionsCollection.update({_id:card_option._id}, {$set:{marked:!card_option.marked}})
    }
    let player = CardsCollection.findOne({_id:card_option.card_id})
    let player_cards = CardOptionsCollection.find({card_id:player._id}).fetch()
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
      CardsCollection.update({_id:card_option.card_id}, {$set:{bingo:true, bingo_at: new Date()}})
    }else{
      CardsCollection.update({_id:card_option.card_id}, {$set:{bingo:false, bingo_at: null, bingo_position: null}})
    }
    Meteor.call('reorder_results', game_id)
  }
})