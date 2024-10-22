import { getStorage, ref as storageRef, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';
import { authentication } from '@/../firebaseConfig.js';

/**
 * @param sourceFolder string of the folder you want to duplicate
 * @param targetFolder string of the desired new folder name (which will also act as the sessionId)
 * @description function to duplicate a folder in Firebase Storage
 */
export async function duplicateFolder(sourceFolder: string, targetFolder: string) {
    const storage = getStorage();

    // Use targetFolder as the sessionId
    const sourceFolderPath = `${targetFolder}/${sourceFolder}/`;
    const targetFolderPath = `${targetFolder}/${targetFolder}/`;

    try {
        // Step 1: List all files in the source folder
        const sourceFolderRef = storageRef(storage, sourceFolderPath);
        const fileList = await listAll(sourceFolderRef);

        // Step 2: Check if target folder exists and generate a unique name if necessary
        let finalTargetFolderPath = targetFolderPath;
        let folderIndex = 1;
        let existingFolder = await listAll(storageRef(storage, targetFolderPath));

        while (existingFolder.items.length > 0) {
            finalTargetFolderPath = `${targetFolder}/old_${targetFolder}_${String(folderIndex).padStart(2, '0')}/`;
            existingFolder = await listAll(storageRef(storage, finalTargetFolderPath));
            folderIndex++;
        }

        // Step 3: Copy each file from source to target
        for (const fileRef of fileList.items) {
            const fileName = fileRef.name;
            const fileURL = await getDownloadURL(fileRef); // Get the download URL for each file

            const response = await fetch(fileURL);
            const fileBlob = await response.blob(); // Get the file as Blob

            const targetFileRef = storageRef(storage, `${finalTargetFolderPath}${fileName}`);
            await uploadBytes(targetFileRef, fileBlob); // Upload the file to the new location
        }

        console.log(`Folder duplicated successfully to ${finalTargetFolderPath}`);
    } catch (error) {
        console.error('Error duplicating folder:', error);
    }
}
