<script lang="ts">

// import React, { useState } from "react"
// import { Toggle } from "react-hook-theme"
// import "react-hook-theme/dist/styles/style.css"

const navigation = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "Testimonial", href: "#testimonial" },
  { name: "Team", href: "#team" },
  { name: "Contact Us", href: "#contact" },
]

let active = "Home"

const goTo = (e, target) =>{
  e.preventDefault()

  document.getElementById(target.replace('#', '')).scrollIntoView({behavior:"smooth"})
}

</script>

    <div class="sticky top-0 z-50 flex justify-center py-4">
      <div class="navbar max-w-xs rounded-full bg-base-100/90 py-0 shadow-2xl outline outline-base-content/5 backdrop-blur md:max-w-4xl">
        <div class="navbar-start">
          <div class="dropdown">
            <div tabIndex={0} role="button" class="btn btn-circle btn-ghost lg:hidden ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </div>
            <ul class="menu dropdown-content menu-md z-[1] mt-3 w-52 gap-2 rounded-box bg-base-100 p-2 shadow">
              {#each navigation as nav }
                <li >
                  <a href={nav.href} on:click={(e)=>goTo(e, nav.href)} class="font-poppins">
                    {nav.name}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
          <a href="/" class="btn btn-ghost rounded-full font-poppins text-lg font-semibold">
            <img src="/Shirt_Logo_Navy_Text.svg" alt="logo" class="h-10"/>
          </a>
        </div>
        <div class="navbar-center ml-10 hidden lg:flex">
          {#each navigation as nav }
            <nav class="menu menu-horizontal px-1">
              <a
                key={nav.name}
                href={nav.href}
                class={`btn btn-ghost rounded-full font-poppins text-sm font-light ${
                  active === nav.name ? "bg-base-300" : ""
                }`}
                on:click={(e)=>goTo(e, nav.href)}
                on:click={() => active = nav.name}>
                {nav.name}
              </a>
            </nav>
          {/each}
        </div>

        <div class="navbar-end h-10 scale-75">
          <!-- <Toggle /> -->
        </div>
      </div>
    </div>
