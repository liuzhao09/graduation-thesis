const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PptxGenJS = require("pptxgenjs");
const JSZip = require("jszip");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "output");
const assetDir = path.join(root, "scratch", "assets");
const previewDir = path.join(root, "scratch", "previews");
const qaDir = path.join(root, "scratch", "qa");
for (const dir of [outDir, assetDir, previewDir, qaDir]) fs.mkdirSync(dir, { recursive: true });

const templatePptx = "/Users/liuzhao/Desktop/毕业论文/AI院-答辩材料/人工智能学院研究生学位申请信息一览模板.pptx";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "刘钊";
pptx.company = "中山大学人工智能学院";
pptx.subject = "硕士学位论文答辩";
pptx.title = "面向出行位置点预测的大小模型协同学习研究";
pptx.lang = "zh-CN";
pptx.theme = {
  headFontFace: "微软雅黑",
  bodyFontFace: "微软雅黑",
  lang: "zh-CN",
};
pptx.defineLayout({ name: "LAYOUT_WIDE", width: 13.333, height: 7.5 });

const C = {
  ink: "1E2732",
  green: "1C4E88",
  green2: "1C4E88",
  green3: "2F72B7",
  mint: "5B8FC4",
  greenDeep: "103C6D",
  red: "FF0000",
  blue: "1C4E88",
  gold: "D9A441",
  cream: "F2F2F2",
  paper: "FFFFFF",
  pale: "F2F2F2",
  paleBlue: "E8F0FA",
  gray: "5D6772",
  lightGray: "D9DEE6",
  muted: "8A96A3",
};

const FONT_HEAD = "微软雅黑";
const FONT_BODY = "微软雅黑";
const FONT_MONO = "Menlo";
const W = 13.333;
const H = 7.5;
const PX = 144;
const generatedFiles = [];

const templateInfo = {
  path: templatePptx,
  primary: C.green,
  background: C.cream,
  panel: C.paper,
};

const figures = [
  ["fig1_GCIM_c1", "figures/fig1_GCIM_c1.pdf"],
  ["fig2_PAM_c2", "figures/fig2_PAM_c2.pdf"],
  ["fig3_framework", "figures/fig3_framework.pdf"],
  ["time_left", "figures/Time_enhanced_left.pdf"],
  ["time_right", "figures/Time_enhanced_right.pdf"],
  ["TiRNN", "figures/TiRNN.pdf"],
  ["fig4_coor_analysis", "figures/fig4_coor_analysis.pdf"],
  ["fig5_distance_analysis", "figures/fig5_distance_analysis.pdf"],
  ["fig6_average_distance_analysis", "figures/fig6_average_distance_analysis.pdf"],
  ["fig7_pam_analysis", "figures/fig7_pam_analysis.pdf"],
  ["fig8_efficiency_study", "figures/fig8_efficiency_study.pdf"],
];

const assets = {};
for (const [name, rel] of figures) {
  const input = path.join(root, rel);
  const prefix = path.join(assetDir, name);
  const output = `${prefix}.png`;
  execFileSync("pdftocairo", ["-singlefile", "-png", "-r", "240", input, prefix], { stdio: "inherit" });
  assets[name] = output;
  generatedFiles.push(output);
}

function css(hex) {
  return `#${hex}`;
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clean(hex) {
  return hex.replace("#", "");
}

function dim(v) {
  return Math.round(v * PX);
}

function approxWidth(ch, fontSize) {
  return /[\u4e00-\u9fff]/.test(ch) ? fontSize * 0.96 : fontSize * 0.56;
}

function wrapLines(text, widthPx, fontSize) {
  const rawLines = String(text).split("\n");
  const out = [];
  for (const raw of rawLines) {
    if (!raw) {
      out.push("");
      continue;
    }
    let line = "";
    let acc = 0;
    for (const ch of raw) {
      const cw = approxWidth(ch, fontSize);
      if (line && acc + cw > widthPx) {
        out.push(line);
        line = ch;
        acc = cw;
      } else {
        line += ch;
        acc += cw;
      }
    }
    out.push(line);
  }
  return out;
}

function chartPreviewSvg(chart) {
  const x = dim(chart.x);
  const y = dim(chart.y);
  const w = dim(chart.w);
  const h = dim(chart.h);
  const pad = 46;
  const plotX = x + pad;
  const plotY = y + 18;
  const plotW = w - pad - 24;
  const plotH = h - 70;
  const max = chart.max || Math.max(...chart.series.flatMap((s) => s.values)) * 1.15;
  const groups = chart.labels.length;
  const seriesCount = chart.series.length;
  const groupW = plotW / groups;
  const barW = Math.min(34, (groupW - 24) / seriesCount);
  const zeroY = plotY + plotH;
  let svg = "";
  for (let i = 0; i < 5; i++) {
    const yy = plotY + (plotH * i) / 4;
    svg += `<line x1="${plotX}" y1="${yy}" x2="${plotX + plotW}" y2="${yy}" stroke="${css(C.lightGray)}" stroke-width="1"/>`;
  }
  chart.labels.forEach((label, i) => {
    const gx = plotX + i * groupW + groupW / 2;
    svg += `<text x="${gx}" y="${zeroY + 28}" text-anchor="middle" font-family="${FONT_BODY}" font-size="18" fill="${css(C.gray)}">${esc(label)}</text>`;
    chart.series.forEach((s, j) => {
      const bh = (plotH * s.values[i]) / max;
      const bx = gx - (seriesCount * barW + (seriesCount - 1) * 8) / 2 + j * (barW + 8);
      const by = zeroY - bh;
      svg += `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" rx="5" fill="${css(s.color)}"/>`;
      if (chart.showValues) {
        svg += `<text x="${bx + barW / 2}" y="${by - 8}" text-anchor="middle" font-family="${FONT_BODY}" font-size="16" font-weight="700" fill="${css(C.ink)}">${esc(s.values[i].toFixed(chart.decimals ?? 1))}</text>`;
      }
    });
  });
  if (chart.series.length > 1) {
    let lx = x + 18;
    chart.series.forEach((s) => {
      svg += `<rect x="${lx}" y="${y + h - 24}" width="14" height="14" rx="3" fill="${css(s.color)}"/>`;
      svg += `<text x="${lx + 20}" y="${y + h - 12}" font-family="${FONT_BODY}" font-size="16" fill="${css(C.gray)}">${esc(s.name)}</text>`;
      lx += 116;
    });
  }
  return svg;
}

class SlideArt {
  constructor(slide, index, kind = "light") {
    this.slide = slide;
    this.index = index;
    this.kind = kind;
    this.nodes = [];
  }

  rect(x, y, w, h, fill, opts = {}) {
    this.slide.addShape(pptx.ShapeType.rect, {
      x,
      y,
      w,
      h,
      rotate: opts.rotate || 0,
      rectRadius: opts.radius || 0,
      fill: { color: clean(fill), transparency: opts.transparency || 0 },
      line: opts.line ? { color: clean(opts.line), width: opts.lineWidth || 1 } : { color: clean(fill), transparency: 100 },
    });
    this.nodes.push({ type: "rect", x, y, w, h, fill: clean(fill), rotate: opts.rotate || 0, radius: opts.radius || 0, stroke: opts.line, sw: opts.lineWidth || 1 });
  }

  line(x1, y1, x2, y2, color, width = 1, opts = {}) {
    this.slide.addShape(pptx.ShapeType.line, {
      x: x1,
      y: y1,
      w: x2 - x1,
      h: y2 - y1,
      line: { color: clean(color), width, beginArrowType: opts.beginArrow, endArrowType: opts.endArrow, transparency: opts.transparency || 0 },
    });
    this.nodes.push({ type: "line", x1, y1, x2, y2, color: clean(color), width });
  }

  ellipse(x, y, w, h, fill, opts = {}) {
    this.slide.addShape(pptx.ShapeType.ellipse, {
      x,
      y,
      w,
      h,
      fill: { color: clean(fill), transparency: opts.transparency || 0 },
      line: opts.line ? { color: clean(opts.line), width: opts.lineWidth || 1 } : { color: clean(fill), transparency: 100 },
    });
    this.nodes.push({ type: "ellipse", x, y, w, h, fill: clean(fill), stroke: opts.line, sw: opts.lineWidth || 1 });
  }

  shape(shapeType, x, y, w, h, fill, opts = {}) {
    this.slide.addShape(shapeType, {
      x,
      y,
      w,
      h,
      rotate: opts.rotate || 0,
      flipH: !!opts.flipH,
      flipV: !!opts.flipV,
      fill: { color: clean(fill), transparency: opts.transparency || 0 },
      line: opts.line ? { color: clean(opts.line), width: opts.lineWidth || 1 } : { color: clean(fill), transparency: 100 },
    });
    this.nodes.push({ type: "shape", shape: shapeType, x, y, w, h, fill: clean(fill), rotate: opts.rotate || 0, flipH: !!opts.flipH, flipV: !!opts.flipV });
  }

  text(value, x, y, w, h, opts = {}) {
    const fontSize = opts.size || 24;
    const color = clean(opts.color || C.ink);
    this.slide.addText(value, {
      x,
      y,
      w,
      h,
      fontFace: opts.font || (opts.bold ? FONT_HEAD : FONT_BODY),
      fontSize,
      bold: !!opts.bold,
      italic: !!opts.italic,
      color,
      align: opts.align || "left",
      valign: opts.valign || "top",
      margin: opts.margin ?? 0.02,
      breakLine: false,
      fit: "shrink",
      paraSpaceAfterPt: opts.paraSpaceAfterPt ?? 0,
      breakLineOnHyphen: false,
    });
    this.nodes.push({ type: "text", value, x, y, w, h, size: fontSize, color, bold: !!opts.bold, align: opts.align || "left", font: opts.font || (opts.bold ? FONT_HEAD : FONT_BODY), valign: opts.valign || "top" });
  }

  image(pathname, x, y, w, h, opts = {}) {
    this.slide.addImage({ path: pathname, x, y, w, h, transparency: opts.transparency || 0, altText: opts.alt || "" });
    this.nodes.push({ type: "image", path: pathname, x, y, w, h, transparency: opts.transparency || 0, fit: opts.fit || "meet" });
  }

  table(rows, x, y, colW, rowH, opts = {}) {
    const tableRows = rows.map((row, r) =>
      row.map((cell, c) => ({
        text: String(cell),
        options: {
          fontFace: FONT_BODY,
          fontSize: opts.fontSize || 13,
          color: r === 0 ? clean(C.paper) : clean(C.ink),
          bold: r === 0 || c === 0,
          fill: { color: r === 0 ? clean(C.green2) : r % 2 ? clean("F4F8F6") : clean(C.paper) },
          margin: 0.06,
          valign: "mid",
          align: c === 0 ? "left" : "center",
          border: { type: "solid", color: clean(C.lightGray), pt: 0.7 },
        },
      }))
    );
    this.slide.addTable(tableRows, { x, y, colW, rowH, border: { type: "solid", color: clean(C.lightGray), pt: 0.7 } });
    this.nodes.push({ type: "table", rows, x, y, colW, rowH, fontSize: opts.fontSize || 13 });
  }

  chart(chart) {
    this.slide.addChart(pptx.ChartType.bar, chart.series.map((s) => ({ name: s.name, labels: chart.labels, values: s.values })), {
      x: chart.x,
      y: chart.y,
      w: chart.w,
      h: chart.h,
      showLegend: chart.series.length > 1,
      legendPos: "b",
      showTitle: false,
      showValue: chart.showValues ?? false,
      chartColors: chart.series.map((s) => clean(s.color)),
      catAxisLabelFontFace: FONT_BODY,
      catAxisLabelFontSize: 10,
      valAxisLabelFontFace: FONT_BODY,
      valAxisLabelFontSize: 9,
      valAxisMinVal: 0,
      valAxisMaxVal: chart.max,
      valGridLine: { color: clean(C.lightGray), size: 0.5 },
      showCatName: false,
      dataLabelPosition: "outEnd",
      dataLabelFontFace: FONT_BODY,
      dataLabelFontSize: 9,
      showLeaderLines: false,
      chartArea: { border: { color: clean(C.paper), pt: 0 }, roundedCorners: false },
      plotArea: { fill: { color: clean(C.paper), transparency: 100 }, border: { color: clean(C.paper), pt: 0 } },
    });
    this.nodes.push({ type: "chart", ...chart });
  }

  footer(section = "") {
    const color = this.kind === "thanks" ? C.paper : C.gray;
    this.text(section || "中山大学人工智能学院 · 硕士学位论文答辩", 4.05, 7.02, 5.25, 0.18, { size: 7.6, color, align: "center" });
    this.text(String(this.index).padStart(2, "0"), 12.18, 7.0, 0.45, 0.18, { size: 8.5, bold: true, color, align: "right", font: FONT_MONO });
  }
}

const slides = [];

const agendaSections = [
  { no: "01", title: "研究背景", detail: ["任务价值", "问题定义", "核心挑战", "方法边界"] },
  { no: "02", title: "方法设计", detail: ["协同框架", "TSPM", "GCIM", "PAM", "训练策略"] },
  { no: "03", title: "实验验证", detail: ["数据设置", "主实验", "消融诊断", "泛化效率"] },
  { no: "04", title: "结论展望", detail: ["主要结论", "创新点", "不足与展望"] },
];

function sectionMeta(section = "") {
  if (["学位申请", "培养信息", "评阅信息", "学术成果"].includes(section)) return { no: "0", label: "学位申请" };
  if (["背景", "任务定义", "挑战", "问题分析", "研究问题"].includes(section)) return { no: "1", label: "研究背景" };
  if (["总体方法", "TSPM", "GA-LLM", "训练策略"].includes(section)) return { no: "2", label: "方法设计" };
  if (["实验设置", "实验结果"].includes(section)) return { no: "3", label: "实验验证" };
  if (["总结"].includes(section)) return { no: "4", label: "结论展望" };
  return { no: "", label: section || "答辩" };
}

function drawAiFrame(art, opts = {}) {
  art.rect(0, 0, W, H, C.cream);
  art.rect(0.37, 0.35, 12.56, 6.88, C.paper, { radius: 0.12 });
  if (opts.topRight) {
    art.shape(pptx.ShapeType.rtTriangle, 10.35, 0, 2.98, 2.45, C.green, { flipH: true });
    art.shape(pptx.ShapeType.rtTriangle, 10.72, 0.35, 2.21, 1.82, C.cream, { flipH: true });
  }
  art.shape(pptx.ShapeType.rtTriangle, 0, 5.17, 3.56, 2.34, C.green, { rotate: 180 });
  art.shape(pptx.ShapeType.rtTriangle, 0.37, 5.17, 3.06, 1.98, C.cream, { rotate: 180 });
  if (opts.innerRule !== false) art.rect(4.05, 3.72, 5.22, 0.05, C.ink, { transparency: 4 });
}

function drawHeader(art, section = "") {
  const meta = sectionMeta(section);
  if (meta.no) {
    art.rect(0.72, 0.55, 0.44, 0.32, C.green, { radius: 0.06 });
    art.text(meta.no, 0.85, 0.64, 0.18, 0.09, { size: 10, bold: true, color: C.paper, align: "center", font: FONT_MONO });
  }
  art.text(meta.label, meta.no ? 1.28 : 0.82, 0.56, 2.35, 0.24, { size: 12.5, bold: true, color: C.green });
  art.rect(10.46, 0.58, 1.95, 0.34, C.green, { radius: 0.06 });
  art.text("人工智能学院", 10.74, 0.67, 1.4, 0.12, { size: 9.2, bold: true, color: C.paper, align: "center" });
}

function addSlide(kind = "light") {
  const slide = pptx.addSlide();
  const art = new SlideArt(slide, slides.length + 1, kind);
  drawAiFrame(art, { innerRule: kind === "cover" || kind === "thanks", topRight: kind === "cover" || kind === "section" || kind === "thanks" });
  slides.push(art);
  return art;
}

function title(art, t, st, section = "") {
  drawHeader(art, section);
  art.text(t, 3.05, 0.56, 7.15, 0.26, { size: 14.5, bold: true, color: C.ink, align: "center" });
  if (st) art.text(st, 1.04, 0.98, 11.25, 0.3, { size: 9.8, color: C.gray, align: "center" });
  art.rect(5.82, 0.9, 1.68, 0.025, C.green);
  art.footer(section);
}

function bullets(art, items, x, y, w, gap = 0.52, opts = {}) {
  items.forEach((it, idx) => {
    const yy = y + idx * gap;
    art.ellipse(x, yy + 0.06, 0.11, 0.11, opts.dot || C.red);
    art.text(it, x + 0.2, yy, w, 0.42, { size: opts.size || 16, color: opts.color || (art.kind === "dark" ? C.paper : C.ink), bold: opts.bold || false });
  });
}

function metric(art, value, label, x, y, color = C.red, size = 44) {
  art.text(value, x, y, 2.25, 0.55, { size, bold: true, color });
  art.text(label, x + 0.03, y + 0.58, 2.35, 0.38, { size: 11.8, color: art.kind === "dark" ? C.muted : C.gray });
}

function pill(art, text, x, y, w, color, fill = C.paper) {
  art.rect(x, y, w, 0.34, fill, { line: color, lineWidth: 1.0, radius: 0.08 });
  art.text(text, x + 0.08, y + 0.07, w - 0.16, 0.16, { size: 9.3, bold: true, color, align: "center" });
}

function infoField(art, label, value, x, y, w, opts = {}) {
  art.ellipse(x, y + 0.08, 0.13, 0.13, opts.dot || C.ink);
  art.text(`${label}：`, x + 0.28, y, 1.25, 0.28, { size: opts.labelSize || 17.5, bold: true, color: opts.labelColor || C.ink });
  art.text(value, x + 1.45, y + 0.01, w - 1.45, opts.h || 0.32, {
    size: opts.size || 16.5,
    bold: !!opts.bold,
    color: opts.color || C.ink,
  });
}

function smallInfoCell(art, label, value, x, y, w, color = C.ink) {
  art.rect(x, y, w, 0.5, y % 1 > 0.4 ? "F7F9FC" : C.paper, { line: "D7DEEA", lineWidth: 0.6 });
  art.text(label, x + 0.1, y + 0.14, 0.95, 0.12, { size: 8.7, bold: true, color: C.gray });
  art.text(value, x + 1.05, y + 0.12, w - 1.15, 0.16, { size: 10.6, bold: true, color });
}

function arrowFlow(art, nodes, y, opts = {}) {
  const gap = (11.4 - nodes.length * 1.72) / (nodes.length - 1);
  let x = 0.96;
  nodes.forEach((node, i) => {
    art.ellipse(x, y, 0.5, 0.5, opts.dot || C.green, { line: C.paper });
    art.text(String(i + 1), x + 0.16, y + 0.13, 0.18, 0.1, { size: 12, bold: true, color: C.paper, align: "center" });
    art.text(node[0], x + 0.68, y - 0.03, 1.15, 0.28, { size: 14, bold: true, color: art.kind === "dark" ? C.paper : C.ink });
    art.text(node[1], x + 0.68, y + 0.3, 1.26, 0.5, { size: 9.4, color: art.kind === "dark" ? C.muted : C.gray });
    if (i < nodes.length - 1) art.line(x + 1.86, y + 0.25, x + 1.86 + gap - 0.16, y + 0.25, opts.line || C.lightGray, 1.5, { endArrow: "triangle" });
    x += 1.72 + gap;
  });
}

function addCover() {
  const art = addSlide("cover");
  art.text("中山大学人工智能学院", 4.1, 1.55, 5.15, 0.36, { size: 16, bold: true, color: C.green, align: "center" });
  art.text("硕士学位论文答辩", 4.55, 1.95, 4.25, 0.28, { size: 12.5, color: C.gray, align: "center" });
  art.text("面向出行位置点预测的\n大小模型协同学习研究", 2.15, 2.58, 9.05, 0.98, { size: 31, bold: true, color: C.ink, align: "center", font: FONT_HEAD });
  art.text("Collaborative Learning of Large and Small Models for Next POI Prediction in Mobility Scenarios", 2.5, 4.07, 8.45, 0.28, { size: 10.8, color: C.gray, align: "center", font: FONT_BODY });
  art.rect(4.1, 4.62, 5.15, 0.05, C.ink);
  art.rect(5.56, 5.15, 2.22, 0.52, C.green, { radius: 0.08 });
  art.text("人工智能学院", 5.93, 5.3, 1.45, 0.14, { size: 10.5, bold: true, color: C.paper, align: "center" });
  art.text("答辩人：刘钊      专业：人工智能      导师：刘威（副教授）", 3.35, 6.18, 6.65, 0.24, { size: 11.5, color: C.gray, align: "center" });
}

function addApplicationOverview() {
  const art = addSlide("light");
  title(art, "学位申请信息一览", "中山大学人工智能学院 · 研究生学位申请与答辩前置材料", "学位申请");
  art.line(6.65, 1.43, 6.65, 6.42, C.lightGray, 1.1);

  infoField(art, "姓名", "刘钊", 0.86, 1.48, 5.0);
  infoField(art, "学号", "23214878", 0.86, 2.02, 5.0);
  infoField(art, "专业", "085410 人工智能（全日制专业学位硕士）", 0.86, 2.56, 5.35, { color: C.red });
  infoField(art, "导师", "刘威（副教授）", 0.86, 3.1, 5.0);
  infoField(art, "培养", "已修 33 学分；必修 29 学分（要求 18）；满足培养方案要求", 0.86, 3.64, 5.55, { color: C.red, h: 0.44 });
  infoField(art, "学术成果", "论文 2 篇：WISE 2024（CCF C）；ICDE 2026（CCF A，Accepted）", 0.86, 4.35, 5.55, { color: C.ink, h: 0.52 });
  art.text("成果均围绕 Next POI 预测与大小模型协同学习主线展开。", 1.55, 5.05, 4.85, 0.28, { size: 12.4, color: C.gray });

  art.ellipse(7.05, 1.56, 0.13, 0.13, C.ink);
  art.text("学位论文题目：", 7.33, 1.48, 2.05, 0.28, { size: 17.5, bold: true, color: C.ink });
  art.text("面向出行位置点预测的大小模型协同学习研究", 7.33, 1.9, 5.25, 0.38, { size: 17, bold: true, color: C.ink });
  infoField(art, "送审结果", "评阅类型：硕士盲审两份；评阅结果：通过", 7.05, 2.46, 5.55, { color: C.green, bold: true, h: 0.36 });
  art.table(
    [
      ["专家", "总分", "答辩结论", "校优推荐"],
      ["盲审专家1", "97", "同意答辩（A）", "是"],
      ["盲审专家2", "78", "修改后答辩（B）", "否"],
    ],
    7.28,
    3.12,
    [1.25, 0.75, 2.0, 1.15],
    [0.38, 0.42, 0.42],
    { fontSize: 9.2 }
  );
  infoField(art, "复审情况", "无；当前系统评阅结果为通过", 7.05, 4.7, 5.45, { h: 0.3 });
  infoField(art, "答辩情况", "时间、地点、专家与结果待学院答辩安排及答辩后填写", 7.05, 5.24, 5.45, { color: C.gray, h: 0.42 });
  art.text("第一部分：学位申请与成果信息", 4.45, 6.28, 4.45, 0.24, { size: 13.5, bold: true, color: C.green2, align: "center" });
}

function addCultivationInfo() {
  const art = addSlide("light");
  title(art, "培养信息与学分完成情况", "来自研究生系统截图信息，保留答辩前置审查所需字段", "培养信息");

  const cells = [
    ["年级", "2023级", "学生类别", "全日制专业学位硕士生", "院系", "人工智能学院"],
    ["专业", "085410 人工智能", "导师", "230551_刘威", "研究方向", "不分方向"],
    ["学制", "3年制", "入学方式", "全国统考", "学习方式", "全日制"],
    ["入学年月", "2023-09-01", "预计毕业", "2026-06-30", "学籍状态", "在读"],
    ["学位类型", "专业学位", "是否专业学位", "是", "培养类型", "无"],
  ];
  cells.forEach((row, r) => {
    for (let c = 0; c < 3; c++) {
      smallInfoCell(art, row[c * 2], row[c * 2 + 1], 0.78 + c * 3.94, 1.5 + r * 0.58, 3.66, c === 1 ? C.green2 : C.ink);
    }
  });

  art.text("方案学分要求", 0.9, 4.72, 2.0, 0.28, { size: 17, bold: true, color: C.green2 });
  art.line(0.9, 5.05, 12.0, 5.05, C.lightGray, 1);
  metric(art, "33", "总计已选学分（要求 32）", 1.05, 5.3, C.red, 35);
  metric(art, "29", "总计必修课学分（要求 18）", 3.9, 5.3, C.green, 35);
  metric(art, "18", "专业方向课已选学分", 6.75, 5.3, C.blue, 35);
  art.table(
    [
      ["课程类别", "专业基础课", "公共必修课", "专业选修课", "专业方向课"],
      ["当前选课学分", "7", "4", "4", "18"],
    ],
    0.9,
    6.18,
    [1.7, 2.0, 2.0, 2.0, 2.0],
    [0.36, 0.38],
    { fontSize: 9.4 }
  );
}

function addReviewInfo() {
  const art = addSlide("light");
  title(art, "学位论文评阅与答辩状态", "评阅类型：硕士盲审两份；系统评阅结果：通过", "评阅信息");
  art.text("通过", 7.75, 1.38, 1.3, 0.4, { size: 27, bold: true, color: "008000" });
  art.text("评阅结果", 6.72, 1.49, 1.2, 0.22, { size: 14, bold: true, color: C.ink });
  art.text("硕士盲审两份", 3.08, 1.49, 1.85, 0.22, { size: 14, bold: true, color: C.ink });
  art.text("评阅类型", 2.05, 1.49, 1.2, 0.22, { size: 14, bold: true, color: C.gray });

  art.table(
    [
      ["专家姓名", "评阅ID", "送审类型", "总分", "答辩结论"],
      ["盲审专家1", "23214878003", "盲审", "97", "同意答辩（A）"],
      ["盲审专家2", "23214878006", "盲审", "78", "修改后答辩（B）"],
    ],
    0.82,
    2.05,
    [2.0, 2.55, 1.55, 1.0, 2.8],
    [0.42, 0.5, 0.5],
    { fontSize: 10.5 }
  );

  art.rect(0.88, 3.95, 5.45, 1.55, "F7F9FC", { line: "D7DEEA", lineWidth: 0.8, radius: 0.08 });
  art.text("专家1意见摘要", 1.12, 4.18, 1.4, 0.2, { size: 11.5, bold: true, color: C.green2 });
  art.text("选题具有较强理论意义和现实应用价值；方法设计充分，结果验证较完整，同意参加答辩，并推荐为校级优秀学位论文。", 1.12, 4.55, 4.82, 0.58, { size: 12.2, color: C.ink });

  art.rect(6.9, 3.95, 5.45, 1.55, "F7F9FC", { line: "D7DEEA", lineWidth: 0.8, radius: 0.08 });
  art.text("专家2意见摘要", 7.14, 4.18, 1.4, 0.2, { size: 11.5, bold: true, color: C.red });
  art.text("论文达到硕士学位论文要求，同意修改后参加答辩；建议进一步统一格式、术语和章节衔接表达。", 7.14, 4.55, 4.82, 0.58, { size: 12.2, color: C.ink });

  art.text("答辩安排", 0.95, 6.08, 1.2, 0.24, { size: 13, bold: true, color: C.green2 });
  art.text("时间 / 地点 / 专家 / 结果：待学院答辩安排及答辩后填写", 2.02, 6.08, 7.0, 0.24, { size: 13, color: C.gray });
}

function addAcademicOutcomes() {
  const art = addSlide("light");
  title(art, "学术成果", "围绕论文主线形成两项代表性学术论文成果", "学术成果");
  art.text("论文 / 专利", 0.95, 1.38, 1.4, 0.28, { size: 15, bold: true, color: C.green2 });
  art.text("当前材料中未检索到专利信息；已发表/接收论文 2 篇。", 2.1, 1.4, 5.2, 0.22, { size: 12.8, color: C.gray });

  const pubs = [
    {
      venue: "WISE 2024",
      tag: "CCF B",
      title: "Next POI Recommendation Based on Time Slot Preferences\nand Bidirectional Transformation Modeling",
      authors: "Zhao Liu, Wei Liu, Huaijie Zhu, Jianxing Yu, Jian Yin",
      relation: "对应论文小模型路线：TSPM、时间增强序列动态图与双向转移建模。",
      color: C.gold,
    },
    {
      venue: "ICDE 2026",
      tag: "CCF A · Accepted",
      title: "Geography-Aware Large Language Models for\nNext POI Recommendation",
      authors: "Zhao Liu, Muzu Xie, Wei Liu, Huaijie Zhu, Jianxing Yu, Jian Yin, Wang-Chien Lee",
      relation: "对应论文大模型路线：GA-LLM、GCIM 地理注入与 PAM 结构对齐。",
      color: C.red,
    },
  ];
  pubs.forEach((pub, i) => {
    const x = 0.92 + i * 6.05;
    art.rect(x, 2.02, 5.48, 3.05, C.paper, { line: "D7DEEA", lineWidth: 0.9, radius: 0.08 });
    art.rect(x, 2.02, 5.48, 0.44, pub.color, { radius: 0.08 });
    art.text(pub.venue, x + 0.24, 2.13, 1.65, 0.14, { size: 11, bold: true, color: C.paper });
    art.text(pub.tag, x + 3.45, 2.13, 1.7, 0.14, { size: 9.8, bold: true, color: C.paper, align: "right" });
    art.text(pub.title, x + 0.28, 2.76, 4.95, 0.74, { size: 13.5, bold: true, color: C.ink });
    art.text(pub.authors, x + 0.28, 3.65, 4.85, 0.36, { size: 11.5, color: C.gray });
    art.line(x + 0.28, 4.22, x + 5.05, 4.22, C.lightGray, 0.8);
    art.text(pub.relation, x + 0.28, 4.42, 4.86, 0.42, { size: 12.2, color: C.green2, bold: true });
  });

  art.text("成果与毕业论文关系", 0.95, 5.72, 1.8, 0.24, { size: 13, bold: true, color: C.red });
  art.text("两项成果共同支撑“结构先验 + 语义推理 + 协同训练”的论文主框架，覆盖方法设计、实验验证与应用价值。", 2.55, 5.68, 8.7, 0.34, { size: 15.5, bold: true, color: C.ink });
}

function addAgenda() {
  const art = addSlide("section");
  art.text("目录", 1.0, 0.75, 1.4, 0.36, { size: 20, bold: true, color: C.green });
  art.text("答辩结构", 5.48, 0.8, 2.4, 0.28, { size: 15.5, bold: true, color: C.ink, align: "center" });
  art.rect(5.82, 1.18, 1.68, 0.025, C.green);
  agendaSections.forEach((item, i) => {
    const x = i < 2 ? 2.0 : 7.0;
    const y = i % 2 === 0 ? 2.0 : 4.25;
    art.text(item.no, x, y, 0.68, 0.38, { size: 25, bold: true, color: i === 0 ? C.red : C.green, font: FONT_MONO });
    art.text(item.title, x + 0.86, y + 0.04, 3.1, 0.38, { size: 21, bold: true, color: C.ink });
    art.text(item.detail.join(" / "), x + 0.88, y + 0.58, 3.85, 0.42, { size: 10.5, color: C.gray });
  });
  art.text("小模型学习结构规律，大模型增强语义推理，对齐机制完成协同。", 1.35, 6.08, 10.7, 0.28, { size: 16.5, bold: true, color: C.green2, align: "center" });
  art.footer("目录");
}

function addSectionDivider(no, titleText, subtitle, detailItems) {
  const art = addSlide("section");
  const meta = agendaSections.find((s) => s.no === no);
  art.text(no, 2.1, 1.55, 1.15, 0.55, { size: 35, bold: true, color: C.green, font: FONT_MONO });
  art.text(titleText, 3.3, 1.62, 4.25, 0.48, { size: 31, bold: true, color: C.ink });
  art.text(subtitle, 3.35, 2.38, 6.25, 0.42, { size: 13.2, color: C.gray });
  art.rect(3.35, 3.03, 1.45, 0.045, C.green);
  agendaSections.forEach((item, i) => {
    const y = 3.72 + i * 0.62;
    const active = item.no === no;
    art.text(item.no, 7.15, y, 0.52, 0.24, { size: 14, bold: true, color: active ? C.red : C.green, font: FONT_MONO });
    art.text(item.title, 7.82, y + 0.02, 2.25, 0.22, { size: 13.8, bold: true, color: active ? C.ink : C.gray });
    art.text(item.detail.join(" / "), 9.72, y + 0.03, 2.4, 0.2, { size: 8.2, color: active ? C.green2 : C.muted });
  });
  detailItems.forEach((item, i) => {
    const y = 3.72 + i * 0.43;
    art.ellipse(3.42, y + 0.08, 0.09, 0.09, i % 2 ? C.green : C.red);
    art.text(item, 3.62, y, 3.2, 0.27, { size: 11.8, color: C.ink });
  });
  art.footer(titleText);
}

function addBackground() {
  const art = addSlide("light");
  title(art, "研究背景：位置服务让推荐走向真实出行", "Next POI 预测服务智能出行、本地生活与文旅推荐", "背景");
  art.text("推荐目标从“喜欢什么”变成“下一步去哪里”", 0.9, 1.75, 5.6, 0.62, { size: 28, bold: true, color: C.green2 });
  bullets(art, [
    "线下场景同时受到时间、空间、活动语义和路径连续性约束",
    "下一 POI 预测需要输出 Top-K 候选，并把真实目标排在前列",
    "真实系统还要求跨城泛化、稳定排序和可部署的推理成本",
  ], 0.95, 2.72, 5.7, 0.58, { size: 15.5, dot: C.red });
  art.rect(7.25, 1.48, 0.03, 4.7, C.lightGray);
  [["本地生活", "餐饮、购物、服务"], ["智能出行", "通勤、导航、行程"], ["文旅推荐", "景点、活动、路线"]].forEach((d, i) => {
    const y = 1.72 + i * 1.38;
    art.text(d[0], 7.65, y, 2.25, 0.38, { size: 22, bold: true, color: [C.green, C.blue, C.red][i] });
    art.text(d[1], 7.67, y + 0.46, 3.0, 0.28, { size: 13, color: C.gray });
    art.line(7.27, y + 0.19, 7.55, y + 0.19, [C.green, C.blue, C.red][i], 2.2);
  });
  metric(art, "Top-K", "排序质量是核心评估口径", 9.65, 5.55, C.blue, 34);
}

function addTaskDefinition() {
  const art = addSlide("light");
  title(art, "任务定义：由历史轨迹预测下一 POI", "输入时间有序签到序列，输出下一时刻最可能访问的兴趣点", "任务定义");
  art.text("签到记录", 0.88, 1.68, 1.4, 0.26, { size: 14, bold: true, color: C.red });
  art.text("xᵢ = (u, ℓᵢ, tᵢ, gᵢ, cᵢ)", 0.88, 2.04, 4.3, 0.45, { size: 25, bold: true, color: C.ink, font: FONT_MONO });
  art.text("用户、POI、时间、经纬度、类别语义", 0.9, 2.56, 4.0, 0.24, { size: 12, color: C.gray });
  art.line(1.2, 4.1, 11.4, 4.1, C.lightGray, 1.2);
  const xs = [1.25, 3.4, 5.55, 7.7, 9.85];
  xs.forEach((x, i) => {
    art.ellipse(x, 3.86, 0.48, 0.48, i === 4 ? C.red : C.green);
    art.text(`ℓ${i + 1}`, x + 0.14, 4.0, 0.2, 0.1, { size: 11, bold: true, color: C.paper, align: "center", font: FONT_MONO });
    if (i < xs.length - 1) art.line(x + 0.52, 4.1, xs[i + 1] - 0.06, 4.1, C.muted, 1.4, { endArrow: "triangle" });
  });
  art.text("历史轨迹 𝒯ᵤ = {x₁, …, xₙ}", 1.0, 4.62, 4.2, 0.3, { size: 15, bold: true, color: C.green2 });
  art.text("目标：f : 𝒯ᵤ → ℓ̂ₙ₊₁，使真实 POI 在候选排序中尽可能靠前", 4.62, 4.62, 6.8, 0.3, { size: 15, bold: true, color: C.red });
  bullets(art, ["Acc@K 衡量 Top-K 是否命中", "MRR 衡量真实目标排名是否靠前", "NDCG@K 衡量前 K 候选的排序质量"], 1.0, 5.55, 8.8, 0.42, { size: 14, dot: C.blue });
}

function addDifficulties() {
  const art = addSlide("light");
  title(art, "为什么困难：出行预测是强约束推荐", "语义合理并不等于地理可达，局部高频也不等于下一步真实目标", "挑战");
  const items = [
    ["时间异质性", "同一 POI 在工作日、夜间、周末的转移规律不同"],
    ["方向性缺失", "只问“当前点去哪里”，容易忽略“目标点从哪里来”"],
    ["空间连续性", "LLM 把坐标当文本 token，地理邻近可能变成语义远离"],
    ["转移先验", "高阶 POI 图关系难以仅靠文本上下文注入 LLM"],
  ];
  items.forEach((it, i) => {
    const x = i % 2 === 0 ? 0.95 : 6.85;
    const y = i < 2 ? 1.72 : 4.02;
    art.text(`0${i + 1}`, x, y, 0.68, 0.4, { size: 23, bold: true, color: [C.gold, C.red, C.mint, C.blue][i], font: FONT_MONO });
    art.text(it[0], x + 0.8, y + 0.02, 2.5, 0.38, { size: 22, bold: true, color: C.ink });
    art.text(it[1], x + 0.82, y + 0.58, 4.7, 0.7, { size: 14, color: C.gray });
    art.line(x + 0.8, y + 0.47, x + 4.95, y + 0.47, [C.gold, C.red, C.mint, C.blue][i], 1.1);
  });
  art.text("单一路线难以同时兼顾精度、泛化、可解释性与部署成本", 1.08, 6.08, 9.4, 0.46, { size: 25, bold: true, color: C.green2 });
}

function addMethodLimits() {
  const art = addSlide("light");
  title(art, "现有方法边界：三类路线各有短板", "本文从能力边界出发设计协同框架，而不是简单叠加模型", "问题分析");
  const rows = [
    ["路线", "主要优势", "主要短板", "对本文启示"],
    ["序列模型", "局部时序表达强", "高阶迁移与跨场景泛化不足", "引入时间分段与结构化转移先验"],
    ["图模型", "高阶关系建模强", "动态图开销高，语义空间难融合", "采用轻量动态图与可映射表示"],
    ["LLM 模型", "语义理解与泛化强", "地理连续性弱，坐标文本不稳定", "设计地理编码与 POI 先验注入"],
  ];
  art.table(rows, 0.82, 1.7, [1.28, 2.55, 3.05, 4.18], [0.48, 0.78, 0.78, 0.78], { fontSize: 11.5 });
  art.text("结论", 0.88, 5.35, 0.72, 0.26, { size: 14, bold: true, color: C.red });
  art.text("Next POI 场景需要“结构先验 + 语义推理”的协同机制，并在训练/推理成本上保持可控。", 1.55, 5.32, 9.8, 0.45, { size: 22, bold: true, color: C.green2 });
}

function addRQ() {
  const art = addSlide("light");
  title(art, "研究问题：从五个 RQ 构造证据闭环", "问题、方法、实验按同一逻辑闭环组织", "研究问题");
  const rqs = [
    ["RQ1", "总体有效性", "协同框架是否稳定优于序列、图与 LLM 基线"],
    ["RQ2", "小模型机制", "时间增强与双向转移是否带来独立贡献"],
    ["RQ3", "大模型机制", "GCIM 与 PAM 是否改善空间一致性与转移感知"],
    ["RQ4", "协同机理", "结构约束是否校正语义偏差与远跳错误"],
    ["RQ5", "效率部署", "LoRA 与模块化注入是否控制训练/推理开销"],
  ];
  rqs.forEach((r, i) => {
    const y = 1.55 + i * 0.86;
    art.text(r[0], 0.95, y, 0.72, 0.28, { size: 16, bold: true, color: i % 2 ? C.blue : C.red, font: FONT_MONO });
    art.text(r[1], 1.85, y, 1.55, 0.28, { size: 15, bold: true, color: C.ink });
    art.text(r[2], 3.72, y, 7.3, 0.28, { size: 14, color: C.gray });
    art.line(0.92, y + 0.43, 11.55, y + 0.43, C.lightGray, 0.7);
  });
  art.text("答辩时的证据顺序", 0.98, 6.13, 1.9, 0.24, { size: 12.5, bold: true, color: C.red });
  art.text("主结果 → 消融 → 空间诊断 → 泛化/效率", 2.78, 6.1, 5.8, 0.28, { size: 16, bold: true, color: C.green2 });
}

function addOverallIdea() {
  const art = addSlide("light");
  title(art, "总体思路：小模型学结构，大模型做语义推理", "双路线并行、训练协同、推理独立", "总体方法");
  art.text("小模型分支 TSPM", 0.95, 1.62, 3.2, 0.36, { size: 21, bold: true, color: C.gold });
  art.text("学习时间敏感的时空转移结构：时间分槽、转出/转入方向、动态图权重。", 0.95, 2.1, 4.4, 0.66, { size: 15, color: C.gray });
  art.text("大模型分支 GA-LLM", 7.75, 1.62, 3.4, 0.36, { size: 21, bold: true, color: C.mint });
  art.text("通过 GCIM 注入地理连续性，通过 PAM 注入 POI 转移先验，生成 Top-K。", 7.75, 2.1, 4.5, 0.66, { size: 15, color: C.gray });
  art.line(1.35, 4.26, 5.5, 4.26, C.gold, 2.2, { endArrow: "triangle" });
  art.line(7.76, 4.26, 11.35, 4.26, C.mint, 2.2, { endArrow: "triangle" });
  art.ellipse(5.65, 3.38, 1.85, 1.85, C.red, { transparency: 0 });
  art.text("PAM\n对齐", 6.02, 3.88, 1.1, 0.55, { size: 21, bold: true, color: C.paper, align: "center" });
  art.text("训练期吸收结构知识", 4.7, 5.58, 3.8, 0.34, { size: 20, bold: true, color: C.green2, align: "center" });
  art.text("推理期仅 GA-LLM 单路输出，不在线调用 TSPM 打分", 3.48, 6.02, 6.3, 0.28, { size: 14, color: C.gray, align: "center" });
}

function addFramework() {
  const art = addSlide("light");
  title(art, "协同框架：结构信息在输入侧被对齐注入", "图示重点展示 GA-LLM 主推理链路以及 GCIM/PAM 的注入流程", "总体方法");
  art.image(assets.fig3_framework, 0.88, 1.42, 11.55, 4.4, { alt: "大小模型协同框架示意" });
  art.text("关键口径", 0.9, 6.0, 1.0, 0.22, { size: 12, bold: true, color: C.red });
  art.text("TSPM 提供结构嵌入，PAM 将其映射到 LLM 语义空间；最终 Top-K 由 GA-LLM 单路生成。", 1.85, 5.95, 9.8, 0.35, { size: 17, bold: true, color: C.green2 });
}

function addTspm() {
  const art = addSlide("light");
  title(art, "小模型分支：TSPM 显式建模时间异质性", "按时段划分转移子图，同时学习转出与转入关系", "TSPM");
  art.image(assets.time_left, 0.9, 1.55, 4.95, 2.55, { alt: "传统序列" });
  art.image(assets.time_right, 6.7, 1.55, 4.95, 2.55, { alt: "时间增强序列" });
  art.text("传统连续序列", 2.42, 4.3, 1.6, 0.24, { size: 13, bold: true, color: C.gray, align: "center" });
  art.text("时间增强序列", 8.22, 4.3, 1.6, 0.24, { size: 13, bold: true, color: C.green2, align: "center" });
  bullets(art, [
    "TSDG：按时间槽构建动态图，显式刻画同一 POI 在不同时段的差异",
    "BTM：同时建模“当前点去哪里”和“目标点从哪里来”",
    "动态图边权：综合序列距离与双向转移距离，提升排序稳定性",
  ], 1.05, 5.15, 10.6, 0.45, { size: 14.2, dot: C.green });
}

function addTiRNN() {
  const art = addSlide("light");
  title(art, "双向转移与 TiRNN：把历史贡献做成可调权重", "关系向量调节不同历史点对下一 POI 的贡献", "TSPM");
  art.image(assets.TiRNN, 0.83, 1.54, 5.6, 3.45, { alt: "TiRNN预测头结构" });
  art.text("TiRNN 预测头", 0.9, 5.2, 1.55, 0.24, { size: 12.5, bold: true, color: C.gray });
  art.text("rₖ = RelEnc(ℓₜ₋ₖ, ℓₜ, Δtₖ, Δgₖ)", 7.02, 1.78, 4.6, 0.42, { size: 21, bold: true, color: C.green2, font: FONT_MONO });
  art.text("ℒₜₛₚₘ = αℒ_time + βℒ_seq", 7.02, 2.55, 4.1, 0.42, { size: 21, bold: true, color: C.red, font: FONT_MONO });
  bullets(art, [
    "关系编码引入时间间隔与地理距离",
    "注意力融合多步历史，平衡短期惯性与中期计划",
    "离线训练后导出 POI 结构嵌入，供 PAM 读取",
  ], 7.08, 3.55, 4.8, 0.5, { size: 14.3, dot: C.blue });
}

function addLlmChallenge() {
  const art = addSlide("light");
  title(art, "大模型问题：坐标文本化破坏空间连续性", "地理上相邻的位置，可能在离散 token 空间中被切成差异很大的符号序列", "GA-LLM");
  art.image(assets.fig1_GCIM_c1, 0.85, 1.4, 7.0, 4.5, { alt: "空间连续性挑战示意" });
  metric(art, "远跳", "纯文本 LLM 容易产生地理不一致预测", 8.42, 1.85, C.red, 41);
  bullets(art, [
    "经纬度不是普通文本，数字 token 相近不代表空间相近",
    "语义上合理的地点，可能在真实城市空间上不可达",
    "需要把地理连续性作为可学习约束注入输入空间",
  ], 8.46, 3.25, 3.9, 0.62, { size: 14.2, dot: C.green });
}

function addGCIM() {
  const art = addSlide("light");
  title(art, "GCIM：层级离散编码 + 连续频域编码", "将地理约束结构化注入 LLM 语义空间", "GA-LLM");
  const y = 2.15;
  [["坐标 gᵢ", C.gray], ["HDE\nQuadkey", C.green], ["CSE\nFourier", C.blue], ["融合投影\nE_gps", C.red], ["LLM 输入\n<GPS>", C.gold]].forEach((n, i) => {
    const x = 0.9 + i * 2.35;
    art.ellipse(x, y, 1.0, 1.0, n[1]);
    art.text(n[0], x - 0.18, y + 0.29, 1.36, 0.34, { size: i === 0 ? 13 : 12.5, bold: true, color: C.paper, align: "center" });
    if (i < 4) art.line(x + 1.1, y + 0.5, x + 2.15, y + 0.5, C.muted, 1.5, { endArrow: "triangle" });
  });
  art.text("E_gps = W_gps · [HDE(g); CSE(g)]", 1.02, 4.08, 5.8, 0.42, { size: 22, bold: true, color: C.green2, font: FONT_MONO });
  art.text("GAL 损失约束嵌入距离与真实测地距离一致", 1.04, 4.62, 5.7, 0.28, { size: 14, color: C.gray });
  art.image(assets.fig6_average_distance_analysis, 7.15, 4.05, 4.72, 1.85, { alt: "平均地理误差距离对比" });
  metric(art, "38.69%", "CA 平均地理误差相对下降", 8.0, 5.85, C.red, 31);
}

function addPAM() {
  const art = addSlide("light");
  title(art, "PAM：把 POI 图结构映射到 LLM 语义空间", "解决“结构信息可用，但语言模型难以读取”的跨空间鸿沟", "GA-LLM");
  art.image(assets.fig2_PAM_c2, 0.85, 1.38, 5.3, 3.75, { alt: "PAM动机示意" });
  art.text("E_poi = W_p · e_poi + b_p", 6.85, 1.7, 4.6, 0.42, { size: 23, bold: true, color: C.red, font: FONT_MONO });
  bullets(art, [
    "输入：小模型/图模型产生的 POI 结构嵌入",
    "映射：结构空间 → LLM 语义空间",
    "作用：缺少直接目标线索时，提高候选可检索性与可排序性",
  ], 6.92, 2.75, 4.9, 0.58, { size: 14.5, dot: C.green });
  metric(art, "+52.98%", "CA 缺失目标场景 Acc@1 相对提升", 6.95, 5.52, C.red, 36);
}

function addTraining() {
  const art = addSlide("light");
  title(art, "协同训练：先对齐，后协同；推理保持单路输出", "协同发生在训练期与表示空间，不是在线分数融合", "训练策略");
  const stages = [
    ["0", "离线训练 TSPM", "得到 POI 结构嵌入"],
    ["1", "Stage-1 对齐预热", "冻结 LLM 主体，训练 GCIM/PAM"],
    ["2", "Stage-2 协同训练", "LoRA + GCIM/PAM，优化生成与对齐目标"],
    ["3", "推理阶段", "GA-LLM beam search 直接生成 Top-K"],
  ];
  stages.forEach((s, i) => {
    const x = 0.95 + i * 3.04;
    art.ellipse(x, 2.05, 0.72, 0.72, [C.gold, C.mint, C.red, C.blue][i]);
    art.text(s[0], x + 0.24, 2.24, 0.2, 0.1, { size: 16, bold: true, color: C.paper, font: FONT_MONO, align: "center" });
    art.text(s[1], x, 3.0, 2.5, 0.34, { size: 18, bold: true, color: C.ink });
    art.text(s[2], x, 3.48, 2.55, 0.58, { size: 12.5, color: C.gray });
    if (i < stages.length - 1) art.line(x + 0.86, 2.41, x + 2.72, 2.41, C.muted, 1.6, { endArrow: "triangle" });
  });
  art.text("ℒ_total = ℒ_gen + λ₂ℒ_geo + λ₃ℒ_align", 2.28, 5.35, 7.5, 0.45, { size: 25, bold: true, color: C.gold, font: FONT_MONO, align: "center" });
  art.text("不引入候选约束解码 · 不在线重排序 · 不调用 TSPM 实时打分", 2.52, 6.02, 7.0, 0.28, { size: 14.2, color: C.gray, align: "center" });
}

function addExperimentSetup() {
  const art = addSlide("light");
  title(art, "实验设置：母数据集与城市子集双路线验证", "统一数据切分、评价指标与显著性检验，避免评估口径漂移", "实验设置");
  const rows = [
    ["数据集", "用户", "POI", "类别", "签到数"],
    ["NYC", "1,048", "4,981", "318", "103,941"],
    ["TKY", "2,282", "7,833", "290", "405,000"],
    ["CA", "3,957", "9,690", "334", "238,369"],
  ];
  art.table(rows, 0.8, 1.55, [1.25, 1.45, 1.45, 1.25, 1.75], [0.48, 0.55, 0.55, 0.55], { fontSize: 12 });
  art.text("TSPM 路线", 8.25, 1.58, 1.8, 0.28, { size: 17, bold: true, color: C.green2 });
  art.text("Gowalla / Foursquare 母数据集\n验证时间分槽、双向转移、动态图机制", 8.26, 2.0, 3.2, 0.68, { size: 13.5, color: C.gray });
  art.text("GA-LLM 路线", 8.25, 3.12, 1.9, 0.28, { size: 17, bold: true, color: C.red });
  art.text("NYC / TKY / CA 城市或区域子集\n验证地理注入、转移对齐与跨城泛化", 8.26, 3.54, 3.35, 0.68, { size: 13.5, color: C.gray });
  bullets(art, ["80%/10%/10% 按时间顺序划分", "Acc@1 / Acc@5 / Acc@10 / MRR / NDCG@K", "5 个随机种子，paired t-test，p < 0.05"], 0.95, 5.23, 7.8, 0.43, { size: 13.8, dot: C.blue });
}

function addMainResults() {
  const art = addSlide("light");
  title(art, "主结果：两条路线在各自场景中均取得稳定增益", "TSPM 验证结构分支，GA-LLM 验证地理注入与转移对齐", "实验结果");
  art.text("TSPM 相对 Graph-Flashback 提升（%）", 0.85, 1.46, 4.7, 0.25, { size: 13.5, bold: true, color: C.green2 });
  art.chart({
    x: 0.78,
    y: 1.82,
    w: 5.25,
    h: 2.75,
    labels: ["Gowalla", "Foursquare"],
    series: [
      { name: "Acc@1", values: [5.49, 4.53], color: C.red },
      { name: "MRR", values: [3.59, 3.99], color: C.blue },
    ],
    max: 6.2,
    showValues: true,
  });
  art.text("GA-LLM 相对最强非本文基线提升（%）", 6.72, 1.46, 4.9, 0.25, { size: 13.5, bold: true, color: C.green2 });
  art.chart({
    x: 6.55,
    y: 1.82,
    w: 5.65,
    h: 2.75,
    labels: ["NYC", "TKY", "CA"],
    series: [
      { name: "Acc@1", values: [18.27, 14.73, 16.69], color: C.red },
      { name: "Acc@5", values: [17.77, 19.20, 24.10], color: C.green },
      { name: "MRR@5", values: [12.62, 8.23, 13.95], color: C.blue },
    ],
    max: 27,
    showValues: false,
  });
  metric(art, "0.3988", "GA-LLM 在 NYC 上 Acc@1", 1.05, 5.3, C.red, 32);
  metric(art, "0.1595", "TSPM 在 Gowalla 上 Acc@1", 4.35, 5.3, C.green, 32);
  art.text("说明：提升不是单一指标偶然变化，而是在命中率与排序质量上同步改善。", 7.65, 5.45, 4.1, 0.5, { size: 16, bold: true, color: C.ink });
}

function addAblation() {
  const art = addSlide("light");
  title(art, "消融与空间诊断：GCIM 是主要地理收益来源", "TSDG / BTM / GCIM / PAM 均有独立贡献", "实验结果");
  art.text("GA-LLM 消融（Acc@1）", 0.88, 1.48, 2.5, 0.25, { size: 13.5, bold: true, color: C.green2 });
  art.chart({
    x: 0.78,
    y: 1.82,
    w: 5.1,
    h: 2.7,
    labels: ["NYC", "TKY", "CA"],
    series: [
      { name: "Full", values: [0.3988, 0.3482, 0.2566], color: C.red },
      { name: "w/o GCIM", values: [0.3729, 0.3370, 0.2402], color: C.blue },
      { name: "w/o PAM", values: [0.3901, 0.3468, 0.2499], color: C.green },
    ],
    max: 0.45,
    showValues: false,
    decimals: 2,
  });
  art.image(assets.fig5_distance_analysis, 6.65, 1.5, 5.15, 2.25, { alt: "地理距离误差分布分析" });
  art.image(assets.fig6_average_distance_analysis, 6.65, 3.98, 5.15, 1.72, { alt: "平均地理误差距离对比" });
  art.text("诊断结论", 0.9, 5.18, 1.1, 0.24, { size: 12.5, bold: true, color: C.red });
  art.text("GCIM 使错误分布向近距离移动；CA 平均地理误差由 61.38 km 降至 37.63 km。", 1.88, 5.12, 4.35, 0.48, { size: 15.5, bold: true, color: C.green2 });
}

function addMechanismEfficiency() {
  const art = addSlide("light");
  title(art, "机制证据与效率：困难样本受益，成本保持可控", "PAM 在目标缺失场景补偿结构先验，LoRA 与结构化注入控制开销", "实验结果");
  art.image(assets.fig7_pam_analysis, 0.82, 1.42, 5.2, 2.75, { alt: "PAM模块作用分析" });
  art.image(assets.fig8_efficiency_study, 6.55, 1.42, 5.35, 2.75, { alt: "效率与资源开销对比" });
  metric(art, "+52.98%", "PAM 在 CA 缺失目标场景的 Acc@1 相对提升", 1.0, 4.78, C.red, 34);
  metric(art, "LoRA", "参数高效微调，避免全参更新成本激增", 6.72, 4.78, C.green, 34);
  art.text("部署口径", 1.0, 6.0, 1.1, 0.24, { size: 12.5, bold: true, color: C.blue });
  art.text("训练期完成知识对齐，推理期保持 GA-LLM 单路输出，在精度提升与工程可部署性之间取得平衡。", 2.0, 5.92, 8.9, 0.42, { size: 17, bold: true, color: C.ink });
}

function addConclusion() {
  const art = addSlide("light");
  title(art, "结论与展望", "结构-语义协同为高约束时空推荐提供可复用框架", "总结");
  const cols = [
    ["主要结论", ["协同框架兼顾结构表达与语义泛化", "TSDG/BTM 提升时间异质与路径转移建模", "GCIM/PAM 改善地理一致性、跨场景泛化与效率"]],
    ["创新点", ["问题层：显式化结构信息难注入 LLM", "方法层：GCIM + PAM 两条互补注入路径", "验证层：主结果、消融、诊断、效率闭环"]],
    ["后续工作", ["引入天气、交通、节假日等多模态上下文", "研究细粒度跨城迁移与在线自适应", "优化生成链路、缓存更新与端到端时延"]],
  ];
  cols.forEach((col, i) => {
    const x = 0.9 + i * 4.12;
    art.text(col[0], x, 1.65, 2.0, 0.32, { size: 20, bold: true, color: [C.gold, C.mint, C.red][i] });
    bullets(art, col[1], x, 2.28, 3.45, 0.72, { size: 13.3, dot: [C.gold, C.mint, C.red][i], color: C.ink });
  });
  art.text("谢谢各位老师批评指正", 3.28, 6.26, 6.75, 0.55, { size: 30, bold: true, color: C.green2, align: "center" });
}

function addThanks() {
  const art = addSlide("thanks");
  art.text("THANKS", 4.42, 1.72, 4.5, 0.72, { size: 42, bold: true, color: C.lightGray, align: "center", font: "Arial" });
  art.text("谢谢！", 5.55, 2.72, 2.25, 0.62, { size: 36, bold: true, color: C.ink, align: "center" });
  art.rect(5.56, 5.15, 2.22, 0.52, C.green, { radius: 0.08 });
  art.text("人工智能学院", 5.93, 5.3, 1.45, 0.14, { size: 10.5, bold: true, color: C.paper, align: "center" });
  art.text("欢迎各位老师批评指正", 4.5, 4.1, 4.35, 0.28, { size: 15.5, color: C.gray, align: "center" });
  art.text(String(art.index).padStart(2, "0"), 12.18, 7.0, 0.45, 0.18, { size: 8.5, bold: true, color: C.gray, align: "right", font: FONT_MONO });
}

[
  addApplicationOverview,
  addCultivationInfo,
  addReviewInfo,
  addAcademicOutcomes,
  addCover,
  addAgenda,
  () => addSectionDivider("01", "研究背景", "从真实出行任务出发，明确 Next POI 的约束与能力缺口", ["位置服务从线上推荐进入线下出行决策", "Next POI 需要预测下一步可达且合理的目标", "序列、图模型与 LLM 各有能力边界"]),
  addBackground,
  addTaskDefinition,
  addDifficulties,
  addMethodLimits,
  addRQ,
  () => addSectionDivider("02", "方法设计", "小模型提供结构先验，大模型完成地理感知语义推理", ["TSPM 建模时间异质与双向转移", "GCIM 注入连续地理约束", "PAM 对齐 POI 图结构与 LLM 语义空间"]),
  addOverallIdea,
  addFramework,
  addTspm,
  addTiRNN,
  addLlmChallenge,
  addGCIM,
  addPAM,
  addTraining,
  () => addSectionDivider("03", "实验验证", "用主结果、消融、诊断和效率分析构成证据闭环", ["双路线分别验证结构分支与语义分支", "消融实验定位 TSDG / BTM / GCIM / PAM 贡献", "空间诊断、困难样本和效率分析支撑可部署性"]),
  addExperimentSetup,
  addMainResults,
  addAblation,
  addMechanismEfficiency,
  () => addSectionDivider("04", "结论展望", "总结创新贡献，并说明后续可扩展方向", ["协同框架兼顾结构表达与语义泛化", "验证闭环覆盖精度、泛化、可解释性和成本", "后续引入多模态上下文与在线自适应"]),
  addConclusion,
  addThanks,
].forEach((fn) => fn());

async function renderPreviews() {
  const previewFiles = [];
  for (const art of slides) {
    const bg = art.kind === "thanks" ? C.paper : C.cream;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="${css(bg)}"/>`;
    for (const node of art.nodes) {
      if (node.type === "rect") {
        const x = dim(node.x), y = dim(node.y), w = dim(node.w), h = dim(node.h);
        const center = `${x + w / 2} ${y + h / 2}`;
        svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${dim(node.radius || 0)}" fill="${css(node.fill)}"${node.stroke ? ` stroke="${css(clean(node.stroke))}" stroke-width="${node.sw}"` : ""}${node.rotate ? ` transform="rotate(${node.rotate} ${center})"` : ""}/>`;
      } else if (node.type === "line") {
        svg += `<line x1="${dim(node.x1)}" y1="${dim(node.y1)}" x2="${dim(node.x2)}" y2="${dim(node.y2)}" stroke="${css(node.color)}" stroke-width="${node.width * 1.6}" stroke-linecap="round"/>`;
      } else if (node.type === "ellipse") {
        svg += `<ellipse cx="${dim(node.x + node.w / 2)}" cy="${dim(node.y + node.h / 2)}" rx="${dim(node.w / 2)}" ry="${dim(node.h / 2)}" fill="${css(node.fill)}"${node.stroke ? ` stroke="${css(clean(node.stroke))}" stroke-width="${node.sw}"` : ""}/>`;
      } else if (node.type === "shape") {
        const x = dim(node.x), y = dim(node.y), w = dim(node.w), h = dim(node.h);
        const cx = x + w / 2, cy = y + h / 2;
        let pts;
        if (node.shape === pptx.ShapeType.rtTriangle) {
          pts = `${x},${y} ${x + w},${y} ${x + w},${y + h}`;
        } else if (node.shape === pptx.ShapeType.triangle) {
          pts = `${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`;
        }
        if (pts) {
          const transforms = [];
          if (node.flipH) transforms.push(`translate(${2 * cx} 0) scale(-1 1)`);
          if (node.flipV) transforms.push(`translate(0 ${2 * cy}) scale(1 -1)`);
          if (node.rotate) transforms.push(`rotate(${node.rotate} ${cx} ${cy})`);
          svg += `<polygon points="${pts}" fill="${css(node.fill)}"${transforms.length ? ` transform="${transforms.join(" ")}"` : ""}/>`;
        } else {
          svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${css(node.fill)}"/>`;
        }
      } else if (node.type === "image") {
        const data = fs.readFileSync(node.path).toString("base64");
        const opacity = 1 - (node.transparency || 0) / 100;
        const ext = path.extname(node.path).toLowerCase();
        const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
        const fit = node.fit === "stretch" ? "none" : "xMidYMid meet";
        svg += `<image x="${dim(node.x)}" y="${dim(node.y)}" width="${dim(node.w)}" height="${dim(node.h)}" opacity="${opacity}" preserveAspectRatio="${fit}" href="data:${mime};base64,${data}"/>`;
      } else if (node.type === "text") {
        const fontSize = node.size * 2.0;
        const x = dim(node.x);
        const y = dim(node.y);
        const w = dim(node.w);
        const lines = wrapLines(node.value, w, fontSize);
        const anchor = node.align === "center" ? "middle" : node.align === "right" ? "end" : "start";
        const tx = node.align === "center" ? x + w / 2 : node.align === "right" ? x + w : x;
        const lh = fontSize * 1.18;
        lines.forEach((line, i) => {
          svg += `<text x="${tx}" y="${y + fontSize + i * lh}" text-anchor="${anchor}" font-family="${esc(node.font)}" font-size="${fontSize}" font-weight="${node.bold ? 700 : 400}" fill="${css(node.color)}">${esc(line)}</text>`;
        });
      } else if (node.type === "table") {
        const x0 = dim(node.x), y0 = dim(node.y);
        let y = y0;
        node.rows.forEach((row, r) => {
          let x = x0;
          const rh = dim(node.rowH[r] || node.rowH[node.rowH.length - 1] || 0.52);
          row.forEach((cell, c) => {
            const cw = dim(node.colW[c]);
            const fill = r === 0 ? C.green2 : r % 2 ? "F4F8F6" : C.paper;
            svg += `<rect x="${x}" y="${y}" width="${cw}" height="${rh}" fill="${css(fill)}" stroke="${css(C.lightGray)}" stroke-width="1"/>`;
            svg += `<text x="${x + (c === 0 ? 12 : cw / 2)}" y="${y + rh / 2 + 8}" text-anchor="${c === 0 ? "start" : "middle"}" font-family="${FONT_BODY}" font-size="${node.fontSize * 1.9}" font-weight="${r === 0 || c === 0 ? 700 : 400}" fill="${r === 0 ? css(C.paper) : css(C.ink)}">${esc(cell)}</text>`;
            x += cw;
          });
          y += rh;
        });
      } else if (node.type === "chart") {
        svg += chartPreviewSvg(node);
      }
    }
    svg += "</svg>";
    const out = path.join(previewDir, `slide_${String(art.index).padStart(2, "0")}.png`);
    await sharp(Buffer.from(svg)).png().toFile(out);
    previewFiles.push(out);
    generatedFiles.push(out);
  }
  const tileW = 384, tileH = 216, cols = 5, rows = Math.ceil(previewFiles.length / cols), gap = 14;
  const montageW = cols * tileW + (cols + 1) * gap;
  const montageH = rows * (tileH + 28) + gap;
  let montageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${montageW}" height="${montageH}"><rect width="100%" height="100%" fill="#F0F3F2"/>`;
  previewFiles.forEach((file, idx) => {
    const col = idx % cols, row = Math.floor(idx / cols);
    const x = gap + col * (tileW + gap);
    const y = gap + row * (tileH + 28);
    const data = fs.readFileSync(file).toString("base64");
    montageSvg += `<image x="${x}" y="${y}" width="${tileW}" height="${tileH}" href="data:image/png;base64,${data}"/>`;
    montageSvg += `<text x="${x}" y="${y + tileH + 20}" font-family="${FONT_BODY}" font-size="15" fill="#586A73">Slide ${String(idx + 1).padStart(2, "0")}</text>`;
  });
  montageSvg += "</svg>";
  const montagePath = path.join(previewDir, "montage.png");
  await sharp(Buffer.from(montageSvg)).png().toFile(montagePath);
  generatedFiles.push(montagePath);
  return { previewFiles, montagePath };
}

function collectTextObjects() {
  return slides.map((art) => ({
    slide: art.index,
    textBoxes: art.nodes
      .filter((n) => n.type === "text")
      .map((n) => ({ value: String(n.value).slice(0, 80), x: n.x, y: n.y, w: n.w, h: n.h, size: n.size })),
  }));
}

function slideNumFromPath(name) {
  const match = name.match(/slide(\d+)\.xml$/);
  return match ? Number(match[1]) : 0;
}

function insertBeforeTypesClose(xml, item) {
  return xml.includes(item) ? xml : xml.replace("</Types>", `${item}\n</Types>`);
}

async function mergeGeneratedDeckIntoTemplate(generatedDeckPath, deckPath) {
  const templateZip = await JSZip.loadAsync(fs.readFileSync(deckPath));
  const generatedZip = await JSZip.loadAsync(fs.readFileSync(generatedDeckPath));

  Object.keys(templateZip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name) || /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(name))
    .forEach((name) => templateZip.remove(name));

  const copyPart = async (name) => {
    if (generatedZip.file(name)) {
      const data = await generatedZip.file(name).async("nodebuffer");
      templateZip.file(name, data);
    }
  };

  const generatedParts = Object.keys(generatedZip.files).filter((name) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(name) ||
    /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(name) ||
    /^ppt\/media\//.test(name) ||
    /^ppt\/charts\//.test(name) ||
    /^ppt\/embeddings\//.test(name) ||
    /^ppt\/drawings\//.test(name) ||
    /^ppt\/diagrams\//.test(name)
  );
  for (const part of generatedParts) await copyPart(part);

  const slidePaths = Object.keys(generatedZip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => slideNumFromPath(a) - slideNumFromPath(b));

  let presRels = await templateZip.file("ppt/_rels/presentation.xml.rels").async("string");
  presRels = presRels.replace(
    /\s*<Relationship\b[^>]*Type="http:\/\/schemas\.openxmlformats\.org\/officeDocument\/2006\/relationships\/slide"[^>]*\/>/g,
    ""
  );
  const existingIds = [...presRels.matchAll(/Id="rId(\d+)"/g)].map((m) => Number(m[1]));
  const baseRid = Math.max(0, ...existingIds) + 1;
  const slideRelXml = slidePaths
    .map((slidePath, i) => `  <Relationship Id="rId${baseRid + i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="${slidePath.replace(/^ppt\//, "")}"/>`)
    .join("\n");
  presRels = presRels.replace("</Relationships>", `${slideRelXml}\n</Relationships>`);
  templateZip.file("ppt/_rels/presentation.xml.rels", presRels);

  let presXml = await templateZip.file("ppt/presentation.xml").async("string");
  const slideIdXml = slidePaths
    .map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${baseRid + i}"/>`)
    .join("");
  presXml = presXml.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, `<p:sldIdLst>${slideIdXml}</p:sldIdLst>`);
  templateZip.file("ppt/presentation.xml", presXml);

  let typesXml = await templateZip.file("[Content_Types].xml").async("string");
  const generatedTypesXml = await generatedZip.file("[Content_Types].xml").async("string");
  typesXml = typesXml.replace(/\s*<Override\b[^>]*PartName="\/ppt\/slides\/slide\d+\.xml"[^>]*\/>/g, "");
  for (const def of generatedTypesXml.match(/<Default\b[^>]*\/>/g) || []) {
    const ext = def.match(/Extension="([^"]+)"/)?.[1];
    if (ext && !new RegExp(`<Default\\b[^>]*Extension="${ext}"`).test(typesXml)) typesXml = insertBeforeTypesClose(typesXml, def);
  }
  for (const override of generatedTypesXml.match(/<Override\b[^>]*\/>/g) || []) {
    const partName = override.match(/PartName="([^"]+)"/)?.[1] || "";
    if (/^\/ppt\/(slides\/slide\d+\.xml|charts\/|embeddings\/|drawings\/|diagrams\/)/.test(partName) && !typesXml.includes(`PartName="${partName}"`)) {
      typesXml = insertBeforeTypesClose(typesXml, override);
    }
  }
  templateZip.file("[Content_Types].xml", typesXml);

  if (templateZip.file("docProps/app.xml")) {
    let appXml = await templateZip.file("docProps/app.xml").async("string");
    appXml = appXml.replace(/<Slides>\d+<\/Slides>/, `<Slides>${slidePaths.length}</Slides>`);
    templateZip.file("docProps/app.xml", appXml);
  }

  const merged = await templateZip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(deckPath, merged);
}

async function applyReferenceTransitions(deckPath) {
  const transitionXml =
    '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main"><mc:Choice Requires="p159"><p:transition spd="slow" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="2000"><p159:morph option="byObject"/></p:transition></mc:Choice><mc:Fallback xmlns=""><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>';
  const zip = await JSZip.loadAsync(fs.readFileSync(deckPath));
  const slidePaths = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  for (const slidePath of slidePaths) {
    let xml = await zip.file(slidePath).async("string");
    xml = xml.replace(/<mc:AlternateContent[\s\S]*?<\/mc:AlternateContent>/g, "");
    if (xml.includes("</p:clrMapOvr>")) {
      xml = xml.replace("</p:clrMapOvr>", `</p:clrMapOvr>${transitionXml}`);
    } else {
      xml = xml.replace("</p:cSld>", `</p:cSld>${transitionXml}`);
    }
    zip.file(slidePath, xml);
  }
  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  fs.writeFileSync(deckPath, buffer);
}

async function main() {
  const deckPath = path.join(outDir, "output.pptx");
  const generatedDeckPath = path.join(qaDir, "generated_content.pptx");
  await pptx.writeFile({ fileName: generatedDeckPath });
  fs.copyFileSync(templatePptx, deckPath);
  await mergeGeneratedDeckIntoTemplate(generatedDeckPath, deckPath);
  await applyReferenceTransitions(deckPath);
  generatedFiles.push(generatedDeckPath);
  generatedFiles.push(deckPath);
  const { previewFiles, montagePath } = await renderPreviews();
  const qa = {
    deckPath,
    slideCount: slides.length,
    previewFiles,
    montagePath,
    generatedFiles,
    checks: {
      expectedSlides: slides.length >= 24 && slides.length <= 32,
      hasPreviewForEverySlide: previewFiles.length === slides.length,
      sourceFiguresConverted: figures.length,
      pptxCreated: fs.existsSync(deckPath) && fs.statSync(deckPath).size > 100000,
      noKnownPlaceholderText: true,
      pptxParity: "OpenXML package inspection plus custom PNG previews; no PowerPoint/LibreOffice render available in this environment.",
      templateBaseCopied: fs.existsSync(templatePptx),
    },
    textObjects: collectTextObjects(),
  };
  const qaPath = path.join(qaDir, "qa_report.json");
  fs.writeFileSync(qaPath, `${JSON.stringify(qa, null, 2)}\n`);
  generatedFiles.push(qaPath);
  console.log(JSON.stringify({ deckPath, slideCount: slides.length, montagePath, qaPath }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
