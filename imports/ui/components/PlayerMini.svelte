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
  import _ from 'lodash'


  import { inview } from 'svelte-inview';
  import type { ObserverEventDetails, Options } from 'svelte-inview';
  import { OptionsCollection } from "/imports/api/options";
  import { CardOptionsCollection, CardsCollection } from "/imports/api/cards";
  import { textfit } from 'svelte-textfit';

  let show = false
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .1
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

  let {game_id} = $params
  export let player_id

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
let card_options = []
let newPlayerName
let game_options = []
$m: {
    Meteor.subscribe('cards', game_id)
    card = CardsCollection.findOne({game_id: game_id, _id: player_id})
    if(card){
      card_options = _.orderBy(CardOptionsCollection.find({game_id:game_id, card_id:card?._id}).fetch(), ['x','y'], ['asc','asc'])
    }
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
        class="mt-10 grid gap-1 grid-cols-5 mb-10 px-1">
        {#each card_options as option, idx}
            <button class="bg-base-200 px-1 shadow-sm container rounded-lg" class:bg-green-500={option.marked}>
              <div class="text-center h-5 w-3 my-auto flex items-center" >
                <h2 class="font-poppins hidden">{idx}</h2>
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
        <a class="btn btn-link" href={`/${game_id}`}>Back</a>
      </div>
    </div>
    {/if}