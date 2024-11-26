<template>
  <div class="py-5 h-full flex flex-col">
    <div
      class="min-[300px] w-full max-w-[800px] mx-auto px-10 flex flex-col h-[80%]"
    >
      <div class="flex justify-between items-center">
        <svg-icon
          type="mdi"
          :path="mdiMonitorAccount"
          color="black"
          size="40"
        ></svg-icon>
        <button class="cursor-pointer active:scale-95 transition-all">
          <svg-icon
            type="mdi"
            :path="mdiCogOutline"
            color="black"
            size="35"
          ></svg-icon>
        </button>
      </div>

      <Messages />
    </div>
    <Recorder />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Recorder from "@/components/Recorder.vue";
import Messages from "@/components/Messages.vue";

import { mdiMonitorAccount, mdiCogOutline } from "@mdi/js";

export default defineComponent({
  name: "App",

  setup() {
    return {
      mdiMonitorAccount,
      mdiCogOutline,
    };
  },

  components: {
    Recorder,
    Messages,
  },
});
</script>

<style>
</style>