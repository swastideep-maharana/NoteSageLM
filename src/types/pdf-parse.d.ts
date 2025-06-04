// types/pdf-parse.d.ts
declare module "pdf-parse" {
  interface PDFPageProxy {
    getTextContent: () => Promise<{
      items: Array<{ str: string }>;
    }>;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: any;
    version: string;
    text: string;
  }

  function pdf(buffer: Buffer): Promise<PDFData>;
  export = pdf;
}
