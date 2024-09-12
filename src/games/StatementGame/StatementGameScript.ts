import { defineComponent, ref, onMounted } from 'vue';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen.vue';
import DilemmaCard from '@/components/DilemmaCard/DilemmaCard.vue';
import PlaceHolder from '@/components/PlaceHolder/PlaceHolder.vue';
import ChoiceTimer from '@/components/ChoiceTimer/ChoiceTimer.vue';
import { authentication, storage } from '@/../firebaseConfig.js';
import { sessionId } from '@/app';

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
  emits: [
    'gameFinished'
  ],
  components: {
    LoadingScreen,
    DilemmaCard,
    PlaceHolder,
    ChoiceTimer
  },
  setup(_, { emit }) {
    let rounds = new Array<Round>;
    let roundIndex = -1;
    const round = ref(new Round);
    let uploaded = false;

    const answers: {
      givenImage: string;
      givenText: string;
      chosenImage: string;
      chosenText: string;
      secondsTaken: number;
    }[] = [];

    const choiceTimer = ref<InstanceType<typeof ChoiceTimer>>();

    const isLoading = ref(true);

    onMounted(async () => {
      await fetchData();
      choiceTimer.value?.start();
    });

    async function fetchData() {
      try {
        const parameters = new URLSearchParams(window.location.search);
        const assetsDirectory = `${parameters.get('sessionId')}/DilemmaGame/`;

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
      if (roundIndex === rounds.length - 1) {
        uploadResult();
        emit('gameFinished');
      }
      else
        round.value = rounds[++roundIndex];
    }

    function onChoiceMade(placeholder: { image: string, text: string }) {
      if (!choiceTimer.value)
        return;

      answers.push({
        givenImage: round.value.centerImage,
        givenText: round.value.centerText,
        chosenImage: placeholder.image,
        chosenText: placeholder.text,
        secondsTaken: choiceTimer.value.startSeconds - choiceTimer.value.secondsRemaining()
      });

      incrementRound();
    }

    async function uploadResult() {
      if (uploaded)
        return;

      const fileData = JSON.stringify(answers, null, 2);
      const blob = new Blob([fileData], { type: 'application/json' });
      const location = storageRef(storage, sessionId + `/DilemmaGame/Results/${authentication.currentUser?.uid}.json`);

      try {
        await uploadBytes(location, blob);
        uploaded = true;
      } catch (error) {
        console.error('Upload failed:', error);
      }
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
