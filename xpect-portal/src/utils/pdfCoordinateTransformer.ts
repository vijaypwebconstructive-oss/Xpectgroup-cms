interface OverlayField {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export function transformField(
  field: OverlayField,
  pdfWidth: number,
  pdfHeight: number,
  previewWidth = 850,
) {
  const scale = pdfWidth / previewWidth;

  return {
    x: field.x * scale,

    y: pdfHeight - field.y * scale,

    width: field.width ? field.width * scale : undefined,

    height: field.height ? field.height * scale : undefined,

    fontSize: 14 * scale,
  };
}
