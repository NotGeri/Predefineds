import type {Predefined} from '@/App.vue';

export const PREDEFINEDS: Array<Predefined> = []
export const DEFAULT_SCRIPT: string = '';
export const URL_SCRIPT_REGEX: RegExp = /\/\/ @include\s*(?<url>.+)/g;
export const OPTIONS_REGEX: RegExp = /const options = JSON\.parse\('(?<options>.*?)'\);/igm;
