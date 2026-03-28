<script lang="ts">
  import { fade, draw, crossfade } from "svelte/transition";
  import { cubicOut, quintOut, backIn } from "svelte/easing";
  import { HiveMindGameCollection, HiveMindGamePlayerCollection } from "/imports/api/hive_mind/collections";
  import CounterInput from "/imports/ui/components/hive_mind/CounterInput.svelte";
  import WordResult from "/imports/ui/components/hive_mind/WordResult.svelte";
  import _ from "lodash";
  import { onMount } from "svelte";

  export let closeModal = () => {};
  export let modalOpen = false;
  export let gameId = null;

  let game = null;
  let loadingQrCode = true;
  let errorQrCode = false;
  let qr_code = null;
  let copyTooltipSuccess = false;
  let copyTooltipError = false;
  let copyTooltipTimeout = null;

  $m: {
    game = HiveMindGameCollection.findOne({ _id: gameId });
    qr_code = game?.qr_code;

    if (!qr_code) {
      getQRCode();
    } else {
      errorQrCode = false;
      loadingQrCode = false;
    }
  }

  let closeHowToPlay = () => {
    closeModal();
  };

  let getQRCode = () => {
    loadingQrCode = true;
    errorQrCode = false;

    Meteor.call("hive_mind.get_qr_code", gameId, (err, res) => {
      if (err) {
        errorQrCode = true;
      } else {
        qr_code = res;
      }
      loadingQrCode = false;
    });
  };

  let copyLink = () => {
    if (copyTooltipTimeout !== null) {
      clearInterval(copyTooltipTimeout);
    }

    copyTooltipSuccess = false;
    copyTooltipError = false;

    let url = Meteor.absoluteUrl(`/hive_mind/${gameId}`);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        copyTooltipSuccess = true;
        copyTooltipTimeout = setTimeout(() => {
          copyTooltipSuccess = false;
        }, 1000);
      })
      .catch((err) => {
        console.log("error copy: ", err);
        copyTooltipError = true;
        copyTooltipTimeout = setTimeout(() => {
          copyTooltipError = false;
        }, 1000);
      });
  };

  // UP TO DESIGNING THIS MODAL, SPECIFICALLY THE SPLIT SCORE BOARD
</script>

{#if !!modalOpen}
  <dialog class="modal {modalOpen ? 'modal-open' : ''}">
    <div class="modal-box border border-black relative">
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeHowToPlay}> ✕ </button>
      <!-- BOTTOM RIGHT CLOSE BUTTON -->
      <!-- TITLE -->
      <h3 class="font-bold text-lg">Share Game ({game?.name})</h3>
      <!-- TITLE -->
      <!-- CONTENT -->
      <div class="pt-4 flex flex-col justify-center items-center py-4">
        {#if loadingQrCode}
          <button class="btn btn-neutral text-black w-64 h-64 pointer-events-none">
            <div class="loading loading-xl rounded-full border-b-2 border-gray-900"></div>
          </button>
        {:else if errorQrCode}
          <button class="btn btn-error text-white w-64 h-64 pointer-events-none" on:click={getQRCode}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-20 h-20 stroke-white text-white"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        {:else if qr_code}
          <img src={qr_code} alt="QR Code" class="w-64 h-64" />
        {/if}

        <div class="divider mt-0 pt-0 mb-5">OR</div>

        <button
          class="btn {copyTooltipError
            ? 'btn-error animate-hard-shake'
            : copyTooltipSuccess
              ? 'btn-success text-white animate-hard-shake'
              : 'btn-neutral text-black'} "
          on:click={copyLink}
        >
          <!--  -->
          <span>{copyTooltipError ? "Try Again" : copyTooltipSuccess ? "Link Copied" : "Copy Link"}</span>
          {#if !copyTooltipError && !copyTooltipSuccess}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
          {/if}
          <!--  -->
        </button>
      </div>
      <!-- CONTENT -->

      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </div>
  </dialog>
{/if}
