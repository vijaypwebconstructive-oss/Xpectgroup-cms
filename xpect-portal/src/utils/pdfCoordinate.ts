export function getPdfCoordinates(
  x: number,
  y: number,
  pdfWidth: number,
  pdfHeight: number,
  previewWidth = 850,
) {
  const scale = pdfWidth / previewWidth;

  return {
    x: x * scale,

    y: pdfHeight - y * scale,

    scale,
  };
}
