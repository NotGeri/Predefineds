<script setup lang="ts">
import {ref} from 'vue';
import {DEFAULT_SCRIPT, OPTIONS_REGEX, PREDEFINEDS} from '@/config';

type Option = {
    id?: string
    text?: string
    name?: string
    colour?: string
    type: 'id' | 'text'
};

export type Predefined = {
    value: string
    label: string
};

const script = ref('');
const error = ref<string | null>(null);
const options = ref<Array<Option> | null>(null);
const results = ref<string | null>(null);
const url = ref<string | null>(null);
const copied = ref<boolean>(false);

/**
 * Parse the script from the top textbox
 * We only really care about the options, so we'll
 * grab them with regex and parse them as JSON
 */
const parse = () => {
    OPTIONS_REGEX.lastIndex = 0;

    let rawOptions = OPTIONS_REGEX.exec(script.value)?.groups?.options ?? '[]';
    rawOptions = rawOptions.replace(/\\'/g, '\'').replace(/\\\\"/g, "\\\"").replace(/\\\\n/g, '\\n');

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
    for (const option of parsedOptions as Array<Option>) {
        // If we don't specify a type, set one here
        if (!option.type) {
            if (option.text && option.text?.length > 0) option.type = 'text';
            else option.type = 'id';
        }

        // If the colour isn't a full hex, add some padding
        if (option.colour && option.colour.startsWith('#') && option.colour.length < 6) {
            while (option.colour.length < 6) {
                option.colour += '0';
            }
        }

        options.value.push(option);
    }
};

/**
 * Reset all options, results and errors
 */
const reset = () => {
    error.value = null;
    results.value = null;
    options.value = null;
};

/**
 * Transform the options and generate
 * the final Tampermonkey script
 */
const generate = () => {
    if (!options.value) return;
    
    const formattedOptions: Array<Option> = [];
    for (const option of options.value) {
        formattedOptions.push({
            type: option.type,
            id: option.id,
            text: option.text?.replace(/\n/g, '\\n'),
            name: option.name?.replace(/\n/g, '\\n'),
            colour: option.colour
        });
    }

    let baseUrl: string = url.value ?? '';
    if (baseUrl?.endsWith('/')) baseUrl = baseUrl?.substring(0, baseUrl?.length - 1);

    results.value = DEFAULT_SCRIPT.replace(/%url%/g, `${baseUrl}/admin/supporttickets.php*`)
        .replace(/%options%/g, JSON.stringify(formattedOptions)
            ?.replace(/'/g, "\\'")
            ?.replace(/\\"/g, '\\\\"')
        );
}

/**
 * Attempt to copy the final output and
 * manage the state of the button
 */
const copy = () => {
    if (!results.value || !navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(results.value).then(() => {
        copied.value = true;

        // Set it back after a few
        setTimeout(() => copied.value = false, 1500);
    });
};

/**
 * Reorder an option
 * @param index The index of the option
 * @param direction The direction to reorder it in
 */
const reorder = (index: number, direction: 'up' | 'down') => {
    if (!options.value) return;
    if (direction == 'up') {
        if (index <= 0) return; // Check for the first element
        const temp = options.value[index];
        options.value[index] = options.value[index - 1];
        options.value[index - 1] = temp;
    } else {
        if (index >= options.value.length - 1) return; // Check for the last element
        const temp = options.value[index];
        options.value[index] = options.value[index + 1];
        options.value[index + 1] = temp;
    }
};

/**
 * Update the name of an option
 * @param index The index of the option
 * @param event The InputEvent that triggered the rename
 */
const updateName = (index: number, event: Event) => {
    if (!options.value) return;
    const name = (event.currentTarget as HTMLElement).textContent;
    if (name != null) {
        options.value[index].name = name;
    }
};

/**
 * Update the type of an option
 * @param index The index of the option
 * @param event The InputEvent that triggered the update
 */
const updateType = (index: number, event: Event) => {
    if (!options.value) return;
    if (options.value[index].type == 'text') options.value[index].type = 'id';
    else options.value[index].type = 'text';
}
</script>

<template>
    <h1 class="text-center m-3">Enter your WHMCS url:</h1>
    <input v-model="url"
           class="w-full h-10"
           placeholder="https://billing.yourhost.tld"/>

    <h1 class="text-center m-3">Enter your entire existing script:</h1>
    <textarea v-model="script"
              @change="reset"
              rows="30"
              class="mb-3 w-full"
              placeholder="Paste your existing script here">
    </textarea>

    <span v-if="error" class="text-red-400 mb-3">{{ error }}</span>

    <div class="flex flex-row gap-3">
        <button class="btn primary" @click="script = DEFAULT_SCRIPT?.replace(/%options%/g, '[]');">
            <i class="fa-solid fa-code"></i>
            Default
        </button>

        <button class="btn danger" @click="reset(); script = '';">
            <i class="fa-solid fa-trash"></i>
            Clear
        </button>

        <button class="btn success" @click="parse" :disabled="!script">
            <i class="fa-solid fa-gears"></i>
            Go!
        </button>
    </div>

    <div v-if="options">
        <div
            class="mt-10 grid grid-cols-[10fr_5fr_5fr_65fr_10fr] gap-x-7 gap-y-10 text-center justify-items-center items-center whitespace-nowrap">
            <template v-for="header in ['Name', 'Colour', 'Custom', 'Content', '']">
                <h3 v-if="options.length > 0">{{ header }}</h3>
            </template>

            <template v-for="(option, index) in options" :key="index">
                <span contenteditable
                      class="btn btn-secondary w-max pr-3 pl-3 h-10 leading-7 whitespace-pre max-w-xs overflow-hidden"
                      :style="{'background-color': options[index].colour}"
                      @blur="event => updateName(index, event)">
                    {{ options[index].name }}</span>

                <input v-model="options[index].colour"
                       type="color"
                       class="w-10 h-10"
                       placeholder="Button colour"/>

                <!-- The checkbox -->
                <label class="toggle-label">
                    <input type="checkbox"
                           :checked="options[index].type == 'text'"
                           @change="event => updateType(index, event)">
                    <div class="toggle"></div>
                </label>

                <!-- ID selection dropdown -->
                <select v-if="options[index].type == 'id'" v-model="options[index].id" class="h-10">
                    <template v-for="predefined in PREDEFINEDS">
                        <option v-bind:value="predefined.value">
                            {{ predefined.label }}
                        </option>
                    </template>
                </select>

                <!-- Custom text area -->
                <textarea v-else v-model="options[index].text"
                          class="h-10"
                          placeholder="Enter custom text">
                    </textarea>

                <!-- Row management buttons -->
                <div class="flex flex-row gap-1 self-center">
                    <button class="btn primary" title="Move up" :disabled="index == 0"
                            @click="reorder(index, 'up')">
                        <i class="fa-solid fa-arrow-up"></i>
                    </button>
                    <button class="btn primary" title="Move down" :disabled="index + 1 == options.length"
                            @click="reorder(index, 'down')">
                        <i class="fa-solid fa-arrow-down"></i>
                    </button>
                    <button class="btn danger" title="Delete" @click="options.splice(index, 1);">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>

            </template>

        </div>

        <!-- Buttons below the editing area -->
        <div class="mt-3 flex flex-row gap-3 justify-center items-center">
            <button class="btn primary" @click="options.push({colour: '#45474e', type: 'id', id: '', name: 'Enter a name'})">
                <i class="fa-solid fa-square-plus"></i>
                New
            </button>

            <button v-if="options" class="btn success" @click="generate">
                <i class="fa-solid fa-retweet"></i>
                Generate
            </button>
        </div>
    </div>

    <!-- Results area -->
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
