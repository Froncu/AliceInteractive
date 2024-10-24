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

    // PairWiseGame states
    const pairwisegameImages = ref<File[]>([]);
    const pairwisegameTitles = ref<string[]>([]);
    const pairwisegameDescriptions = ref<string[]>([]);

    // DilemmaGame (formerly StatementGame) states
    const dilemmagameImages = ref<File[]>([]);
    const dilemmagameCenterTexts = ref<string[]>([]); // Store center text for each center image

    // AssociationGame states
    const associationgameImages = ref<File[]>([]);
    const associationgameTitles = ref<string[]>([]);
    const associationImageLimitReached = ref(false); // Handle up to 12 images for AssociationGame

    const storage = getStorage();

    // Dropdown for folder selection
    const rootFolders = ref<string[]>([]);
    const selectedFolder = ref('');
    const selectedGames = ref<Record<GameKeys, string>>({
      game1: '',
      game2: '',
      game3: ''
    });

    const duplicatedFolderLink = ref(''); // New ref to store the duplicated folder link

const duplicatedProjectLink = computed(() => {
  if (!duplicatedFolderLink.value) return '';
  return `${window.location.origin}/MainPage?sessionId=${duplicatedFolderLink.value}`;
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
      return ['PairWiseGame', 'DilemmaGame', 'AssociationGame'].filter((game) => {
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

    // Function to handle folder duplication
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

        // PairWiseGame: Upload images and update cards.json
        if (selectedGames.value.game1 === 'PairWiseGame' || selectedGames.value.game2 === 'PairWiseGame' || selectedGames.value.game3 === 'PairWiseGame') {
          await uploadImagesAndUpdateCardsJson(folderName.value, pairwisegameImages.value, pairwisegameTitles.value, pairwisegameDescriptions.value, 'PairWiseGame');
        }

        // DilemmaGame: Upload images and update cardData.json
        if (selectedGames.value.game1 === 'DilemmaGame' || selectedGames.value.game2 === 'DilemmaGame' || selectedGames.value.game3 === 'DilemmaGame') {
          await uploadImagesAndUpdateCardDataJson(folderName.value, dilemmagameImages.value, dilemmagameCenterTexts.value, 'DilemmaGame');
        }

        // AssociationGame: Upload images and update influenceZones.json
        if (selectedGames.value.game1 === 'AssociationGame' || selectedGames.value.game2 === 'AssociationGame' || selectedGames.value.game3 === 'AssociationGame') {
          await uploadImagesAndUpdateInfluenceZonesJson(folderName.value, associationgameImages.value, associationgameTitles.value);
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

    // Upload images and update influenceZones.json for AssociationGame
    async function uploadImagesAndUpdateInfluenceZonesJson(folderPath: string, images: File[], titles: string[]) {
      const influenceZones: any[] = [];

      try {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const title = titles[i];

          const imageFilePath = `${folderPath}/AssociationGame/${image.name}`;
          const imageFileRef = storageRef(storage, imageFilePath);
          await uploadBytes(imageFileRef, image);

          influenceZones.push({
            size: 30,
            name: title || `Zone ${i + 1}`,
            color: "#ffffff",
            bordercolor: "black",
            bordersize: 2,
            fontsize: 16,
            fontcolor: "black",
            image: image.name
          });
        }

        const influenceZonesJsonPath = `${folderPath}/AssociationGame/influenceZones.json`;
        const influenceZonesJsonRef = storageRef(storage, influenceZonesJsonPath);
        const influenceZonesBlob = new Blob([JSON.stringify(influenceZones, null, 2)], { type: 'application/json' });
        await uploadBytes(influenceZonesJsonRef, influenceZonesBlob);
        console.log('influenceZones.json updated successfully.');
        duplicatedFolderLink.value = folderName.value;


      } catch (error) {
        console.error('Error uploading images or updating influenceZones.json:', error);
      }
    }

    // Upload images and update cards.json for PairWiseGame, AssociationGame
    async function uploadImagesAndUpdateCardsJson(folderPath: string, images: File[], titles: string[], descriptions: string[], gameType: string) {
      const cards: any[] = [];
      let currentId = 1; // Start ID counter for cards.json

      try {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const title = titles[i];
          const description = descriptions[i];

          const imageFilePath = `${folderPath}/${gameType}/${image.name}`;
          const imageFileRef = storageRef(storage, imageFilePath);
          await uploadBytes(imageFileRef, image);

          cards.push({
            id: currentId,
            title: title || `Image ${currentId}`,
            imagePath: image.name, // Store just the file name
            description: description || 'No description provided.'
          });
          currentId++; // Increment the ID
        }

        const cardsJsonPath = `${folderPath}/${gameType}/cards.json`;
        const cardsJsonRef = storageRef(storage, cardsJsonPath);
        const cardsBlob = new Blob([JSON.stringify({ cardItems: cards }, null, 2)], { type: 'application/json' });
        await uploadBytes(cardsJsonRef, cardsBlob);
        console.log(`${gameType} cards.json updated successfully.`);

      } catch (error) {
        console.error(`Error uploading images or updating ${gameType} cards.json:`, error);
      }
    }

    // Upload images and update cardData.json for DilemmaGame
    async function uploadImagesAndUpdateCardDataJson(folderPath: string, images: File[], centerTexts: string[], gameType: string) {
      const cardData: any[] = [];

      try {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const centerText = centerTexts[i];

          const imageFilePath = `${folderPath}/${gameType}/${image.name}`;
          const imageFileRef = storageRef(storage, imageFilePath);
          await uploadBytes(imageFileRef, image);

          cardData.push({
            centerImage: image.name, // Just store the file name
            centerText: centerText || 'No center text provided.',
            leftImage: 'image2.png', // Static left image
            leftText: 'dislike', // Static left text
            rightImage: 'image3.png', // Static right image
            rightText: 'like' // Static right text
          });
        }

        const cardDataJsonPath = `${folderPath}/${gameType}/cardData.json`;
        const cardDataJsonRef = storageRef(storage, cardDataJsonPath);
        const cardDataBlob = new Blob([JSON.stringify(cardData, null, 2)], { type: 'application/json' });
        await uploadBytes(cardDataJsonRef, cardDataBlob);
        console.log('cardData.json updated successfully.');

      } catch (error) {
        console.error('Error uploading images or updating cardData.json:', error);
      }
    }

    // PairWiseGame Handlers
    function handlePairwiseImageChange(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        pairwisegameImages.value = Array.from(files);
      }
    }

    function handlePairwiseTitleChange(event: Event, index: number) {
      pairwisegameTitles.value[index] = (event.target as HTMLInputElement).value;
    }

    function handlePairwiseDescriptionChange(event: Event, index: number) {
      pairwisegameDescriptions.value[index] = (event.target as HTMLInputElement).value;
    }

    // DilemmaGame Handlers
    function handleDilemmaImageChange(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        dilemmagameImages.value = Array.from(files);
      }
    }

    function handleDilemmaCenterTextChange(event: Event, index: number) {
      dilemmagameCenterTexts.value[index] = (event.target as HTMLInputElement).value;
    }

    // AssociationGame Handlers
    function handleAssociationImageChange(event: Event) {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        if (associationgameImages.value.length + files.length > 12) {
          associationImageLimitReached.value = true;
          return;
        }
        associationgameImages.value = Array.from(files);
      }
    }

    function handleAssociationTitleChange(event: Event, index: number) {
      associationgameTitles.value[index] = (event.target as HTMLInputElement).value;
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
      handlePairwiseImageChange,
      handlePairwiseTitleChange,
      handlePairwiseDescriptionChange,
      pairwisegameImages,
      pairwisegameTitles,
      pairwisegameDescriptions,
      handleDilemmaImageChange,
      handleDilemmaCenterTextChange,
      dilemmagameImages,
      dilemmagameCenterTexts,
      handleAssociationImageChange,
      handleAssociationTitleChange,
      associationgameImages,
      associationgameTitles,
      associationImageLimitReached,
      duplicatedProjectLink // Return the computed link
      
    };
  }
});
