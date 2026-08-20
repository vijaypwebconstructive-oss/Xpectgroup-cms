import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect, forwardRef } from "react";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface Props {
  pdfUrl: string;
  invitation: any;
  personalDetails: any;
  employeeSignature: string | null;
  overlayFields: any[];
}

const ContractViewer = forwardRef<HTMLDivElement, Props>(
  (
    { pdfUrl, invitation, personalDetails, employeeSignature, overlayFields },
    ref,
  ) => {
    const [numPages, setNumPages] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);

    const [pdfWidth, setPdfWidth] = useState(850);

    /*
     * ---------------------------------------------
     * RESPONSIVE PDF WIDTH
     * ---------------------------------------------
     */

    useEffect(() => {
      const updateWidth = () => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;

        setPdfWidth(Math.min(width, 850));
      };

      updateWidth();

      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }, []);

    /*
     * ---------------------------------------------
     * OVERLAY DATA
     * ---------------------------------------------
     */

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

    /*
     * ---------------------------------------------
     * GET OVERLAY VALUE
     * ---------------------------------------------
     */

    function getFieldValue(id: string) {
      const value = overlayData[id as keyof typeof overlayData];

      if (!value) {
        return null;
      }

      /*
       * Signature fields
       */

      if (id === "employeeSignature" || id === "ownerSignature") {
        return (
          <img
            src={value as string}
            alt={id}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        );
      }

      return value;
    }

    /*
     * ---------------------------------------------
     * PDF COORDINATE SYSTEM
     * ---------------------------------------------
     *
     * All your overlay coordinates are based
     * on an 850px wide PDF.
     */

    const ORIGINAL_PDF_WIDTH = 850;

    const scale = pdfWidth / ORIGINAL_PDF_WIDTH;

    /*
     * ---------------------------------------------
     * GLOBAL EMPLOYEE SIGNATURE
     * ---------------------------------------------
     *
     * This signature will appear on EVERY PAGE.
     *
     * Coordinates are based on 850px PDF width.
     */

    const signaturePosition = {
      width: 120,
      height: 50,

      // Distance from left
      right: 40,

      // Distance from bottom
      bottom: 35,
    };

    /*
     * ---------------------------------------------
     * RENDER
     * ---------------------------------------------
     */

    return (
      <div
        id="contract-viewer"
        className="border  overflow-hidden bg-gray-100"
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

            /*
             * Only fields belonging to this page
             */

            const pageFields = overlayFields.filter(
              (field) => field.page === pageNumber,
            );

            return (
              <div
                key={pageNumber}
                className="pdf-page relative mb-8"
                style={{
                  width: pdfWidth,
                }}
              >
                {/* ---------------------------------
                      PDF PAGE
                     --------------------------------- */}

                <Page pageNumber={pageNumber} width={pdfWidth} />

                {/* ---------------------------------
                      DOCUMENT-SPECIFIC OVERLAYS
                     --------------------------------- */}

                {pageFields.map((field) => {
                  const fieldValue = getFieldValue(field.id);

                  if (!fieldValue) {
                    return null;
                  }

                  return (
                    <div
                      key={`${field.id}-${field.page}-${field.x}-${field.y}`}
                      className="absolute text-black"
                      style={{
                        left: `${field.x * scale}px`,

                        top: `${field.y * scale}px`,

                        width: field.width
                          ? `${field.width * scale}px`
                          : "auto",

                        height: field.height
                          ? `${field.height * scale}px`
                          : "auto",

                        fontSize: `${14 * scale}px`,

                        lineHeight: 1.2,

                        pointerEvents: "none",

                        whiteSpace: "pre-wrap",

                        fontWeight: 500,

                        overflow: "hidden",

                        zIndex: 10,
                      }}
                    >
                      {fieldValue}
                    </div>
                  );
                })}

                {/* ---------------------------------
                      EMPLOYEE SIGNATURE
                      EVERY PAGE
                     --------------------------------- */}

                {employeeSignature && (
                  <div
                    className="absolute"
                    style={{
                      right: `${signaturePosition.right * scale}px`,
                      bottom: `${signaturePosition.bottom * scale}px`,

                      width: `${signaturePosition.width * scale}px`,
                      height: `${signaturePosition.height * scale}px`,

                      pointerEvents: "none",
                      zIndex: 20,
                    }}
                  >
                    <img
                      src={employeeSignature}
                      alt="Employee Signature"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
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

ContractViewer.displayName = "ContractViewer";

export default ContractViewer;
