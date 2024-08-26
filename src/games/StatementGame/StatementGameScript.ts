import { defineComponent, ref, onMounted } from 'vue';
import DilemmaCard from '@/components/DilemmaCard/DilemmaCard.vue';
import PlaceHolder from '@/components/PlaceHolder/PlaceHolder.vue';
import ChoiceTimer from '@/components/ChoiceTimer/ChoiceTimer.vue';

export default defineComponent({
  name: 'StatementGame',
  components: {
    DilemmaCard,
    PlaceHolder,
    ChoiceTimer
  },
  setup() {
    let cardData: {
      imagePath: string;
      textContent: string;
      leftPlaceholderImage: string;
      leftPlaceholderText: string;
      rightPlaceholderImage: string;
      rightPlaceholderText: string;
    }[] = [];

    const currentIndex = ref<number>(0);
    const imagePath = ref<string | undefined>(undefined);
    const textContent = ref<string>('Loading...');
    const leftPlaceholderImage = ref<string | undefined>(undefined);
    const leftPlaceholderText = ref<string | undefined>(undefined);
    const rightPlaceholderImage = ref<string | undefined>(undefined);
    const rightPlaceholderText = ref<string | undefined>(undefined);

    const answers: {
      givenImageSource: string | undefined;
      givenText: string;
      chosenImageSource: string | undefined;
      chosenText: string;
      secondsTaken: number;
    }[] = [];

    const choiceTimer = ref<{ resetTimer: () => void } | null>(null);
    const startTime = ref<number | null>(null);

    const fetchData = async () => {
      try {
        const response = await fetch('/assets/StatementGame/cardData.json');
        const data = await response.json();
        cardData = data;
        loadNextCard();
      } catch (error) {
        console.error('Error fetching data:', error);
        textContent.value = 'Error loading data.';
      }
    };

    const loadNextCard = () => {
      if (choiceTimer.value) {
        choiceTimer.value.resetTimer();
      }

      if (currentIndex.value < cardData.length) {
        const currentCard = cardData[currentIndex.value];
        imagePath.value = currentCard.imagePath;
        textContent.value = currentCard.textContent;
        leftPlaceholderImage.value = currentCard.leftPlaceholderImage;
        leftPlaceholderText.value = currentCard.leftPlaceholderText;
        rightPlaceholderImage.value = currentCard.rightPlaceholderImage;
        rightPlaceholderText.value = currentCard.rightPlaceholderText;
        startTime.value = Date.now(); // Track the start time
        currentIndex.value++;
      } else {
        textContent.value = 'No more cards!';
        saveAnswersToFile();
      }
    };

    function onChoiceMade(placeholder: { image: string | undefined, text: string }){
      if (imagePath.value !== undefined && startTime.value !== null) {
        const secondsTaken = (Date.now() - startTime.value) / 1000; // Calculate time taken in seconds
        answers.push({
          givenImageSource: imagePath.value,
          givenText: textContent.value,
          chosenImageSource: placeholder.image,
          chosenText: placeholder.text,
          secondsTaken
        });
      }
      loadNextCard();
    }

    const saveAnswersToFile = () => {
      const fileData = JSON.stringify(answers, null, 2);
      const blob = new Blob([fileData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'answers.json';
      a.click();
      URL.revokeObjectURL(url);
    };  

    const handleTimeUp = () => {
      answers.push(
        {
          givenImageSource: "null",
          givenText: "null",
          chosenImageSource: "null",
          chosenText: "null",
          secondsTaken: 0
        }
      )
      loadNextCard();
    };

    onMounted(() => {
      fetchData();
      const placeholders = document.querySelectorAll('.place-holder') as NodeListOf<HTMLElement>;

      if (placeholders.length === 2) {
        const [leftPlaceholder, rightPlaceholder] = placeholders;

        leftPlaceholder.style.top = '55%';
        leftPlaceholder.style.left = '20%';
        leftPlaceholder.style.rotate = '-6deg';

        rightPlaceholder.style.top = '55%';
        rightPlaceholder.style.left = '80%';
        rightPlaceholder.style.rotate = '6deg';
      }
    });

    return {
      imagePath,
      textContent,
      leftPlaceholderImage,
      leftPlaceholderText,
      rightPlaceholderImage,
      rightPlaceholderText,
      onChoiceMade,
      choiceTimer,
      handleTimeUp
    };
  }
});
