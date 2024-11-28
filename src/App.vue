<template>
  <div class="pt-5 h-full flex flex-col">
    <div
      class="min-[300px] w-full max-w-[800px] mx-auto px-4 md:px-8 flex flex-col h-[80%]"
    >
      <button
        class="cursor-pointer active:scale-95 transition-all"
        @click="openSettings = !openSettings"
      >
        <svg-icon
          type="mdi"
          :path="mdiCogOutline"
          color="black"
          size="35"
        ></svg-icon>
      </button>

      <Messages />
    </div>
    <Recorder />
    <Settings v-if="openSettings" @close="openSettings = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Recorder from "@/components/Recorder.vue";
import Messages from "@/components/Messages.vue";
import Settings from "@/components/dialogs/Settings.vue";

import { mdiMonitorAccount, mdiCogOutline } from "@mdi/js";
import { emitter } from "./main";

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
    Settings,
  },

  data() {
    return {
      openSettings: false,
    };
  },

  watch: {
    openSettings(val: boolean) {
      emitter.emit("openSettings", val);
    },
  },
});
</script>

<style scoped>
button {
  text-align: right;
}
</style>
