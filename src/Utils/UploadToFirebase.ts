import { getStorage, ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { authentication } from '@/../firebaseConfig.js'; // Import authentication

/**
 * @param folder string of the folder you want to refere to
 * @param data the data you want to pass
 * @description function to upload your data to firebase
 */

export async  function uploadResult(folder:string,data:any) {
    const storage = getStorage();
    const parameters = new URLSearchParams(window.location.search);
    const assetsDirectory = `${parameters.get("sessionId")}/${folder}/`;

    const fileData = JSON.stringify(data, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });

    const location = storageRef(storage, `${assetsDirectory}/Results/${authentication.currentUser?.uid}.json`);

    try {
      await uploadBytes(location, blob); // Upload the sorted cards as a JSON file to Firebase
      console.log('Results uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }