<script lang="ts">
	import { quintOut } from "svelte/easing";
	import { onMount } from "svelte";
	import { Meteor } from "meteor/meteor";
	import { fade, fly, draw } from "svelte/transition";
	import { inview } from "svelte-inview";
	import type { ObserverEventDetails, Options } from "svelte-inview";
	import { goto } from "@roxi/routify";
	import { KellyGameCollection } from "/imports/api/kelly_pool/collections";
	import _ from "lodash";

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
		Meteor.call("new_game", newGameName, (err, res) => {
			if (!err) {
				$goto(`/${res}`);
				let adminGames = localStorage.getItem("kelly_admin_games");
				if (adminGames) {
					let games = JSON.parse(adminGames);
					games.push(res);
					localStorage.setItem("kelly_admin_games", JSON.stringify(games));
				} else {
					localStorage.setItem("kelly_admin_games", JSON.stringify([res]));
				}
			}
		});
	};
	let gameFound = true;

	let findGame = (e) => {
		if (searchName) {
			console.log("SEARCH NAME", searchName.toLowerCase());

			let found = KellyGameCollection.findOne({
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

	let games = localStorage.getItem("kelly_past_games");
	if (games) {
		past_games = JSON.parse(games);
	}

	
	let videoStream
	let imageSrc
	let canvas
	let poolSrc
	let cameras = []
	let cameraId
	let playing = false
	let interval

	const play = async () => {
		console.log(cameraId)
		playing = true
		let stream = await navigator.mediaDevices.getUserMedia({video: {deviceId:cameraId}, audio: false})
	
		videoStream.srcObject = stream
		videoStream.play()
		if(!interval){
			interval = Meteor.setInterval(() => {
				cap()
			}, 1000);
		}
	}

	const stop = async () => {
		if(interval){
			clearTimeout(interval)
			interval = null
		}
	}

	const cap = async () =>{
		canvas.width = videoStream.videoWidth;
		canvas.height = videoStream.videoHeight;
		console.log(canvas.height, canvas.width)
		canvas.getContext('2d').drawImage(videoStream, 0, 0, canvas.width, canvas.height);
		
		let data = await Meteor.callAsync('test_cv',canvas.toDataURL('image/png'))
		imageSrc.src = data
	}

	onMount(async ()=>{
		let devices = await navigator.mediaDevices.enumerateDevices()
		cameras = devices.filter((v)=>v.kind == "videoinput")
	})

</script>

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
					<h1
						class="font-poppins text-7xl font-black uppercase md:text-7xl text-center outline-text md:whitespace-nowrap"
					>
						Kelly Cam
					</h1>
					<div class="w-full flex justify-center items-center">
						<div class="relative w-full h-full">
						<div class="absolute inset-0 flex justify-center items-center z-10">
							<p class="text-2xl font-bold">x</p>
						</div>
						<video class="w-full" bind:this={videoStream}></video>
					</div>
					</div>
					<img class="w-full" alt="you" bind:this={imageSrc}/>
					<!-- <img class="w-full" bind:this={poolSrc} src="/pool1.jpg"/> -->
					<canvas class="w-full hidden" bind:this={canvas} />
					<select bind:value={cameraId}>
						{#each cameras as camera}
						<option value={camera.deviceId}>{camera.label}</option>
						{/each}
					</select>
					<div class="flex gap-2 max-lg:justify-center">
						<button
							type="button"
							class="btn btn-accent md:btn-lg rounded-full font-poppins shadow-lg border-black"
							on:click={play}
						>
							PLAY
						</button>
						<button
							type="button"
							on:click={stop}
							class="btn btn-accent md:btn-lg rounded-full font-poppins shadow-lg border-black"
						>
							STOP
						</button>
						<button
							type="button"
							on:click={cap}
							class="btn btn-accent md:btn-lg rounded-full font-poppins shadow-lg border-black"
						>
							CAP
						</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="hero-content flex-col lg:flex-row-reverse min-h-[500px]"></div>
	{/if}
</div>

