import { Meteor } from 'meteor/meteor';
import { KellyGameCollection, KellyPlayerCollection } from '/imports/api/kelly_pool/collections';
import { Random } from 'meteor/random';

Meteor.methods({
  "kelly.new_game"(name){
    let code = Random.id(4)
    let id = KellyGameCollection.insert({name:name.toLowerCase(), code:code.toLowerCase()})
    return id
  },
  'kelly.add_player'(game_id, name, code){
    KellyPlayerCollection.insert({game_id: game_id, name:name, code:code})
  }, 
  'kelly.sink_ball'(game_id, ball_to_sink){

    // Step 1: Update the game by adding the ball to the sunk balls array
    KellyGameCollection.update({_id:game_id}, {$push:{sunk_balls:ball_to_sink}})

    // Step 2: Update the player (who has this ball) balls array so that the ball is marked as sunk
    let player = KellyPlayerCollection.findOne({game_id:game_id, balls:{$elemMatch:{ball:ball_to_sink}}})
    let player_balls = player?.balls || []

    if(player){
      player_balls = player.balls.map((ball)=>{
        if(ball.ball == ball_to_sink){
          ball.status = "sunk"
          ball.sunk_time = new Date()
        }
        return ball
      }) 
      KellyPlayerCollection.update({_id:player._id}, {$set:{balls:player_balls}})
    }
      

    // Step 3: Get the game mode of the game
    let game = KellyGameCollection.findOne({_id:game_id})
    let game_mode = game.game_mode

    // Step 4: If the game mode is "stay_alive", mark the player as finished if they have no balls left
    if(game_mode == "stay_alive" && player){
      let alive_balls = player_balls.filter((ball)=>ball.status == "alive")
      if(alive_balls.length == 0){
        KellyPlayerCollection.update({_id:player._id}, {$set:{finished_at: new Date()}})
      }
    } 

    // Step 5: If the game mode is "sink_all", mark the player as finished if all their balls are sunk
    if(game_mode == "sink_all" && player){
      let sunk_balls = player_balls.filter((ball)=>ball.status == "sunk")
      if(sunk_balls.length == player_balls.length){
        KellyPlayerCollection.update({_id:player._id}, {$set:{finished_at: new Date()}})
      }
      player = KellyPlayerCollection.findOne({_id:player._id})
    }

    // Step 6: If all but one player is finished, end the game
    let players = KellyPlayerCollection.find({game_id:game_id}).fetch()
    let finished_players = players.filter((player)=>player.finished_at)
    if(players.length - finished_players.length <= 1){
      KellyGameCollection.update({_id:game_id}, {$set:{end_time:new Date()}})
    }

    return player
  }, 
  'kelly.start_game'(game_id, game_mode){

    // Step 1: Update the game with a start time, game mode and sunk balls array
    KellyGameCollection.update({_id:game_id}, {$set:{game_mode:game_mode, start_time:new Date(), sunk_balls:[]}})

    // Step 2: Get all the players for the game
    let players = KellyPlayerCollection.find({game_id:game_id}).fetch()

    // Step 3: Find out how many balls each player gets
    let balls_per_player = Math.floor(15 / players.length)

    // Step 4: For each player, add a random ball (1-15) to their hand, no player can have the same ball
    let balls = _.shuffle(_.range(1,16))
    players.forEach((player, index)=>{
      let player_balls = balls.slice(index*balls_per_player, (index+1)*balls_per_player)
      player_balls = player_balls.sort((a, b) => a - b).map((ball) => {
        return {ball:ball, status:"alive"}
      })

      KellyPlayerCollection.update({_id:player._id}, {$set:{balls:player_balls}})
    })
    

  },
})