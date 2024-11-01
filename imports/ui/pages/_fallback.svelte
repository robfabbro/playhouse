<script lang="ts">
	import { Meteor } from "meteor/meteor";
	import { loadFull } from "tsparticles";
	import particlesHome from "/imports/ui/particles/particlesHome.json";
	import Particles, { particlesInit } from "/imports/ui/particles/particles.ts";
	import { goto } from "@roxi/routify";
  import { quintOut } from 'svelte/easing'
	import { fade, fly,draw } from 'svelte/transition'

	let games = [
		{
			name: "Kelly Pool",
			route: "/kelly_pool",
			logo: "pool",
		},
		{
			name: "Camel Race",
			route: "/camel_race",
			logo: "camel",
		},
		{
			name: "Werewolf",
			route: "/werewolf",
			logo: "wolf",
		},
		{
			name: "Aidan's Game",
			route: "/beta",
			logo: "king",
		},
		{
			name: "Zilche",
			route: "/zilche",
			logo: "dice",
		},
		{
			name: "Bingo",
			route: "/bingo",
			logo: "bingo",
		},
	]

	let onParticlesLoaded = (event: any) => {
		const particlesContainer = event.detail.particles;
	};

	void particlesInit(async (engine) => {
		await loadFull(engine);
	});
</script>

<div class="min-h-screen flex flex-col justify-center items-center z-50 pb-32">
	
	<!-- ian what is this -->
	 <div class="flex flex-col gap-4 justify-center items-center py-16">
  <h1 class="font-poppins text-7xl font-black uppercase">C'MON DEV'S LETS GET IT TOGETHER NOW</h1>
  <img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnk3NHpvcW9nNHAxcmQ1ejE3ZnU3bjhhenFya2N6ZjkzdGhyYnBsNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bRKmwTzInZtN2hd1hL/giphy.webp" alt="giph" class="w-full h-full max-w-4xl object-contain rounded-md"/>
	 </div>



</div>

<!-- <Particles
	id="tsparticles"
	class="put your classes here"
	style=""
	options={particlesHome}
	on:particlesLoaded={onParticlesLoaded}
/> -->


