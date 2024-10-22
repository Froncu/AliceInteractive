import { defineComponent, onMounted, ref } from 'vue';
import { storage } from '@/../firebaseConfig';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import GameProgress from '@/components/GameProgress/GameProgress.vue';
import AssociationGame from '@/games/AssociationGame/AssociationGame.vue';
import PairWiseGame from '@/games/PairWiseGame/PairWiseGame.vue';
import StatementGame from '@/games/StatementGame/StatementGame.vue';
import { router } from '@/router';

export default defineComponent({
  name: 'GamePage',
  components: {
    GameProgress,
    AssociationGame,
    PairWiseGame,
    StatementGame
  },
  setup() {
    const gameProgress = ref<InstanceType<typeof GameProgress>>();
    const games = ref(new Array<string>);
    const gameIndex = ref(-1);
    const gamesCount = ref(0);
    const currentGame = ref<string>('');

    onMounted(async () => {
      const parameters = new URLSearchParams(window.location.search);
      const fileRef = storageRef(storage, `${parameters.get('sessionId')}/gameOrder.json`);
      const url = await getDownloadURL(fileRef);
      const response = await fetch(url);
      const data = await response.json();
      games.value = Object.values(data);
      gamesCount.value = games.value.length;

      nextGame();
    });

    function nextGame() {
      if (gameIndex.value == games.value.length - 1)
        router.push('finishedPage');
      else {
        currentGame.value = games.value[++gameIndex.value];
        gameProgress.value?.nextStep();
      }
    }

    return {
      gameProgress,
      gamesCount,
      currentGame,
      nextGame
    };
  }
});
