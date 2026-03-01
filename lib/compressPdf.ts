import { PDFDocument } from 'pdf-lib';

/**
 * Compresses a PDF File by re-rendering each page to a JPEG canvas image
 * using the pdfjs-dist that is bundled with react-pdf, then embedding
 * those images into a new PDF via pdf-lib.
 *
 * @param file        Original PDF File
 * @param scale       Render scale (0.5–1.5). Lower = smaller file. Default: 1.0
 * @param jpegQuality JPEG quality (0–1). Lower = smaller file. Default: 0.75
 */
export async function compressPdf(
    file: File,
    scale: number = 1.0,
    jpegQuality: number = 0.75
): Promise<File> {
    // Dynamically import pdfjs so it only runs in the browser
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();

    // Use a copy to prevent "already detached" errors
    const dataCopy = new Uint8Array(arrayBuffer.slice(0));

    const loadingTask = pdfjs.getDocument({ data: dataCopy });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const newPdf = await PDFDocument.create();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        // Integer dimensions are required for correct canvas rendering
        const width = Math.floor(viewport.width);
        const height = Math.floor(viewport.height);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D canvas context');

        // Render PDF page onto canvas — do NOT pass `canvas` property,
        // only canvasContext + viewport to avoid blank-page rendering bugs
        const renderTask = page.render({
            canvasContext: ctx as unknown as CanvasRenderingContext2D,
            viewport,
        });
        await renderTask.promise;

        // Convert canvas → JPEG data URL → base64 bytes
        const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        if (!jpegDataUrl || jpegDataUrl === 'data:,') {
            throw new Error(`Page ${pageNum}: canvas rendering produced empty image`);
        }

        const base64 = jpegDataUrl.split(',')[1];
        const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        // Embed JPEG into the new PDF page
        const jpegImage = await newPdf.embedJpg(jpegBytes);
        const newPage = newPdf.addPage([width, height]);
        newPage.drawImage(jpegImage, { x: 0, y: 0, width, height });

        // Clean up canvas to free memory
        canvas.width = 0;
        canvas.height = 0;
    }

    await pdf.destroy();

    const compressedBytes = await newPdf.save();
    return new File([compressedBytes.buffer], file.name, { type: 'application/pdf' });
}
