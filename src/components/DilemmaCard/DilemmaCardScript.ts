import { defineComponent, ref, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'DilemmaCard',
  emits: ["choicemade"],
  setup(_, { emit }) {
    let offset = { x: 0, y: 0 };
    const cardElement = ref<HTMLElement | null>(null);
    function onTransitionEnd(event: TransitionEvent) {
      if (event.propertyName === 'left' || event.propertyName === 'top' || event.propertyName === 'rotate') {
        const placeholders = document.querySelectorAll<HTMLElement>('.place-holder');
        const cardRect = cardElement.value?.getBoundingClientRect();

        const overlappingPlaceholder = ref<HTMLElement | null>(null);
        placeholders.forEach((placeholder) => {
          const placeholderRect = placeholder.getBoundingClientRect();
          if (cardRect &&
            cardRect.left < placeholderRect.right &&
            cardRect.right > placeholderRect.left &&
            cardRect.top < placeholderRect.bottom &&
            cardRect.bottom > placeholderRect.top) {
            overlappingPlaceholder.value = placeholder;
            return;
          }
        });

        if (overlappingPlaceholder.value) {
          const imgElement = overlappingPlaceholder.value.querySelector("img");
          const pElement = overlappingPlaceholder.value.querySelector("p");
          const droppedInfo = {
            image: imgElement?.getAttribute('src') || '',
            text: pElement?.textContent || ''
          };
          
          emit("choicemade", droppedInfo);

          if (!cardElement.value)
            return;
          
          cardElement.value.style.left = '50%';
          cardElement.value.style.top = '60%';
          cardElement.value.style.rotate = '';
        }

        if (cardElement.value)
          cardElement.value.removeEventListener('transitionend', onTransitionEnd);
      }
    }

    function grab(event: MouseEvent | TouchEvent) {
      event.preventDefault();

      if (event instanceof MouseEvent && event.button !== 0 || !cardElement.value)
        return;

      const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
      const centerX = parseInt(window.getComputedStyle(cardElement.value).left);
      const centerY = parseInt(window.getComputedStyle(cardElement.value).top);
      offset = { x: clientX - centerX, y: clientY - centerY };

      window.addEventListener('mousemove', drag);
      window.addEventListener('touchmove', drag);
      cardElement.value.style.transition = "none";

      cardElement.value.removeEventListener('transitionend', onTransitionEnd);

      drag(event);
    }

    function drag(event: MouseEvent | TouchEvent) {
      if (!cardElement.value)
        return;

      const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
      const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
      cardElement.value.style.left = `${clientX - offset.x}px`;
      cardElement.value.style.top = `${clientY - offset.y}px`;

      const placeholders = document.querySelectorAll<HTMLElement>('.place-holder');
      if (placeholders.length !== 2)
        return;

      const [leftPlaceholder, rightPlaceholder] = placeholders;

      const computedStyleLeft = window.getComputedStyle(leftPlaceholder);
      const computedStyleRight = window.getComputedStyle(rightPlaceholder);
      
      const leftRotation = parseFloat(computedStyleLeft.rotate);
      const rightRotation = parseFloat(computedStyleRight.rotate);
      
      const computedStyleCenter = window.getComputedStyle(cardElement.value);
      const cardCenterX = parseInt(computedStyleCenter.left);
      const leftCenterX = parseInt(computedStyleLeft.left);
      const rightCenterX = parseInt(computedStyleRight.left);

      const distanceFromLeft = cardCenterX - leftCenterX;
      const totalDistance = rightCenterX - leftCenterX;
      const progress = distanceFromLeft / totalDistance;

      const interpolatedRotation = leftRotation + (rightRotation - leftRotation) * progress;
      cardElement.value.style.rotate = `${interpolatedRotation}deg`;
    }

    function release() {
      if (!cardElement.value)
        return;

      const placeholders = document.querySelectorAll<HTMLElement>('.place-holder');
      const cardRect = cardElement.value.getBoundingClientRect();
      const overlappingPlaceholder = ref<HTMLElement>();
      placeholders.forEach((placeholder) => {
        const placeholderRect = placeholder.getBoundingClientRect();

        if (cardRect.left < placeholderRect.right &&
          cardRect.right > placeholderRect.left &&
          cardRect.top < placeholderRect.bottom &&
          cardRect.bottom > placeholderRect.top) {
          overlappingPlaceholder.value = placeholder;
          return;
        }
      });

      cardElement.value.style.transition = "rotate 0.5s ease, left 0.5s ease, top 0.5s ease";
      cardElement.value.addEventListener('transitionend', onTransitionEnd);

      if (overlappingPlaceholder.value) {
        const computedStyle = window.getComputedStyle(overlappingPlaceholder.value);
        cardElement.value.style.left = computedStyle.left;
        cardElement.value.style.top = computedStyle.top;

        const placeholderRotation = parseFloat(computedStyle.rotate);
        cardElement.value.style.rotate = `${placeholderRotation}deg`;

        console.log(overlappingPlaceholder.value.style);
      }
      else {
        cardElement.value.style.left = '50%';
        cardElement.value.style.top = '60%';
        cardElement.value.style.rotate = '';
      }

      window.removeEventListener('mousemove', drag);
      window.removeEventListener('touchmove', drag);
    }

    onMounted(() => {
      cardElement.value = document.querySelector<HTMLElement>('.dilemma-card');
      if (cardElement.value) {
        cardElement.value.style.left = '50%';
        cardElement.value.style.top = '60%';
        cardElement.value.style.rotate = '';
      }
      window.addEventListener('mouseup', release);
      window.addEventListener('touchend', release);
    });

    onUnmounted(() => {
      window.removeEventListener('mouseup', release);
      window.removeEventListener('touchend', release);

      if (cardElement.value)
        cardElement.value.removeEventListener('transitionend', onTransitionEnd);
    });

    return {
      grab
    };
  }
});
