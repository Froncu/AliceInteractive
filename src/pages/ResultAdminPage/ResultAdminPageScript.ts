import { defineComponent, ref, onMounted } from 'vue';
import { getStorage, ref as storageRef, listAll, getDownloadURL } from 'firebase/storage';

// Define types for the result structures
interface PairwiseResultItem {
  id: number;
  imagePath: string;
  title: string;
}

interface DilemmaResultItem {
  givenImage: string;
  givenText: string;
  chosenImage: string;
  chosenText: string;
  secondsTaken: number;
}

interface PairwiseScore {
  imagePath: string;
  description: string;
  totalScore: number;
}

interface DilemmaStats {
  imagePath: string;
  givenText: string;
  likes: number;
  dislikes: number;
}

export default defineComponent({
  name: 'ResultAdminPage',
  setup() {
    const storage = getStorage();
    
    // Dropdown for folder selection
    const rootFolders = ref<string[]>([]);
    const selectedFolder = ref(''); // This will act as the session ID

    const pairwiseResults = ref<PairwiseResultItem[][]>([]);
    const dilemmaResults = ref<DilemmaResultItem[][]>([]);
    const totalScores = ref<PairwiseScore[]>([]);
    const dilemmaStats = ref<DilemmaStats[]>([]);
    const isLoading = ref(false);
    const errorMessage = ref('');
    const sessionNotFound = ref(false);  // Flag to show "no session ID found"

    // Fetch list of folders (session IDs) on component mount
    onMounted(async () => {
      await fetchRootFolders();
    });

    // Fetch available folders (session IDs)
    async function fetchRootFolders() {
      try {
        const storageRefRoot = storageRef(storage, '/');
        const folderList = await listAll(storageRefRoot);
        rootFolders.value = folderList.prefixes.map((folderRef) => folderRef.name);
      } catch (error) {
        console.error('Error fetching folders:', error);
        errorMessage.value = 'Failed to load folder list.';
      }
    }

    // When the folder is selected, fetch results automatically
    async function fetchSessionData() {
      if (!selectedFolder.value) return;

      isLoading.value = true;
      errorMessage.value = '';
      sessionNotFound.value = false;

      const sessionId = selectedFolder.value;
      try {
        await fetchPairWiseResults(sessionId);
        await fetchDilemmaResults(sessionId);
        processPairWiseResults();
        processDilemmaResults();
        isLoading.value = false;
      } catch (error) {
        console.error('Error fetching results:', error);
        errorMessage.value = 'Failed to load results.';
        isLoading.value = false;
      }
    }

    // Fetch PairWiseGame results
    async function fetchPairWiseResults(sessionId: string) {
      const folderPath = `${sessionId}/PairWiseGame/Results/`;
      const resultFiles = await listAll(storageRef(storage, folderPath));
      pairwiseResults.value = await loadResults<PairwiseResultItem>(resultFiles);
    }

    // Fetch DilemmaGame results
    async function fetchDilemmaResults(sessionId: string) {
      const folderPath = `${sessionId}/DilemmaGame/Results/`;
      const resultFiles = await listAll(storageRef(storage, folderPath));
      dilemmaResults.value = await loadResults<DilemmaResultItem>(resultFiles);
    }

    async function loadResults<T>(resultFiles: any): Promise<T[][]> {
      const results: T[][] = [];
      for (const fileRef of resultFiles.items) {
        const fileURL = await getDownloadURL(fileRef);
        const response = await fetch(fileURL);
        const data: T[] = await response.json();
        results.push(data);
      }
      return results;
    }

    // Process PairWiseGame results
    function processPairWiseResults() {
      const scoreMap: Record<string, { totalScore: number, title: string }> = {};

      pairwiseResults.value.forEach((result) => {
        result.forEach((item, index) => {
          const { imagePath, title } = item;
          if (!scoreMap[imagePath]) {
            scoreMap[imagePath] = { totalScore: 0, title: title || 'No title available' };
          }
          scoreMap[imagePath].totalScore += index + 1;
        });
      });

      totalScores.value = Object.entries(scoreMap).map(([imagePath, { totalScore, title }]) => ({
        imagePath,
        description: title,
        totalScore
      }));

      totalScores.value.sort((a, b) => a.totalScore - b.totalScore);
    }

    // Process DilemmaGame results
    function processDilemmaResults() {
      const statsMap: Record<string, { givenText: string; likes: number; dislikes: number }> = {};

      dilemmaResults.value.forEach(result => {
        result.forEach(item => {
          const { givenImage, givenText, chosenText } = item;
          if (!statsMap[givenImage]) {
            statsMap[givenImage] = { givenText, likes: 0, dislikes: 0 };
          }
          if (chosenText === 'like') {
            statsMap[givenImage].likes++;
          } else if (chosenText === 'dislike') {
            statsMap[givenImage].dislikes++;
          }
        });
      });

      dilemmaStats.value = Object.entries(statsMap).map(([imagePath, data]) => ({
        imagePath,
        givenText: data.givenText,
        likes: data.likes,
        dislikes: data.dislikes,
      }));
    }

    return {
      rootFolders,
      selectedFolder,
      isLoading,
      errorMessage,
      sessionNotFound,
      totalScores,
      dilemmaStats,
      fetchSessionData, // Trigger fetching session data when folder is selected
    };
  }
});