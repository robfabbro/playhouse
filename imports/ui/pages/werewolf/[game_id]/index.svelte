<script lang="ts">
	import { Meteor } from "meteor/meteor";
	import { params, redirect, goto } from "@roxi/routify";
	import moment from "moment";
	import { inview } from "svelte-inview";
	import type { ObserverEventDetails, Options } from "svelte-inview";

	import {
		WolfGameCollection,
		WolfPlayerCollection,
		WolfRoundCollection,
	} from "/imports/api/werewolf/collections";

	import { textfit } from "svelte-textfit";
	import { onMount } from "svelte";
	import _ from "lodash";

	let show = false;
	const options: Options = {
		rootMargin: "50px",
		unobserveOnEnter: true,
		threshold: 0.1,
	};
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
		(show = detail.inView);

	let { game_id, name } = $params;

	let newOptionValue;
	let addPlayerModal;
	let viewPlayerModal;
	let sinkBallModal;
	let startGameModal;
	let loading = false;
	let selectedMode = "stay_alive";
	let showPlayerCode = false;
	let unlockAddPlayer = false;
	let playerToView;
	let playerToViewCodeOptions;
	let playerToViewShowBalls = false;
	let ballToSink;
	let isAdmin = false;
	let playerAffectedBySink = null;
	let last_round = {};
	let player_parents = [];
	let option_parents = [];

	const playerCodes = [
		"🍎",
		"🍊",
		"⚽️",
		"🏀",
		"🏈",
		"🎾",
		"🎱",
		"🍓",
		"🍆",
		"🌞",
		"🌝",
		"🐸",
		"🐷",
		"🚗",
		"💎",
	];

	const closeAddPlayerModal = () => {
		newPlayerName = "";
		newPlayerCode = null;
		showPlayerCode = false;
		unlockAddPlayer = false;
		addPlayerModal.close();
	};

	const closeSinkBallModal = () => {
		ballToSink = null;
		playerAffectedBySink = null;
		sinkBallModal.close();
	};

	const closeViewPlayerModal = () => {
		playerToView = null;
		playerToViewCodeOptions = null;
		playerToViewShowBalls = false;
		viewPlayerModal.close();
	};

	const openAddPlayerModal = () => {
		if (!game?.end_time) {
			showPlayerCode = false;
			unlockAddPlayer = false;
			let unclaimedCodes = playerCodes.filter((code) => {
				return !WolfPlayerCollection.find({
					game_id: game_id,
					code: code,
				}).count();
			});
			newPlayerCode =
				unclaimedCodes[Math.floor(Math.random() * unclaimedCodes.length)];
			addPlayerModal.showModal();
		}
	};

	const openSinkBallModal = (ball) => {
		if (!game?.end_time) {
			ballToSink = ball;
			sinkBallModal.showModal();
		}
	};

	const openViewPlayerModal = (player) => {
		if (!game?.end_time) {
			playerToView = player;
			let nonPlayerCodes = playerCodes.filter((code) => {
				return code !== player.code;
			});
			//limit the number of options to 7
			let limitedOptions = _.sampleSize(nonPlayerCodes, 7);
			playerToViewCodeOptions = _.shuffle([
				...limitedOptions,
				playerToView.code,
			]);

			console.log({ playerToViewCodeOptions });
			viewPlayerModal.showModal();
		}
	};

	const placingth = (placing) => {
		if ([11, 12, 13].includes(placing)) {
			return `${placing}` + "th";
		} else {
			return (
				`${placing}` +
				(placing % 10 === 1
					? "st"
					: placing % 10 === 2
						? "nd"
						: placing % 10 === 3
							? "rd"
							: "th")
			);
		}
	};

	let savePlayer = () => {
		loading = true;
		Meteor.call(
			"wolf.add_player",
			game_id,
			newPlayerName,
			newPlayerCode,
			(err, res) => {
				if (!err) {
					newPlayerName = "";
					loading = false;
					closeAddPlayerModal();
				}
			}
		);
	};

	let startGame = () => {
		loading = true;
		Meteor.call("wolf.start_game", game_id, selectedMode, (err, res) => {
			if (!err) {
				loading = false;
				selectedMode = "stay_alive";
				startGameModal.close();
			}
		});
	};

	let sinkBall = () => {
		loading = true;
		Meteor.call("wolf.sink_ball", game_id, ballToSink, (err, res) => {
			if (!err) {
				loading = false;
				console.log({ res });
				playerAffectedBySink = res;
				// closeSinkBallModal();
			}
		});
	};

	let players = [];
	let rounds = [];
	let alivePlayers = [];
	let deadPlayers = [];
	let newPlayerName;
	let newPlayerCode;
	let game_options = [];
	let game;
	let ballsAlive = _.range(1, 16);

	$m: {
		Meteor.subscribe("wolf.players", game_id);
		Meteor.subscribe("wolf.rounds", game_id);
		Meteor.subscribe("wolf.games");
		players = WolfPlayerCollection.find({ game_id: game_id }).fetch();
		rounds = WolfRoundCollection.find({ game_id: game_id }).fetch();
		last_round = WolfRoundCollection.findOne({
			game_id: game_id,
			open: true,
		});
		alivePlayers = players.filter(
			(player) => !player?.balls?.every((ball) => ball?.status === "sunk")
		);
		deadPlayers = players
			.filter((player) =>
				player?.balls?.every((ball) => ball?.status === "sunk")
			)
			.sort((a, b) => b.finished_at - a.finished_at);
		game = WolfGameCollection.findOne({ _id: game_id });

		if (localStorage.getItem("wolf_admin_games")) {
			let adminGames = JSON.parse(localStorage.getItem("wolf_admin_games"));
			isAdmin = adminGames.includes(game_id);
		}

		ballsAlive = _.range(1, 16).filter((ball) => {
			let sunkBalls = game?.sunk_balls || [];
			return !sunkBalls.includes(ball);
		});

		if (game) {
			let games = localStorage.getItem("wolf_past_games");
			if (games) {
				games = JSON.parse(games);
				games.push(game);
				games = _.uniqBy(games, "_id");
				localStorage.setItem("wolf_past_games", JSON.stringify(games));
			} else {
				localStorage.setItem("wolf_past_games", JSON.stringify([game]));
			}
		}

		console.log({ player_parents });
	}
</script>

<div
	use:inview={options}
	on:inview_change={handleChange}
	class="flex flex-col items-center justify-center p-20 pb-4"
>
	<div
		class:invisible={!show}
		class:fade-in={show}
		class="flex flex-col items-center justify-center"
	>
		<div class="flex flex-col items-center">
			<h1 class="font-poppins text-5xl font-black uppercase text-center">
				{game?.name}
			</h1>
			<div class="btn btn-ghost">
				<span class="text-lg font-light"> code: </span>
				<span class="text-lg font-bold">
					{game?.code}
				</span>
			</div>
		</div>

		<a class="btn btn-link btn-sm absolute top-8 left-8" href={`/`}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2.5"
				stroke="currentColor"
				class="h-8 w-8"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15.75 19.5 8.25 12l7.5-7.5"
				/>
			</svg>
		</a>
	</div>
</div>

{#if game}
	<div
		use:inview={options}
		on:inview_change={handleChange}
		class="flex flex-col items-center justify-center"
	>
		<div
			class:invisible={!show}
			class:fade-in={show}
			class="flex items-center justify-center gap-5"
		>
			<!-- Add Player Header -->
			{#if !game?.start_time}
				<h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">
					Players
				</h1>
				<button
					class="btn bg-[#50B9AB] btn-circle rounded-lg font-poppins shadow-lg border-black flex items-center justify-center p-2"
					on:click={openAddPlayerModal}
				>
					{#if !loading}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-8 w-8"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
					{:else}
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
			{/if}
			<!-- Add Player Header -->
		</div>

		<!-- Players Before Game Start -->
		{#if !game?.start_time}
			<div
				class:invisible={!show}
				class:fade-in={show}
				class="flex items-center justify-center gap-5"
			>
				<div class="mt-6 grid gap-1 grid-cols-3 mb-10 px-1">
					{#each players as player, idx}
						<div
							class="w-full bg-base-100 px-1 shadow-sm container rounded-lg text-center flex flex-col gap-4 items-center border border-black min-h-32"
						>
							<div
								class="text-center my-auto flex flex-col items-center justify-center text-auto"
								bind:this={player_parents[idx]}
							>
								<h2
									class="font-poppins capitalize"
									class:text-sm={player?.name?.length >= 11}
									class:text-lg={player?.name?.length === 10}
									class:text-xl={player?.name?.length === 9}
									class:text-2xl={[8, 7].includes(player?.name?.length)}
									class:text-3xl={player?.name?.length === 6}
									class:text-4xl={player?.name?.length === 5}
									class:text-5xl={player?.name?.length <= 4}
								>
									{player?.name}
								</h2>
							</div>
							{#if player?.balls?.length}
								<div
									use:inview={options}
									on:inview_change={handleChange}
									class="flex flex-col items-center justify-center"
								>
									<div
										class:invisible={!show}
										class:fade-in={show}
										class={`flex gap-1 mb-4 px-1`}
									>
										{#each player?.balls || [] as ball, idx}
											<button
												class="bg-base-200 px-1 shadow-sm container rounded-full"
												class:bg-green-500={game?.game_mode === "sink_all" &&
													ball?.status === "alive"}
												class:bg-red-500={game?.game_mode === "stay_alive" &&
													ball?.status === "sunk"}
											>
												<div
													class="text-center h-5 w-3 my-auto flex items-center"
												>
													<h2 class="font-poppins hidden">{idx}</h2>
												</div>
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
		<!-- Players Before Game Start -->
		<!-- Game When Started -->
		{#if game?.start_time}
			<div
				class:invisible={!show}
				class:fade-in={show}
				class="flex flex-col items-center justify-center gap-2"
			>
				<!-- Remaining Balls -->
				<h1
					class="text-center font-poppins text-2xl font-semibold md:text-5xl flex items-center"
				>
					Rounds
				</h1>

				<div
					class="mt-6 flex flex-row flex-wrap gap-1 mb-10 px-8 items-center justify-center"
				>
					{#each rounds as round}
						{#if round?.cycle == "night"}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="rounded-full bg-black text-white btn btn-lg btn-circle p-0 text-blue-200"
							>
								<path
									fill-rule="evenodd"
									d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
									clip-rule="evenodd"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="rounded-full bg-black text-white btn btn-lg btn-circle p-0 text-yellow-300"
							>
								<path
									d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"
								/>
							</svg>
						{/if}
					{/each}
					<!-- {#each ballsAlive as ball}
						<button
							class="rounded-full bg-black text-white btn btn-lg btn-circle p-0"
							on:click={() => openSinkBallModal(ball)}
						>
							<img
								src={`/assets/pool_balls/${ball}.svg`}
								alt={`Ball ${ball}`}
								class="h-full w-full"
							/>
						</button>
					{/each} -->
				</div>
				<!-- Remaining Balls -->

				<!-- Remaining Players -->
				<h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">
					{alivePlayers?.length !== 1 ? "Remaining Players" : " The Winner"}
				</h1>

				<div
					class:invisible={!show}
					class:fade-in={show}
					class="mt-6 grid gap-1 grid-cols-3 mb-10 px-1 w-full"
					class:grid-cols-2={alivePlayers?.length === 2}
					class:grid-cols-1={alivePlayers?.length === 1}
					class:grid-cols-3={alivePlayers?.length > 2}
				>
					{#each alivePlayers as player, idx}
						<button
							class="w-full bg-base-100 px-1 shadow-sm container rounded-lg text-center flex flex-col gap-4 items-center border border-black min-h-32 bg-cover bg-center"
							style:background-image={player.dead ? "url('/claw.png')" : ""}
							class:text-red-500={player.dead}
							on:click={() => openViewPlayerModal(player)}
						>
							<div
								class="text-center my-auto flex flex-col items-center justify-center text-auto gap-2"
								bind:this={player_parents[idx]}
							>
								<h2
									class="font-poppins capitalize"
									class:text-sm={player?.name?.length >= 11}
									class:text-lg={player?.name?.length === 10}
									class:text-xl={player?.name?.length === 9}
									class:text-2xl={[8, 7].includes(player?.name?.length)}
									class:text-3xl={player?.name?.length === 6}
									class:text-4xl={player?.name?.length === 5}
									class:text-5xl={player?.name?.length <= 4}
								>
									{player?.name}
								</h2>
								{#if alivePlayers?.length === 1}
									<p>1st</p>
								{/if}
							</div>
							{#if player?.balls?.length}
								<div
									use:inview={options}
									on:inview_change={handleChange}
									class="flex flex-col items-center justify-center"
								>
									<div
										class:invisible={!show}
										class:fade-in={show}
										class={`flex flex-wrap gap-1 mb-4 px-1`}
									>
										{#each player?.balls || [] as ball, idx}
											{#if alivePlayers?.length === 1 || ball.status === "sunk"}
												<div
													class:w-12={player?.balls?.length < 3}
													class:h-12={player?.balls?.length < 3}
													class:h-8={player?.balls?.length >= 3}
													class:w-8={player?.balls?.length >= 3}
												>
													<img
														src={`/assets/pool_balls/${ball?.ball}.svg`}
														alt={`Ball ${ball?.ball}`}
														class="h-full w-full"
													/>
												</div>
											{:else}
												<button
													class="bg-base-200 px-1 shadow-sm container rounded-full"
													class:w-12={player?.balls?.length < 3}
													class:h-12={player?.balls?.length < 3}
													class:h-8={player?.balls?.length >= 3}
													class:w-8={player?.balls?.length >= 3}
													class:bg-green-500={game?.game_mode === "sink_all" &&
														ball?.status === "alive"}
													class:bg-red-500={game?.game_mode === "stay_alive" &&
														ball?.status === "sunk"}
												>
													<span class="text-gray-600 font-bold"> ? </span>
												</button>
											{/if}
										{/each}
									</div>
								</div>
							{/if}
						</button>
					{/each}
				</div>
				<!-- Remaining Players -->

				<!-- Eliminated Players -->
				{#if deadPlayers?.length}
					<h1
						class="text-center font-poppins text-2xl font-semibold md:text-5xl"
					>
						Eliminated Players
					</h1>

					<div
						class:invisible={!show}
						class:fade-in={show}
						class="mt-6 grid gap-1 grid-cols-3 mb-10 px-1 w-full"
					>
						{#each deadPlayers as player, idx}
							<div
								class="w-full bg-base-100 px-1 shadow-sm container rounded-lg text-center flex flex-col gap-4 items-center border border-black min-h-32"
							>
								<div
									class="text-center my-auto flex flex-col items-center justify-center text-auto gap-2"
									bind:this={player_parents[idx]}
								>
									<h2
										class="font-poppins capitalize"
										class:text-sm={player?.name?.length >= 11}
										class:text-lg={player?.name?.length === 10}
										class:text-xl={player?.name?.length === 9}
										class:text-2xl={[8, 7].includes(player?.name?.length)}
										class:text-3xl={player?.name?.length === 6}
										class:text-4xl={player?.name?.length === 5}
										class:text-5xl={player?.name?.length <= 4}
									>
										{player?.name}
									</h2>
									<p>
										{placingth(
											players?.length - (deadPlayers?.length - (idx + 1))
										)}
									</p>
								</div>
								{#if player?.balls?.length}
									<div
										use:inview={options}
										on:inview_change={handleChange}
										class="flex flex-col items-center justify-center"
									>
										<div
											class:invisible={!show}
											class:fade-in={show}
											class={`flex flex-wrap justify-center gap-1 mb-4 px-1`}
										>
											{#each player?.balls || [] as ball, idx}
												{#if (game?.game_mode === "sink_all" && ball?.status == "alive") || (game?.game_mode === "stay_alive" && ball?.status === "sunk")}
													<div
														class:w-12={player?.balls?.length < 3}
														class:h-12={player?.balls?.length < 3}
														class:h-8={player?.balls?.length >= 3}
														class:w-8={player?.balls?.length >= 3}
													>
														<img
															src={`/assets/pool_balls/${ball?.ball}.svg`}
															alt={`Ball ${ball?.ball}`}
															class="h-full w-full"
														/>
													</div>
												{:else}
													<button
														class="bg-base-200 px-1 shadow-sm container rounded-full w-10 h-10"
													>
														<div
															class="text-center h-5 w-3 my-auto flex items-center"
														>
															<h2 class="font-poppins hidden">{idx}</h2>
														</div>
													</button>
												{/if}
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
				<!-- Eliminated Players -->
			</div>
		{/if}
		<!-- Game When Started -->
	</div>

	<!-- Start Game Button -->
	{#if !game?.start_time && players?.length > 1}
		<div
			use:inview={options}
			on:inview_change={handleChange}
			class="flex flex-col items-center justify-center"
		>
			<div
				class:invisible={!show}
				class:fade-in={show}
				class="flex items-center justify-center gap-5"
			>
				{#if !game?.start_time}
					<button
						class="btn bg-[#50B9AB] btn-lg rounded-lg font-poppins shadow-lg border-black flex items-center justify-center"
						on:click={() => startGameModal.showModal()}
					>
						Start Game
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
				{/if}
			</div>
		</div>
	{/if}
{/if}
<!-- Start Game Button -->

<dialog class="modal" bind:this={addPlayerModal}>
	{#if game}
		<div class="modal-box border border-black flex flex-col gap-4">
			<h3 class="font-bold text-lg">Add a player</h3>
			<p class="">Press ESC key or click outside to close</p>
			<input
				bind:value={newPlayerName}
				type="text"
				placeholder="Enter the name of your player"
				class="input input-bordered input-primary w-full"
			/>

			{#if !showPlayerCode}
				<button
					class="btn rounded-lg font-poppins shadow-lg border-black w-full bg-black text-white"
					on:click={() => {
						showPlayerCode = true;
						unlockAddPlayer = true;
					}}
				>
					Show Code
				</button>
				<div class="w-full flex items-center justify-center">
					<button
						class="rounded-full bg-black text-white btn btn-lg btn-circle text-3xl"
						on:click={() => {
							showPlayerCode = true;
							unlockAddPlayer = true;
						}}>?</button
					>
				</div>
			{:else}
				<button
					class="btn rounded-lg font-poppins shadow-lg border-black w-full bg-white text-black"
					on:click={() => {
						showPlayerCode = false;
					}}
				>
					Hide Code
				</button>
				<div class="w-full flex items-center justify-center text-7xl">
					{newPlayerCode}
				</div>
			{/if}

			<div class="pt-2">
				<button
					class="btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
					on:click={savePlayer}
					class:btn-disabled={!unlockAddPlayer}
				>
					Add Player
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
			<button on:click={closeAddPlayerModal}>close</button>
		</form>
	{/if}
</dialog>

<!-- View Player Modal -->
<dialog class="modal" bind:this={viewPlayerModal}>
	{#if game}
		<div class="modal-box border border-black flex flex-col gap-4">
			<button
				class="btn btn-sm btn-circle absolute bg-white border-none top-5 right-5"
				on:click={closeViewPlayerModal}
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
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>
			<h3 class="font-bold text-lg">View Player</h3>

			{#if !playerToViewShowBalls}
				<p class="">Enter the correct code to view this player</p>
				<div class="flex flex-wrap items-center justify-center gap-2">
					{#each playerToViewCodeOptions || [] as code}
						<button
							class="btn btn-lg rounded-lg font-poppins shadow-lg border-black min-w-12 text-5xl"
							on:click={() => {
								if (code === playerToView.code) {
									playerToViewShowBalls = true;
								} else {
									alert("Incorrect code");
									closeViewPlayerModal();
								}
							}}
						>
							{code}
						</button>
					{/each}
				</div>
			{:else}
				<div
					class="flex flex-wrap items-center justify-center gap-2 text-md font-semibold"
				>
					{playerToView.role}
					<a class="btn" href={`/werewolf/${game_id}/${playerToView._id}`}>go</a
					>
				</div>
			{/if}
		</div>
		<form method="dialog" class="modal-backdrop">
			<button on:click={closeViewPlayerModal}>close</button>
		</form>
	{/if}
</dialog>
<!-- View Player Modal -->

<!-- Sink Ball Modal -->
<dialog class="modal" bind:this={sinkBallModal}>
	{#if game}
		<div class="modal-box border border-black flex flex-col gap-4">
			<button
				class="btn btn-sm btn-circle absolute bg-white border-none top-5 right-5"
				on:click={closeSinkBallModal}
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
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>
			{#if playerAffectedBySink === null}
				<h3 class="font-bold text-lg">Sink Ball</h3>
				<div class="flex flex-wrap items-center justify-center gap-2">
					<img
						src={`/assets/pool_balls/${ballToSink}.svg`}
						alt={`Ball ${ballToSink}`}
						class="h-20 w-20"
					/>
				</div>

				<div class="mt-6">
					<button
						class="btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
						on:click={sinkBall}
					>
						Sink this Ball!
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
			{:else}
				<h3 class="font-bold text-lg">Ball Sunk</h3>
				<div class="mt-6">
					<p class="text-center">
						{playerAffectedBySink?.name || "No one's"}'s ball has been sunk!
					</p>
					{#if playerAffectedBySink?.finished_at}
						<p class="text-center">
							And this player {game?.game_mode === "stay_alive"
								? "been eliminated!"
								: "finished!"}
						</p>
					{/if}

					<button
						class="mt-6 btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
						on:click={closeSinkBallModal}
					>
						Close!
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
			<button on:click={closeSinkBallModal}>close</button>
		</form>
	{/if}
</dialog>
<!-- Sink Ball Modal -->

<!-- Start Game Modal -->
<dialog class="modal" bind:this={startGameModal}>
	{#if game}
		<div class="modal-box border border-black flex flex-col gap-4">
			<button
				class="btn btn-sm btn-circle absolute bg-white border-none top-5 right-5"
				on:click={() => startGameModal.close()}
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
						d="M6 18 18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<h3 class="font-bold text-lg">Choose your mode:</h3>

			<div class="flex items-center gap-2 justify-center w-full">
				<button
					class="btn md:btn-lg rounded-lg font-poppins shadow-lg border-black min-w-36 {selectedMode ===
					'stay_alive'
						? 'bg-[#E6A64C]'
						: 'bg-white'}"
					on:click={() => {
						selectedMode = "stay_alive";
					}}
				>
					Stay Alive
				</button>
				<button
					class="btn md:btn-lg rounded-lg font-poppins shadow-lg border-black min-w-36 {selectedMode ===
					'sink_all'
						? 'bg-[#E6A64C]'
						: 'bg-white'}"
					on:click={() => {
						selectedMode = "sink_all";
					}}
				>
					Sink your balls
				</button>
			</div>
			<div class="mt-6">
				<button
					class="btn bg-[#50B9AB] md:btn-lg rounded-lg font-poppins shadow-lg border-black w-full"
					on:click={startGame}
				>
					Begin!
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
	{/if}
</dialog>
<!-- Start Game Modal -->
