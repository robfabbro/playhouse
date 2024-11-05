<script>
	import { params } from "@roxi/routify";
	import { HTTP } from "meteor/http";
	import {
		ZilcheGameCollection,
		ZilchePlayerCollection,
	} from "/imports/api/zilche/collections";
	import { Meteor } from "meteor/meteor";
	import { triggerAlertMenu } from "/imports/ui/stores/zilcheStore";
	import Digit from "/imports/ui/components/zilche/Digit.svelte";
	import _ from "lodash";

	export let idx = 0;
	export let player;

	let editingScore = false;
	let currentScore = "0";

	let game;
	$: player_id = player?._id;
	$m: game = ZilcheGameCollection.findOne({ _id: $params.game_id });
	$m: players = ZilchePlayerCollection.find({
		game_id: $params.game_id,
	}).fetch();

	let is_turn;
	$m: is_turn = player?.turn;

	const confirmScore = () => {
		currentScore === "" ? (currentScore = "0") : null;
		editingScore = false;
	};

	const setScoreToAdd = (score) => {
		currentScore = (parseInt(currentScore) + score).toString();
	};

	const incrementScore = () => {
		Meteor.call(
			"zilche.storeScore",
			player_id,
			parseInt(currentScore),
			(err, res) => {
				if (err || !res) {
					triggerAlertMenu("incrementing score", "failed");
				}

				currentScore = "0";
			}
		);
	};

	const addScore = (score, counter = 0) => {
		score == "" ? (score = "0") : null;
		Meteor.call("zilche.addScore", $params.game_id, player_id, counter, score);
		currentScore = "0";
		editingScore = false;
	};

	const stealScore = () => {
		Meteor.call("zilche.stealScore", $params.game_id, player_id);
	};

	$m: playerScore = player?.score + (player?.stored_score || 0);

	$m: currentScore = currentScore
		? currentScore.match(/^[0-9\-]+$/)?.join("")
		: "";
</script>

<div class="mt-6 flex justify-center items-center mb-6 px-1">
	<button
		class="bg-base-100 px-3 shadow-sm container rounded-lg text-center flex flex-col gap-4 items-center border border-black min-h-32 relative py-5"
		class:bg-indigo-50={is_turn}
		class:border-4={is_turn}
		class:border-indigo-800={is_turn}
		on:click={() => {}}
	>
		<span class="absolute top-[5%] left-[5%]">{player?.order || ""}.</span>
		<span class="absolute top-[5%] right-[5%] font-bold"
			>{player?.placing || ""}</span
		>
		<div class="card-body flex flex-col justify-between">
			{#if (!game?.final_round || player?.order > game?.order_of_first_finished) && !game?.finished}
				<div
					class="font-semibold font-poppins capitalize text-center"
					class:text-sm={player?.name?.length >= 11}
					class:text-lg={player?.name?.length === 10}
					class:text-xl={player?.name?.length === 9}
					class:text-2xl={[8, 7].includes(player?.name?.length)}
					class:text-3xl={player?.name?.length === 6}
					class:text-4xl={player?.name?.length === 5}
					class:text-5xl={player?.name?.length <= 4}
				>
					{player.name}
				</div>

				<div class="flex flex-col items-center justify-center pt-4">
					<div
						class={`w-full flex justify-center text-3xl font-poppins cursor-pointer ${is_turn ? "text-black" : ""}`}
						on:click|stopPropagation={() => (editingScore = true)}
						on:keydown={() => {}}
					>
						{#key `${player.score}-${idx}`}
							{#each String(playerScore).split("") as num, i}
								<Digit {num} {i} />
							{/each}
						{/key}
					</div>
				</div>

				<!-- Stored Score -->
				<div
					class={`font-semibold leading-tight flex justify-center items-center text-2xl mb-2`}
				>
					<div
						class={`text-md mb-2 px-4 py-1 shadow-sm border rounded-full ${is_turn ? "text-green-700 bg-green-100 border-white" : "text-gray-200 border-white bg-white"}`}
					>
						{#key `${currentScore}-${idx}`}
							{#each `+ ${String(currentScore)}`.split("") as num, i}
								<Digit {num} {i} />
							{/each}
						{/key}
					</div>
				</div>
				<!-- Stored Score -->

				<div class="flex justify-center items-center gap-3">
					<button
						on:click={() => setScoreToAdd(50)}
						class:btn-disabled={!is_turn}
						class="btn btn-sm border border-gray-400">+50</button
					>
					<button
						on:click={() => setScoreToAdd(100)}
						class:btn-disabled={!is_turn}
						class="btn btn-sm border border-gray-400">+100</button
					>
					<button
						on:click={() => setScoreToAdd(500)}
						class:btn-disabled={!is_turn}
						class="btn btn-sm border border-gray-400">+500</button
					>
				</div>
				<div class="flex justify-around gap-2">
					<button
						on:click={() => incrementScore()}
						disabled={!is_turn && currentScore == 0 && !editingScore}
						class="btn btn-sm bg-green-400 border-green-800">Add</button
					>
					{#if parseInt(currentScore) > 0 && editingScore}
						<button
							on:click={() => (currentScore = "-" + currentScore)}
							class="btn btn-sm btn-accent">- Score</button
						>
					{/if}

					<button
						on:click={() => addScore(0)}
						class:btn-disabled={!is_turn}
						class="btn btn-sm bg-red-400 border-red-800">Zilche</button
					>
				</div>
				<div>
					{#if is_turn && player?.counter == 0 && game?.last_score?.value > 0 && game.scores?.length > 0 && game?.scores.slice(-1)[0]?.player != player?._id}
						<div class="flex flex-col justify-end items-center card-actions">
							<button
								on:click={() => stealScore()}
								class:btn-disabled={!is_turn}
								class="btn bg-orange-600 border-2 border-orange-950 mt-6 text-orange-950 w-full h-auto text-xl"
							>
								STEAL&nbsp; {game?.last_score?.value}
							</button>
						</div>
					{/if}
					{#if player.stored_score}
						<div class="flex flex-col justify-end items-center card-actions">
							<button
								on:click={() => addScore(player.stored_score, player.counter)}
								class="btn bg-indigo-600 mt-6 text-white w-full h-auto text-xl"
							>
								Confirm:&nbsp; {player.stored_score}
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<span class="text-center text-3xl">{player?.name}</span>
				<span class="text-center text-4xl">{player?.score}</span>
				<span class="text-center text-xl"
					>Biggest Roll: {_.max(player.scores.map((s) => s.value))}</span
				>
				<span class="text-center text-xl"
					>Biggest Roll Lost: {_.max(
						player.lost_scores.map((s) => s.value)
					) || "N/A"}</span
				>
				<span class="text-center text-xl"
					>Total Scores Lost: {_.sum(
						player.lost_scores.map((s) => s.value)
					)}</span
				>
				<span class="text-center text-xl">Zilches: {player?.zilches}</span
				>
			{/if}
		</div>
	</button>
</div>
