const defaultColor = "rgba(0, 0, 0, 0.8)";

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

function drawDividers(ctx, color = defaultColor) {
  // Calculate how many repetitions we need
  const repeatCount = Math.ceil(ctx.canvas.width / ctx.canvas.height) + 1;

  for (let i = 1; i < repeatCount; i++) {
    const lineOffset = ctx.canvas.height * i;

    // Draw a vertical line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.moveTo(lineOffset, 0);
    ctx.lineTo(lineOffset, 0 + ctx.canvas.height);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawVerticalLines(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const lineCount = 3;

  for (let i = 1; i <= lineCount; i++) {
    const r = getRandomIntInclusive(-2, 2);
    const lineOffset = r + x + (i * ctx.canvas.height) / (lineCount + 1);

    // Draw a vertical line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.moveTo(lineOffset, 0);
    ctx.lineTo(lineOffset, 0 + ctx.canvas.height);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawHorizontalLines(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const lineCount = 4;

  for (let i = 1; i <= lineCount; i++) {
    const r = getRandomIntInclusive(-2, 2);
    const lineOffset = r + (i * ctx.canvas.height) / (lineCount + 1);

    // Draw a horizontal line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.moveTo(x, lineOffset);
    ctx.lineTo(x + ctx.canvas.height, lineOffset);
    ctx.closePath();
    ctx.stroke();
  }
}

function drawTrianglesDown(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const triangleCount = 4;

  for (let i = 0; i < triangleCount; i++) {
    const r = getRandomIntInclusive(-2, 2);
    const top = r + (i * ctx.canvas.height) / triangleCount;
    const bottom = r + ((i + 1) * ctx.canvas.height) / triangleCount;
    const middle = x + ctx.canvas.height / 2;
    const end = x + ctx.canvas.height;

    // Draw a triangle line
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x, top);
    ctx.lineTo(end, top);
    ctx.lineTo(middle, bottom);
    ctx.lineTo(x, top);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTrianglesUp(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const triangleCount = 4;

  for (let i = 0; i < triangleCount; i++) {
    const r = getRandomIntInclusive(-2, 2);
    const top = r + (i * ctx.canvas.height) / triangleCount;
    const bottom = r + ((i + 1) * ctx.canvas.height) / triangleCount;
    const middle = x + ctx.canvas.height / 2;
    const end = x + ctx.canvas.height;

    // Draw a triangle line
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(middle, top);
    ctx.lineTo(end, bottom);
    ctx.lineTo(x, bottom);
    ctx.lineTo(middle, top);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTallTriangles(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const triangleCount = 4;

  for (let i = 0; i < triangleCount; i++) {
    const r = getRandomIntInclusive(-1, 1);
    const start = r + x + (i * ctx.canvas.height) / triangleCount;
    const end = r + x + ((i + 1) * ctx.canvas.height) / triangleCount;

    // Draw a triangle line
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(start, 0);
    ctx.lineTo(start, ctx.canvas.height);
    ctx.lineTo(end, ctx.canvas.height);
    ctx.lineTo(start, 0);
    ctx.closePath();
    ctx.fill();
  }
}

function drawTallInvertedTriangles(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const triangleCount = 5;

  for (let i = 0; i < triangleCount; i++) {
    const r = getRandomIntInclusive(-1, 1);
    const start = r + x + (i * ctx.canvas.height) / triangleCount;
    const end = r + x + ((i + 1) * ctx.canvas.height) / triangleCount;
    const middle = r + x + ((i + 0.5) * ctx.canvas.height) / triangleCount;

    // Draw a triangle line
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(middle, ctx.canvas.height);
    ctx.lineTo(end, 0);
    ctx.lineTo(start, 0);
    ctx.lineTo(middle, ctx.canvas.height);
    ctx.closePath();
    ctx.fill();
  }
}

function drawSquiggles(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const squiggleCount = 8;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.moveTo(x, ctx.canvas.height - ctx.lineWidth * 4);

  for (let i = 1; i <= squiggleCount; i++) {
    const start = x + i * (ctx.canvas.height / squiggleCount);
    const top =
      i % 2 === 0 ? ctx.canvas.height - ctx.lineWidth * 4 : ctx.lineWidth * 4;
    const r = getRandomIntInclusive(-2, 2);
    ctx.lineTo(start + r, top + r);
  }

  ctx.stroke();
}

function drawCheckerboard(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const columns = 5;
  const rows = Math.ceil(ctx.canvas.height / columns) + 1;
  const size = Math.ceil(ctx.canvas.height / columns);

  const isInverse = getRandomIntInclusive(0, 1) === 1;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      // Only draw alternating squares
      if (isInverse ? j % 2 !== i % 2 : j % 2 === i % 2) {
        const r = getRandomIntInclusive(-1, 1);
        const start = r + x + j * size;
        const top = r + i * size;

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.rect(start, top, size, size);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

function drawMiniTriangles(ctx, x = 0, color = defaultColor) {
  // Calculate how many repetitions we need
  const columns = 6;
  const rows = Math.ceil(ctx.canvas.height / columns) - 1;
  const size = Math.ceil(ctx.canvas.height / columns);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const r = getRandomIntInclusive(-1, 1);
      const start = Math.max(x, r + x + j * size);
      const top = i * size;
      const middle = start + size / 2;
      const bottom = top + size * 1.1;
      const end = Math.min(x + ctx.canvas.height, start + size);

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(middle, top);
      ctx.lineTo(end, bottom);
      ctx.lineTo(start, bottom);
      ctx.closePath();
      ctx.fill();
    }
  }
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

const patterns = shuffleArray([
  drawVerticalLines,
  drawHorizontalLines,
  drawTrianglesDown,
  drawSquiggles,
  drawCheckerboard,
  drawMiniTriangles,
  drawTrianglesUp,
  drawTallTriangles,
  drawTallInvertedTriangles,
]);

function fillCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  drawDividers(ctx);

  const count = Math.ceil(canvas.width / canvas.height);
  let previousR = -1;
  for (let i = 0; i < count; i++) {
    // Pick a non-repeating random pattern
    let r = previousR;
    while (r === previousR) {
      r = getRandomIntInclusive(0, patterns.length - 1);
    }

    // Draw pattern
    const drawPattern = patterns[r];
    drawPattern(ctx, canvas.height * i);
    previousR = r;
  }
}

function fillAllCanvases() {
  const canvases = Array.from(
    document.querySelectorAll("canvas.pattern-divider"),
  );
  canvases.forEach(fillCanvas);
}

requestAnimationFrame(fillAllCanvases);
