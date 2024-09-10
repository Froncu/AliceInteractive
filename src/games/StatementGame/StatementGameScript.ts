import { defineComponent, ref, onMounted } from 'vue';
import { getStorage, getDownloadURL, ref as storageRef } from 'firebase/storage';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.vue';
import DilemmaCard from '@/components/DilemmaCard/DilemmaCard.vue';
import PlaceHolder from '@/components/PlaceHolder/PlaceHolder.vue';
import ChoiceTimer from '@/components/ChoiceTimer/ChoiceTimer.vue';

class Round {
  centerImage = '';
  centerText = '';
  leftImage = '';
  leftText = '';
  rightImage = '';
  rightText = '';
}

export default defineComponent({
  name: 'StatementGame',
  components: {
    LoadingScreen,
    DilemmaCard,
    PlaceHolder,
    ChoiceTimer
  },
  setup() {
    let rounds = new Array<Round>;
    let roundIndex = -1;
    const round = ref(new Round);

    const answers: {
      givenImage: string;
      givenText: string;
      chosenImage: string;
      chosenText: string;
      secondsTaken: number;
    }[] = [];

    const choiceTimer = ref<InstanceType<typeof ChoiceTimer>>();
    const assetsDirectory = 'Test01/DilemmaGame/';
    const isLoading = ref(true);

    onMounted(async () => {
      await fetchData();
      choiceTimer.value?.start();
    });

    async function fetchData() {
      try {
        const storage = getStorage();
        const fileRef = storageRef(storage, assetsDirectory + 'cardData.json');
        const url = await getDownloadURL(fileRef);

        const response = await fetch(url);
        const data = await response.json();
        rounds = data;

        for (const round of rounds) {
          let fileRef = storageRef(storage, assetsDirectory + round.centerImage);
          round.centerImage = await getDownloadURL(fileRef);

          fileRef = storageRef(storage, assetsDirectory + round.leftImage);
          round.leftImage = await getDownloadURL(fileRef);

          fileRef = storageRef(storage, assetsDirectory + round.rightImage);
          round.rightImage = await getDownloadURL(fileRef);
        }

        incrementRound();
        isLoading.value = false;
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    function incrementRound() {
      choiceTimer.value?.reset(true);
      round.value = rounds[++roundIndex];
    }

    function onChoiceMade(placeholder: { image: string, text: string }) {
      if (!choiceTimer.value)
        return;

      if (roundIndex >= rounds.length - 1) {
        if (roundIndex === rounds.length - 1) {
          saveAnswersToFile();
          ++roundIndex;
          choiceTimer.value.reset(false);
        }

        return;
      }

      answers.push({
        givenImage: round.value.centerImage,
        givenText: round.value.centerText,
        chosenImage: placeholder.image,
        chosenText: placeholder.text,
        secondsTaken: choiceTimer.value.startSeconds - choiceTimer.value.secondsRemaining()
      });

      incrementRound();
    }

    function saveAnswersToFile() {
      const fileData = JSON.stringify(answers, null, 2);
      const blob = new Blob([fileData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'answers.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function onTimeUp() {
      answers.push({
        givenImage: 'null',
        givenText: 'null',
        chosenImage: 'null',
        chosenText: 'null',
        secondsTaken: 0
      });

      incrementRound();
    }

    return {
      round,
      choiceTimer,
      isLoading,
      onChoiceMade,
      onTimeUp
    };
  }
});
