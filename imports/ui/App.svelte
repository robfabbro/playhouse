<script lang="ts">
  import { Meteor } from "meteor/meteor";
  import NavBar from './components/NavBar.svelte'
  import Hero from './components/Hero.svelte'
  import LogoClouds from "./components/LogoClouds.svelte";
  import Services from "./components/Services.svelte";
  import Team from "./components/Team.svelte";
  import Testimonial from "./components/Testimonial.svelte";
  import Contact from "./components/Contact.svelte";
  import { routes } from "/imports/routify/routes"; 
  import { Router } from "@roxi/routify";


</script>

<div class="bg-base-200">
  <Router {routes} />
</div>