
<script lang="ts">

import { quintOut } from 'svelte/easing'
import { onMount } from 'svelte'
import { Meteor } from 'meteor/meteor';
import { fade, fly,draw } from 'svelte/transition'
import { inview } from 'svelte-inview';
import type { ObserverEventDetails, Options } from 'svelte-inview';
import { goto } from "@roxi/routify"
  import { BingoCollection } from '/imports/api/bingos';

let show = false

// onMount(()=>{
//   Meteor.setTimeout(()=>{
//     show = true
//   }, 1000)
// })
const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: 0.5
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

    let categoryModal
    let findModal
    let newGameName = ''
    let searchName = ''
    let loading = false
  
let saveGame = (e) =>{
  loading = true
  Meteor.call('new_game', newGameName, (err, res)=>{
    if(!err){
      $goto(`/${res}`)
      console.log(res)
    }
  })
}
let gameFound = true

let findGame = (e)=>{
  if(searchName){
    let found = BingoCollection.findOne({$or:[{name: searchName.toLowerCase(), code: searchName.toLowerCase()}]})
    if(found){
      $goto(`/${found._id}`)
    }else{
      gameFound = false
    }
  }
}

</script>

    
    <div
      use:inview={options}
      on:inview_change="{handleChange}"
      id="home"
      class="hero py-10 flex justify-center">
      {#if show}
      <div
        class="hero-content flex-col lg:flex-row-reverse " >
        

      <img class="max-h-[70vh] md:max-w-md" src="/bingoBongo.png" alt="bingo"/>
      
        <div class="text-center lg:text-start md:max-w-[50%] xl:max-w-[80%]">
          <span class="badge badge-outline badge-lg">Awesome Fun</span>
          <h1 class="font-poppins text-3xl font-black uppercase md:text-7xl">
            BINGO
          </h1>
          
          <div class="flex gap-2 max-lg:justify-center">
            <button
              type="button"
              on:click={()=>categoryModal.showModal()}
              class="btn btn-success md:btn-lg rounded-full font-poppins shadow-md">
              Create Game
            </button>
            <button
              type="button"
              on:click={()=>findModal.showModal()}
              class="btn btn-accent md:btn-lg rounded-full font-poppins shadow-md">
              Join Game
            </button>
          </div>
        </div>
      </div>
      {:else}
      <div
        class="hero-content flex-col lg:flex-row-reverse min-h-[500px]">
      </div>
      {/if}

      
    </div>

    <dialog class="modal" bind:this={categoryModal}>
      <div class="modal-box">
        <h3 class="font-bold text-lg">Start a Game</h3>
        <p class="py-4" >Press ESC key or click outside to close</p>
        <input bind:value={newGameName} type="text" placeholder="Enter the name of your game" class="input input-bordered input-primary w-full" />
        <div class="pt-2" >
          <button class="btn btn-success" on:click={saveGame}>
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
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <dialog class="modal" bind:this={findModal}>
      <div class="modal-box">
        <h3 class="font-bold text-lg">Find a Game</h3>
        <p class="py-4" >Press ESC key or click outside to close</p>
        <input bind:value={searchName} type="text" placeholder="Enter the game code or name" class="input input-bordered input-primary w-full" />
        <div class="pt-2" >
          <button class="btn btn-success" on:click={findGame}>
            Join
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
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

