import "server-only";
import { createHash } from "crypto";

export type ParsedInterestRow = {
  rowKey: string;
  page: number;
  grade: string;
  classNumber: string;
  studentNumber: string;
  studentName: string;
  region: string;
  majorSeries: string;
  universityName: string;
  department: string;
  recruitCount: string;
  stage1Elements: string;
  csatMinimum: string;
  season: string;
  admissionType: string;
  admissionName: string;
  selectionType: string;
  myGrade: string;
  myScore: string;
};

type PdfTextItem = {
  str: string;
  transform: number[];
  width: number;
};

type PositionedText = { text: string; x: number; y: number };

const COLUMN_BOUNDS = [
  25, 45, 65, 85, 102, 133, 162, 185, 210, 260, 325, 348, 405, 425,
  450, 505, 558, 586, 750, 780, 825,
] as const;

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function joinCell(items: PositionedText[], compact = false) {
  const ordered = items.sort((a, b) => b.y - a.y || a.x - b.x);
  return clean(ordered.map((item) => item.text.trim()).join(compact ? "" : " "));
}

function isAnchor(items: PositionedText[]) {
  const cell = (from: number, to: number) =>
    items.filter((item) => item.x >= from && item.x < to).map((item) => item.text);
  return (
    cell(25, 45).some((v) => /^\d+$/.test(v)) &&
    cell(45, 65).some((v) => /^\d+$/.test(v)) &&
    cell(65, 85).some((v) => /^\d+$/.test(v)) &&
    cell(85, 102).some((v) => /^\d+$/.test(v)) &&
    cell(102, 133).some((v) => /[가-힣A-Za-z]/.test(v))
  );
}

function rowId(row: Omit<ParsedInterestRow, "rowKey">) {
  return createHash("sha256")
    .update(JSON.stringify(row))
    .digest("hex")
    .slice(0, 20);
}

export async function parseInterestPdf(buffer: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const document = await pdfjs.getDocument({ data: buffer }).promise;
  const parsed: ParsedInterestRow[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = (content.items as PdfTextItem[])
        .filter((item) => item.str?.trim())
        .map((item) => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
        }));

      const yValues = Array.from(new Set(items.map((item) => Math.round(item.y * 10) / 10)))
        .sort((a, b) => b - a);
      const anchorYs = yValues.filter((y) =>
        isAnchor(items.filter((item) => Math.abs(item.y - y) < 0.7))
      );

      for (let index = 0; index < anchorYs.length; index += 1) {
        const anchorY = anchorYs[index];
        const upper = index === 0 ? anchorY + 13 : (anchorYs[index - 1] + anchorY) / 2;
        const lower =
          index === anchorYs.length - 1 ? anchorY - 13 : (anchorY + anchorYs[index + 1]) / 2;
        const rowItems = items.filter(
          (item) => item.y <= upper && item.y > lower && item.x >= 25 && item.x < 825
        );
        const cells = COLUMN_BOUNDS.slice(0, -1).map((from, cellIndex) =>
          rowItems.filter(
            (item) => item.x >= from && item.x < COLUMN_BOUNDS[cellIndex + 1]
          )
        );
        const value = (index: number, compact = false) => joinCell(cells[index], compact);
        const base: Omit<ParsedInterestRow, "rowKey"> = {
          page: pageNumber,
          grade: value(1, true),
          classNumber: value(2, true),
          studentNumber: value(3, true),
          studentName: value(4, true),
          region: value(6, true),
          majorSeries: value(7, true),
          universityName: value(8, true),
          department: value(9, true),
          recruitCount: value(10, true),
          stage1Elements: value(11),
          csatMinimum: value(12, true),
          season: value(13, true),
          admissionType: value(14, true),
          admissionName: value(15, true),
          selectionType: value(16, true),
          myGrade: value(18, true),
          myScore: value(19, true),
        };
        if (base.studentName && base.universityName) {
          parsed.push({ ...base, rowKey: rowId(base) });
        }
      }
    }
  } finally {
    await document.destroy();
  }

  if (parsed.length === 0) {
    throw new Error(
      "이 PDF에서는 표 내용을 읽을 수 없습니다. 텍스트가 포함된 관심대학 PDF를 사용해 주세요."
    );
  }
  return parsed;
}
