import pptxgenModule from 'pptxgenjs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM compat
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// pptxgenjs default export compat
const pptxgen = (pptxgenModule as any).default ?? pptxgenModule;

const COLORS = {
  bg: '0F172A',
  bgCard: '1E293B',
  border: '334155',
  text: 'E2E8F0',
  textMuted: '94A3B8',
  textDim: '64748B',
  accent: '38BDF8',
  white: 'F8FAFC',
  red: 'EF4444',
  orange: 'F97316',
  yellow: 'EAB308',
  green: '22C55E',
  purple: 'A78BFA',
  indigo: '6366F1',
  blue: '3B82F6',
};

function createPresentation(): InstanceType<typeof pptxgen> {
  const pptx = new (pptxgen as any)();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'UK House Price Map Team';
  pptx.subject = 'UK House Price Map - Project Presentation';
  pptx.title = 'UK House Price Map';

  // Define dark master slide
  pptx.defineSlideMaster({
    title: 'DARK_MASTER',
    background: { color: COLORS.bg },
    objects: [
      {
        text: {
          text: '',
          options: {
            x: 12.2,
            y: 7,
            w: 1,
            h: 0.4,
            fontSize: 10,
            color: COLORS.textDim,
            align: 'right',
          },
        },
      },
    ],
    slideNumber: { x: 12.2, y: 7, fontSize: 10, color: COLORS.textDim },
  });

  // Title master
  pptx.defineSlideMaster({
    title: 'TITLE_MASTER',
    background: { color: COLORS.bg },
    slideNumber: { x: 12.2, y: 7, fontSize: 10, color: COLORS.textDim },
  });

  addTitleSlide(pptx);
  addProblemSlide(pptx);
  addSolutionSlide(pptx);
  addFeaturesSlide(pptx);
  addPriceTrendSlide(pptx);
  addDaysToSellSlide(pptx);
  addPropertyTypeSlide(pptx);
  addDataSourcesSlide(pptx);
  addArchitectureSlide(pptx);
  addMarketContextSlide(pptx);
  addUserJourneySlide(pptx);
  addRoadmapSlide(pptx);
  addThankYouSlide(pptx);

  return pptx;
}

function addDivider(slide: pptxgen.Slide) {
  slide.addShape('rect' as pptxgen.ShapeType, {
    x: 0.8,
    y: 0.6,
    w: 0.9,
    h: 0.06,
    fill: { color: COLORS.accent },
    rectRadius: 0.03,
  });
}

function addSlideTitle(slide: pptxgen.Slide, title: string) {
  addDivider(slide);
  slide.addText(title, {
    x: 0.8,
    y: 0.8,
    w: 11,
    h: 0.7,
    fontSize: 32,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.white,
  });
}

// --- Slide 1: Title ---
function addTitleSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'TITLE_MASTER' });

  // Decorative circle
  slide.addShape('ellipse' as pptxgen.ShapeType, {
    x: 5.3,
    y: 0.6,
    w: 2.7,
    h: 2.7,
    fill: { color: COLORS.accent },
    // @ts-expect-error opacity is valid
    opacity: 0.08,
  });

  slide.addText('UK House Price Map', {
    x: 1,
    y: 2.0,
    w: 11.3,
    h: 1.2,
    fontSize: 52,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.white,
    align: 'center',
  });

  slide.addText('Interactive choropleth map for property investors', {
    x: 1,
    y: 3.2,
    w: 11.3,
    h: 0.6,
    fontSize: 24,
    fontFace: 'Segoe UI',
    color: COLORS.textMuted,
    align: 'center',
  });

  slide.addText(
    'Visualising 24 million+ Land Registry transactions across\n2,800 postcode districts in England & Wales',
    {
      x: 2,
      y: 4.0,
      w: 9.3,
      h: 1.0,
      fontSize: 17,
      fontFace: 'Segoe UI',
      color: COLORS.textMuted,
      align: 'center',
      lineSpacingMultiple: 1.3,
    }
  );

  // Stat boxes
  const stats = [
    { num: '24M+', label: 'Transactions' },
    { num: '2,800', label: 'Districts' },
    { num: '30 yrs', label: 'History' },
  ];

  stats.forEach((s, i) => {
    const x = 3.0 + i * 2.6;
    slide.addShape('roundRect' as pptxgen.ShapeType, {
      x,
      y: 5.2,
      w: 2.2,
      h: 1.1,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.1,
    });
    slide.addText(s.num, {
      x,
      y: 5.25,
      w: 2.2,
      h: 0.6,
      fontSize: 24,
      fontFace: 'Segoe UI',
      bold: true,
      color: COLORS.accent,
      align: 'center',
    });
    slide.addText(s.label, {
      x,
      y: 5.8,
      w: 2.2,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: COLORS.textMuted,
      align: 'center',
    });
  });

  slide.addText('February 2026', {
    x: 1,
    y: 6.7,
    w: 11.3,
    h: 0.4,
    fontSize: 14,
    fontFace: 'Segoe UI',
    color: COLORS.textDim,
    align: 'center',
  });
}

// --- Slide 2: The Problem ---
function addProblemSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'The Problem');

  slide.addText(
    [
      { text: 'Property investors need to identify growth areas and compare price trends, but existing tools are either ' },
      { text: 'behind paywalls', options: { color: COLORS.accent, bold: true } },
      { text: ', show only ' },
      { text: 'asking prices', options: { color: COLORS.accent, bold: true } },
      { text: ' (not actual sold prices), or lack ' },
      { text: 'geographic granularity', options: { color: COLORS.accent, bold: true } },
      { text: '.' },
    ],
    {
      x: 0.8,
      y: 1.7,
      w: 11.5,
      h: 0.8,
      fontSize: 17,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.4,
    }
  );

  // Left card: Pain Points
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 0.8,
    y: 2.8,
    w: 5.5,
    h: 3.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('Current Pain Points', {
    x: 1.1,
    y: 2.95,
    w: 5,
    h: 0.45,
    fontSize: 18,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    [
      { text: '•  Rightmove/Zoopla show asking prices, not real sale prices', options: { bullet: false } },
      { text: '\n•  No free interactive map of actual transaction data' },
      { text: '\n•  Hard to spot emerging growth areas at a glance' },
      { text: '\n•  Comparing districts requires manual lookup across multiple sites' },
    ],
    {
      x: 1.1,
      y: 3.5,
      w: 5,
      h: 2.8,
      fontSize: 15,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.6,
      valign: 'top',
    }
  );

  // Right card: What Investors Want
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 7,
    y: 2.8,
    w: 5.5,
    h: 3.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('What Investors Want', {
    x: 7.3,
    y: 2.95,
    w: 5,
    h: 0.45,
    fontSize: 18,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    [
      { text: '•  Real sold prices from official government records' },
      { text: '\n•  Visual map to spot growth trends quickly' },
      { text: '\n•  Year-over-year comparisons across districts' },
      { text: '\n•  Breakdown by property type (houses vs flats)' },
    ],
    {
      x: 7.3,
      y: 3.5,
      w: 5,
      h: 2.8,
      fontSize: 15,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.6,
      valign: 'top',
    }
  );
}

// --- Slide 3: Our Solution ---
function addSolutionSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'Our Solution');

  slide.addText(
    [
      { text: 'A free, open-source interactive map powered entirely by ' },
      { text: 'official government data', options: { color: COLORS.accent, bold: true } },
      { text: '.' },
    ],
    {
      x: 0.8,
      y: 1.7,
      w: 11.5,
      h: 0.5,
      fontSize: 17,
      fontFace: 'Segoe UI',
      color: COLORS.text,
    }
  );

  // How it works card
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 0.8,
    y: 2.5,
    w: 5.5,
    h: 4.0,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('How it works', {
    x: 1.1,
    y: 2.65,
    w: 5,
    h: 0.45,
    fontSize: 18,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    [
      { text: '•  Colour-coded map: blue = falling, red = rising' },
      { text: '\n•  Click any district for detailed stats & charts' },
      { text: '\n•  Filter by property type & year range' },
      { text: '\n•  Compare districts side by side' },
      { text: '\n•  Regional average days to sell' },
    ],
    {
      x: 1.1,
      y: 3.2,
      w: 5,
      h: 3.0,
      fontSize: 15,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.6,
      valign: 'top',
    }
  );

  // Map mockup area (right side)
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 7,
    y: 2.5,
    w: 5.5,
    h: 4.0,
    fill: { color: '1A2332' },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('[ Interactive Map Preview ]', {
    x: 7,
    y: 3.3,
    w: 5.5,
    h: 0.5,
    fontSize: 16,
    fontFace: 'Segoe UI',
    color: COLORS.textDim,
    align: 'center',
  });

  // Colored region mockups
  const regions = [
    { x: 8.2, y: 3.0, w: 1.2, h: 0.8, color: COLORS.indigo, label: 'Scotland' },
    { x: 8.0, y: 3.9, w: 1.0, h: 0.6, color: COLORS.red, label: 'NW' },
    { x: 9.2, y: 3.9, w: 1.0, h: 0.6, color: COLORS.orange, label: 'Yorks' },
    { x: 8.5, y: 4.6, w: 1.0, h: 0.6, color: COLORS.orange, label: 'W Mid' },
    { x: 9.7, y: 4.6, w: 1.0, h: 0.6, color: COLORS.yellow, label: 'E Mid' },
    { x: 9.2, y: 5.3, w: 0.9, h: 0.5, color: COLORS.red, label: 'London' },
    { x: 8.0, y: 5.3, w: 1.0, h: 0.6, color: COLORS.green, label: 'SW' },
  ];

  regions.forEach((r) => {
    slide.addShape('roundRect' as pptxgen.ShapeType, {
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fill: { color: r.color },
      // @ts-expect-error opacity valid
      opacity: 0.7,
      rectRadius: 0.05,
    });
    slide.addText(r.label, {
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fontSize: 9,
      fontFace: 'Segoe UI',
      color: COLORS.white,
      align: 'center',
      valign: 'middle',
      bold: true,
    });
  });

  // Sidebar mockup
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 10.8,
    y: 3.0,
    w: 1.4,
    h: 3.2,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.08,
  });
  slide.addText('District: SW1\n\nAvg Price\n£850K\n\nYoY Change\n+3.2%\n\nDays to Sell\n48 days', {
    x: 10.85,
    y: 3.1,
    w: 1.3,
    h: 3.0,
    fontSize: 7,
    fontFace: 'Segoe UI',
    color: COLORS.text,
    valign: 'top',
    lineSpacingMultiple: 1.1,
  });

  // Legend at bottom of map
  const legendItems = [
    { color: COLORS.blue, label: 'Fell' },
    { color: COLORS.yellow, label: 'Flat' },
    { color: COLORS.red, label: 'Rose' },
  ];
  legendItems.forEach((item, i) => {
    const lx = 7.6 + i * 1.5;
    slide.addShape('rect' as pptxgen.ShapeType, {
      x: lx,
      y: 6.15,
      w: 0.25,
      h: 0.18,
      fill: { color: item.color },
      rectRadius: 0.02,
    });
    slide.addText(item.label, {
      x: lx + 0.3,
      y: 6.12,
      w: 1,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Segoe UI',
      color: COLORS.textMuted,
    });
  });
}

// --- Slide 4: Key Features ---
function addFeaturesSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'Key Features');

  const features = [
    { title: 'Choropleth Map', desc: 'Colour-coded districts showing year-over-year price growth. Spot trends at a glance.', color: COLORS.accent },
    { title: 'District Details', desc: 'Click any district for avg price, YoY change, transactions, and days to sell.', color: COLORS.green },
    { title: 'Price Trend Charts', desc: 'Historical price chart per district with adjustable year range.', color: COLORS.purple },
    { title: 'Property Type Filter', desc: 'Filter by Detached, Semi, Terraced, or Flats. Compare by building type.', color: COLORS.orange },
    { title: 'Search & Navigate', desc: 'Search by postcode or area name. The map flies to the selected district.', color: COLORS.yellow },
    { title: 'Compare Districts', desc: 'Side-by-side comparison of two districts for investment evaluation.', color: COLORS.red },
  ];

  features.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * 3.9;
    const y = 1.8 + row * 2.6;

    slide.addShape('roundRect' as pptxgen.ShapeType, {
      x,
      y,
      w: 3.6,
      h: 2.3,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.12,
    });

    // Colored accent bar
    slide.addShape('rect' as pptxgen.ShapeType, {
      x: x + 0.2,
      y: y + 0.2,
      w: 0.5,
      h: 0.06,
      fill: { color: f.color },
      rectRadius: 0.03,
    });

    slide.addText(f.title, {
      x: x + 0.2,
      y: y + 0.35,
      w: 3.2,
      h: 0.4,
      fontSize: 16,
      fontFace: 'Segoe UI',
      bold: true,
      color: COLORS.accent,
    });

    slide.addText(f.desc, {
      x: x + 0.2,
      y: y + 0.8,
      w: 3.2,
      h: 1.3,
      fontSize: 13,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.4,
      valign: 'top',
    });
  });
}

// --- Slide 5: Price Trend Chart ---
function addPriceTrendSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'UK House Price Growth (1995 – 2025)');

  slide.addText('Average house price trend based on HM Land Registry data.', {
    x: 0.8,
    y: 1.7,
    w: 11,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Segoe UI',
    color: COLORS.text,
  });

  // Line chart
  const chartData = [
    {
      name: 'Average Price (£K)',
      labels: ['1995', '1997', '1999', '2001', '2003', '2005', '2007', '2008', '2010', '2012', '2014', '2016', '2018', '2020', '2022', '2024', '2025'],
      values: [62, 68, 78, 95, 135, 190, 210, 215, 168, 170, 195, 215, 230, 245, 260, 275, 270],
    },
  ];

  slide.addChart(pptx.ChartType.line, chartData, {
    x: 0.8,
    y: 2.3,
    w: 11.5,
    h: 4.5,
    showTitle: false,
    showLegend: false,
    lineSize: 3,
    lineSmooth: true,
    lineDataSymbol: 'circle',
    lineDataSymbolSize: 6,
    chartColors: [COLORS.accent],
    plotArea: { fill: { color: COLORS.bgCard } },
    catAxisLabelColor: COLORS.textMuted,
    catAxisLabelFontSize: 10,
    valAxisLabelColor: COLORS.textMuted,
    valAxisLabelFontSize: 10,
    valGridLine: { color: COLORS.border, style: 'dash', size: 0.5 },
    catGridLine: { style: 'none' },
    valAxisNumFmt: '£#,##0K',
    valAxisMinVal: 0,
    valAxisMaxVal: 320,
  });

  slide.addText('Source: HM Land Registry Price Paid Data. UK national average.', {
    x: 0.8,
    y: 6.9,
    w: 11,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: COLORS.textDim,
  });
}

// --- Slide 6: Days to Sell ---
function addDaysToSellSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'Average Days to Sell by Region');

  slide.addText('How long properties take to sell varies dramatically across the UK.', {
    x: 0.8,
    y: 1.7,
    w: 11,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Segoe UI',
    color: COLORS.text,
  });

  // Bar chart
  const chartData = [
    {
      name: 'Days to Sell',
      labels: ['Scotland', 'North West', 'North East', 'Yorkshire', 'East Midlands', 'West Midlands', 'East of England', 'South West', 'London', 'South East', 'Wales'],
      values: [21, 33, 35, 37, 40, 42, 45, 46, 48, 50, 57],
    },
  ];

  slide.addChart(pptx.ChartType.bar, chartData, {
    x: 0.5,
    y: 2.3,
    w: 6.5,
    h: 4.5,
    showTitle: false,
    showLegend: false,
    showValue: true,
    barDir: 'bar',
    barGrouping: 'clustered',
    chartColors: [COLORS.accent],
    plotArea: { fill: { color: COLORS.bgCard } },
    catAxisLabelColor: COLORS.textMuted,
    catAxisLabelFontSize: 10,
    valAxisLabelColor: COLORS.textMuted,
    valAxisLabelFontSize: 10,
    valGridLine: { color: COLORS.border, style: 'dash', size: 0.5 },
    catGridLine: { style: 'none' },
    dataLabelColor: COLORS.white,
    dataLabelFontSize: 9,
  });

  // Key Insights card
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 7.5,
    y: 2.3,
    w: 5,
    h: 2.3,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('Key Insights', {
    x: 7.8,
    y: 2.45,
    w: 4.5,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    '•  2.7x gap between fastest (Scotland, 21d) and slowest (Wales, 57d)\n•  Northern regions sell faster\n•  London not the slowest despite highest prices\n•  Affordable markets attract quicker decisions',
    {
      x: 7.8,
      y: 2.9,
      w: 4.5,
      h: 1.5,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.5,
      valign: 'top',
    }
  );

  // In Our App card
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 7.5,
    y: 4.8,
    w: 5,
    h: 2.0,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('In Our App', {
    x: 7.8,
    y: 4.95,
    w: 4.5,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    'Each district sidebar shows the regional average days to sell, with the region name displayed so investors understand the granularity.',
    {
      x: 7.8,
      y: 5.4,
      w: 4.5,
      h: 1.2,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.4,
      valign: 'top',
    }
  );

  slide.addText('Source: Zoopla House Price Index, January 2026', {
    x: 0.8,
    y: 6.9,
    w: 6,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: COLORS.textDim,
  });
}

// --- Slide 7: Property Type Breakdown ---
function addPropertyTypeSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'Average Price by Property Type');

  slide.addText('Prices vary significantly by building type. Our app breaks down each district.', {
    x: 0.8,
    y: 1.7,
    w: 11,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Segoe UI',
    color: COLORS.text,
  });

  // Bar chart - property prices
  const barData = [
    {
      name: 'Average Price (£K)',
      labels: ['Detached', 'Semi-detached', 'Terraced', 'Flat'],
      values: [450, 310, 245, 210],
    },
  ];

  slide.addChart(pptx.ChartType.bar, barData, {
    x: 0.5,
    y: 2.3,
    w: 5.8,
    h: 4.2,
    showTitle: true,
    title: 'UK Average Prices (2025)',
    titleColor: COLORS.accent,
    titleFontSize: 14,
    showLegend: false,
    showValue: true,
    chartColors: [COLORS.accent],
    plotArea: { fill: { color: COLORS.bgCard } },
    catAxisLabelColor: COLORS.textMuted,
    catAxisLabelFontSize: 11,
    valAxisLabelColor: COLORS.textMuted,
    valAxisLabelFontSize: 10,
    valGridLine: { color: COLORS.border, style: 'dash', size: 0.5 },
    catGridLine: { style: 'none' },
    dataLabelColor: COLORS.white,
    dataLabelFontSize: 10,
    valAxisNumFmt: '£#,##0K',
  });

  // Pie/Donut chart - transaction share
  const pieData = [
    {
      name: 'Share of Transactions',
      labels: ['Terraced', 'Semi-detached', 'Flat', 'Detached'],
      values: [32, 26, 24, 18],
    },
  ];

  slide.addChart(pptx.ChartType.doughnut, pieData, {
    x: 6.8,
    y: 2.3,
    w: 5.8,
    h: 4.2,
    showTitle: true,
    title: 'Share of Transactions',
    titleColor: COLORS.accent,
    titleFontSize: 14,
    showLegend: true,
    legendPos: 'r',
    legendColor: COLORS.text,
    legendFontSize: 11,
    showPercent: true,
    dataLabelColor: COLORS.white,
    chartColors: [COLORS.green, COLORS.purple, COLORS.orange, COLORS.accent],
  });

  slide.addText('Approximate figures from Land Registry data', {
    x: 0.8,
    y: 6.7,
    w: 11,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: COLORS.textDim,
  });
}

// --- Slide 8: Data Sources ---
function addDataSourcesSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'Data Sources');

  slide.addText(
    [
      { text: 'All data is ' },
      { text: 'free, legal, and open', options: { color: COLORS.accent, bold: true } },
      { text: ' under government licences.' },
    ],
    {
      x: 0.8,
      y: 1.7,
      w: 11,
      h: 0.4,
      fontSize: 17,
      fontFace: 'Segoe UI',
      color: COLORS.text,
    }
  );

  const rows: pptxgen.TableRow[] = [
    [
      { text: 'Source', options: { fontSize: 12, color: COLORS.textMuted, bold: true, fill: { color: COLORS.bg } } },
      { text: 'What It Provides', options: { fontSize: 12, color: COLORS.textMuted, bold: true, fill: { color: COLORS.bg } } },
      { text: 'Coverage', options: { fontSize: 12, color: COLORS.textMuted, bold: true, fill: { color: COLORS.bg } } },
    ],
    [
      { text: 'HM Land Registry', options: { fontSize: 14, color: COLORS.accent, bold: true } },
      { text: 'Actual sold prices, dates, property types, postcodes', options: { fontSize: 14, color: COLORS.text } },
      { text: 'England & Wales, 1995–present', options: { fontSize: 14, color: COLORS.text } },
    ],
    [
      { text: 'Zoopla HPI', options: { fontSize: 14, color: COLORS.accent, bold: true } },
      { text: 'Regional average days to sell', options: { fontSize: 14, color: COLORS.text } },
      { text: '11 UK regions, monthly', options: { fontSize: 14, color: COLORS.text } },
    ],
    [
      { text: 'OpenStreetMap', options: { fontSize: 14, color: COLORS.accent, bold: true } },
      { text: 'Map tiles for the interactive base map', options: { fontSize: 14, color: COLORS.text } },
      { text: 'Global, real-time', options: { fontSize: 14, color: COLORS.text } },
    ],
    [
      { text: 'postcodes.io', options: { fontSize: 14, color: COLORS.accent, bold: true } },
      { text: 'Postcode geocoding (lat/lng coordinates)', options: { fontSize: 14, color: COLORS.text } },
      { text: 'All UK postcodes', options: { fontSize: 14, color: COLORS.text } },
    ],
  ];

  slide.addTable(rows, {
    x: 0.8,
    y: 2.5,
    w: 11.5,
    colW: [3, 5.5, 3],
    border: { type: 'solid', pt: 0.5, color: COLORS.border },
    fill: { color: COLORS.bgCard },
    fontFace: 'Segoe UI',
    rowH: [0.5, 0.7, 0.7, 0.7, 0.7],
  });
}

// --- Slide 9: Architecture ---
function addArchitectureSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'Architecture');

  slide.addText('No backend server required. A static site that can be hosted anywhere.', {
    x: 0.8,
    y: 1.7,
    w: 11,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Segoe UI',
    color: COLORS.text,
  });

  // Architecture flow (left side)
  const steps = [
    { label: 'Land Registry CSV', sub: '4.3 GB • 24M+ rows • Downloaded once' },
    { label: 'Node.js Processing Pipeline', sub: 'Stream CSV → Group by district → Calculate stats' },
    { label: 'Static Files', sub: 'districts-summary.geojson + per-district trend JSONs' },
    { label: 'React SPA', sub: 'Fetch on demand → Leaflet choropleth → Interactive UI' },
  ];

  steps.forEach((s, i) => {
    const y = 2.5 + i * 1.2;
    slide.addShape('roundRect' as pptxgen.ShapeType, {
      x: 0.8,
      y,
      w: 5.8,
      h: 0.85,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.08,
    });
    slide.addText(s.label, {
      x: 1.0,
      y,
      w: 5.4,
      h: 0.45,
      fontSize: 14,
      fontFace: 'Segoe UI',
      bold: true,
      color: COLORS.white,
      valign: 'bottom',
    });
    slide.addText(s.sub, {
      x: 1.0,
      y: y + 0.4,
      w: 5.4,
      h: 0.4,
      fontSize: 11,
      fontFace: 'Segoe UI',
      color: COLORS.textMuted,
      valign: 'top',
    });

    // Arrow between steps
    if (i < steps.length - 1) {
      slide.addText('↓', {
        x: 3.4,
        y: y + 0.85,
        w: 0.6,
        h: 0.35,
        fontSize: 18,
        color: COLORS.textDim,
        align: 'center',
      });
    }
  });

  // Tech stack (right side)
  slide.addText('Tech Stack', {
    x: 7.5,
    y: 2.5,
    w: 5,
    h: 0.45,
    fontSize: 18,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });

  const techs = ['React 19', 'TypeScript 5.9', 'Vite 7', 'Tailwind CSS 4', 'Leaflet', 'React-Leaflet', 'Recharts', 'Node.js', 'csv-parser'];
  techs.forEach((t, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    slide.addText(t, {
      x: 7.5 + col * 1.7,
      y: 3.1 + row * 0.65,
      w: 1.5,
      h: 0.5,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      align: 'center',
      valign: 'middle',
      shape: 'roundRect' as pptxgen.ShapeType,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.08,
    });
  });

  slide.addText(
    'All dependencies are free and open-source. Zero hosting cost on static platforms like GitHub Pages or Vercel.',
    {
      x: 7.5,
      y: 5.3,
      w: 5,
      h: 0.8,
      fontSize: 13,
      fontFace: 'Segoe UI',
      color: COLORS.textMuted,
      lineSpacingMultiple: 1.4,
    }
  );
}

// --- Slide 10: Market Context ---
function addMarketContextSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'UK Housing Market Context');

  slide.addText('Data as of January 2026 from official sources.', {
    x: 0.8,
    y: 1.7,
    w: 11,
    h: 0.4,
    fontSize: 15,
    fontFace: 'Segoe UI',
    color: COLORS.text,
  });

  // 3 stat cards
  const stats = [
    { num: '£269,800', label: 'UK average house price', color: COLORS.accent },
    { num: '+1.2%', label: 'Annual price change', color: COLORS.green },
    { num: '~40 days', label: 'UK average time to sell', color: COLORS.accent },
  ];

  stats.forEach((s, i) => {
    const x = 0.8 + i * 3.9;
    slide.addShape('roundRect' as pptxgen.ShapeType, {
      x,
      y: 2.4,
      w: 3.6,
      h: 1.4,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.12,
    });
    slide.addText(s.num, {
      x,
      y: 2.45,
      w: 3.6,
      h: 0.8,
      fontSize: 30,
      fontFace: 'Segoe UI',
      bold: true,
      color: s.color,
      align: 'center',
      valign: 'bottom',
    });
    slide.addText(s.label, {
      x,
      y: 3.2,
      w: 3.6,
      h: 0.5,
      fontSize: 13,
      fontFace: 'Segoe UI',
      color: COLORS.textMuted,
      align: 'center',
    });
  });

  // Regional Variation card
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 0.8,
    y: 4.2,
    w: 5.5,
    h: 2.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('Regional Variation', {
    x: 1.1,
    y: 4.35,
    w: 5,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    '•  Scotland: fastest to sell (21 days avg)\n•  North West: strongest growth, 6 of top 10 postcodes\n•  Wales: slowest to sell (57 days avg)\n•  London: highest prices but moderate growth',
    {
      x: 1.1,
      y: 4.8,
      w: 5,
      h: 2.0,
      fontSize: 13,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.6,
      valign: 'top',
    }
  );

  // Why This Tool Matters card
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 7,
    y: 4.2,
    w: 5.5,
    h: 2.8,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('Why This Tool Matters', {
    x: 7.3,
    y: 4.35,
    w: 5,
    h: 0.4,
    fontSize: 16,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    '•  Regional performance varies dramatically\n•  Affordable areas are outperforming expensive ones\n•  Investors need granular, postcode-level visibility\n•  Our map makes these patterns visible instantly',
    {
      x: 7.3,
      y: 4.8,
      w: 5,
      h: 2.0,
      fontSize: 13,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.6,
      valign: 'top',
    }
  );
}

// --- Slide 11: User Journey ---
function addUserJourneySlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'User Journey');

  const steps = [
    { num: '1', title: 'Explore the Map', desc: 'Open the app to see a colour-coded map. Blue = falling prices, red = rising. Pan and zoom to explore.' },
    { num: '2', title: 'Click a District', desc: 'Click any district to open the sidebar with avg price, YoY change, transactions, and days to sell.' },
    { num: '3', title: 'Analyse Trends', desc: 'View the historical price chart. Adjust the year range. See property type breakdown.' },
    { num: '4', title: 'Filter & Compare', desc: 'Filter by property type. Compare two districts side by side. Search for specific postcodes.' },
  ];

  steps.forEach((s, i) => {
    const x = 0.8 + i * 3.1;
    const y = 2.0;

    slide.addShape('roundRect' as pptxgen.ShapeType, {
      x,
      y,
      w: 2.8,
      h: 4.5,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.12,
    });

    // Number circle
    slide.addShape('ellipse' as pptxgen.ShapeType, {
      x: x + 0.85,
      y: y + 0.3,
      w: 1.1,
      h: 1.1,
      fill: { color: COLORS.bg },
      line: { color: COLORS.accent, width: 2 },
    });
    slide.addText(s.num, {
      x: x + 0.85,
      y: y + 0.3,
      w: 1.1,
      h: 1.1,
      fontSize: 30,
      fontFace: 'Segoe UI',
      bold: true,
      color: COLORS.accent,
      align: 'center',
      valign: 'middle',
    });

    slide.addText(s.title, {
      x: x + 0.2,
      y: y + 1.6,
      w: 2.4,
      h: 0.5,
      fontSize: 16,
      fontFace: 'Segoe UI',
      bold: true,
      color: COLORS.accent,
      align: 'center',
    });

    slide.addText(s.desc, {
      x: x + 0.2,
      y: y + 2.2,
      w: 2.4,
      h: 2.0,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.5,
      valign: 'top',
    });
  });
}

// --- Slide 12: Roadmap ---
function addRoadmapSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });
  addSlideTitle(slide, 'Future Roadmap');

  // Short Term card
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 0.8,
    y: 1.8,
    w: 5.5,
    h: 4.5,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('Short Term', {
    x: 1.1,
    y: 1.95,
    w: 5,
    h: 0.45,
    fontSize: 18,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    '•  EPC data integration (floor area, energy ratings)\n•  Price-per-square-metre calculations\n•  Links to Rightmove/Zoopla for current listings\n•  Mobile-responsive layout',
    {
      x: 1.1,
      y: 2.5,
      w: 5,
      h: 3.5,
      fontSize: 15,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.8,
      valign: 'top',
    }
  );

  // Long Term card
  slide.addShape('roundRect' as pptxgen.ShapeType, {
    x: 7,
    y: 1.8,
    w: 5.5,
    h: 4.5,
    fill: { color: COLORS.bgCard },
    line: { color: COLORS.border, width: 1 },
    rectRadius: 0.12,
  });
  slide.addText('Long Term', {
    x: 7.3,
    y: 1.95,
    w: 5,
    h: 0.45,
    fontSize: 18,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.accent,
  });
  slide.addText(
    '•  Rental yield estimates\n•  Transport links and amenity scoring\n•  Investment hotspot prediction model\n•  Scotland coverage (Registers of Scotland)',
    {
      x: 7.3,
      y: 2.5,
      w: 5,
      h: 3.5,
      fontSize: 15,
      fontFace: 'Segoe UI',
      color: COLORS.text,
      lineSpacingMultiple: 1.8,
      valign: 'top',
    }
  );
}

// --- Slide 13: Thank You ---
function addThankYouSlide(pptx: pptxgen) {
  const slide = pptx.addSlide({ masterName: 'TITLE_MASTER' });

  // Decorative circles
  slide.addShape('ellipse' as pptxgen.ShapeType, {
    x: 5.65,
    y: 0.4,
    w: 2,
    h: 2,
    fill: { color: COLORS.accent },
    // @ts-expect-error opacity valid
    opacity: 0.05,
  });
  slide.addShape('ellipse' as pptxgen.ShapeType, {
    x: 5.85,
    y: 0.6,
    w: 1.6,
    h: 1.6,
    fill: { color: COLORS.accent },
    // @ts-expect-error opacity valid
    opacity: 0.08,
  });

  slide.addText('Thank You', {
    x: 1,
    y: 2.2,
    w: 11.3,
    h: 1,
    fontSize: 52,
    fontFace: 'Segoe UI',
    bold: true,
    color: COLORS.white,
    align: 'center',
  });

  slide.addText('UK House Price Map', {
    x: 1,
    y: 3.2,
    w: 11.3,
    h: 0.6,
    fontSize: 24,
    fontFace: 'Segoe UI',
    color: COLORS.textMuted,
    align: 'center',
  });

  // 3 summary stat cards
  const stats = [
    { num: 'Free & Open', label: 'Government data, no paywalls' },
    { num: 'No Backend', label: 'Static site, zero hosting cost' },
    { num: '24M+ Sales', label: '30 years of real transactions' },
  ];

  stats.forEach((s, i) => {
    const x = 2 + i * 3.2;
    slide.addShape('roundRect' as pptxgen.ShapeType, {
      x,
      y: 4.2,
      w: 2.8,
      h: 1.5,
      fill: { color: COLORS.bgCard },
      line: { color: COLORS.border, width: 1 },
      rectRadius: 0.1,
    });
    slide.addText(s.num, {
      x,
      y: 4.25,
      w: 2.8,
      h: 0.8,
      fontSize: 20,
      fontFace: 'Segoe UI',
      bold: true,
      color: COLORS.accent,
      align: 'center',
      valign: 'bottom',
    });
    slide.addText(s.label, {
      x,
      y: 5.0,
      w: 2.8,
      h: 0.6,
      fontSize: 11,
      fontFace: 'Segoe UI',
      color: COLORS.textMuted,
      align: 'center',
    });
  });

  slide.addText('github.com/vsohr/openmap-house-prices', {
    x: 1,
    y: 6.2,
    w: 11.3,
    h: 0.5,
    fontSize: 16,
    fontFace: 'Segoe UI',
    color: COLORS.accent,
    align: 'center',
  });
}

// --- Main ---
async function main() {
  const pptx = createPresentation();
  const outPath = resolve(__dirname, '..', 'docs', 'UK-House-Price-Map-Presentation.pptx');
  await pptx.writeFile({ fileName: outPath });
  console.log(`Presentation saved to: ${outPath}`);
}

main().catch((err) => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
