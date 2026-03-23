<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { redirect, goto, route } from "@roxi/routify";
  import moment from "moment";
  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  import {
    HiveMindGameCollection,
    HiveMindGamePlayerCollection,
    HiveMindPlayerCollection,
    HiveMindRoundCollection,
    HiveMindRoundWordCollection,
    HiveMindRoundAnswerCollection,
  } from "/imports/api/hive_mind/collections";
  import PlayerAvatar from "/imports/ui/components/hive_mind/PlayerAvatar.svelte";
  import Countdown from "/imports/ui/components/hive_mind/Countdown.svelte";
  import WordResult from "/imports/ui/components/hive_mind/WordResult.svelte";
  import PlayerResult from "/imports/ui/components/hive_mind/PlayerResult.svelte";
  import PlayerScoreModal from "/imports/ui/components/hive_mind/PlayerScoreModal.svelte";
  import WordInformationModal from "/imports/ui/components/hive_mind/WordInformationModal.svelte";
  import { textfit } from "svelte-textfit";
  import { onMount } from "svelte";
  import _ from "lodash";
  import { fade, draw } from "svelte/transition";
  import { cubicOut, quintOut } from "svelte/easing";

  export let scoped;
  $: ({ player_code, your_player, your_game_player, game_id, round_id } = scoped);

  $m: {
    console.log("%c PROPS ON /hive_mind_index: ", "color: yellow; font-weight: bold;");
    console.log({ ...scoped });
  }

  let showResult = false;
  let timeout = null;

  // $m: {
  //   console.log("SHOW RESULT: ", showResult);
  //   timeout = setTimeout(() => {
  //     showResult = !showResult;
  //   }, 3000);
  // }

  let show = false;
  const options: Options = {
    rootMargin: "50px",
    unobserveOnEnter: true,
    threshold: 0.1,
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => (show = detail.inView);

  let game;
  let all_players = [];
  let all_answers = [];
  let other_players = [];
  let loading = false;
  let round;
  let answer = [];
  let target_word = null;
  let round_words = [];
  let no_answer_word = null;
  let selectedPlayerId = null;
  let selectedWordIdToView = null;

  $m: {
    round = HiveMindRoundCollection.findOne({ _id: round_id }, { sort: { createdAt: -1 } });
    target_word = HiveMindRoundWordCollection.findOne({ round_id: round_id, target: true });
    round_words = HiveMindRoundWordCollection.find(
      { round_id: round_id, target: false },
      { sort: { answer_count: -1, order: 1 } }
    ).fetch();
    no_answer_word = HiveMindRoundWordCollection.findOne({ round_id: round_id, word_id: "no_answer" });

    if (!round) {
      $goto(`/hive_mind/${game_id}`);
    }

    if (round?.next_round_start || round?.next_round_cancelling) {
      selectedPlayerId = null;
    }

    // go to next round if this round is complete
    if (round?.next_round_start) {
      let now = new Date();
      let elapsed = Math.floor((now.getTime() - round?.next_round_start.getTime()) / 1000);
      let remaining = Math.ceil(5 - elapsed);
      if (remaining <= 0) {
        console.log("[round_id] going to next round");
        goToNextRound();
      }
    }

    answer = HiveMindRoundAnswerCollection.findOne({ round_id: round_id, player_id: your_game_player?._id });

    console.log({ round, target_word, round_words, answer });
  }

  $m: {
    game = HiveMindGameCollection.findOne({ _id: game_id });

    all_answers = HiveMindRoundAnswerCollection.find({ game_id: game_id }).fetch();
    all_players = HiveMindGamePlayerCollection.find({ game_id: game_id })
      .fetch()
      .map((player) => {
        let answer = all_answers.find((a) => a.round_id === round_id && a?.player_id === player?._id);

        let game_answers = all_answers.filter((a) => a?.player_id === player?._id);
        let total_points = _.sumBy(game_answers, (a) => a.points_scored);
        let majorities = game_answers.filter((a) => a.is_majority).length;
        let minorities = game_answers.filter((a) => a.is_minority).length;

        if (player._id === your_game_player?._id) {
          if (answer) {
            player.iconColour = "stroke-green-800 fill-green-400";
          } else {
            player.iconColour = "stroke-gray-800 fill-gray-400";
          }
        } else {
          if (answer) {
            player.iconColour = "stroke-green-800 fill-green-400";
          } else {
            player.iconColour = "stroke-gray-800 fill-gray-400";
          }
        }

        return { ...player, answer, game_answers, total_points, majorities, minorities };
      })
      .sort((a, b) => {
        return b?.total_points - a?.total_points;
      });

    other_players = HiveMindGamePlayerCollection.find({
      player_id: { $ne: your_player?._id },
      game_id: game_id,
    })
      .fetch()
      .map((player) => {
        let answer = all_answers.find((a) => a.round_id === round_id && a?.player_id === player?._id);

        let game_answers = all_answers.filter((a) => a?.player_id === player?._id);
        let total_points = _.sumBy(game_answers, (a) => a.points_scored);
        let majorities = game_answers.filter((a) => a.is_majority).length;
        let minorities = game_answers.filter((a) => a.is_minority).length;

        if (answer) {
          player.iconColour = "stroke-green-800 fill-green-400";
        } else {
          player.iconColour = "stroke-gray-800 fill-gray-400";
        }

        return { ...player, answer, game_answers, total_points, majorities, minorities };
      });

    console.log({ all_players, other_players });
  }

  const selectWord = (word_id) => {
    if (!word_id) {
      return;
    }
    loading = true;
    Meteor.call("hive_mind.select_word", player_code, round_id, word_id, (err, res) => {
      loading = false;
      if (err) {
        console.log("ERROR SELECTING WORD: ", err);
        return;
      }
    });
  };

  const viewWord = (word_id) => {
    if (!word_id) {
      return;
    }
    selectedWordIdToView = word_id;
  };

  const startNextRound = () => {
    loading = true;
    Meteor.call("hive_mind.start_next_round", round_id, player_code, (err, res) => {
      loading = false;
      if (err) {
        console.log("ERROR STARTING ROUND: ", err);
        return;
      }
    });
  };

  const cancelStartNextRound = () => {
    loading = true;
    Meteor.call("hive_mind.cancel_start_next_round", round_id, player_code, (err, res) => {
      loading = false;
      if (err) {
        console.log("ERROR CANCELLING ROUND: ", err);
        return;
      }
    });
  };

  const goToNextRound = () => {
    loading = true;
    Meteor.call("hive_mind.get_next_round", round_id, (err, res) => {
      loading = false;
      if (err) {
        console.log("ERROR SELECTING WORD: ", err);
        return;
      } else {
        console.log("goToNextRound ", res);
        $goto(`/hive_mind/${game_id}/${res}`);
      }
    });
  };
</script>

<!-- GAME TITLE -->
<div
  use:inview={options}
  on:inview_change={handleChange}
  class="flex flex-col items-center justify-center p-20 pt-8 pb-4 mt-4"
>
  <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
    <div class="flex flex-col items-center">
      <p class="text-base font-medium uppercase text-center">Hive Mind</p>
      <h1 class="font-poppins text-lg font-black uppercase text-center">
        {game?.name}
      </h1>
      <div class="btn btn-ghost btn-sm">
        <span class="text-sm font-light"> code: </span>
        <span class="text-sm font-bold">
          {game?.code}
        </span>
      </div>
    </div>

    <a class="btn btn-link btn-sm absolute top-8 left-8" href={`/hive_mind`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke="currentColor"
        class="h-8 w-8"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
    </a>
    {#if round?.round_start && !round?.round_end}
      <div class="btn btn-link btn-sm absolute top-4 right-4">
        <Countdown
          countdownTitle="Round Ends"
          circleSize="h-16 w-16 md:h-24 md:w-24"
          textSize="text-2xl md:text-4xl"
          referenceTimestamp={round?.round_start}
          secondsToLast={15}
          onComplete={() => {
            console.log("ROUND COUNTDOWN COMPLETE, STARTING ROUND");
          }}
        />
      </div>
    {:else if round?.round_end && !round?.round_answer_reveal}
      <div class="btn btn-link btn-sm absolute top-4 right-4">
        <Countdown
          countdownTitle="Word Reveals"
          circleSize="h-16 w-16 md:h-24 md:w-24"
          textSize="text-2xl md:text-4xl"
          referenceTimestamp={round?.round_end}
          secondsToLast={5}
          onComplete={() => {
            console.log("REVEAL COUNTDOWN COMPLETE, REVEALING WORDS");
          }}
        />
      </div>
    {:else if round?.round_end && round?.round_answer_reveal && round?.round_revealed && !round?.round_scored}
      <div class="btn btn-link btn-sm absolute top-4 right-4">
        <Countdown
          countdownTitle="Revealing Leaderboard"
          circleSize="h-16 w-16 md:h-24 md:w-24"
          textSize="text-2xl md:text-4xl"
          referenceTimestamp={round?.round_revealed}
          secondsToLast={5}
          onComplete={() => {
            console.log("COUNTDOWN COMPLETE, REVEALING LEADERBOARD");
          }}
        />
      </div>
    {/if}
  </div>
</div>
<!-- GAME TITLE -->

<!-- ROUND TITLE -->
{#if round && !round?.next_round_start && !round?.next_round_cancelling}
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-2">
        {#if round?.round_scored}
          <h1 class="text-2xl font-black font-poppins uppercase text-center">LEADERBOARD</h1>
        {/if}
        {#if round?.round_revealed}
          <h1 class="font-poppins text-lg font-normal uppercase text-center">
            End of Round {round?.round_number}
          </h1>
          {#if round?.round_scored}
            <div class="btn btn-ghost pointer-events-none border-gray-200 bg-gray-200">
              <span class="text-lg font-light"> <b class="font-bold">{game?.points_to_win}</b> points to win </span>
            </div>
          {/if}
        {:else}
          <h1 class="font-poppins text-lg font-normal uppercase text-center">
            Round {round?.round_number}
          </h1>
        {/if}
        {#if target_word && !round?.round_scored}
          <div class="flex justify-center items-center">
            <h1
              class="{target_word?.word?.length > 24
                ? 'text-2xl'
                : target_word?.word?.length > 16
                  ? 'text-3xl'
                  : 'text-4xl'} font-black font-poppins uppercase text-center"
            >
              {target_word?.word}
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="h-8 w-8 stroke-blue-400 self-start btn btn-circle btn-sm m-0 p-0 bg-white hover:bg-gray-200 hover:stroke-blue-800 border-0 shadow-none"
              on:click={() => viewWord(target_word?.word_id)}
              on:keydown={() => viewWord(target_word?.word_id)}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
<!-- ROUND TITLE -->

<!-- ROUND IS CURRENTLY BEING PLAYED -->
{#if round && !round?.round_end}
  <!-- WORDS TO CHOOSE FROM -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center flex-shrink-0">
      <div
        class="flex flex-col justify-start md:flex-row md:flex-wrap md:justify-around gap-y-4 items-center w-full {round?.round_end
          ? 'invisible'
          : ''}"
      >
        {#each round_words as rw, i (rw._id)}
          <div
            class="w-full md:w-auto md:max-w-[40%] md:basis-1/2 h-full flex {parseInt(i) % 2 === 0
              ? 'pr-12 md:pr-0'
              : 'pr-12 md:pr-0'}"
          >
            <!-- Word Info Button -->
            <button
              class="btn w-auto m-0 p-2 border-2 border-gray-600 hover:border-gray-400 {parseInt(i) % 2 === 0
                ? 'rounded-r-none border-r-0'
                : 'rounded-r-none border-r-0 md:rounded-r-lg md:border-r-2 md:rounded-l-none md:border-l-0 md:order-3'}"
              on:click={() => viewWord(rw?.word_id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </button>
            <!-- Word Info Button -->

            <button
              class="btn w-full border-black border-2 rounded-lg h-full {parseInt(i) % 2 === 0
                ? 'rounded-l-none'
                : 'rounded-l-none md:rounded-r-none md:rounded-l-lg'} {loading
                ? 'bg-gray-200 text-gray-600 pointer-events-none'
                : answer?.word_id === rw?._id
                  ? 'bg-green-500 pointer-events-none'
                  : 'bg-white hover:bg-green-100'}"
              on:click={() => {
                if (!loading && answer?.word_id !== rw?._id) {
                  selectWord(rw?._id);
                }
              }}
            >
              <span
                class="font-bold font-poppins text-black text-center {rw?.word?.length <= 4
                  ? 'text-2xl'
                  : rw?.word?.length <= 6
                    ? 'text-xl'
                    : rw?.word?.length <= 8
                      ? 'text-lg'
                      : rw?.word?.length <= 10
                        ? 'text-base'
                        : 'text-sm'}">{rw.word}</span
              >
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <!-- WORDS TO CHOOSE FROM -->

  <!-- PLAYER STATUSES -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center gap-4">
      <div class="flex flex-col justify-center items-center gap-3">
        <PlayerAvatar
          game_player={your_game_player}
          iconClass="w-12 h-12 {answer?._id ? 'stroke-green-800 fill-green-400' : 'stroke-gray-800 fill-gray-400'}"
          textClass="text-xl"
          containerClass=""
          showName={true}
        />
      </div>
      <div class="flex flex-row flex-wrap justify-center items-center gap-1">
        {#each other_players as player (player._id)}
          <PlayerAvatar
            game_player={player}
            iconClass="w-10 h-10 {player?.iconColour}"
            textClass={player?.player_name?.length === 3
              ? "text-xl"
              : player?.player_name?.length === 4
                ? "text-lg"
                : player?.player_name?.length <= 6
                  ? "text-base"
                  : player?.player_name?.length <= 8
                    ? "text-sm"
                    : "text-xs"}
            containerClass={player?.containerClass}
            showName={false}
          />
        {/each}
      </div>
    </div>
  </div>
  <!-- PLAYER STATUSES -->
{/if}
<!-- ROUND IS CURRENTLY BEING PLAYED -->

<!-- ROUND ENDED -->
{#if round && round?.round_end && !round?.round_scored}
  <!-- ROUND RESULTS WORDS -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center px-8">
    <div class:invisible={!show} class:fade-in={show} class="w-full flex flex-col items-center justify-center">
      <div class="flex flex-col items-stretch py-4 gap-4 w-full">
        {#each round_words as rw, i (rw?._id)}
          <WordResult word={rw} {round_words} {round} />
        {/each}
      </div>
    </div>
  </div>
  <!-- ROUND RESULTS WORDS -->
{/if}
<!-- ROUND ENDED -->

<!-- ROUND LEADERBOARD -->
{#if round && round?.round_end && round?.round_scored && !round?.next_round_start && !round?.next_round_cancelling && !(game?.ended_at || game?.final_leaderboard_revealed)}
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center px-8">
    <div class:invisible={!show} class:fade-in={show} class="w-full flex flex-col items-center justify-center">
      <div class="flex flex-col items-stretch py-4 gap-4 w-full">
        {#each all_players as player, index (player?._id)}
          <PlayerResult
            {player}
            {all_players}
            {index}
            selectPlayer={() => {
              console.log("SELECTING PLAYER: ", player?._id);
              selectedPlayerId = player._id;
            }}
          />
        {/each}
      </div>
    </div>
  </div>
{:else if game?.ended_at || game?.final_leaderboard_revealed}
  <div class="flex flex-col items-center justify-center">
    <p class="text-gray-700 font-poppins text-3xl">Finalising Game...</p>
    <div class="loading loading-lg rounded-full border-b-2 border-gray-900"></div>
  </div>
{/if}
<!-- ROUND LEADERBOARD -->

<!-- NEXT ROUND BUTTON -->
{#if round && round?.round_end && round?.round_scored && !round?.next_round_start && !round?.next_round_cancelling}
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <button
          class="btn btn-lg rounded-full border-2 border-black bg-blue-400 font-bold text-xl text-black"
          on:click={startNextRound}>Go Next Round</button
        >
      </div>
    </div>
  </div>
{/if}
<!-- NEXT ROUND BUTTON -->

<!-- NEXT ROUND START COUNTDOWN -->
{#if round?.next_round_start && !round?.next_round_cancelling}
  <!-- NEXT ROUND LOADING -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center gap-4">
      {#if round?.next_round_started_by}
        <h1 class="text-base font-medium font-poppins -mb-3 uppercase">
          {round?.next_round_started_by} started the next round
        </h1>
      {/if}
      <h1 class="text-2xl font-bold">Starting next round in...</h1>
      <Countdown
        referenceTimestamp={round?.next_round_start}
        secondsToLast={3}
        onComplete={() => {
          console.log("COUNTDOWN COMPLETE, STARTING ROUND");
          goToNextRound();
        }}
      />
      <button
        class="btn btn-lg rounded-full border-2 border-black bg-red-600 font-bold text-xl text-black"
        on:click={cancelStartNextRound}>Cancel</button
      >
    </div>
  </div>
  <!-- NEXT ROUND LOADING -->
{:else if round?.next_round_cancelling}
  <!-- NEXT ROUND CANCELLING -->
  <div use:inview={options} on:inview_change={handleChange} class="flex flex-col items-center justify-center p-8 py-4">
    <div class:invisible={!show} class:fade-in={show} class="flex flex-col items-center justify-center gap-4">
      {#if round?.next_round_cancelled_by}
        <h1 class="text-base font-medium font-poppins -mb-3 uppercase">
          {round?.next_round_cancelled_by} cancelled the next round
        </h1>
      {/if}
      <h1 class="text-2xl font-bold">Returning to Leaderboard...</h1>
      <!-- CANCEL -->
      <div class="flex justify-center items-center gap-2 rounded-full border-4 border-black h-24 w-24 p-2 border-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-20 w-20 text-red-600 fill-white stroke-orange-600 stroke-2"
        >
          <path
            in:draw={{ duration: 10000, delay: 0, easing: quintOut }}
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <!-- CANCEL -->
      <!-- CANCELLING BUTTON -->
      <button
        class="btn btn-lg rounded-full border-2 border-black bg-orange-600 font-bold text-xl text-white pointer-events-none"
        >Cancelling</button
      >
      <!-- CANCELLING BUTTON -->
    </div>
  </div>
  <!-- NEXT ROUND CANCELLING -->
{/if}
<!-- NEXT ROUND START COUNTDOWN -->

<!-- PLAYER SCORE MODAL -->
<PlayerScoreModal
  playerToViewId={selectedPlayerId}
  {all_players}
  closeModal={() => {
    console.log("CLOSING MODAL");
    selectedPlayerId = null;
  }}
/>
<!-- PLAYER SCORE MODAL -->

<!-- WORD INFORMATION MODAL -->
<WordInformationModal
  wordIdToView={selectedWordIdToView}
  closeModal={() => {
    console.log("CLOSING MODAL");
    selectedWordIdToView = null;
  }}
/>
<!-- WORD INFORMATION MODAL -->
