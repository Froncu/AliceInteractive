import { getStorage, ref as storageRef, listAll, getDownloadURL, uploadBytes } from 'firebase/storage';

/**
 * @param sourceFolder - string of the folder you want to duplicate
 * @param targetFolder - string of the desired new folder name (which will also act as the sessionId)
 * @description Function to duplicate a folder and its contents (including subfolders) in Firebase Storage
 */
export async function duplicateFolder(sourceFolder: string, targetFolder: string) {
    const storage = getStorage();

    // Define the source folder path and ensure target folder is at the root level (not nested inside the source folder)
    const sourceFolderPath = `${sourceFolder}/`;
    const targetFolderPath = `${targetFolder}/`;

    try {
        // Step 1: List all files and folders in the source folder
        const sourceFolderRef = storageRef(storage, sourceFolderPath);
        const fileList = await listAll(sourceFolderRef);

        // Step 2: Create a unique folder name if the target already exists
        let finalTargetFolderPath = targetFolderPath;
        let folderIndex = 1;
        let existingFolder = await listAll(storageRef(storage, targetFolderPath));

        while (existingFolder.items.length > 0) {
            // Create a unique folder name if there is a naming conflict
            finalTargetFolderPath = `old_${String(folderIndex).padStart(2, '0')}_${targetFolder}/`;
            existingFolder = await listAll(storageRef(storage, finalTargetFolderPath));
            folderIndex++;
        }

        // Step 3: Recursively copy all files and subfolders
        await copyFilesAndFolders(sourceFolderPath, finalTargetFolderPath, storage);

        console.log(`Folder and its contents duplicated successfully to ${finalTargetFolderPath}`);
    } catch (error) {
        console.error('Error duplicating folder:', error);
    }
}

/**
 * Recursively copy files and folders from source to target in Firebase Storage
 * @param sourcePath - path of the source folder
 * @param targetPath - path of the target folder
 * @param storage - Firebase Storage instance
 */
async function copyFilesAndFolders(sourcePath: string, targetPath: string, storage: any) {
    const sourceFolderRef = storageRef(storage, sourcePath);
    const fileList = await listAll(sourceFolderRef);

    // Loop through all items (files and folders) in the source path
    for (const fileRef of fileList.items) {
        // Handle file duplication
        const fileName = fileRef.name;
        const fileURL = await getDownloadURL(fileRef);

        // Fetch the file as a Blob from the URL
        const response = await fetch(fileURL);
        const fileBlob = await response.blob();

        // Upload the file Blob to the target location
        const targetFileRef = storageRef(storage, `${targetPath}${fileName}`);
        await uploadBytes(targetFileRef, fileBlob);
    }

    // Loop through all "prefixes" (subfolders) in the source path
    for (const folderRef of fileList.prefixes) {
        // Get the name of the child folder
        const childFolderName = folderRef.name;

        // Define the new target path for the child folder
        const newTargetPath = `${targetPath}${childFolderName}/`;

        // Recursively copy the contents of the child folder
        await copyFilesAndFolders(`${sourcePath}${childFolderName}/`, newTargetPath, storage);
    }
}
