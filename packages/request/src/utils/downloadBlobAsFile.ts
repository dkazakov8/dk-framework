export function downloadBlobAsFile(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', filename);
  link.className = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
