import { Options } from './../.meteor/local/.build422760.build/programs/.build662945.server/assets/packages/mongo/mongo.d';
import { Meteor } from 'meteor/meteor';
import webpush  from 'web-push';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import {HTTP} from 'meteor/http'
import { BingoCollection } from '/imports/api/bingos';
import { CardsCollection } from '/imports/api/cards';
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

Meteor.publish('transactions.all', function publishTransactionsAll() {
  return TransactionCollection.find()
})

Meteor.publish('categories.all', function publishCategoriesAll() {
  return CategoryCollection.find()
})

Meteor.publish('zones.all', function publishCategoriesAll() {
  return ZoneCollection.find()
})

Meteor.publish('cards', function(game_id){
  return CardsCollection.find({game_id:game_id})
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
  "new_game"(name){
    let code = Random.id(4)
    let id = BingoCollection.insert({name:name.toLowerCase(), code:code.toLowerCase()})
    return id
  },
  'add_option'(game_id, name){
    OptionsCollection.insert({game_id: game_id, name:name})
  },
  'add_player'(game_id, name){
    let options = _.shuffle(OptionsCollection.find({game_id:game_id}, {limit:25}).fetch())
    let cards = []
    
    let y = 0
    let z = 0
    while(y < 5){
      let x = 0
      while(x < 5){
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
    CardsCollection.insert({game_id: game_id, name:name.toLowerCase(), card:cards})
  }
})