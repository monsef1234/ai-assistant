<template>
  <div class="flex-1 overflow-y-auto my-5 relative">
    <div v-if="messages.length > 0" class="flex flex-col gap-2">
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
import { emitter } from "@/main";
import { AzureOpenAI } from "openai";
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/index";
import { toast } from "vue3-toastify";

interface Message {
  id: number;
  sender: string;
  response: string;
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
    };
  },

  methods: {
    getOpenAIChatInstance(): AzureOpenAI {
      return new AzureOpenAI({
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY_CHAT,
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT_CHAT,
        apiVersion: import.meta.env.VITE_AZURE_OPENAI_VERSION_CHAT,
        deployment: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME_CHAT,
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
        model: "",
        max_tokens: 2000,
      };
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
              ...message,
              response: completion.choices[0].message.content,
              isLoading: false,
              sender: msg,
            };
          }
          return message;
        });
      } catch (err: any) {
        toast.error(err);
        this.messages = this.messages.map((message: Message) => {
          if (message.id === this.id) {
            return {
              ...message,
              response: "Sorry, there was an error processing your message.",
              isLoading: false,
              sender: msg,
            };
          }
          return message;
        });
      }
    },
  },

  beforeUnmount() {
    emitter.off("newMessage");
    emitter.off("isLoading");
  },

  created() {
    emitter.on("newMessage", async (message: string) => {
      try {
        await this.chatCompletionHandler(message);
        emitter.emit("receivedMessage");
      } catch (error) {
        console.error("Message handling error:", error);
      }
    });

    emitter.on("isLoading", (isLoading: boolean) => {
      const newId = this.messages.length + 1;
      this.id = newId;
      this.messages.push({
        id: newId,
        sender: "",
        response: "",
        isLoading: isLoading,
      });
    });
  },
});
</script>