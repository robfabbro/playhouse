<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import PlayerMini from "/imports/ui/components/bingo/PlayerMini.svelte";
  import { params, redirect } from "@roxi/routify";
  import _ from 'lodash'
  import moment from 'moment'
  import confettiConfig from '/imports/ui/particles/confetti.json'
  import { inview } from 'svelte-inview';
  import type { ObserverEventDetails, Options } from 'svelte-inview';
  import { BingoGameCollection, BingoPlayerCollection, BingoPlayerCardCollection } from '/imports/api/bingo/collections'
  import { textfit } from 'svelte-textfit';
  import { onMount } from "svelte";
  import { loadFull } from 'tsparticles'

  let show = true
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .1
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

$: game_id = $params.game_id
$: player_id = $params.player_id

let newOptionValue
let playerModal
let loading = false
let saveCard = ()=>{
  loading = true
  Meteor.call('bingo.add_option', game_id, newOptionValue, (err,res)=>{
    if(!err){
      newOptionValue = ''
      loading = false
    }
  })
}

let savePlayer = ()=>{
  loading = true
  Meteor.call('bingo.add_player', game_id, newPlayerName, (err,res)=>{
    if(!err){
      newPlayerName = ''
      loading = false
    }
  })
}
let card = {}
let card_options = []
let newPlayerName
let game_options = []
let other_cards = []
let player_parents = []
let card_parent
let game
let bingo = false

let ParticlesComponent: any
	onMount(async () => {
		const module = await import('/imports/ui/particles/Particles.svelte')
		ParticlesComponent = module.default
	})
	let onParticlesLoaded = (event: any) => {
		const particlesContainer = event.detail.particles
	}
	let particlesInit = async (main: any) => {
		await loadFull(main)
	}

  const placingth = (placing) => {
      if ([11, 12, 13].includes(placing)) {
        return `${placing}` + 'th'
      } else {
        return `${placing}` + (placing % 10 === 1 ? 'st' : placing % 10 === 2 ? 'nd' : placing % 10 === 3 ? 'rd' : 'th')
      }
    }

$m: {
    Meteor.subscribe('bingo.players', game_id)
    Meteor.subscribe('bingo.games')
    card = BingoPlayerCollection.findOne({game_id: game_id, _id: player_id})
    game = BingoGameCollection.findOne({_id:game_id})

    if(card){
      card_options = _.orderBy(BingoPlayerCardCollection.find({game_id:game_id, card_id:card?._id}).fetch(), ['x','y'], ['asc','asc'])
      if(card.bingo){
        bingo = true
      }else{
        bingo = false
      }
    }
    other_cards = BingoPlayerCollection.find({game_id: game_id, _id: {$ne:player_id}}).fetch()
  }

let toggle = (option) => {
  if(option.card_id == player_id){
    Meteor.call('bingo.toggle', option, game_id)
  }
}

const goBingo = () => {
  bingo = !bingo
}


let parents = []

</script>
    
    {#if card?.name}
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
        <h1 class="text-center font-poppins text-3xl font-semibold md:text-5xl capitalize">Welcome {card?.name}</h1>
        
        <a class="btn btn-link" href={`/bingo/${game_id}`}>Back</a>
        
      </div>
      <div
        class:invisible={!show}
        class:fade-in={show}
        class:grid-cols-4={game?.size == 4}
        class:grid-cols-5={game?.size == 5}
        class:grid-cols-3={game?.size == 3}
        class={`mt-10 grid gap-1 mb-10 px-1`}>
        {#each card_options as option}
            <button class="bg-base-100 px-2 shadow-sm container rounded-lg" class:bg-green-500={option.marked} on:click={()=>toggle(option)}>
              <div class="text-center h-20 my-auto flex items-center" bind:this={parents[option._id]}>
                <h2 use:textfit={{mode:"multi", parent:parents[option._id]}} class="font-poppins">{option.option?.name}</h2>
              </div>
            </button>
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
        class="flex flex-col items-center justify-center">
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">Player not found</h1>
        <a class="btn btn-link" href={`/bingo/${game_id}`}>Back</a>
      </div>
    </div>
    {/if}

    <div
      use:inview={options}
      on:inview_change="{handleChange}"
      class="flex flex-col items-center justify-center">
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="flex items-center justify-center gap-5">
        <h1 class="text-center font-poppins text-xl font-semibold ">Overview</h1>
      </div>
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="mt-10 grid gap-1 grid-cols-3 mb-10 px-1">
            <a href={`/bingo/${game_id}/${card?._id}`} class="bg-base-100 px-1 shadow-sm container rounded-lg active:bg-green-400 text-center flex flex-col gap-4 items-center outline-double outline-pink-600" >
              <div class="text-center h-20 my-auto flex flex-col items-center" bind:this={card_parent}>
                <h2 use:textfit={{mode:"multi",parent:card_parent}} class="font-poppins capitalize">{card?.name}</h2>
                {#if card?.bingo}
                <h2 class="font-poppins capitalize text-base font-bold">{placingth(card?.bingo_position)}</h2>
                <h2 class="font-poppins capitalize text-sm">{moment(card?.bingo_at).format('hh:mm A - DD/MM')}</h2>
                {/if}
              </div>
              <PlayerMini player_id={card?._id} />
            </a>
        {#each other_cards as card, idx}
            <a href={`/bingo/${game_id}/${card._id}`} class="bg-base-100 px-1 shadow-sm container rounded-lg active:bg-green-400 gap-4 text-center flex flex-col items-center" >
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

    {#if bingo}
      <svelte:component
        this={ParticlesComponent}
        id="tsparticles"
        options={confettiConfig.options}
        on:particlesLoaded={onParticlesLoaded}
        {particlesInit}
      />
    {/if}
  