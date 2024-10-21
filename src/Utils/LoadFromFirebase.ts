import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";

export async function loadFromFirebase(
  folder: string,
  file: string
): Promise<any> {
  const storage = getStorage();

  const parameters = new URLSearchParams(window.location.search);
  const assetsDirectory = `${parameters.get("sessionId")}/${folder}/`;
  const fileRef = storageRef(storage, assetsDirectory + file + ".json");

  try {
    // Get the download URL for the file
    const url = await getDownloadURL(fileRef);

    // Fetch the file content from the URL
    const response = await fetch(url);

    // Parse the JSON response and convert it to an object
    const data = await response.json();

    // Return the JSON object
    return data;
  } catch (error) {
    console.error("Error loading JSON from Firebase:", error);
    throw error; // Handle or re-throw the error
  }
}
