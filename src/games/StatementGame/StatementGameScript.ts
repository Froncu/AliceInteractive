import { defineComponent, ref, onMounted } from 'vue';
import { getStorage, ref as storageRef, getDownloadURL } from 'firebase/storage';
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

    const choiceTimer = ref<InstanceType<typeof ChoiceTimer> | null>();

    const assetsDirectory = 'Test01/DilemmaGame/';
    const storage = getStorage();

    const fetchData = async () => {
      try {
        const fileRef = storageRef(storage, assetsDirectory + 'cardData.json');
        const url = await getDownloadURL(fileRef);

        const response = await fetch(url);
        const data = await response.json();
        cardData = data;

        for (const card of cardData)
          await loadData(card);

        loadNextCard();
      } catch (error) {
        console.error('Error fetching data:', error);
        textContent.value = 'Error loading data.';
      }
    };

    async function loadData(card: typeof cardData[0]) {
      let fileRef = storageRef(storage, assetsDirectory + card.imagePath);
      card.imagePath = await getDownloadURL(fileRef);

      fileRef = storageRef(storage, assetsDirectory + card.leftPlaceholderImage);
      card.leftPlaceholderImage = await getDownloadURL(fileRef);

      fileRef = storageRef(storage, assetsDirectory + card.rightPlaceholderImage);
      card.rightPlaceholderImage = await getDownloadURL(fileRef);
    }

    function loadNextCard() {
      if (choiceTimer.value)
        choiceTimer.value.reset(true);

      if (currentIndex.value >= cardData.length) {
        textContent.value = 'No more cards!';
        saveAnswersToFile();
        return;
      }

      const currentCard = cardData[currentIndex.value];

      imagePath.value = currentCard.imagePath;
      textContent.value = currentCard.textContent;
      leftPlaceholderImage.value = currentCard.leftPlaceholderImage;
      leftPlaceholderText.value = currentCard.leftPlaceholderText;
      rightPlaceholderImage.value = currentCard.rightPlaceholderImage;
      rightPlaceholderText.value = currentCard.rightPlaceholderText;
      currentIndex.value++;
    }

    function onChoiceMade(placeholder: { image: string | undefined, text: string }) {
      if (imagePath.value === undefined || !choiceTimer.value)
        return;

      answers.push({
        givenImageSource: imagePath.value,
        givenText: textContent.value,
        chosenImageSource: placeholder.image,
        chosenText: placeholder.text,
        secondsTaken: choiceTimer.value.startSeconds - choiceTimer.value.secondsRemaining()
      });

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
      choiceTimer,
      onChoiceMade,
      handleTimeUp
    };
  }
});
