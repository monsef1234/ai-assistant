<template>
  <div
    class="overlay absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm"
    @click="$emit('close')"
  ></div>
  <div
    class="z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-5 min-w-[300px] max-w-[500px] w-full shadow-lg"
  >
    <h1 class="text-2xl text-center">Settings</h1>
    <div>
      <p class="text-lg my-3 block">Voice:</p>
      <v-select
        v-model="voice"
        :clearable="false"
        :filterable="false"
        :options="voices"
      ></v-select>
    </div>
    <div>
      <p class="text-lg my-3 block">Volume:</p>
      <vue3-slider
        v-model="volume"
        :min="0"
        :max="100"
        color="#8e05c4"
        :tooltip="true"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import slider from "vue3-slider";
import { emitter } from "../../main";

import "vue-select/dist/vue-select.css";

type Voice = "alloy" | "echo" | "fable" | "nova" | "onyx" | "shimmer";

export default defineComponent({
  name: "Settings",

  emits: ["close"],

  components: {
    "vue3-slider": slider,
  },

  data() {
    return {
      voice: this.getStoredValue("voice", "alloy"),
      voices: ["alloy", "echo", "fable", "nova", "onyx", "shimmer"] as Voice[],
      volume: this.getStoredValue("volume", 60, Number),
    };
  },

  methods: {
    getStoredValue<T>(
      key: string,
      defaultValue: T,
      transform?: (value: string) => T
    ): T {
      const value = localStorage.getItem(key);
      if (!value) return defaultValue;
      return transform ? transform(value) : (value as T);
    },
  },

  watch: {
    voice(val: Voice) {
      localStorage.setItem("voice", val);
      emitter.emit("voice", val);
    },

    volume(val: number) {
      localStorage.setItem("volume", val.toString());
      emitter.emit("volume", val);
    },
  },
});
</script>