<template>
  <div class="progress-bar">
    <div v-for="(circle, index) in circles" :key="index" :class="['circle', { checked: index < checkedCount }]">
      <span class="circle-label">{{ index + 1 }}</span>
    </div>
    <div class="line"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'ProgressBar',
  props: {
    total: {
      type: Number,
      default: 5,
    },
    checkedCount: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const circles = Array.from({ length: props.total });

    const getLeftmostUncheckedIndex = computed(() => {
      return circles.findIndex((_, index) => index >= props.checkedCount);
    });

    return {
      circles,
      getLeftmostUncheckedIndex,
    };
  },
});
</script>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
  position: relative;
}

.circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #fff;
  font-weight: bold;
  position: relative;
}

.circle.checked {
  background-color: #4caf50;
}

.circle-label {
  position: absolute;
  z-index: 1;
}

.line {
  flex: 1;
  height: 2px;
  background-color: #4caf50;
  position: absolute;
  left: 15px;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
}
</style>
