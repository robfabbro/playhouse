<script>
	import { fly, fade } from 'svelte/transition';
	
	export let num;
	export let i;
</script>

<span
	in:fly={{ y: -10, duration: 200, delay: 200 + i * 80 }}
>
	{num}
</span>
