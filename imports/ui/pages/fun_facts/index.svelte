<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import { loadFull } from "tsparticles";
  import particlesFacts from "/imports/ui/particles/particlesFacts.json";
  import Particles, { particlesInit } from "/imports/ui/particles/particles.ts";
  import { quintOut } from "svelte/easing";
  import { onMount } from "svelte";
  import { fade, fly, draw } from "svelte/transition";
  import { inview } from "svelte-inview";
  import type { ObserverEventDetails, Options } from "svelte-inview";
  import { goto } from "@roxi/routify";
  import { FactsVoteCollection } from "/imports/api/fun_facts/collections";
  import _ from "lodash";
  import { Random } from "meteor/random";

  let funFactIdentifier;
  onMount(async () => {
    funFactIdentifier = localStorage.getItem("fun_fact_identifier");

    if (!funFactIdentifier) {
      let identifier = Random.id(8);
      localStorage.setItem("fun_fact_identifier", identifier);
      fun_fact_identifier = identifier;
    }
  });
  let onParticlesLoaded = (event: any) => {
    const particlesContainer = event.detail.particles;
  };
  // let particlesInit = async (main: any) => {
  // 	await loadFull(main);
  // };

  void particlesInit(async (engine) => {
    // call this once per app
    // you can use main to customize the tsParticles instance adding presets or custom shapes
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    //await loadFull(engine);
    await loadFull(engine);
  });

  let show = false;

  const options: Options = {
    rootMargin: "50px",
    unobserveOnEnter: true,
    threshold: 0.5,
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => (show = detail.inView);

  let viewFactModal;
  let viewingFact = null;
  let viewingFactVotes = [];
  let viewingFactTotalVotes = [];
  let hasUpvote;
  let hasDownvote;
  let addFactModal;
  let factToAdd = "";
  let factToShow = null;
  let loading = false;

  let addFact = (e) => {
    loading = true;
    Meteor.call("facts.new_fact", funFactIdentifier, factToAdd, (err, res) => {
      loading = false;
      if (!err) {
        addFactModal.close();
        viewingFact = res;
        viewFactModal.showModal();
      }
    });
  };

  let viewFact = (e) => {
    loading = true;
    viewingFact = null;
    viewingFactVotes = null;
    viewingFactTotalVotes = null;
    viewFactModal.showModal();
    Meteor.call("facts.get_random_fact", viewingFact?.fact_id, (err, res) => {
      if (!err) {
        viewingFact = res;
        loading = false;
      }
    });
  };
  let addVote = (vote) => {
    Meteor.call("facts.add_vote", funFactIdentifier, viewingFact?.fact_id, vote, (err, res) => {
      console.log({ err, res });
    });
  };

  $m: {
    Meteor.subscribe("facts.fact_votes", viewingFact?.fact_id);
    viewingFactVotes = FactsVoteCollection.find({ fact_id: viewingFact?.fact_id }).fetch();
    viewingFactTotalVotes = _.sumBy(viewingFactVotes, "vote");

    let userVote = FactsVoteCollection.findOne({ voter: funFactIdentifier });
    console.log({ viewingFact });
    console.log({ viewingFactVotes });
    console.log({ viewingFactTotalVotes });
    console.log({ userVote });
    if (userVote) {
      hasUpvote = userVote?.vote > 0;
      hasDownvote = userVote?.vote < 0;
    } else {
      hasUpvote = false;
      hasDownvote = false;
    }
  }
</script>

<Particles
  id="tsparticles"
  class="put your classes here"
  style=""
  options={particlesFacts}
  on:particlesLoaded={onParticlesLoaded}
/>

<div
  use:inview={options}
  on:inview_change={handleChange}
  id="home"
  class="hero flex justify-center items-center p-0 m-0"
>
  {#if show}
    <div class="hero-content p-0 flex-col lg:flex-row-reverse">
      <div
        class="text-center lg:text-start md:max-w-[50%] xl:max-w-[80%] min-h-screen z-1 flex items-center justify-center z-10"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="flex flex-col">
            <div class="flex">
              <button class="text-sm bg-white btn btn-sm text-left border-none shadow-none" on:click={() => $goto("/")}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-6"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>

                Back to home
              </button>
            </div>
            <h1
              class="font-poppins text-7xl font-black uppercase md:text-7xl text-center secret_santa-text md:whitespace-nowrap"
            >
              Fun Facts
            </h1>
          </div>

          <div class="flex gap-2 max-lg:justify-center">
            <button
              type="button"
              on:click={viewFact}
              class="btn bg-pink-400 md:btn-lg rounded-full font-poppins shadow-lg border-black"
            >
              View a Fact
            </button>
            <button
              type="button"
              on:click={() => addFactModal.showModal()}
              class="btn btn-accent md:btn-lg rounded-full font-poppins shadow-lg border-black"
            >
              Add a Fact
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="hero-content flex-col lg:flex-row-reverse min-h-[500px]"></div>
  {/if}
</div>

<dialog class="modal" bind:this={viewFactModal}>
  {#if viewingFact}
    <div class="modal-box border border-black">
      <h3 class="font-bold text-lg flex items-center">
        Fact
        {#if !loading}
          #{viewingFact?.fact_id}
        {:else if loading}
          <span class="ml-2 loading loading-xs loading-spinner text-black"></span>
        {/if}
      </h3>
      <div class="chat chat-start w-full flex justify-center mt-4">
        <div class="chat-bubble text-white bg-indigo-400 text-3xl font-bold">
          {viewingFact?.content}
        </div>
      </div>
      <!-- UPVOTE SYSTEM HERE -->
      <div class="flex items-center justify-center gap-8 mt-8">
        <!-- UPVOTE ICON -->
        {#if hasUpvote}
          <!-- SELECTED -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="btn btn-sm btn-ghost rounded-full p-0 m-0 h-12 w-12 hover:bg-green-100 text-green-600"
            class:pointer-events-none={loading}
            on:click={() => addVote(0)}
            on:keydown={() => addVote(0)}
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
              clip-rule="evenodd"
            />
          </svg>
          <!-- SELECTED -->
        {:else}
          <!-- UNSELECTED -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="btn btn-sm btn-ghost rounded-full p-0 m-0 h-12 w-12 hover:bg-green-100 text-green-600"
            class:pointer-events-none={loading}
            on:click={() => addVote(1)}
            on:keydown={() => addVote(1)}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <!-- UNSELECTED -->
        {/if}
        <!-- UPVOTE ICON -->

        <!-- TOTAL VOTES -->
        <div
          class="flex justify-center text-4xl font-bold"
          class:text-green-600={viewingFactTotalVotes > 0}
          class:text-red-600={viewingFactTotalVotes < 0}
        >
          {#if viewingFactTotalVotes !== null}
            {`${viewingFactTotalVotes > 0 ? "+" : viewingFactTotalVotes < 0 ? "-" : ""} ${Math.abs(viewingFactTotalVotes)}`}
          {:else}
            <span class="loading loading-lg loading-spinner text-black"></span>
          {/if}
        </div>
        <!-- TOTAL VOTES -->

        <!-- DOWNVOTE ICON -->
        {#if hasDownvote}
          <!-- SELECTED -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="btn btn-sm btn-ghost rounded-full p-0 m-0 h-12 w-12 hover:bg-red-100 text-red-600"
            class:pointer-events-none={loading}
            on:click={() => addVote(0)}
            on:keydown={() => addVote(0)}
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
              clip-rule="evenodd"
            />
          </svg>
          <!-- SELECTED -->
        {:else}
          <!-- UNSELECTED -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="btn btn-sm btn-ghost rounded-full p-0 m-0 h-12 w-12 hover:bg-red-100 text-red-600"
            class:pointer-events-none={loading}
            on:click={() => addVote(-1)}
            on:keydown={() => addVote(-1)}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <!-- UNSELECTED -->
        {/if}
        <!-- DOWNVOTE ICON -->
        <!-- UPVOTE SYSTEM HERE -->
      </div>

      <!-- GET ANOTHER FACT -->
      <div class="flex justify-center items-center mt-8 mb-4">
        <button
          type="button"
          on:click={viewFact}
          class="min-w-40 btn bg-pink-400 hover:bg-pink-500 rounded-full font-poppins shadow-lg border-black flex items-center gap-2"
          class:pointer-events-none={loading}
        >
          {#if !loading}
            View Another Fact
          {:else}
            <span class="loading loading-spinner loading-sm text-pink-200"></span>
          {/if}
        </button>
      </div>
      <!-- GET ANOTHER FACT -->
    </div>
  {:else}
    <div class="modal-box border border-black">
      <h3 class="font-bold text-lg flex items-center">Not Facts Found!</h3>
      <div class="mt-8 flex flex-col justify-center items-center">
        <p>You have the privilege of adding the first fact!</p>
        <button
          type="button"
          on:click={() => {
            viewFactModal.close();
            addFactModal.showModal();
          }}
          class="mt-8 mb-4 btn bg-pink-400 md:btn-lg rounded-full font-poppins shadow-lg border-black"
        >
          Add a Fact
        </button>
      </div>
    </div>
  {/if}
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<dialog class="modal" bind:this={addFactModal}>
  <div class="modal-box border border-black">
    <h3 class="font-bold text-lg flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
        <path
          fill-rule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
          clip-rule="evenodd"
        />
      </svg>
      Add a Fact
    </h3>
    <p class="py-4">Press ESC key or click outside to close</p>
    <textarea
      bind:value={factToAdd}
      type="text"
      placeholder="Add a fun fact here!"
      class="textarea textarea-bordered textarea-primary w-full"
    />
    <div class="pt-4">
      <button
        class="btn bg-pink-400 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
        on:click={addFact}
      >
        Confirm
        {#if loading}
          <svg class="animate-spin ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
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
