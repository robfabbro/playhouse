<script lang="ts">
	import { Meteor } from "meteor/meteor";
	import { loadFull } from "tsparticles";
	import particlesHome from "/imports/ui/particles/particlesAidan.json";
	import Particles, { particlesInit } from "/imports/ui/particles/particles.ts";
	import { quintOut } from "svelte/easing";
	import { onMount } from "svelte";
	import { fade, fly, draw } from "svelte/transition";
	import { inview } from "svelte-inview";
	import type { ObserverEventDetails, Options } from "svelte-inview";
	import { goto } from "@roxi/routify";
	import _ from "lodash";

	// let ParticlesComponent: any;
	// onMount(async () => {
	// 	const module = await import("/imports/ui/components/svelte/Particles.svelte");
	// 	ParticlesComponent = module.default;
	// });
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
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
		(show = detail.inView);

	let categoryModal;
	let findModal;
	let newGameName = "";
	let searchName = "";
	let loading = false;

	let stats = false;

	let character = [0, 0, 0, 0]

	let saveGame = (e) => {
		loading = true;
		Meteor.call("new_game", newGameName, (err, res) => {
			if (!err) {
				$goto(`/${res}`);
				let adminGames = localStorage.getItem("admin_games");
				if (adminGames) {
					let games = JSON.parse(adminGames);
					games.push(res);
					localStorage.setItem("admin_games", JSON.stringify(games));
				} else {
					localStorage.setItem("admin_games", JSON.stringify([res]));
				}
			}
		});
	};
	let gameFound = true;

	let findGame = (e) => {
		if (searchName) {
			console.log("SEARCH NAME", searchName.toLowerCase());

			let found = CamelGameCollection.findOne({
				$or: [
					{ name: searchName.toLowerCase() },
					{ code: searchName.toLowerCase() },
				],
			});
			console.log(found);
			if (found) {
				$goto(`/${found._id}`);
			} else {
				gameFound = false;
			}
		}
	};

	let generateStats = (e) => {
		for (let i = 0; i < 4; i++) {
			character[i] = Math.floor(Math.random() * (6 - 1)) + 1 + Math.floor(Math.random() * (6 - 1)) + 1 + Math.floor(Math.random() * (6 - 1)) + 1
		}
		stats = true
	}

	$m: {
		Meteor.subscribe("games");
	}
	let past_games;

	let games = localStorage.getItem("past_games");
	if (games) {
		past_games = JSON.parse(games);
	}
</script>

<Particles
	id="tsparticles"
	class="put your classes here"
	style=""
	options={particlesHome}
	on:particlesLoaded={onParticlesLoaded}
/>



<div
	use:inview={options}
	on:inview_change={handleChange}
	id="home"
	class="hero flex justify-center items-center bg-black p-0 m-0"
>
	{#if show}
		<div class="hero-content p-0 flex-col lg:flex-row-reverse">
			<div
				class="text-center lg:text-start md:max-w-[50%] xl:max-w-[80%] min-h-screen z-1 flex items-center justify-center z-10"
			>
				<div class="flex flex-col items-center gap-4">
					<h1
						class="font-poppins text-7xl font-black text-white uppercase md:text-7xl text-center md:whitespace-nowrap"
					>
						Aidan's <span class="text-red-600">Game</span>
					</h1>

					<div class="flex gap-2 max-lg:justify-center">
						<button
							type="button"
							on:click={() => categoryModal.showModal()}
							class="btn bg-black md:btn-lg rounded-full font-poppins shadow-lg border-white text-white"
						>
							Start <span class="text-red-600">Adventure</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="hero-content flex-col lg:flex-row-reverse min-h-[500px]"></div>
	{/if}
</div>

<dialog class="modal" bind:this={categoryModal}>
	{#if !stats}
	<div class="modal-box border border-black  bg-black text-white">
		<h3 class="font-bold text-lg">Start an adventure</h3>
		<p class="py-4">Press ESC key or click outside to close</p>
		<input
			bind:value={newGameName}
			type="text"
			placeholder="Enter the name of your hero!"
			class="input input-bordered bg-black text-white input-primary w-full"
		/>
		<div class="pt-4">
			<button
				class="btn bg-black text-red-600 md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
				on:click={generateStats}
			>
				What's my character?
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
	{:else}
	<div class="modal-box border bg-black text-white border-black">
		<h3 class="font-bold text-lg">Welcome {newGameName}!</h3>
		<p class="py-4">Your character's stats are: <p>
		<p class="py-4">Strength: {character[0]}<p>
		<p class="py-4">Endurance:  {character[1]}<p>
		<p class="py-4">Agility:  {character[2]}<p>
		<p class="py-4">Charisma:  {character[3]}<p>
		<div class="pt-4 flex">
			<button
				class="btn bg-black text-red-600 md:btn-lg rounded-lg font-poppins shadow-lg border-white w-1/2"
				on:click={console.log("test")}
			>
				Go Forth!
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
			<button
				class="btn bg-black text-red-600 md:btn-lg rounded-lg font-poppins shadow-lg border-white w-1/2"
				on:click={generateStats}
			>
				Reroll
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
	{/if}
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

<dialog class="modal" bind:this={findModal}>
	<div class="modal-box border border-black">
		<h3 class="font-bold text-lg">Find a Game</h3>
		<p class="py-4">Press ESC key or click outside to close</p>
		<input
			bind:value={searchName}
			type="text"
			placeholder="Enter the game code or name"
			class="input input-bordered input-primary w-full"
		/>
		<div class="pt-4">
			<button
				class="btn bg-white md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
				on:click={findGame}
			>
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
		{#if past_games}
			<div class="divider">past games</div>
			<div class="pt-2 flex flex-wrap gap-2">
				{#each past_games as game}
					<a href={`/${game._id}`}>
						<button class="btn btn-md border-black" type="button">
							{game.name}
						</button>
					</a>
				{/each}
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

