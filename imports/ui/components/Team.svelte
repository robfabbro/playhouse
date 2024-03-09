<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { inview } from 'svelte-inview';
  import type { ObserverEventDetails, Options } from 'svelte-inview';

  import { textfit } from 'svelte-textfit';
  import { Meteor } from 'meteor/meteor';
  import { params } from '@roxi/routify';
  import { CardsCollection } from '/imports/api/cards'
  
  let show = false
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .1
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

  let {game_id, name} = $params

  let parents = []
  let cards

  $m: {
    Meteor.subscribe('cards', game_id)
    let cards = CardsCollection.find({game_id: game_id})
  }

</script>


    <div
      id="team"
      use:inview={options}
      on:inview_change="{handleChange}"
      class="flex flex-col items-center justify-center">
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="flex flex-col items-center justify-center">
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">Our Team</h1>
        <span class="text-md mt-4 px-2 text-center font-poppins md:mt-4 md:px-5 md:text-xl">
          our passionate team is core to our services, in person and personal
        </span>
      </div>
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="mt-10 grid gap-4 grid-cols-5 mb-10">
        {#each teams as team}
            <div class="bg-base-100 px-10 shadow-sm container" >
              <div class="text-center h-20 my-auto flex items-center" bind:this={team.parent}>
                <h2 use:textfit={{mode:"multi",parent:team.parent}} class="font-poppins">{team.position}</h2>
              </div>
            </div>
        {/each}
      </div>
    </div>
