import JSZip from 'jszip';

import { BULK_MARKS_CARD_MAX, exportMarksCardPdf, loadMarksCardLogo } from './marksCardPdf';
import { downloadBlob, mapPool, sanitizeFilePart } from './fileExport';

export { BULK_MARKS_CARD_MAX };

const PDF_CONCURRENCY = 4;

/** ZIP of marks cards for every result row of one exam (logo loaded once). */
export async function downloadBulkMarksCardZip({
  exam,
  subjects,
  results,
  className,
  resultDate,
  zipLabel,
  onProgress,
}) {
  const resultList = Array.isArray(results) ? results : [];
  if (!resultList.length) throw new Error('No student results found for this exam');
  if (resultList.length > BULK_MARKS_CARD_MAX) {
    throw new Error(`At most ${BULK_MARKS_CARD_MAX} students per Marks Card download`);
  }

  const logo = await loadMarksCardLogo();
  let completed = 0;
  const built = await mapPool(resultList, PDF_CONCURRENCY, async (resultRow, index) => {
    let item = { status: 'failed' };
    try {
      const out = await exportMarksCardPdf({
        exam,
        subjects,
        resultRow,
        className,
        resultDate,
        logo,
        returnBlob: true,
      });
      if (out?.blob) item = { status: 'ready', blob: out.blob, filename: out.filename, index };
    } catch {
      /* counted as skipped */
    }
    completed += 1;
    onProgress?.(completed, resultList.length);
    return item;
  });

  const zip = new JSZip();
  const usedNames = new Set();
  let downloaded = 0;
  let skippedFailed = 0;
  for (const item of built) {
    if (item.status !== 'ready') {
      skippedFailed += 1;
      continue;
    }
    let filename = item.filename;
    if (usedNames.has(filename)) filename = `${filename.replace(/\.pdf$/i, '')}_${item.index + 1}.pdf`;
    usedNames.add(filename);
    zip.file(filename, item.blob);
    downloaded += 1;
  }

  if (downloaded > 0) {
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    downloadBlob(blob, `${sanitizeFilePart(zipLabel || `MarksCards_${exam?.test_name || 'exam'}`)}.zip`);
  }
  return { downloaded, skippedFailed };
}
