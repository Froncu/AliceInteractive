import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'DilemmaCard',
  emits: ['mouse-move'],
  setup(props, { emit }) {
    const isDragging = ref(false);
    const offset = ref({ x: 0, y: 0 });
    const cardElement = ref<HTMLElement | null>(null);

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        isDragging.value = true;
        const rect = cardElement.value?.getBoundingClientRect();
        if (rect) {
          offset.value = { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
          event.preventDefault();
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.value && cardElement.value) {
        const { clientX, clientY } = event;
    
        // Update card position based on the mouse movement
        cardElement.value.style.left = `${clientX - offset.value.x}px`;
        cardElement.value.style.top = `${clientY - offset.value.y}px`;
    
        // Fetch rotation values from placeholders
        const placeholders = document.querySelectorAll('.place-holder-left, .place-holder-right');
        if (placeholders.length === 2) {
          const leftPlaceholder = placeholders[0] as HTMLElement;
          const rightPlaceholder = placeholders[1] as HTMLElement;
    
          const leftRotation = parseFloat(window.getComputedStyle(leftPlaceholder).rotate) || -2;
          const rightRotation = parseFloat(window.getComputedStyle(rightPlaceholder).rotate) || 5;
    
          const leftPlaceholderRect = leftPlaceholder.getBoundingClientRect();
          const rightPlaceholderRect = rightPlaceholder.getBoundingClientRect();
          
          const cardRect = cardElement.value.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
    
          const leftCenterX = leftPlaceholderRect.left + leftPlaceholderRect.width / 2;
          const rightCenterX = rightPlaceholderRect.left + rightPlaceholderRect.width / 2;
    
          // Calculate the distance of the card from the left and right placeholders
          const totalDistance = rightCenterX - leftCenterX;
          const distanceFromLeft = cardCenterX - leftCenterX;
          const progress = distanceFromLeft / totalDistance;
    
          // Interpolate the rotation
          const interpolatedRotation = leftRotation + (rightRotation - leftRotation) * progress;
    
          // Apply the rotation
          cardElement.value.style.transform = `translate(-50%, -50%) rotate(${interpolatedRotation}deg)`;
        }
    
        emit('mouse-move', {
          x: clientX,
          y: clientY
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging.value) {
        isDragging.value = false;
    
        const placeholders = document.querySelectorAll('.place-holder-left, .place-holder-right');
        let snapped = false;
    
        placeholders.forEach((placeholder) => {
          const placeholderRect = (placeholder as HTMLElement).getBoundingClientRect();
          if (cardElement.value) {
            const cardRect = cardElement.value.getBoundingClientRect();
    
            if (
              cardRect.left < placeholderRect.right &&
              cardRect.right > placeholderRect.left &&
              cardRect.top < placeholderRect.bottom &&
              cardRect.bottom > placeholderRect.top
            ) {
              // Snap to the placeholder center
              cardElement.value.style.left = `${placeholderRect.left + placeholderRect.width / 2}px`;
              cardElement.value.style.top = `${placeholderRect.top + placeholderRect.height / 2}px`;
    
              // Reset rotation to match placeholder
              const placeholderRotation = window.getComputedStyle(placeholder).rotate || '0deg';
              cardElement.value.style.transform = `translate(-50%, -50%) rotate(${placeholderRotation})`;
              snapped = true;
            }
          }
        });
    
        if (!snapped && cardElement.value) {
          // Snap back to the center
          cardElement.value.style.left = `50%`;
          cardElement.value.style.top = `50%`;
          cardElement.value.style.transform = `translate(-50%, -50%)`; // Reset rotation
        }
      }
    };
    

    onMounted(() => {
      cardElement.value = document.querySelector('.dilemma-card') as HTMLElement;
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    });

    onUnmounted(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    });

    return {
      handleMouseDown,
      cardElement
    };
  }
});
