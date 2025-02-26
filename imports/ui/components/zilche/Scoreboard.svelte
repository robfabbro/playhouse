<script>
  import { params } from "@roxi/routify";
  import { HTTP } from "meteor/http";
  import { ZilcheGameCollection, ZilchePlayerCollection } from "/imports/api/zilche/collections";
  import { Meteor } from "meteor/meteor";
  import _ from "lodash";

  let { game_id, name } = $params;
  let game;
  let players = [];
  $m: {
    game = ZilcheGameCollection.findOne({ _id: $params.game_id });
    players = ZilchePlayerCollection.find({ game_id: game_id }, { sort: { order: 1 } }).fetch();
  }

  const isWinner = (player) => {
    return game.finished && player?.placing === "1st";
  };
  const isHighlighted = (player) => {
    return !game.finished && player?.turn;
  };
</script>

<div class="w-full lg:flex flex-col my-8">
  {#each players as player, idx (player?._id)}
    <div
      class={`grid grid-cols-12 my-2 text-lg md:text-2xl ${isWinner(player) ? "animate-winner-font" : isHighlighted(player) ? "text-indigo-600 font-bold" : "text-gray-500"}`}
    >
      <span class="capitalize col-start-1 col-end-2 text-center">{player?.name}</span>
      <!-- CUSTOM RANGE -->
      <div class="relative flex items-center col-start-2 col-end-12 w-full h-full">
        <!-- BACKGROUND MARKER -->
        <div
          class={`absolute left-0 h-1 w-full rounded-xl z-10 ${isWinner(player) ? "animate-winner-colour" : isHighlighted(player) ? "bg-indigo-200" : "bg-gray-200"}`}
        ></div>

        <div class="absolute left-0 flex items-center h-3 w-full rounded-xl z-20">
          <!-- SCORE CONFIRMED -->
          <div
            class={`h-full z-20 ${isWinner(player) ? "animate-winner-colour" : isHighlighted(player) ? "bg-indigo-600" : "bg-gray-200"} flex justify-end items-center ${player.stored_score ? "rounded-l-xl" : "rounded-xl"}`}
            style={`width: ${player.score / 100}%;`}
          ></div>
          <!-- SCORE UNCONFIRMED -->
          <div
            class={`rounded-r-xl h-full z-20 opacity-50 bg-indigo-400 flex justify-end items-center -mr-2`}
            style={`width: ${player.stored_score / 100}%;`}
          ></div>
          <!-- RANGE THUMB THUMB -->
          <span
            class={`flex justify-center items-center rounded-full ${isWinner(player) ? "animate-winner-colour" : isHighlighted(player) ? "bg-indigo-800" : "bg-gray-300 "} w-5 h-5 z-30 opacity-100`}
          >
          </span>
        </div>
      </div>
      <span class="col-start-12 col-end-13 text-center self-center">{player?.score + (player?.stored_score || 0)}</span>
    </div>
  {/each}
</div>
