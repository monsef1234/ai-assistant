<template>
  <div
    class="relative overflow-y-auto messages-container flex-1 my-9 scroll-smooth"
  >
    <div
      v-if="messages.length > 0"
      class="flex flex-col gap-2 messages-list mr-3"
    >
      <div v-for="message in messages" :key="message.id">
        <div
          class="flex flex-col gap-2"
          :class="{ 'animate-pulse': message.isLoading }"
        >
          <p
            v-if="!message.isLoading"
            class="text-sm md:text-base bg-purple-700 p-2 rounded-br-none self-end rounded-lg min-w-[200px] max-w-[800px] w-fit text-white"
          >
            {{ message.sender }}
          </p>
          <p
            v-if="!message.isLoading"
            class="text-sm md:text-base bg-gray-700 p-2 rounded-lg rounded-bl-none min-w-[200px] max-w-[800px] w-fit text-white"
          >
            {{ message.response }}
          </p>
          <div
            v-if="message.isLoading"
            class="w-full text-center text-lg bg-gray-700 rounded-lg text-white"
          >
            Loading...
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="messages.length === 0"
      class="flex flex-col gap-7 absolute bottom-0 text-center w-full"
    >
      <p class="text-2xl text-gray-400">Start a conversation</p>
      <svg-icon
        type="mdi"
        :path="mdiArrowDownDropCircleOutline"
        size="40"
        class="mx-auto text-gray-400 animate-bounce"
      ></svg-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { mdiArrowDownDropCircleOutline } from "@mdi/js";
import { emitter } from "../main";
import { AzureOpenAI } from "openai";
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/index";
import { toast } from "vue3-toastify";

type Voice = "alloy" | "echo" | "fable" | "nova" | "onyx" | "shimmer";

interface Message {
  id: number;
  sender: string | null;
  response: string | null;
  isLoading: boolean;
}

export default defineComponent({
  name: "Messages",

  setup() {
    return {
      mdiArrowDownDropCircleOutline,
    };
  },

  data() {
    return {
      messages: [] as Message[],
      id: null as number | null,

      observer: null as MutationObserver | null,
    };
  },

  methods: {
    getStoredValue<T>(
      key: string,
      defaultValue: T,
      transform?: (val: string) => T
    ): T {
      const value = localStorage.getItem(key);
      if (!value) return defaultValue;
      return transform ? transform(value) : (value as T);
    },

    scrollToBottom() {
      if (this.observer) {
        this.observer.disconnect();
      }

      this.observer = new MutationObserver(() => {
        const element: HTMLElement | null = document.querySelector(
          ".messages-container"
        );
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      });
      this.observer.observe(
        document.querySelector(".messages-list") as HTMLElement,
        {
          childList: true,
          subtree: true,
        }
      );
    },

    getOpenAIChatInstance(): AzureOpenAI {
      return new AzureOpenAI({
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY_CHAT,
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT_CHAT,
        apiVersion: import.meta.env.VITE_AZURE_OPENAI_VERSION_CHAT,
        deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME_CHAT,
        dangerouslyAllowBrowser: true,
      });
    },

    getOpenAISpeechInstance(): AzureOpenAI {
      return new AzureOpenAI({
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY_SPEECH,
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT_SPEECH,
        apiVersion: import.meta.env.VITE_AZURE_OPENAI_VERSION_SPEECH,
        deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME_SPEECH,
        dangerouslyAllowBrowser: true,
      });
    },

    createMessages(message: string): ChatCompletionCreateParamsNonStreaming {
      return {
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant. and you are from algeria and if you dont now the answer say you dont know",
          },
          {
            role: "user",
            content: message,
          },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 2000,
      };
    },

    async speechCompletionHandler(msg: string) {
      try {
        const openai = this.getOpenAISpeechInstance();
        const mp3 = await openai.audio.speech.create({
          model: "tts-1",
          voice: this.getStoredValue("voice", "alloy"),
          input: msg,
        });

        const buffer = await mp3.arrayBuffer();

        // Convert buffer to audio and play
        const blob = new Blob([buffer], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.volume = this.getStoredValue("volume", 60, Number) / 100;
        await audio.play();

        // Cleanup URL after playing
        audio.onended = () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error("Speech playback error:", err);
        toast.error("Failed to play audio");
      }
    },

    async chatCompletionHandler(msg: string) {
      try {
        const openai = this.getOpenAIChatInstance();
        const completion: ChatCompletion = await openai.chat.completions.create(
          this.createMessages(msg)
        );

        if (!completion.choices[0]?.message?.content) {
          throw new Error("No response from AI");
        }

        this.messages = this.messages.map((message: Message) => {
          if (message.id === this.id) {
            return {
              id: message.id,
              response: completion.choices[0].message.content,
              isLoading: false,
              sender: msg,
            };
          }
          return message;
        });

        await this.speechCompletionHandler(
          completion.choices[0].message.content
        );
      } catch (err: any) {
        console.log(err);

        toast.error(err || "An error accured");
        this.messages = this.messages.map((message: Message) => {
          if (message.id === this.id) {
            return {
              id: this.id,
              response:
                "Sorry, there was an error processing your message, Try again later",
              isLoading: false,
              sender: msg,
            };
          }
          return message;
        });
      }
    },
  },

  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
    },
  },

  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
    emitter.off("newMessage");
    emitter.off("isLoading");
  },

  created() {
    emitter.on("newMessage", async ({ message }: { message: string }) => {
      try {
        await this.chatCompletionHandler(message);
        emitter.emit("receivedMessage");
      } catch (error) {
        console.error("Message handling error:", error);
      }
    });

    emitter.on("isLoading", (isLoading: boolean) => {
      if (isLoading) {
        const newId = this.messages.length + 1;
        this.id = newId;
        this.messages.push({
          id: newId,
          sender: "",
          response: "",
          isLoading: isLoading,
        });
      } else {
        this.messages = this.messages.filter(
          (message: Message) => message.id !== this.id
        );
      }
    });
  },
});
</script>

<style scoped>
.messages-container {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}
</style>