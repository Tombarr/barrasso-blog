const COLOR = '#000000';

function secureRandomFloat() {
  const randomUint32 = new Uint32Array(1);
  window.crypto.getRandomValues(randomUint32);
  const u32Max = 0xffffffff;
  return randomUint32[0] / (u32Max + 1);
}

function random() {
  if ('crypto' in window && typeof window.crypto.getRandomValues === 'function') {
    return secureRandomFloat();
  }

  return Math.random();
}

function getRandomNumInclusive(min, max) {
  return random() * (max - min) + min;
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(random() * (maxFloored - minCeiled + 1) + minCeiled);
}

// Base dimensions: 16 units wide, 32 units tall (2:1 ratio)
const BASE_WIDTH = 16;
const BASE_HEIGHT = 32;

/**
 * Type 1: Simple triangular pine trees (top-left)
 */
function drawPineTree1(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();

  // Triangle outline
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x, y + h * 0.75);
  ctx.lineTo(x + w, y + h * 0.75);
  ctx.closePath();
  ctx.stroke();

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.75);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
}

/**
 * Type 2: Detailed evergreen with horizontal branches (top-right)
 */
function drawPineTree2(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Branches (horizontal lines with slight angle)
  const branchLevels = 8;
  for (let i = 0; i < branchLevels; i++) {
    const yPos = y + (i / branchLevels) * h * 0.85 - h * 0.075;
    const branchWidth = (w * 0.65) * (i / (branchLevels + 2));

    ctx.beginPath();
    ctx.moveTo(x + w / 2 - branchWidth, yPos);
    ctx.lineTo(x + w / 2 + branchWidth, yPos);
    ctx.stroke();
  }
}

/**
 * Type 3: Layered triangular pine (middle-left)
 */
function drawPineTree3(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Three layered triangular sections
  const layers = [
    { yStart: 0.05, height: 0.25, width: 0.5 },
    { yStart: 0.3, height: 0.25, width: 0.4 },
    { yStart: 0.55, height: 0.25, width: 0.3 }
  ];

  layers.forEach(layer => {
    const yTop = y + h * layer.yStart;
    const yBottom = y + h * (layer.yStart + layer.height);
    const widthAtBottom = w * (layer.yStart + layer.height + 0.2);

    ctx.beginPath();
    ctx.moveTo(x + w * layer.width, yTop);
    ctx.lineTo(x + w / 2 - widthAtBottom / 2, yBottom);
    ctx.lineTo(x + w / 2 + widthAtBottom / 2, yBottom);
    ctx.lineTo(x + w * (1 - layer.width), yTop);
    ctx.stroke();
  });

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.8);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
}

/**
 * Type 4: Dense evergreen with many small branches (middle-right)
 */
function drawPineTree4(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.1);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Many diagonal branch lines creating dense appearance
  const branches = 8;
  for (let i = 0; i < branches; i++) {
    const yPos = y + (i / branches) * h * 0.8 + h * 0.1;
    const branchWidth = (w * 0.65) * (i / (branches + 3));

    // Left branch
    ctx.beginPath();
    ctx.moveTo(x + w / 2, yPos);
    ctx.lineTo(x + w / 2 - branchWidth, yPos + h * 0.04);
    ctx.stroke();

    // Right branch
    ctx.beginPath();
    ctx.moveTo(x + w / 2, yPos);
    ctx.lineTo(x + w / 2 + branchWidth, yPos + h * 0.04);
    ctx.stroke();
  }
}

/**
 * Type 5: Horizontal layered branches (bottom-left)
 */
function drawPineTree5(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.1);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Horizontal branch layers with small verticals
  const layers = 7;
  for (let i = 0; i < layers; i++) {
    const yPos = y + (i / layers) * h * 0.75 + h * 0.15;
    const branchWidth = (w * 0.65) * (i / (layers + 2));

    // Horizontal branch
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - branchWidth, yPos);
    ctx.lineTo(x + w / 2 + branchWidth, yPos);
    ctx.stroke();

    // Small vertical tips at ends
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - branchWidth, yPos);
    ctx.lineTo(x + w / 2 - branchWidth, yPos - h * 0.05);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + w / 2 + branchWidth, yPos);
    ctx.lineTo(x + w / 2 + branchWidth, yPos - h * 0.05);
    ctx.stroke();
  }
}

/**
 * Type 6: Detailed evergreen with horizontal branches, short trunk (top-right)
 */
 function drawPineTree6(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h);
  ctx.lineTo(x + w / 2, y + h * 0.65);
  ctx.stroke();

  // Branches (horizontal lines with slight angle)
  const branchLevels = 7;
  for (let i = 0; i < branchLevels; i++) {
    const yPos = y + (i / branchLevels) * h * 0.85 - h * 0.075;
    const branchWidth = (w * 0.85) * (i / (branchLevels + 2));

    ctx.beginPath();
    ctx.moveTo(x + w / 2 - branchWidth, yPos);
    ctx.lineTo(x + w / 2 + branchWidth, yPos);
    ctx.stroke();
  }
}

/**
 * Type 7: Detailed evergreen with varied horizontal branches (top-right)
 */
 function drawPineTree7(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h);
  ctx.lineTo(x + w / 2, y + h * 0.65);
  ctx.stroke();

  const branchWidths = [0.2, 0.5, 0.8, 0.45, 0.7, 0.55, 0.4];

  // Branches (horizontal lines with slight angle)
  const branchLevels = branchWidths.length;
  for (let i = 0; i < branchLevels; i++) {
    const yPos = y + (i / branchLevels) * h * 0.7 + h * 0.05;
    const branchWidth = w * branchWidths[i];

    ctx.beginPath();
    ctx.moveTo(x + w / 2 - branchWidth, yPos);
    ctx.lineTo(x + w / 2 + branchWidth, yPos);
    ctx.stroke();
  }
}

/**
 * Position 1: Simple evergreen with branches (top-left, first)
 */
 function drawPineTree8(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.15);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Upward angled branches
  const branches = 7;
  for (let i = 0; i < branches; i++) {
    const yPos = y + (i / branches) * h * 0.75 + h * 0.2;
    const branchWidth = (w * 0.75) * (i / (branches + 2));

    // Left branch - angled upward
    ctx.beginPath();
    ctx.moveTo(x + w / 2, yPos);
    ctx.lineTo(x + w / 2 - branchWidth, yPos - h * 0.05);
    ctx.stroke();

    // Right branch - angled upward
    ctx.beginPath();
    ctx.moveTo(x + w / 2, yPos);
    ctx.lineTo(x + w / 2 + branchWidth, yPos - h * 0.05);
    ctx.stroke();
  }
}

/**
 * Position 9: Rounded/capsule shaped trees (middle row, third)
 */
function drawPineTree9(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Rounded capsule top
  const capsuleWidth = w * 0.5;
  const capsuleHeight = h * 0.65;
  const radius = capsuleWidth / 2;

  ctx.beginPath();
  // Top semicircle
  ctx.arc(x + w / 2, y + radius, radius, Math.PI, 0, false);
  // Right side
  ctx.lineTo(x + w / 2 + radius, y + capsuleHeight - radius);
  // Bottom semicircle
  ctx.arc(x + w / 2, y + capsuleHeight - radius, radius, 0, Math.PI, false);
  // Left side
  ctx.closePath();
  ctx.stroke();

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + capsuleHeight);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();
}

/**
 * Position 15: Angular zigzag evergreen (bottom row, last)
 */
 function drawPineTree10(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.75);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Zigzag angular branches
  const layers = 6;
  for (let i = 0; i < layers; i++) {
    const yPos = y + (i / layers) * h * 0.75 + h * 0.15;
    const branchWidth = (w * 0.5) * (i / layers);
    const segmentHeight = h * 0.05;

    // Left branch with zigzag
    ctx.beginPath();
    ctx.moveTo(x + w / 2, yPos);
    ctx.lineTo(x + w / 2 - branchWidth * 0.5, yPos - segmentHeight);
    ctx.lineTo(x + w / 2 - branchWidth, yPos);
    ctx.stroke();

    // Right branch with zigzag
    ctx.beginPath();
    ctx.moveTo(x + w / 2, yPos);
    ctx.lineTo(x + w / 2 + branchWidth * 0.5, yPos - segmentHeight);
    ctx.lineTo(x + w / 2 + branchWidth, yPos);
    ctx.stroke();
  }
}

/**
 * Deciduous Position 1: Circular canopy with branches
 */
 function drawDeciduousTree1(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  const trunkHeight = h * 0.4;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.6);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Circular canopy
  const canopyRadius = w * 0.65;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.2, canopyRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Branch structure inside canopy
  const branchStart = y + h * 0.3;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.6);
  ctx.lineTo(x + w / 2, branchStart - canopyRadius * 0.5);
  ctx.stroke();

  // Left branches
  ctx.beginPath();
  ctx.moveTo(x + w / 2, branchStart);
  ctx.lineTo(x + w / 2 - canopyRadius * 0.5, branchStart - canopyRadius * 0.3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w / 2 - canopyRadius * 0.5, branchStart - canopyRadius * 0.3);
  ctx.lineTo(x + w / 2 - canopyRadius * 0.7, branchStart - canopyRadius * 0.5);
  ctx.stroke();

  // Right branches
  ctx.beginPath();
  ctx.moveTo(x + w / 2, branchStart);
  ctx.lineTo(x + w / 2 + canopyRadius * 0.5, branchStart - canopyRadius * 0.3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w / 2 + canopyRadius * 0.5, branchStart - canopyRadius * 0.3);
  ctx.lineTo(x + w / 2 + canopyRadius * 0.7, branchStart - canopyRadius * 0.5);
  ctx.stroke();
}

/**
 * Deciduous Position 4: Oval/elliptical canopy with branches
 */
 function drawDeciduousTree4(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.6);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Elliptical canopy
  const radiusX = w * 0.45;
  const radiusY = h * 0.4;
  const centerY = y + h * 0.3;

  ctx.beginPath();
  ctx.ellipse(x + w / 2, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Branch structure
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.6);
  ctx.lineTo(x + w / 2, centerY);
  ctx.stroke();

  // Left branch
  ctx.beginPath();
  ctx.moveTo(x + w / 2, centerY);
  ctx.lineTo(x + w / 2 - radiusX * 0.4, centerY - radiusY * 0.3);
  ctx.stroke();

  // Right branch
  ctx.beginPath();
  ctx.moveTo(x + w / 2, centerY);
  ctx.lineTo(x + w / 2 + radiusX * 0.4, centerY - radiusY * 0.3);
  ctx.stroke();
}

/**
 * Deciduous Position 9: Cloud-like rounded canopy
 */
function drawDeciduousTree9(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.65);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Cloud-like canopy with multiple arcs
  const canopyY = y + h * 0.35;
  const r1 = w * 0.45;
  const r2 = w * 0.4;
  const r3 = w * 0.35;

  ctx.beginPath();
  // Left bump
  ctx.arc(x + w * 0.2, canopyY, r2, Math.PI * 2.2, Math.PI * 3.5);
  ctx.stroke();
  ctx.beginPath();

  // Top bump
  ctx.arc(x + w / 2, canopyY - r1 * 0.8, r1, Math.PI * 1, Math.PI * 2.2);
  ctx.stroke();
  ctx.beginPath();

  // Right bump
  ctx.arc(x + w * 0.8, canopyY, r3, Math.PI * 1.65, Math.PI * 3);
  ctx.stroke();

  // Simple trunk line inside
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.65);
  ctx.lineTo(x + w / 2, canopyY + r1 * 0.5);
  ctx.stroke();
}

/**
 * Deciduous Position 2: Rounded rectangle canopy with branches
 */
function drawDeciduousTree2(ctx, { x, y }, size, color) {
  const w = BASE_WIDTH * size;
  const h = BASE_HEIGHT * size;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  // Trunk
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.65);
  ctx.lineTo(x + w / 2, y + h);
  ctx.stroke();

  // Rounded rectangle canopy
  const canopyWidth = w * 0.8;
  const canopyHeight = h * 0.65;
  const cornerRadius = w * 0.25;
  const canopyX = x + w * 0.1;
  const canopyY = y + h * 0.05;

  ctx.beginPath();
  ctx.moveTo(canopyX + cornerRadius, canopyY);
  ctx.lineTo(canopyX + canopyWidth - cornerRadius, canopyY);
  ctx.arcTo(canopyX + canopyWidth, canopyY, canopyX + canopyWidth, canopyY + cornerRadius, cornerRadius);
  ctx.lineTo(canopyX + canopyWidth, canopyY + canopyHeight - cornerRadius);
  ctx.arcTo(canopyX + canopyWidth, canopyY + canopyHeight, canopyX + canopyWidth - cornerRadius, canopyY + canopyHeight, cornerRadius);
  ctx.lineTo(canopyX + cornerRadius, canopyY + canopyHeight);
  ctx.arcTo(canopyX, canopyY + canopyHeight, canopyX, canopyY + canopyHeight - cornerRadius, cornerRadius);
  ctx.lineTo(canopyX, canopyY + cornerRadius);
  ctx.arcTo(canopyX, canopyY, canopyX + cornerRadius, canopyY, cornerRadius);
  ctx.stroke();

  // Branch structure
  const branchBase = y + h * 0.65;
  const branchMid = y + h * 0.35;

  ctx.beginPath();
  ctx.moveTo(x + w / 2, branchBase);
  ctx.lineTo(x + w / 2, branchMid);
  ctx.stroke();

  // Left branch
  ctx.beginPath();
  ctx.moveTo(x + w / 2, branchMid);
  ctx.lineTo(x + w * 0.3, branchMid - h * 0.1);
  ctx.stroke();

  // Right branch
  ctx.beginPath();
  ctx.moveTo(x + w / 2, branchMid);
  ctx.lineTo(x + w * 0.7, branchMid - h * 0.1);
  ctx.stroke();
}

function shuffleArray(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = clone[i];
      clone[i] = clone[j];
      clone[j] = temp;
  }
  return clone;
}

const trees = shuffleArray([
  drawPineTree1,
  drawPineTree2,
  drawPineTree3,
  drawPineTree4,
  drawPineTree5,
  drawPineTree6,
  drawPineTree7,
  drawPineTree8,
  drawPineTree9,
  drawDeciduousTree1,
  drawDeciduousTree2,
  drawDeciduousTree4,
  drawDeciduousTree9
]);

function prepareCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.translate(0.5, 0.5);
  const dpi = Math.max(1, window.devicePixelRatio);
  const scale = dpi * 2;
  const width = canvas.width;
  const height = canvas.height;
  canvas.style.width = Math.floor(width / scale) + "px";
  canvas.style.height = Math.floor(height / scale) + "px";
  ctx.width = width * scale;
  ctx.height = height * scale;
  ctx.scale(scale, scale);

  return ctx;
}

function fillCanvas(canvas) {
  const ctx = prepareCanvas(canvas);

  const top = 20;
  const repeatLimit = 20;

  let previousX = 0;
  let previousR = -1;
  const numberOfTrees = getRandomIntInclusive(12, 16);
  for (let i = 0; i < numberOfTrees; i++) {
    // Avoid repeating trees
    let r = previousR;
    let repeatIndex = 0;
    while (r === previousR && repeatIndex < repeatLimit) {
      r = getRandomIntInclusive(0, trees.length - 1);
    }

    const scale = getRandomNumInclusive(0.7, 1.3);
    const deltaX = getRandomIntInclusive(BASE_WIDTH * 0.85, BASE_WIDTH * 1.25);
    const drawTree = trees[r];

    drawTree(ctx, { x: previousX + deltaX, y: top + BASE_HEIGHT * (1 - scale) }, scale, COLOR);
    previousX += deltaX;
  }

  ctx.strokeStyle = COLOR;
  ctx.lineWidth = 1;

  // Ground line
  const canvasWidth = previousX + BASE_WIDTH * 2;
  ctx.beginPath();
  ctx.moveTo(0, top + BASE_HEIGHT);
  ctx.lineTo(canvasWidth, top + BASE_HEIGHT);
  ctx.stroke();

  ctx.translate(-0.5, -0.5);

  // Constrain to center
  canvas.parentNode.style.maxWidth = canvasWidth + 'px';
}

function fillAllCanvases() {
  const canvases = Array.from(document.querySelectorAll('canvas.tree-divider'));
  canvases.forEach(fillCanvas);
}

requestAnimationFrame(fillAllCanvases);
