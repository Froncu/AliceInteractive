import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';

export default defineComponent({
  name: 'DilemmaCard',
  emits: ['mouse-move'],
  setup(props, { emit }) {
    const isDragging = ref(false);
    const offset = ref({ x: 0, y: 0 });
    const textContainer = ref<HTMLElement | null>(null);

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

    const adjustFontSize = () => {
      if (textContainer.value) {
        const container = textContainer.value;
        let fontSize = 256; // Start with a base font size
        container.style.fontSize = `${fontSize}px`;
        while (container.scrollHeight > container.clientHeight && fontSize > 0) {
          fontSize -= 1; // Decrease font size until it fits
          container.style.fontSize = `${fontSize}px`;
        }
      }
    };

    onMounted(() => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      // Watch for changes in the text content or container size
      const resizeObserver = new ResizeObserver(() => adjustFontSize());
      if (textContainer.value) {
        resizeObserver.observe(textContainer.value);
      }

      // Adjust font size on initial mount
      adjustFontSize();
    });

    onUnmounted(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Clean up ResizeObserver
      if (textContainer.value) {
        const resizeObserver = new ResizeObserver(() => adjustFontSize());
        resizeObserver.unobserve(textContainer.value);
      }
    });

    return {
      handleMouseDown,
      textContainer
    };
  }
});
