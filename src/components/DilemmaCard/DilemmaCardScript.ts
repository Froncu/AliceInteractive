import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'DilemmaCard',
  emits: ['card-dropped'],
  setup(_, { emit }) {
    const isDragging = ref(false);
    const offset = ref({ x: 0, y: 0 });
    const cardElement = ref<HTMLElement | null>(null);

    const handleStart = (event: MouseEvent | TouchEvent) => {
      if (event instanceof MouseEvent && event.button !== 0) return;

      isDragging.value = true;
      if (cardElement.value) {
        cardElement.value.classList.add('no-transition'); // Disable transition
      }
      
      const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
      const rect = cardElement.value?.getBoundingClientRect();
      if (rect) {
        offset.value = { x: clientX - rect.left, y: clientY - rect.top };
        event.preventDefault();
      }
    };

    const getRotationAngle = (element: HTMLElement): number => {
      const transform = window.getComputedStyle(element).transform;
      if (transform === 'none') return 0;

      const matrix = new DOMMatrix(transform);
      return Math.atan2(matrix.m21, matrix.m11) * (-180 / Math.PI);
    };

    const handleMove = (event: MouseEvent | TouchEvent) => {
      if (isDragging.value && cardElement.value) {
        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

        const placeholders = document.querySelectorAll('.place-holder') as NodeListOf<HTMLElement>;
        if (placeholders.length === 2) {
          const [leftPlaceholder, rightPlaceholder] = placeholders;

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

        cardElement.value.style.left = `${clientX - offset.value.x}px`;
        cardElement.value.style.top = `${clientY - offset.value.y}px`;
      }
    };

    const handleEnd = (event: MouseEvent | TouchEvent) => {
      if (isDragging.value) {
        isDragging.value = false;
        if (cardElement.value) {
          cardElement.value.classList.remove('no-transition'); // Re-enable transition
        }

        const placeholders = document.querySelectorAll('.place-holder') as NodeListOf<HTMLElement>;
        
        let droppedPlaceholder: { image: string; text: string } | null = null;
        placeholders.forEach((placeholder) => {
          const placeholderRect = placeholder.getBoundingClientRect();
          if (cardElement.value) {
            const cardRect = cardElement.value.getBoundingClientRect();

            if (cardRect.left < placeholderRect.right &&
              cardRect.right > placeholderRect.left &&
              cardRect.top < placeholderRect.bottom &&
              cardRect.bottom > placeholderRect.top
            ) {
              droppedPlaceholder = {
                image: placeholder.querySelector('img')?.getAttribute('src') || '',
                text: placeholder.querySelector('p')?.textContent || ''
              };

              const placeholderCenterX = placeholderRect.left + placeholderRect.width / 2;
              const placeholderCenterY = placeholderRect.top + placeholderRect.height / 2;
              const placeholderRotation = getRotationAngle(placeholder);

              // Calculate the center position of the card
              const cardRect = cardElement.value.getBoundingClientRect();
              const cardWidth = cardRect.width;
              const cardHeight = cardRect.height;
              const cardCenterX = cardRect.left + cardWidth / 2;
              const cardCenterY = cardRect.top + cardHeight / 2;

              // Calculate the translation offset
              const translateX = placeholderCenterX - cardCenterX;
              const translateY = placeholderCenterY - cardCenterY;

              // Apply the position and rotation with transition
              cardElement.value.style.transition = 'transform 0.5s ease, left 0.5s ease, top 0.5s ease';
              cardElement.value.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${placeholderRotation}deg)`;

              const transitionEnd = () => {
                cardElement.value?.style.removeProperty('transition');
                emit('card-dropped', droppedPlaceholder);
                cardElement.value?.removeEventListener('transitionend', transitionEnd);
                if (cardElement.value) {
                  cardElement.value.style.left = '50%';
                  cardElement.value.style.top = '70%';
                  cardElement.value.style.transform = 'translate(-50%, -50%)';
                }
              }

              // Optionally remove the transition class after the animation ends
              cardElement.value.addEventListener('transitionend', transitionEnd);
            }
          }
        });

        if (!droppedPlaceholder) {
          // Reset card position if no placeholder was matched
          if (cardElement.value) {
            cardElement.value.style.left = '50%';
            cardElement.value.style.top = '70%';
            cardElement.value.style.transform = 'translate(-50%, -50%)';
          }
        }
      }
    };

    const addEventListeners = () => {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    };

    const removeEventListeners = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    onMounted(() => {
      cardElement.value = document.querySelector('.dilemma-card') as HTMLElement;
      if (cardElement.value) {
        cardElement.value.style.left = '50%';
        cardElement.value.style.top = '70%';
        cardElement.value.style.transform = 'translate(-50%, -50%)';
        cardElement.value.addEventListener('mousedown', handleStart);
        cardElement.value.addEventListener('touchstart', handleStart, { passive: false });
      }

      addEventListeners();
    });

    onUnmounted(() => {
      if (cardElement.value) {
        cardElement.value.removeEventListener('mousedown', handleStart);
        cardElement.value.removeEventListener('touchstart', handleStart);
      }

      removeEventListeners();
    });

    return {
      handleMouseDown: handleStart,
      cardElement
    };
  }
});
