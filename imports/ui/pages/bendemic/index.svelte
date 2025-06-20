<script lang="ts">
	import { Meteor } from "meteor/meteor";
	import { loadFull } from "tsparticles";
	import particlesHome from "/imports/ui/particles/particlesBendemic.json";
	import Particles, { particlesInit } from "/imports/ui/particles/particles.ts";
	import { quintOut } from "svelte/easing";
	import { onMount } from "svelte";
	import { fade, fly, draw } from "svelte/transition";
	import { inview } from "svelte-inview";
	import type { ObserverEventDetails, Options } from "svelte-inview";
	import { goto, url } from "@roxi/routify";
	import _ from "lodash";
  import QRCode from "qrcode";
  import {
    PatientCollection,
  } from "/imports/api/bendemic/collections";

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

	let loading = false;


	let qr_code = "";
  let bens = 0;
  let alisons = 0;
  let neutrals = 0;

	let generateQR = async () => {
    Meteor.callAsync("bendemic.generate");
	}

  Meteor.subscribe("bendemic.patients");

  $m: {
    bens = PatientCollection.find({ status: "ben" }).count()
    alisons = PatientCollection.find({ status: "alison" }).count()
    neutrals = PatientCollection.find({ status: "neutral" }).count()
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
						{#if neutrals/500 > 0.5}
            Pan
            {:else if alisons/500 > 0.5}
            Ali
            {:else if bens/500 > 0.5}
            Ben
            {/if}
            <span class="text-red-600">demic</span>
					</h1>

					<div class="flex gap-2 max-lg:justify-center">
            <button
							type="button"
							on:click={generateQR}
							class="btn bg-black md:btn-lg rounded-full font-poppins shadow-lg border-white text-white"
						>
							Generate
						</button>
					</div>
          <div class="m-10 w-full h-24 flex border">
            <span class="bg-blue-600 text-center text-white flex items-center justify-center" style:width={`${bens}%`}>
              Bens
            </span> 
            <span class="bg-white text-center text-black flex items-center justify-center" style:width={`${neutrals}%`}>
              {#if neutrals/500 > 0.5}
                Uninfected
              {/if}
            </span> 
            <span class="bg-red-600 text-center text-white flex items-center justify-center" style:width={`${alisons}%`}> 
              Alisons
            </span> 
          </div>
				</div>
			</div>
      {#if qr_code}
      <div>
        <img src={qr_code} alt="QR Code" class="w-64 h-64" />
      </div>
      {/if}
		</div>
	{:else}
		<div class="hero-content flex-col lg:flex-row-reverse min-h-[500px]"></div>
	{/if}
</div>

