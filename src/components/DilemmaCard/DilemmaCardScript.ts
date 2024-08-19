import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'DilemmaCard',
  emits: ['mouse-move'],
  setup(props, { emit }) {
    const isDragging = ref(false);
    const offset = ref({ x: 0, y: 0 });

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        isDragging.value = true;
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        offset.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        event.preventDefault(); // Prevent default action to avoid unexpected behavior
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.value) {
        const { clientX, clientY } = event;
        const cardElement = (event.target as HTMLElement).closest('.dilemma-card') as HTMLElement;

        if (cardElement) {
          cardElement.style.position = 'absolute';
          cardElement.style.left = `${clientX - offset.value.x}px`;
          cardElement.style.top = `${clientY - offset.value.y}px`;

          emit('mouse-move', {
            x: clientX,
            y: clientY
          });
        }
      }
    };

    const handleMouseUp = () => {
      isDragging.value = false;
    };

    onMounted(() => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    });

    onUnmounted(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    });

    return {
      handleMouseDown
    };
  }
});
