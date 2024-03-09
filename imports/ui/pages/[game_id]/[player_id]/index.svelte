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


  import { inview } from 'svelte-inview';
  import type { ObserverEventDetails, Options } from 'svelte-inview';
  import { OptionsCollection } from "/imports/api/options";
  import { CardsCollection } from "/imports/api/cards";
  import { textfit } from 'svelte-textfit';

  let show = false
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .1
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

  let {game_id, player_id} = $params

let newOptionValue
let playerModal
let loading = false
let saveCard = ()=>{
  loading = true
  Meteor.call('add_option', game_id, newOptionValue, (err,res)=>{
    if(!err){
      newOptionValue = ''
      loading = false
    }
  })
}

let savePlayer = ()=>{
  loading = true
  Meteor.call('add_player', game_id, newPlayerName, (err,res)=>{
    if(!err){
      newPlayerName = ''
      loading = false
    }
  })
}
let card = {}
let newPlayerName
let game_options = []
$m: {
    Meteor.subscribe('cards', game_id)
    card = CardsCollection.findOne({game_id: game_id, _id: player_id})
    
  }
</script>
    
    {#if card?.card}
    <div
      use:inview={options}
      on:inview_change="{handleChange}"
      class="flex flex-col items-center justify-center">
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="flex flex-col items-center justify-center">
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl capitalize">Welcome {card?.name}</h1>
        <a class="btn btn-link" href={`/${game_id}`}>Back</a>
      </div>
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="mt-10 grid gap-1 grid-cols-5 mb-10 px-1">
        {#each card.card as option}
            <div class="bg-base-100 px-2 shadow-sm container rounded-lg" >
              <div class="text-center h-20 my-auto flex items-center" bind:this={option.parent}>
                <h2 use:textfit={{mode:"multi",parent:option.parent}} class="font-poppins">{option.option?.name}</h2>
              </div>
            </div>
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
        <a class="btn btn-link" href={`/${game_id}`}>Back</a>
      </div>
    </div>
    {/if}