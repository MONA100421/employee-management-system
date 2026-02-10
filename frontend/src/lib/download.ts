import { getPresignedGet } from "./upload";


export async function openPresignedInNewTab(fileUrl?: string) {
  if (!fileUrl) throw new Error("fileUrl is required");
  const { downloadUrl } = await getPresignedGet({ fileUrl });
  window.open(downloadUrl, "_blank");
}

export async function forceDownloadPresigned(
  fileUrl?: string,
  fileName?: string,
) {
  if (!fileUrl) throw new Error("fileUrl is required");
  const { downloadUrl } = await getPresignedGet({ fileUrl });

  const a = document.createElement("a");
  a.href = downloadUrl;
  if (fileName) a.download = fileName;
  a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
