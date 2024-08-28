import { defineComponent, ref, onUnmounted } from 'vue';

export default defineComponent({
  name: 'ChoiceTimer',
  props: {
    startSeconds: {
      type: Number,
      required: true,
    }
  },
  emits: ['elapsed'],
  setup(props, { emit }) {
    const timeRemaining = ref(props.startSeconds);
    let timerInterval = 0;

    function start() {
      if (timerInterval)
        return;

      timerInterval = window.setInterval(() => {
        timeRemaining.value -= 1;
        if (timeRemaining.value <= 0) {
          clearInterval(timerInterval);
          emit('elapsed');
        }
      }, 1000);
    }

    function reset(startAfter: boolean) {
      timeRemaining.value = props.startSeconds;
      clearInterval(timerInterval);
      timerInterval = 0;

      if (startAfter)
        start();
    }

    function secondsRemaining() {
      return timeRemaining.value;
    }

    onUnmounted(() => {
      reset(false);
    });

    return {
      timeRemaining,
      start,
      reset,
      secondsRemaining
    };
  }
});
