
<script lang="ts">

// import { Swiper, SwiperSlide } from "swiper/react"
// import "swiper/css"
// import "swiper/css/navigation"
// import "swiper/css/pagination"
// import { Navigation, Autoplay, Pagination, Mousewheel, Keyboard } from "swiper/modules"
import { fade, fly } from 'svelte/transition'
import { inview } from 'svelte-inview';
import type { ObserverEventDetails, Options } from 'svelte-inview';
  import { Meteor } from 'meteor/meteor';
let show = false
  const options: Options = {
    rootMargin: '50px',
    unobserveOnEnter: true,
    threshold: .2
  };
  const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) =>
    (show = detail.inView);

let autoSlide = 0
let carousel

  
const slideTo = (e, index)=>{
  e?.preventDefault()
  let value = 1
  if(carousel){
    if(index < 0){
      value = (testimonials.length + index) % testimonials.length
    }else{
      value = ( index ) % testimonials.length
    }
    carousel.scrollTo({
      top: 0,
      left: carousel.clientWidth * value,
      behavior: "smooth",
    })
  }
  

}

Meteor.setInterval(()=>{
  slideTo(null, autoSlide+1)
  autoSlide = autoSlide +1
}, 2000)
  
const testimonials = [
  {
    name: "Peter",
    position: "Project Manager",
    quote:
      "The team is awesome. They are very professional and know how to get the job done. I would recommend them to anyone.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "David",
    position: "Marketing Manager",
    quote:
      "Wonderful team, great service and always available to answer any queries. I always recommend them to everyone.",
    image:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Marc",
    position: "Human Resources",
    quote: "The best way to manage your technology, like having your own it department",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Lisa",
    position: "Accounting Manager",
    quote:
      "The value of engaging with with Techreative is immense, which all our suppliers were this good",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
]
</script>

    <div
      id="testimonial"
      use:inview={options}
      on:inview_change="{handleChange}"
      transition:fade={{delay:500, duration:300}}

      class="my-20 flex flex-col items-center justify-center md:my-32">
      <div
        class:invisible={!show}
        class:fade-in={show}
        class="flex flex-col items-center justify-center">
        <h1 class="text-center font-poppins text-2xl font-semibold md:text-5xl">
          Testimonials
        </h1>
        <span class="text-md mt-2 px-2 font-poppins md:mt-4 md:px-5 md:text-xl">
          What Our Clients Might Says About Us
        </span>
      </div>

      <div class:invisible={!show}
      class:fade-in={show} class="py-10 container mx-4 h-96 rounded-xl max-sm:max-w-sm">
      <div class="carousel w-full bg-base-100 rounded-xl" bind:this={carousel}>
        {#each  testimonials as testimonial, idx}
          <div id={`slide${idx}`} class="carousel-item relative w-full flex items-center justify-center">
            <div class="flex h-full items-center justify-center">
                <figure class="mx-10 my-10">
                  <blockquote class="text-center font-poppins font-semibold leading-8 text-base-content lg:text-2xl">
                    <p>“{testimonial.quote}”</p>
                  </blockquote>
                  <div class="mt-10 flex flex-col items-center">
                    <img
                      class="mx-auto h-14 w-14 rounded-full"
                      src={testimonial.image}
                      alt={testimonial.name}
                    />
                    <div class="mt-4 flex justify-center gap-2 lg:tracking-widest">
                      <div>{testimonial.name}</div>
                      <div class="text-base-content/50">{testimonial.position}</div>
                    </div>
                  </div>
                </figure>
              </div>
            <div class="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <button on:click={(e)=>slideTo(e, idx-1)} class="btn btn-circle">❮</button> 
              <button on:click={(e)=>slideTo(e, idx+1)} class="btn btn-circle">❯</button>
            </div>
          </div> 
        {/each}
      </div>
      </div>
    </div>
