import { defineComponent, ref, computed, onMounted } from 'vue';
import { getStorage, ref as storageRef, listAll, uploadBytes } from 'firebase/storage';
import { duplicateFolder } from '@/Utils/DuplicateFromFirebase';

type GameKeys = 'game1' | 'game2' | 'game3';

export default defineComponent({
  name: 'AdminPage',
  setup() {
    const folderName = ref('');
    const errorMessage = ref('');
    const gameOrderError = ref('');
    const dilemmagameImages = ref<File[]>([]);
    const pairwisegameImages = ref<File[]>([]);

    // Dropdown for folder selection
    const rootFolders = ref<string[]>([]);
    const selectedFolder = ref('');
    const storage = getStorage();

    const selectedGames = ref<Record<GameKeys, string>>({
      game1: '',
      game2: '',
      game3: ''
    });

    onMounted(async () => {
      const storageRefRoot = storageRef(storage, '/');
      try {
        const folderList = await listAll(storageRefRoot);
        rootFolders.value = folderList.prefixes
          .map((folderRef) => folderRef.name)
          .filter((folderName) => folderName !== 'default');
      } catch (error) {
        console.error('Error fetching root folder names:', error);
      }
    });

    // Check if the upload button should be enabled
    const isUploadButtonDisabled = computed(() => !selectedFolder.value);

    // Upload selected folder name as a string file in the root folder
    async function uploadFolderString() {
      if (!selectedFolder.value) {
        console.error('No folder selected.');
        return;
      }

      try {
        const stringBlob = new Blob([selectedFolder.value], { type: 'text/plain' });
        const stringFilePath = `selectedFolderName.txt`;
        const stringFileRef = storageRef(storage, stringFilePath);
        await uploadBytes(stringFileRef, stringBlob);
        console.log('Folder name string successfully uploaded:', selectedFolder.value);
      } catch (error) {
        console.error('Error uploading folder name string:', error);
      }
    }

    function availableGames(currentGame: GameKeys) {
      return ['PairWiseGame', 'StatementGame', 'DilemmaGame'].filter((game) => {
        return (
          selectedGames.value[currentGame] === game ||
          !Object.values(selectedGames.value).includes(game)
        );
      });
    }

    function onSelect(gameKey: GameKeys) {
      gameOrderError.value = '';
    }

    const isFolderDuplicationDisabled = computed(() => {
      const hasSelectedGame = selectedGames.value.game1 || selectedGames.value.game2 || selectedGames.value.game3;
      return !folderName.value || folderName.value === 'default' || !hasSelectedGame;
    });

    async function dupFolder() {
      errorMessage.value = '';

      if (!folderName.value) {
        errorMessage.value = 'Please enter a folder name.';
        return;
      }

      if (folderName.value === 'default') {
        errorMessage.value = 'The folder name cannot be "default".';
        return;
      }

      try {
        await duplicateFolder('default', folderName.value);

        const newGameOrder = {
          game1: selectedGames.value.game1 || null,
          game2: selectedGames.value.game2 || null,
          game3: selectedGames.value.game3 || null
        };

        await overwriteGameOrderJson(folderName.value, newGameOrder);
        console.log(`Duplication completed, and gameOrder.json updated in folder: ${folderName.value}`);

        // Upload images to existing folders if needed
        if (selectedGames.value.game1 === 'DilemmaGame' || selectedGames.value.game2 === 'DilemmaGame' || selectedGames.value.game3 === 'DilemmaGame') {
          await uploadImages(folderName.value, dilemmagameImages.value, 'DilemmaGame'); // Existing folder
        }
        if (selectedGames.value.game1 === 'PairWiseGame' || selectedGames.value.game2 === 'PairWiseGame' || selectedGames.value.game3 === 'PairWiseGame') {
          await uploadImages(folderName.value, pairwisegameImages.value, 'PairWiseGame'); // Existing folder
        }
      } catch (error) {
        console.error('Error during folder duplication or JSON upload:', error);
        errorMessage.value = 'An error occurred while duplicating the folder or updating the gameOrder.json.';
      }
    }

    async function overwriteGameOrderJson(folderPath: string, gameOrder: Record<string, string | null>) {
      const jsonFilePath = `${folderPath}/gameOrder.json`;
      const jsonFileRef = storageRef(storage, jsonFilePath);
      const jsonBlob = new Blob([JSON.stringify(gameOrder)], { type: 'application/json' });
      await uploadBytes(jsonFileRef, jsonBlob);
      console.log('gameOrder.json successfully overwritten.');
    }

    async function uploadImages(folderPath: string, images: File[], gameType: string) {
      try {
        for (const image of images) {
          const imageFilePath = `${folderPath}/${gameType}/${image.name}`; // Upload to existing game folder
          const imageFileRef = storageRef(storage, imageFilePath);
          await uploadBytes(imageFileRef, image);
          console.log(`Image ${image.name} uploaded to ${gameType}`);
        }
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    }

    function handleDilemmaImageChange(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        dilemmagameImages.value = Array.from(files);
      }
    }

    function handlePairwiseImageChange(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        pairwisegameImages.value = Array.from(files);
      }
    }

    return {
      folderName,
      errorMessage,
      gameOrderError,
      selectedFolder,
      rootFolders,
      dupFolder,
      uploadFolderString,
      selectedGames,
      availableGames,
      onSelect,
      isFolderDuplicationDisabled,
      isUploadButtonDisabled,
      handleDilemmaImageChange,
      handlePairwiseImageChange,
      dilemmagameImages,
      pairwisegameImages
    };
  }
});
