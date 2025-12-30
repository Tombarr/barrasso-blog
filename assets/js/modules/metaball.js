/**
 * Metaball SVG Generator with Shiny Gradient Effect
 * Based on Metaball script by SATO Hiroyuki
 * http://shspage.com/aijs/en/#metaball
 *
 * Creates 3 connected circles with fePointLight filter for shiny gradient
 */

const round = (n) => parseFloat(n.toFixed(2));
const radius = (min = 0.75, max = 1.25) =>
  round(min + Math.random() * (max - min));

// Configuration: Base size and relative sizes for 3 circles
const BASE_SIZE = 75; // pixels
const RELATIVE_SIZES = [
  radius(0.85, 1.1),
  radius(0.55, 0.85),
  radius(0.75, 0.95),
]; // percentages of base size

// Metaball connection parameters
const HANDLE_SIZE = 2; // Control point distance multiplier
const V = 0.5; // Spread parameter (0-1)

/**
 * Generates semi-random but constrained positions for 3 circles
 * Ensures circles are always positioned for valid metaball connections:
 * - Distance between circles: 70-120% of sum of radii (safe range for metaball algorithm)
 * - Spread horizontally with slight vertical variation
 */
function generateCircleData(width, height) {
  const seed = Date.now() % 10000;
  const random = (index) => {
    const x = Math.sin(seed + index * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  const circles = [];
  const BASE = round(BASE_SIZE * (window.innerWidth / 1200));
  const padding = BASE * 2;

  // Center the arrangement
  const centerY = height / 2;

  // Generate first circle (leftmost)
  const r1 = BASE * RELATIVE_SIZES[0];
  const cx1 = padding + random(0) * (width * 0.25); // Left side
  const cy1 = centerY + (random(1) - 0.5) * BASE * 0.35; // Slight vertical variation
  circles.push({ cx: cx1, cy: cy1, r: r1 });

  // Generate second circle (middle-right) - guaranteed valid distance from first
  const r2 = BASE * RELATIVE_SIZES[1];
  // Safe distance range: 70-120% of sum of radii
  const minDist2 = (r1 + r2) * 0.7;
  const maxDist2 = (r1 + r2) * 1.1;
  const dist2 = minDist2 + random(2) * (maxDist2 - minDist2);

  // Horizontal bias: angle between -30° to +30° (mostly horizontal)
  const angle2 = ((random(3) - 0.5) * Math.PI) / 3; // ±30 degrees
  const cx2 = cx1 + dist2 * Math.cos(angle2);
  const cy2 = cy1 + dist2 * Math.sin(angle2);
  circles.push({ cx: cx2, cy: cy2, r: r2 });

  // Generate third circle - positioned to ensure valid connections to BOTH circle 1 and 2
  const r3 = BASE * RELATIVE_SIZES[2];

  // Calculate safe distance from circle 1
  const minDist13 = (r1 + r3) * 0.7;
  const maxDist13 = (r1 + r3) * 1.1;
  const dist13 = minDist13 + random(4) * (maxDist13 - minDist13);

  // Position roughly horizontal but on opposite side from circle 2
  // Angle between 150° to 210° relative to circle 1 (opposite horizontal direction)
  const baseAngle3 = angle2 + Math.PI; // Opposite direction
  const angleVariation = ((random(5) - 0.5) * Math.PI) / 6; // ±15 degrees variation
  const angle3 = baseAngle3 + angleVariation;

  const cx3 = cx1 + dist13 * Math.cos(angle3);
  const cy3 = cy1 + dist13 * Math.sin(angle3);
  circles.push({ cx: cx3, cy: cy3, r: r3 });

  // Verify all pairs are within valid range
  const d12 = dist([cx1, cy1], [cx2, cy2]);
  const d23 = dist([cx2, cy2], [cx3, cy3]);
  const d31 = dist([cx3, cy3], [cx1, cy1]);

  return circles.map((circle) => ({
    cx: Math.round(circle.cx),
    cy: Math.round(circle.cy),
    r: circle.r,
  }));
}

/**
 * Calculate distance between two points
 */
function dist([x1, y1], [x2, y2]) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

/**
 * Calculate angle between two points
 */
function angle([x1, y1], [x2, y2]) {
  return Math.atan2(y1 - y2, x1 - x2);
}

/**
 * Get a point at angle a and radius r from center [cx, cy]
 */
function getVector([cx, cy], a, r) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/**
 * Generate metaball path between two circles
 * Based on SATO Hiroyuki's algorithm
 */
function metaball(
  radius1,
  radius2,
  center1,
  center2,
  handleSize = HANDLE_SIZE,
  v = V,
) {
  const HALF_PI = Math.PI / 2;
  const d = dist(center1, center2);
  const tooClose = d <= Math.abs(radius1 - radius2);
  let u1, u2;

  // Return empty if circles are too far or one contains the other
  if (radius1 === 0 || radius2 === 0 || tooClose) {
    return null;
  }

  // Calculate arc angles based on circle overlap
  if (d < radius1 + radius2) {
    u1 = Math.acos(
      (radius1 * radius1 + d * d - radius2 * radius2) / (2 * radius1 * d),
    );
    u2 = Math.acos(
      (radius2 * radius2 + d * d - radius1 * radius1) / (2 * radius2 * d),
    );
  } else {
    u1 = 0;
    u2 = 0;
  }

  // Calculate all angles for tangent points
  const angleBetweenCenters = angle(center2, center1);
  const maxSpread = Math.acos((radius1 - radius2) / d);

  const angle1 = angleBetweenCenters + u1 + (maxSpread - u1) * v;
  const angle2 = angleBetweenCenters - u1 - (maxSpread - u1) * v;
  const angle3 =
    angleBetweenCenters + Math.PI - u2 - (Math.PI - u2 - maxSpread) * v;
  const angle4 =
    angleBetweenCenters - Math.PI + u2 + (Math.PI - u2 - maxSpread) * v;

  // Calculate tangent points
  const p1 = getVector(center1, angle1, radius1);
  const p2 = getVector(center1, angle2, radius1);
  const p3 = getVector(center2, angle3, radius2);
  const p4 = getVector(center2, angle4, radius2);

  // Calculate handle lengths for bezier curves
  const totalRadius = radius1 + radius2;
  const d2Base = Math.min(v * handleSize, dist(p1, p3) / totalRadius);
  const d2 = d2Base * Math.min(1, (d * 2) / (radius1 + radius2));

  const r1 = radius1 * d2;
  const r2 = radius2 * d2;

  // Calculate control points
  const h1 = getVector(p1, angle1 - HALF_PI, r1);
  const h2 = getVector(p2, angle2 + HALF_PI, r1);
  const h3 = getVector(p3, angle3 + HALF_PI, r2);
  const h4 = getVector(p4, angle4 - HALF_PI, r2);

  const escaped = d > radius1;

  return {
    p1,
    p2,
    p3,
    p4,
    h1,
    h2,
    h3,
    h4,
    escaped,
    radius: radius2,
  };
}

/**
 * Convert metaball data to SVG path string
 */
function metaballToPath(data) {
  if (!data) return "";
  const { p1, p2, p3, p4, h1, h2, h3, h4, escaped, radius } = data;

  return [
    "M",
    p1.map(round).join(","),
    "C",
    h1.map(round).join(","),
    h3.map(round).join(","),
    p3.map(round).join(","),
    "A",
    round(radius),
    round(radius),
    0,
    escaped ? 1 : 0,
    0,
    p4.map(round).join(","),
    "C",
    h4.map(round).join(","),
    h2.map(round).join(","),
    p2.map(round).join(","),
  ].join(" ");
}

/**
 * Generate complete metaball shape for 3 circles
 * Connects all three circles with smooth metaball transitions
 */
function generateMetaballPath(circles) {
  if (circles.length !== 3) return "";

  const [c1, c2, c3] = circles;
  const center1 = [c1.cx, c1.cy];
  const center2 = [c2.cx, c2.cy];
  const center3 = [c3.cx, c3.cy];

  // Generate metaball connections between each pair
  const m12 = metaball(c1.r, c2.r, center1, center2);
  const m23 = metaball(c2.r, c3.r, center2, center3);
  const m31 = metaball(c3.r, c1.r, center3, center1);

  // If all connections exist, create unified shape
  return [m12, m23, m31].map(metaballToPath).join(" ");
}

/**
 * Calculate bounding box for all circles
 * Returns { minX, minY, maxX, maxY, width, height }
 */
function calculateBoundingBox(circles) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  circles.forEach((circle) => {
    minX = Math.min(minX, circle.cx - circle.r);
    minY = Math.min(minY, circle.cy - circle.r);
    maxX = Math.max(maxX, circle.cx + circle.r);
    maxY = Math.max(maxY, circle.cy + circle.r);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Create SVG namespace-aware element
 */
function createSVGElement(tagName, attributes = {}) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    tagName,
  );
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

/**
 * Initializes metaball SVG on the page
 */
export function initMetaball() {
  const container = document.querySelector(".metaball-container");
  if (!container) return;

  const svg = container.querySelector("svg");
  if (!svg) return;

  const width = parseFloat(svg.getAttribute("width") || 800);
  const height = parseFloat(svg.getAttribute("height") || 600);

  // Generate circle data
  const circles = generateCircleData(width, height);

  // Calculate bounding box to ensure circles aren't clipped
  const bbox = calculateBoundingBox(circles);

  // Add padding to bounding box
  const padding = 20;
  const viewBoxWidth = bbox.width + padding * 2;
  const viewBoxHeight = bbox.height + padding * 2;
  const viewBoxX = bbox.minX - padding;
  const viewBoxY = bbox.minY + padding;

  // Update SVG dimensions to fit content
  svg.setAttribute(
    "viewBox",
    `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`,
  );
  svg.setAttribute("width", width);
  svg.setAttribute("height", Math.max(height, viewBoxHeight));

  // Clear existing metaball content (but preserve defs from template)
  const existingGroup = svg.querySelector(".metaball-group");
  if (existingGroup) {
    existingGroup.remove();
  }

  // Create group for metaball shapes
  // Note: auroraGlow is a gradient, not a filter, so we don't apply it as filter
  const group = createSVGElement("g", {
    fill: "url(#auroraGradient)",
    class: "metaball-group",
  });

  // Add metaball connector path
  const connectorPath = generateMetaballPath(circles);
  if (connectorPath) {
    const path = createSVGElement("path", {
      d: connectorPath,
      "stroke-linejoin": "round",
    });
    group.appendChild(path);
  }

  // Append group to SVG
  svg.appendChild(group);

  // Apply random rotation and scale on mobile
  if (window.innerWidth <= 767) {
    const randomRotation = Math.random() * 45;
    const randomScale = 1.25 + Math.random() * 0.75; // Scale between 1 and 1.5
    svg.style.transformOrigin = "top left";
    svg.style.transform = `translate(-50%, -65%) rotate(${randomRotation}deg) scale(${randomScale})`;
  }
}
