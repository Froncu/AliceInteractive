import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'DilemmaCard',
  emits: ['card-dropped'],
  setup(_, { emit }) {
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
    
        cardElement.value.style.left = `${clientX - offset.value.x}px`;
        cardElement.value.style.top = `${clientY - offset.value.y}px`;
    
        const placeholders = document.querySelectorAll('.place-holder-left, .place-holder-right');
        if (placeholders.length === 2) {
          const leftPlaceholder = placeholders[0] as HTMLElement;
          const rightPlaceholder = placeholders[1] as HTMLElement;
    
          // Function to extract the rotation angle from the transform property
          const getRotationAngle = (element: HTMLElement): number => {
            const transform = window.getComputedStyle(element).transform;
          
            if (transform === 'none') return 0;
          
            // Create a matrix from the transform string
            const matrix = new DOMMatrix(transform);
          
            // Calculate the rotation angle in degrees
            const angle = Math.atan2(matrix.m21, matrix.m11) * (-180 / Math.PI);
          
            return angle;
          };
          
    
          const leftRotation = getRotationAngle(leftPlaceholder);
          const rightRotation = getRotationAngle(rightPlaceholder);
    
          const leftPlaceholderRect = leftPlaceholder.getBoundingClientRect();
          const leftCenterX = leftPlaceholderRect.left + leftPlaceholderRect.width / 2;
    
          const rightPlaceholderRect = rightPlaceholder.getBoundingClientRect();
          const rightCenterX = rightPlaceholderRect.left + rightPlaceholderRect.width / 2;
    
          const cardRect = cardElement.value.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
    
          const distanceFromLeft = cardCenterX - leftCenterX;
          const totalDistance = rightCenterX - leftCenterX;
          const progress = distanceFromLeft / totalDistance;
    
          const interpolatedRotation = leftRotation + (rightRotation - leftRotation) * progress;
    
          cardElement.value.style.transform = `translate(-50%, -50%) rotate(${interpolatedRotation}deg)`;
        }
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
    
            if (!snapped &&
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

              // Emit the 'card-dropped' event
              emit('card-dropped');
            }
          }
        });
    
        if (!snapped && cardElement.value) {
          cardElement.value.style.left = `50%`;
          cardElement.value.style.top = `50%`;
          cardElement.value.style.transform = `translate(-50%, -50%)`;
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
