import { defineComponent, ref, onMounted, watchEffect } from 'vue';
import DilemmaCard from '@/components/DilemmaCard/DilemmaCard.vue';

export default defineComponent({
  name: 'StatementGame',
  components: {
    DilemmaCard
  },
  setup() {
    const imageSrc = ref<string | undefined>(undefined);

    import('@/assets/logo.png').then((module) => {
      imageSrc.value = module.default;
    });

    const textContent = ref('Hellooo.');

    const imageStyle = ref<Partial<CSSStyleDeclaration>>({
      position: 'absolute',
      left: '0',
      top: '0',
      width: '100%',
      height: '100%',
      objectFit: 'fill' // Ensure the image stretches to fill the card
    });

    const updateImagePosition = () => {
      const cardElement = document.querySelector('.dilemma-card') as HTMLElement;
      if (cardElement) {
        imageStyle.value = {
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          objectFit: 'fill' // Ensures image stretches to fill the entire card
        };
      }
    };

    onMounted(updateImagePosition);
    watchEffect(updateImagePosition);

    return {
      imageSrc,
      imageStyle,
      updateImagePosition,
      textContent // Expose textContent to the template
    };
  }
});
