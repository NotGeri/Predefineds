<script setup lang="ts">
import {ref} from 'vue';
import {DEFAULT_SCRIPT, PREDEFINEDS} from '@/config';

type Option = {
    id?: string
    text?: string
    name?: string
    colour?: string
};

export type Predefined = {
    value: string
    label: string
}

const script = ref('');
const error = ref<string | null>(null);
const options = ref<Array<Option> | null>(null);
const results = ref<string | null>(null);
const copied = ref<boolean>(false);

const useDefault = () => {
    script.value = DEFAULT_SCRIPT?.replace(/%options%/g, '[]');
};

const optionsRegex = /const options = JSON\.parse\('(?<options>.*?)'\);/igm;
const parse = () => {
    optionsRegex.lastIndex = 0;

    const rawOptions = optionsRegex.exec(script.value)?.groups?.options ?? '[]';
    let parsedOptions;
    try {
        parsedOptions = JSON.parse(rawOptions);
    } catch (e) {
        if (e instanceof Error) {
            error.value = `Unable to parse options: ${e.message}`;
            console.error(e.message);
        }
        return;
    }

    options.value = [];
    options.value.push(...parsedOptions)
};

const reset = () => {
    error.value = null;
    results.value = null;
    options.value = null
};

const generate = () => {
    results.value = defaultScript.replace(/%options%/g, JSON.stringify(options.value)
        ?.replace(/'/g, "\\'")
        ?.replace(/\\"/g, '\\\\"')
    );
}

const copy = () => {
    if (!results.value || !navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(results.value).then(() => {
        copied.value = true;

        // Set it back after a few
        setTimeout(() => copied.value = false, 1500);
    });
};

</script>

<template>
    <h1 class="text-center m-3">Enter your entire existing script:</h1>
    <textarea v-model="script"
              @change="reset"
              rows="30"
              class="mb-3 w-full"
              placeholder="Paste your existing script here">
    </textarea>

    <span v-if="error" class="text-red-400 mb-3">{{ error }}</span>

    <div class="flex flex-row gap-3">
        <button class="btn primary" @click="useDefault">
            <i class="fa-solid fa-code"></i>
            Default
        </button>

        <button class="btn danger" @click="reset">
            <i class="fa-solid fa-trash"></i>
            Clear
        </button>

        <button class="btn success" @click="parse" :disabled="!script">
            <i class="fa-solid fa-gears"></i>
            Go!
        </button>
    </div>

    <div v-if="options">
        <div class="mt-10 grid grid-cols-5 gap-x-5 gap-y-5 text-center justify-items-center items-center align-middle">
            <template v-for="header in ['Predefined ID', 'Custom Text', 'Name', 'Colour', '']">
                <h1 class="mb-3">{{ header }}</h1>
            </template>

            <template v-for="(option, index) in options" :key="index">

                <select v-model="options[index].id">
                    <template v-for="predefined in PREDEFINEDS">
                        <option v-bind:value="predefined.value">
                            {{ predefined.label }}
                        </option>
                    </template>
                </select>

                <textarea v-model="options[index].text"
                          placeholder="Custom text">
                </textarea>

                <textarea v-model="options[index].name"
                          placeholder="Button name">
                </textarea>

                <input v-model="options[index].colour"
                       type="color"
                       class="w-full h-full"
                       placeholder="Button colour"/>

                <button class="btn danger" @click="options.splice(index, 1); results = null;">
                    <i class="fa-solid fa-trash"></i>
                    Delete
                </button>
            </template>
        </div>

        <div class="mt-3 flex flex-row gap-3 justify-center items-center">
            <button class="btn primary" @click="options.push({})">
                <i class="fa-solid fa-square-plus"></i>
                New
            </button>

            <button v-if="options" class="btn success" @click="generate">
                <i class="fa-solid fa-retweet"></i>
                Generate
            </button>
        </div>
    </div>

    <div v-if="!!results" class="w-full text-center mt-10">
        <h1 class="text-center mt-3">Replace your Tampermonkey script with this:</h1>
        <textarea v-model="results"
                  @change="error = null"
                  rows="30"
                  class="mt-3 w-full">
        </textarea>
        <button class="btn primary mt-3" @click="copy">
            <i class="fa-solid fa-copy"></i>
            {{ !copied ? 'Copy' : 'Copied!' }}
        </button>
    </div>
</template>
