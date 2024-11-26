<template>
  <div class="h-[20%] bg-black rounded-lg py-5">
    <button
      @click="startVadFunction"
      class="mx-auto w-24 block disabled:cursor-not-allowed"
      :class="{ 'active:scale-95': !isActive }"
      :disabled="isActive"
    >
      <img
        :src="isActive ? active : inactive"
        alt="active"
        class="object-cover"
      />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import type { MicVAD } from "@ricky0123/vad-web";

import { toast, type ToastContainerOptions } from "vue3-toastify";
import { AzureOpenAI } from "openai";
import { emitter } from "@/main";

import active from "@/assets/images/active.gif";
import inactive from "@/assets/images/inactive.gif";

import "vue3-toastify/dist/index.css";

declare global {
  interface Window {
    vad: any;
  }
}

export default defineComponent({
  name: "Recorder",

  setup() {
    return {
      active,
      inactive,
    };
  },

  data() {
    return {
      isActive: false as boolean,
      mymicVad: null as MicVAD | null,
    };
  },

  methods: {
    getOpenAIWhisperInstance(): AzureOpenAI {
      return new AzureOpenAI({
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY_WHISPER,
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT_WHISPER,
        apiVersion: import.meta.env.VITE_AZURE_OPENAI_VERSION_WHISPER,
        deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME_WHISPER,
        dangerouslyAllowBrowser: true,
      });
    },

    async startVadFunction() {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });

        this.isActive = true;
        if (window.vad) {
          this.mymicVad = await window.vad.MicVAD.new({
            preSpeechPadFrames: 5, // Reduces initial clip
            positiveSpeechThreshold: 0.8, // Lower threshold for better detection
            negativeSpeechThreshold: 0.8, // Lower threshold for better detection
            minSpeechFrames: 5, // Minimum frames to trigger speech
            startOnLoad: true, // Start listening immediately
            onSpeechStart: () => {
              console.log("start");
            },
            onSpeechEnd: (audio: Float32Array | undefined) => {
              this.mymicVad?.pause();
              this.transcriptionAudio(audio);
            },
            onVADMisfire: () => {
              toast.info("Please speak louder", {
                position: "top-center",
                autoClose: 3000,
                pauseOnHover: true,
                theme: "dark",
              } as ToastContainerOptions);
            },
          });

          this.mymicVad.start();
        } else {
          toast.error("VAD is not available", {
            position: "top-center",
            autoClose: 3000,
            pauseOnHover: true,
            theme: "dark",
          } as ToastContainerOptions);
        }
      } catch (err) {
        console.log(err);

        toast.error(
          "Microphone permission denied please check your browser microphone permission",
          {
            position: "top-center",
            autoClose: 3000,
            pauseOnHover: true,
            theme: "dark",
          } as ToastContainerOptions
        );
      }
    },

    convertFloat32ArrayToBlob(audio: Float32Array) {
      // Helper function to write strings to DataView
      const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      // Convert to 16-bit PCM
      const pcmData = new Int16Array(audio.length);
      for (let i = 0; i < audio.length; i++) {
        const s = Math.max(-1, Math.min(1, audio[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Create WAV header
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);

      // WAV Header
      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + pcmData.length * 2, true);
      writeString(view, 8, "WAVE");
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, 16000, true);
      view.setUint32(28, 32000, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, "data");
      view.setUint32(40, pcmData.length * 2, true);

      // Combine header and data
      const blob = new Blob([wavHeader, pcmData], { type: "audio/wav" });
      return blob;
    },

    async transcriptionAudio(audio: Float32Array) {
      emitter.emit("isLoading", true);
      const blob = await this.convertFloat32ArrayToBlob(audio);
      const audioFile = new File([blob], "audio.wav", { type: "audio/wav" });
      console.log(audioFile);
      try {
        const openaiWhisper = this.getOpenAIWhisperInstance();

        const transcription = await openaiWhisper.audio.transcriptions.create({
          file: audioFile,
          language: "en",
        });

        emitter.emit("newMessage", transcription.text);
      } catch (err: any) {
        let errMsg = "An error accured";

        if (err.toString().includes("Please retry after")) {
          const retryMatch = err.message.match(
            /Please retry after (\d+\s+\w+)/
          );

          if (retryMatch) {
            errMsg = `Please retry after ${retryMatch[1]} due to rate limit`;
          }
        }
        toast.error(errMsg);
        emitter.emit("isLoading", false);
        this.isActive = false;
      }
    },
  },

  beforeUnmount() {
    emitter.off("receivedMessage");
    if (this.mymicVad) {
      this.mymicVad.pause();
      this.mymicVad = null;
    }
  },

  created() {
    emitter.on("receivedMessage", () => {
      this.isActive = false;
    });
  },
});
</script>
