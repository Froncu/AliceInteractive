import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'ChoiceTimer',
  emits: ['time-up'],
  setup(_, { emit }) {
    const timeRemaining = ref(20);
    let timerInterval: number | null = null;

    const startTimer = () => {
      timeRemaining.value = 20; // reset timer
      if (timerInterval) clearInterval(timerInterval);

      timerInterval = window.setInterval(() => {
        timeRemaining.value -= 1;
        if (timeRemaining.value <= 0) {
          clearInterval(timerInterval as number);
          emit('time-up');
        }
      }, 1000);
    };

    const resetTimer = () => {
      timeRemaining.value = 20;
      startTimer(); // Restart the timer
    };

    onMounted(() => {
      startTimer();
    });

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval);
    });

    return { timeRemaining, startTimer, resetTimer };
  }
});
