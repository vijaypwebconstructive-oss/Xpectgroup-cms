export function downloadGeneratedContract(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes], {
    type: "application/pdf",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = "EmploymentContract.pdf";
  a.click();

  URL.revokeObjectURL(url);
}
