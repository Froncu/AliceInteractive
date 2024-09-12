import { defineComponent, ref, computed, watch } from "vue";

export default defineComponent({
  props: {
    stepCount: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const steps = ref(new Array(props.stepCount));
    const currentStep = ref(1);

    watch(() => props.stepCount, () => {
      steps.value = new Array(props.stepCount);
    });

    const progressPercentage = computed(() => {
      return ((currentStep.value - 1) / (steps.value.length - 1)) * 100;
    });

    function nextStep() {
      if (currentStep.value < steps.value.length)
        ++currentStep.value;
    }

    function previousStep() {
      if (currentStep.value > 1)
        --currentStep.value;
    }

    return {
      steps,
      currentStep,
      progressPercentage,
      nextStep,
      previousStep,
    };
  },
});