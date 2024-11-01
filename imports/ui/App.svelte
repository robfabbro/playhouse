<script lang="ts">
	import { Meteor } from "meteor/meteor";
	import { routes } from "/imports/routify/routes";
	import { Router } from "@roxi/routify";
</script>

<div class="bg-white h-screen">
	<Router {routes} />
</div>
