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

	let show = false;

	const options: Options = {
		rootMargin: "50px",
		unobserveOnEnter: true,
		threshold: 0.5,
	};
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
		(show = detail.inView);

	let loading = false;

  let patients = [];

  Meteor.subscribe("bendemic.patients");

  $m: {
    patients = PatientCollection.find({}).fetch();
  }

</script>

<div
	use:inview={options}
	on:inview_change={handleChange}
	id="home"
	class="hero flex justify-center items-center bg-black p-0 m-0"
>
	{#if patients.length > 0}
  <div class="grid grid-cols-5">
    {#each patients as patient}
    <div>
      <img src={patient.qr_code} alt="QR Code" class="w-64 h-64"/>
    </div>
    {/each}
  </div>
  {/if}
</div>

