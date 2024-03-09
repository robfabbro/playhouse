<script lang='ts'>
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { inview } from 'svelte-inview';
  import type { ObserverEventDetails, Options } from 'svelte-inview';

  let show = false
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .2
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

const services = [
  {
    name: "IT Support and Administration",
    bg: "https://picsum.photos/800/600/?blur=1",
    description: 'IT administration, done right takes time and energy. Doing it securely and keeping up with the changes can be burden, and not always the best use of your own time. We differentiate ourselves with super friendly and passionate IT experts. We love to meet new faces, go to new places and will insist we visit you in your place of work on a regular basis, even just to say hi :)' 
  },
  {
    name: "Strategic Consulting",
    bg: "/mugshots/_DSC7585.jpg",
    description: 'Jargon got you down? Too many options? Too many opinions? Board papers due? Whether its advice on your tech stack, support migrating systems, or assistance with continuity planning and documentation. We have highly specialised experience in technology consultation small or complex' 
  },
  {
    name: "Cyber Security, Auditing and Compliance",
    bg: "https://picsum.photos/800/600/?blur=3",
    description: 'An ever evolving space, from audits and assessments, to certification or compliance. We encapsulate security in everything we do, and apply the best standards and high value initiatives, tools or processes custom fit for your size and risk profile. ' 
  },
  {
    name: "Application Development",
    bg: "https://picsum.photos/800/600/?blur=4",
    description: 'Have a unique idea? Sick of using products with workarounds? With a focus on pushing high value output, early, our small team punches above its weight creating highly efficient products for your niche. Just checkout our previous work!'
  },
  {
    name: "API Integrations and Automations",
    bg: "https://picsum.photos/800/600/?blur=5",
    description: 'Have two or more systems that just wont talk to each other? We experts at writing the glue that lets you integrate and have systems communicate just the right amount to make magic happen'
  },
  {
    name: "An Amazing Team",
    bg: "/mugshots/_DSC7631.jpg",
    description: "We are a social bunch, and would love for you to reach out and chat with us, or better yet come visit us in person!" 
  },
]
</script>

    <div
      id="services"
      use:inview={options}
      on:inview_change="{handleChange}"
      transition:fade={{delay:500, duration:300}}
      class="mt-10 flex flex-col items-center justify-center md:mt-20"
      >
      <div
        class="flex flex-col items-center justify-center"
        class:invisible={!show}
        class:fade-in={show}>
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">
          Our Services
        </h1>
        <span class="text-md mt-2 px-2 text-center font-poppins md:mt-4 md:px-5 md:text-xl">
          Uncover new paths, explore opportunities and chart your success with us.
        </span>
      </div>
      <div
        
        
        class="container mt-10 grid gap-10 p-4 md:grid-cols-2 xl:grid-cols-3 slide-in-fwd-top"
        class:invisible={!show}
        class:fade-in={show}
        >
        
        {#each services as service}
          <div class="flip-box">
            <div
              class="card image-full bg-slate-900 shadow-xl transition duration-300 relative un-flip-it">
              <figure class="object-cover max-h-80">
                <img src={service.bg} alt={service.name} class="object-cover w-full object-center invisible bg-secondary"/>
              </figure>
              <div class="card-body justify-start">
                <h2 class="card-title font-poppins text-4xl font-semibold contrast-200">
                  {service.name}
                  </h2>
                <div>
                  {service.description}
                </div>
              </div>
            </div>
            <div
              class="card image-full bg-base-100 shadow-xl transition duration-300 flip-it absolute top-0">
              <figure class="object-cover max-h-80">
                <img src={service.bg} alt={service.name} class="object-cover w-full object-center"/>
              </figure>
              <div class="card-body">
                <h2 class="card-title mt-auto font-poppins text-4xl font-semibold contrast-200">
                  {service.name}
                </h2>
              </div>
            </div>
            
          </div>
        {/each}

      </div>
    </div>

