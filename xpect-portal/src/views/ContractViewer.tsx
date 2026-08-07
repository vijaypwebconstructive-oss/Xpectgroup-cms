import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect, forwardRef } from "react";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { overlayFields } from "../utils/overlayFields";
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url,
// ).href;

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
interface Props {
  pdfUrl: string;
  invitation: any;
  personalDetails: any;
  employeeSignature: string | null;
}

const ContractViewer = forwardRef<HTMLDivElement, Props>(
  ({ pdfUrl, invitation, personalDetails, employeeSignature }, ref) => {
    const [numPages, setNumPages] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pdfWidth, setPdfWidth] = useState(850);

    useEffect(() => {
      const updateWidth = () => {
        if (!containerRef.current) return;

        setPdfWidth(Math.min(containerRef.current.offsetWidth, 850));
      };

      updateWidth();

      window.addEventListener("resize", updateWidth);

      return () => window.removeEventListener("resize", updateWidth);
    }, []);

    useEffect(() => {
      const page = document.querySelector(".react-pdf__Page");

      if (!page) return;

      console.log("Rendered Width:", page.clientWidth);
      console.log("Rendered Height:", page.clientHeight);

      console.log("Aspect Ratio:", page.clientHeight / page.clientWidth);
    }, [pdfWidth]);

    const overlayData = {
      employeeName: personalDetails?.name || "",

      employeeAddress: personalDetails?.address || "",

      contractDate: new Date().toLocaleDateString(),

      salary:
        invitation?.salaryAmount && invitation?.salaryType
          ? `${invitation.salaryType} / £${invitation.salaryAmount}`
          : "",

      Ownername: invitation?.senderName || "",

      designation: invitation?.senderDesignation || "",

      ownerDate: new Date().toLocaleDateString(),

      employeeDate: new Date().toLocaleDateString(),

      employeeSignature,

      ownerSignature: null,
    };

    console.log(invitation);

    // const overlayFields = [
    //   {
    //     id: "employeeName",
    //     page: 3,
    //     x: 120,
    //     y: 390,
    //   },
    //   {
    //     id: "employeeAddress",
    //     page: 3,
    //     x: 135,
    //     y: 423,
    //   },
    //   {
    //     id: "contractDate",
    //     page: 3,
    //     x: 110,
    //     y: 177,
    //   },
    //   {
    //     id: "salary",
    //     page: 5,
    //     x: 160,
    //     y: 344,
    //   },
    //   {
    //     id: "employeeSignature",
    //     page: 11,
    //     x: 500,
    //     y: 257,
    //     width: 100,
    //   },
    //   {
    //     id: "ownerSignature",
    //     page: 11,
    //     x: 140,
    //     y: 257,
    //     width: 100,
    //   },
    //   {
    //     id: "Ownername",
    //     page: 11,
    //     x: 120,
    //     y: 351,
    //     width: 260,
    //     height: 60,
    //   },
    //   {
    //     id: "designation",
    //     page: 11,
    //     x: 160,
    //     y: 381,
    //     width: 260,
    //     height: 60,
    //   },
    //   {
    //     id: "ownerDate",
    //     page: 11,
    //     x: 115,
    //     y: 411,
    //     width: 260,
    //     height: 60,
    //   },
    //   {
    //     id: "employeeName",
    //     page: 11,
    //     x: 477,
    //     y: 351,
    //     width: 260,
    //   },
    //   {
    //     id: "employeeDate",
    //     page: 11,
    //     x: 473,
    //     y: 382,
    //     width: 260,
    //   },
    //   {
    //     id: "OwnerDate",
    //     page: 11,
    //     x: 78,
    //     y: 440,
    //     width: 260,
    //   },
    // ];

    function getFieldValue(id: string) {
      const value = overlayData[id as keyof typeof overlayData];

      if (!value) return null;

      if (id === "employeeSignature" || id === "ownerSignature") {
        return (
          <img
            src={value as string}
            alt={id}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        );
      }

      return value;
    }

    const ORIGINAL_PDF_WIDTH = 850;
    const scale = pdfWidth / ORIGINAL_PDF_WIDTH;
    const pageSignature = {
      width: 120,
      height: 50,

      // Bottom-right position based on your original PDF width
      x: ORIGINAL_PDF_WIDTH - 160,
      y: 1080,
    };

    return (
      <div
        className="border rounded-xl overflow-hidden bg-gray-100"
        id="contract-viewer"
        ref={(node) => {
          containerRef.current = node;

          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
          }}
          onLoadError={(error) => {
            console.error("PDF Error:", error);
          }}
        >
          {Array.from(new Array(numPages), (_, index) => {
            const pageNumber = index + 1;

            return (
              <div key={pageNumber} className="pdf-page relative mb-8">
                <Page pageNumber={pageNumber} width={pdfWidth} />

                {/* Overlay Fields */}
                {overlayFields
                  .filter((field) => field.page === pageNumber)
                  .map((field) => (
                    <div
                      key={`${field.id}-${field.page}-${field.x}-${field.y}`}
                      className="absolute text-sm text-black"
                      style={{
                        left: field.x * scale,
                        top: field.y * scale,
                        width: field.width ? field.width * scale : undefined,
                        height: field.height ? field.height * scale : undefined,
                        fontSize: `${14 * scale}px`,
                        pointerEvents: "none",
                        whiteSpace: "pre-wrap",
                        fontWeight: 500,
                      }}
                    >
                      {getFieldValue(field.id)}
                    </div>
                  ))}

                {employeeSignature && (
                  <div
                    className="absolute"
                    style={{
                      left: pageSignature.x * scale,
                      top: pageSignature.y * scale,
                      width: pageSignature.width * scale,
                      height: pageSignature.height * scale,
                      pointerEvents: "none",
                    }}
                  >
                    <img
                      src={employeeSignature}
                      alt="Employee Signature"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Document>
      </div>
    );
  },
);

export default ContractViewer;
