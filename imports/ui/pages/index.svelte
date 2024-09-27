<script lang="ts">
	import { Meteor } from "meteor/meteor";
	import Hero from "/imports/ui/components/Hero.svelte";
	import { loadFull } from "tsparticles";
	import particlesConfig from "/imports/ui/particles/particlesConfig.json";
	import Particles, { particlesInit } from "/imports/ui/particles/particles.ts";

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
</script>

<Particles
	id="tsparticles"
	class="put your classes here"
	style=""
	options={particlesConfig}
	on:particlesLoaded={onParticlesLoaded}
/>

<Hero />
