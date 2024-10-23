import { getDownloadURL } from "firebase/storage";

export async function loadResults<T>(resultFiles: any): Promise<T[][]> {
  const results: T[][] = [];
  for (const fileRef of resultFiles.items) {
    const fileURL = await getDownloadURL(fileRef);
    const response = await fetch(fileURL);
    const data: T[] = await response.json();
    results.push(data);
  }
  return results;
}
