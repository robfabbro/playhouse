	<script lang="ts">
	import { Meteor } from "meteor/meteor";
  import { params } from "@roxi/routify";
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
  import {
    PatientCollection,
  } from "/imports/api/bendemic/collections";
  import QRCode from "qrcode";
  import { setPatient, getPatientStatus, getPatientId } from "/imports/ui/stores/zilcheStore";

	let onParticlesLoaded = (event: any) => {
		const particlesContainer = event.detail.particles;
	};

	void particlesInit(async (engine) => {
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

  let patient_id = $params.patient_id;
	let patient;
  let infected_by_user = false

  Meteor.subscribe("bendemic.patient", patient_id);

  $m: {
    patient = PatientCollection.findOne({ patient_id: patient_id });
    console.log(patient)
    if (patient) {
      res = setPatient(patient_id, patient.status);
      if (res) {
        console.log("set localstorage")
      }
      else {
        if (getPatientId() != patient_id) {
          patient.status = getPatientStatus();
          Meteor.callAsync("bendemic.infect", patient.status, patient_id);
          infected_by_user = true;
        }
      }
    }
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
        {#if patient}
				<div class="flex flex-col items-center gap-4">
					<h1
						class="font-poppins text-7xl font-black text-white uppercase md:text-7xl text-center md:whitespace-nowrap"
					> 
            {#if infected_by_user}
            You have infected this patient
            {:else if patient.status != "neutral"}
						You are infected as <span class="text-red-600">{patient.status}</span>
            {:else}
            You are not infected
            {/if}

					</h1>

          <div>
            <img src={patient.qr_code} alt="QR Code" class="w-32 h-32" />
          </div>
          {#if patient.status != "neutral"}
          <span
						class="font-poppins text-1xl font-black text-white uppercase text-center md:whitespace-nowrap"
					>
          Scan other QR codes to infect them
          </span>
          {/if}
				</div>
        {/if}
			</div>
		</div>
	{:else}
		<div class="hero-content flex-col lg:flex-row-reverse min-h-[500px]"></div>
	{/if}
</div>

