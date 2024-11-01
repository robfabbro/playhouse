<script lang="ts">
	import { Meteor } from "meteor/meteor";
	import { loadFull } from "tsparticles";
	import particlesHome from "/imports/ui/particles/particlesHome.json";
	import Particles, { particlesInit } from "/imports/ui/particles/particles.ts";
	import { quintOut } from "svelte/easing";
	import { onMount } from "svelte";
	import { fade, fly, draw } from "svelte/transition";
	import { inview } from "svelte-inview";
	import type { ObserverEventDetails, Options } from "svelte-inview";
	import { goto } from "@roxi/routify";
	import { WolfGameCollection } from "/imports/api/werewolf/collections";
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

	let saveGame = (e) => {
		loading = true;
		Meteor.call("werewolf.new_game", newGameName, (err, res) => {
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

			let found = WolfGameCollection.findOne({
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
							<button
								class="text-sm bg-white btn btn-sm text-left border-none shadow-none"
								on:click={() => $goto("/")}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15.75 19.5 8.25 12l7.5-7.5"
									/>
								</svg>

								Back to home
							</button>
						</div>
						<h1
							class="font-poppins text-7xl font-black uppercase md:text-7xl text-center outline-text md:whitespace-nowrap"
						>
							Werewolf
						</h1>
					</div>

					<div class="flex gap-2 max-lg:justify-center">
						<button
							type="button"
							on:click={() => categoryModal.showModal()}
							class="btn bg-[#50B9AB] md:btn-lg rounded-full font-poppins shadow-lg border-black"
						>
							Create Game
						</button>
						<button
							type="button"
							on:click={() => findModal.showModal()}
							class="btn btn-accent md:btn-lg rounded-full font-poppins shadow-lg border-black"
						>
							Join Game
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
	<div class="modal-box border border-black">
		<h3 class="font-bold text-lg">Start a Game</h3>
		<p class="py-4">Press ESC key or click outside to close</p>
		<input
			bind:value={newGameName}
			type="text"
			placeholder="Enter the name of your game"
			class="input input-bordered input-primary w-full"
		/>
		<div class="pt-4">
			<button
				class="btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
				on:click={saveGame}
			>
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
				class="btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
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
