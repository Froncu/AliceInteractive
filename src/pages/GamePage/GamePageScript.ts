import { defineComponent, onMounted, ref } from 'vue';
import { storage } from '@/../firebaseConfig';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import GameProgressBar from '@/components/GameProgressBar/GameProgressBar.vue';
import AssociationGame from '@/games/AssociationGame/AssociationGame.vue';
import PairWiseGame from '@/games/PairWiseGame/PairWiseGame.vue';
import StatementGame from '@/games/StatementGame/StatementGame.vue';

export default defineComponent({
  name: 'GamePage',
  components: {
    GameProgressBar,
    AssociationGame,
    PairWiseGame,
    StatementGame
  },
  setup() {
    const games = ref(new Array<string>);
    const gameIndex = ref(-1);
    const currentGame = ref<string>('');
    const gameFinished = ref(false);

    onMounted(async () => {
      const parameters = new URLSearchParams(window.location.search);
      const fileRef = storageRef(storage, `${parameters.get('sessionId')}/gameOrder.json`);
      const url = await getDownloadURL(fileRef);
      const response = await fetch(url);
      const data = await response.json();
      games.value = Object.values(data);

      nextGame();
    });

    function onGameFinished() {
      gameFinished.value = true;
    }

    function nextGame() {
      currentGame.value = games.value[++gameIndex.value];
      gameFinished.value = false;
    }

    return {
      games,
      gameIndex,
      currentGame,
      onGameFinished,
      nextGame
    };
  }
});
