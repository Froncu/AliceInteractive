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
          offset.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
          event.preventDefault();
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.value && cardElement.value) {
        const { clientX, clientY } = event;

        cardElement.value.style.left = `${clientX - offset.value.x}px`;
        cardElement.value.style.top = `${clientY - offset.value.y}px`;

        const placeholders = document.querySelectorAll('.place-holder') as NodeListOf<HTMLElement>;
        if (placeholders.length === 2) {
          const [leftPlaceholder, rightPlaceholder] = placeholders;

          // Function to extract the rotation angle from the transform property
          const getRotationAngle = (element: HTMLElement): number => {
            const transform = window.getComputedStyle(element).transform;
            if (transform === 'none')
              return 0;

            const matrix = new DOMMatrix(transform);
            return Math.atan2(matrix.m21, matrix.m11) * (-180 / Math.PI);
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

          cardElement.value.style.transform = `rotate(${interpolatedRotation}deg)`;
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging.value) {
        isDragging.value = false;
    
        const placeholders = document.querySelectorAll('.place-holder') as NodeListOf<HTMLElement>;
        let isOverlapping = false;
    
        placeholders.forEach((placeholder) => {
          const placeholderRect = placeholder.getBoundingClientRect();
          if (cardElement.value) {
            const cardRect = cardElement.value.getBoundingClientRect();
    
            if (cardRect.left < placeholderRect.right &&
              cardRect.right > placeholderRect.left &&
              cardRect.top < placeholderRect.bottom &&
              cardRect.bottom > placeholderRect.top
            ) {
              isOverlapping = true;
            }
          }
        });
    
        if (isOverlapping) {
          emit('card-dropped');
        } else {
          // Reset the card's position if not overlapping
          if (cardElement.value) {
            cardElement.value.style.left = '50%';
            cardElement.value.style.top = '50%';
            cardElement.value.style.transform = 'translate(-50%, -50%)';
          }
        }
      }
    };
    

    onMounted(() => {
      cardElement.value = document.querySelector('.dilemma-card') as HTMLElement
      cardElement.value.style.left = '50%';
      cardElement.value.style.top = '50%';
      cardElement.value.style.transform = 'translate(-50%, -50%)';

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