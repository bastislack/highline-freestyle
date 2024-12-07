<script setup lang="ts">
import { computed, ref } from 'vue';
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'radix-vue';
import { useI18n } from 'vue-i18n';
import messages from '@/i18n/metadata/stickFrequency';

const i18n = useI18n({
  messages,
  useScope: 'local',
});

const { t } = i18n;

// eslint-disable-next-line no-undef
const sliderValue = defineModel<[number]>('frequency');

const sliderColor = computed<string>(() => {
  if (sliderValue.value === undefined) {
    throw new Error('frequency model not set!');
  }
  return options.value.map((e) => e[2])[sliderValue.value[0]];
});

function highlightSelectionClasses(level: number): string {
  if (sliderValue.value === undefined) {
    throw new Error('frequency model not set!');
  }
  return level === sliderValue.value[0] ? 'font-semibold ' + options.value[level][2] : '';
}

function dotClasses(level: number): string {
  if (sliderValue.value === undefined) {
    throw new Error('frequency model not set!');
  }
  return level === sliderValue.value[0] ? 'bg-secondary-950 ' : 'bg-secondary-400';
}

const options = ref<[number, string, string][]>([
  [0, 'levels.neverTried', 'bg-white'],
  [1, 'levels.practicing', 'bg-skill1'],
  [2, 'levels.once', 'bg-skill2'],
  [3, 'levels.rarely', 'bg-skill3'],
  [4, 'levels.sometimes', 'bg-skill4'],
  [5, 'levels.often', 'bg-skill5'],
  [6, 'levels.generally', 'bg-skill6'],
  [7, 'levels.always', 'bg-skill7'],
]);
</script>

<template>
  <div class="flex flex-col w-[350px] md:w-[500px] justify-center h-fit items-center text-sm">
    <div class="flex flex-row justify-end w-full">
      <div class="flex flex-row justify-between items-end w-[89%]">
        <div
          v-for="option in options.slice().filter((_, idx) => idx % 2 == 1)"
          :key="'' + option"
          class="w-[25%] h-fit text-center overflow-visible flex flex-col gap-1 items-center"
        >
          <span class="w-fit px-1 inline-block" :class="highlightSelectionClasses(option[0])">
            {{ t(option[1]) }}
          </span>
          <div class="h-1 w-1 rounded-full" :class="dotClasses(option[0])" />
        </div>
      </div>
    </div>

    <div class="flex flex-row justify-center w-full">
      <SliderRoot
        v-model="sliderValue"
        class="relative flex flex-row items-center select-none touch-none w-[83%] md:w-[81.5%] h-6"
        :min="0"
        :max="7"
        :step="1"
      >
        <SliderTrack class="bg-black relative grow rounded-full w-full overflow-hidden h-2">
          <SliderRange class="absolute rounded-full h-full" :class="sliderColor" />
        </SliderTrack>
        <SliderThumb
          class="block w-5 h-5 shadow-[0_2px_10px] shadow-blackA7 rounded-[10px] hover:bg-violet3 focus:outline-none focus:shadow-[0_0_0_5px] focus:shadow-blackA8"
          :class="sliderColor"
          aria-label="Stick Frequency"
        />
      </SliderRoot>
    </div>

    <div class="flex flex-row justify-start w-full">
      <div class="flex flex-row justify-between items-start w-[89%]">
        <div
          v-for="option in options.slice().filter((_, idx) => idx % 2 == 0)"
          :key="'' + option"
          class="w-[25%] h-fit text-center overflow-visible flex flex-col gap-1 items-center"
        >
          <div class="h-1 w-1 rounded-full" :class="dotClasses(option[0])" />
          <div>
            <span class="w-fit px-1" :class="highlightSelectionClasses(option[0])">
              {{ t(option[1]) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
