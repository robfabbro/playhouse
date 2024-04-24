<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import NavBar from '/imports/ui/components/NavBar.svelte'
  import Hero from '/imports/ui/components/Hero.svelte'
  import LogoClouds from "/imports/ui/components/LogoClouds.svelte";
  import Services from "/imports/ui/components/Services.svelte";
  import Team from "/imports/ui/components/Team.svelte";
  import Testimonial from "/imports/ui/components/Testimonial.svelte";
  import Contact from "/imports/ui/components/Contact.svelte";
  import { params, redirect } from "@roxi/routify";
  import PlayerMini from "/imports/ui/components/PlayerMini.svelte"
  import moment from 'moment'
  import { inview } from 'svelte-inview';
  import type { ObserverEventDetails, Options } from 'svelte-inview';
  import { OptionsCollection } from "/imports/api/options";
  import { CardsCollection } from "/imports/api/cards";
  import { BingoCollection } from '/imports/api/bingos'
  import { textfit } from 'svelte-textfit';
  import { onMount } from "svelte";
  import _ from 'lodash'

  let show = false
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .1
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

  let {game_id, name} = $params

let newOptionValue
let playerModal
let loading = false

let player_parents = []
let option_parents = []
let saveCard = ()=>{
  loading = true
  Meteor.call('add_option', game_id, newOptionValue, (err,res)=>{
    if(!err){
      newOptionValue = ''
      loading = false
    }
  })
}
const placingth = (placing) => {
      if ([11, 12, 13].includes(placing)) {
        return `${placing}` + 'th'
      } else {
        return `${placing}` + (placing % 10 === 1 ? 'st' : placing % 10 === 2 ? 'nd' : placing % 10 === 3 ? 'rd' : 'th')
      }
    }

let savePlayer = ()=>{
  loading = true
  Meteor.call('add_player', game_id, newPlayerName, (err,res)=>{
    if(!err){
      newPlayerName = ''
      loading = false
      playerModal.close()
    }
  })
}

let cards = []
let newPlayerName
let game_options = []
let game
$m: {
    Meteor.subscribe('options', game_id)
    Meteor.subscribe('cards', game_id)
    Meteor.subscribe('bingos')
    cards = CardsCollection.find({game_id: game_id}).fetch()
    game_options = OptionsCollection.find({game_id: game_id}).fetch()
    game = BingoCollection.findOne({_id:game_id})
    
    if(game){
      let games = localStorage.getItem("past_games");
      if(games){
        games = JSON.parse(games)
        games.push(game)
        games = _.uniqBy(games, '_id')
        localStorage.setItem("past_games", JSON.stringify(games))
      }else{
        localStorage.setItem("past_games", JSON.stringify([game]))
      }
    }
    
  }
</script>

    <div
      use:inview={options}
      on:inview_change="{handleChange}"
      class="flex flex-col items-center justify-center">
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="flex flex-col items-center justify-center">
        <div class="flex items-baseline">
          <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl capitalize">{game?.name}</h1>
          <div class="btn btn-ghost">code: {game?.code}</div>
        </div>
        
        <a class="btn btn-link btn-sm" href={`/`}>Back</a>
        
      </div>
    </div>

    {#if game}
    {#if game_options?.length >= (game.size * game.size) }
    <div
      use:inview={options}
      on:inview_change="{handleChange}"
      class="flex flex-col items-center justify-center">
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="flex items-center justify-center gap-5">
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">Players</h1>
        <button class="btn btn-info" on:click={()=>playerModal.showModal()}>
          Add
          {#if loading}
          <svg
            class="animate-spin ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {/if}
        </button>
      </div>
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="mt-10 grid gap-1 grid-cols-3 mb-10 px-1">
        {#each cards as card, idx}
          <a href={`/${game_id}/${card?._id}`} class="bg-base-100 px-1 shadow-sm container rounded-lg active:bg-green-400 text-center flex flex-col gap-4 items-center" >
            <div class="text-center h-20 my-auto flex flex-col items-center" bind:this={player_parents[idx]}>
              <h2 use:textfit={{mode:"multi",parent:player_parents[idx]}} class="font-poppins capitalize">{card?.name}</h2>
              {#if card?.bingo}
              <h2 class="font-poppins capitalize text-base font-bold">{placingth(card?.bingo_position)}</h2>
              <h2 class="font-poppins capitalize text-sm">{moment(card?.bingo_at).format('hh:mm A - DD/MM')}</h2>
              {/if}
            </div>
            <PlayerMini player_id={card._id} />
          </a>
        {/each}
      </div>
    </div>
    {:else}
    <div
      use:inview={options}
      on:inview_change="{handleChange}"
      class="flex flex-col items-center justify-center">

      <div
        class:invisible={!show}
        class:fade-in={show}
        class="mt-10 flex items-center justify-center mb-10 px-1">
        <div class=" text-xl">
          Add at least {game.size * game.size} options to start adding players
        </div>
      </div>
    </div>
    {/if}

    {#if cards?.length <=0 }
    <div class="flex items-center w-full justify-center">
      <div class="modal-box">
        <h3 class="font-bold text-lg">Add your Options</h3>
        <form on:submit|preventDefault={saveCard}>
        <input bind:value={newOptionValue} type="text" placeholder="Enter your option description here" class="input input-bordered input-primary w-full" />
        <div class="pt-2 flex items-center justify-between" >
          <div>{game_options?.length} options, only {game_options.length < (game.size * game.size) ? (game.size * game.size) -game_options.length : 0} more to start</div>
          <button class="btn btn-success" >
            Go
            {#if loading}
            <svg
              class="animate-spin ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {/if}
          </button>
        </div>
      </form>
      </div>
    </div>
    {/if}
    {/if}

    <div
      use:inview={options}
      on:inview_change="{handleChange}"
      class="flex flex-col items-center justify-center">
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="flex flex-col items-center justify-center">
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">Options</h1>
      </div>
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="mt-10 grid gap-1 grid-cols-5 mb-10 px-1">
        {#each game_options as option, idx}
            <div class="bg-base-100 px-1 shadow-sm container rounded-lg" >
              <div class="text-center h-20 my-auto flex items-center" bind:this={option_parents[idx]}>
                <h2 use:textfit={{mode:"multi",parent:option_parents[idx]}} class="font-poppins">{option?.name}</h2>
              </div>
            </div>
        {/each}
      </div>
    </div>

<!-- <Team /> -->

<dialog class="modal" bind:this={playerModal}>
  {#if game}
  <div class="modal-box flex flex-col gap-4">
    <h3 class="font-bold text-lg">Add a player</h3>
    <p class="">Press ESC key or click outside to close</p>
    {#if cards.length === 0}
    <p class="text-red-800">Note: You will no longer be able to add more options once you add a player</p>
    {/if}
    {#if game_options.length < (game.size * game.size)}
    <p class="text-lg font-semibold" >You need to add more options before you can add players.</p>
    {:else}
    <input bind:value={newPlayerName} type="text" placeholder="Enter the name of your player" class="input input-bordered input-primary w-full" />
    <div class="pt-2" >
      <button class="btn btn-success" on:click={savePlayer}>
        Go
        {#if loading}
        <svg
          class="animate-spin ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {/if}
      </button>
    </div>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
  {/if}
</dialog>