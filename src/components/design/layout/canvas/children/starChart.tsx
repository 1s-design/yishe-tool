import { computed, defineComponent, nextTick, ref, watch } from "vue";
import {
  canvasStickerOptionsOnlyChild,
  updateRenderingCanvas,
} from "../index.tsx";
import {
  createFilterFromOptions,
  createTransformString,
  formatToNativeSizeString,
  getPositionInfoFromOptions,
} from "../helper.tsx";
import {
  createBasicDefaultOptions,
  createFilterDefaultOptions,
  createPositionDefaultOptions,
  createTransformDefaultOptions,
} from "./defaultOptions.tsx";
import { onBeforeReturnRender, onCanvasChildSetup } from "./commonHooks.ts";
import * as Astronomy from "astronomy-engine";

interface CelestialBody {
  name: string;
  ra: number;
  dec: number;
  color: string;
  radius: number;
  symbol: string;
}

const BODY_COLORS: Record<string, string> = {
  Sun: "#FFD700",
  Moon: "#C0C0C0",
  Mercury: "#B0B0B0",
  Venus: "#FFFACD",
  Mars: "#FF4500",
  Jupiter: "#DEB887",
  Saturn: "#F4A460",
  Uranus: "#ADD8E6",
  Neptune: "#4169E1",
};

const BODY_SYMBOLS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
};

function equatorialToStereographic(
  ra: number,
  dec: number,
  observerLat: number,
  observerLon: number,
  siderealTime: number,
): { x: number; y: number; visible: boolean } {
  const ha = siderealTime - ra;
  const haRad = (ha * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const latRad = (observerLat * Math.PI) / 180;

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const alt = Math.asin(sinAlt);

  if (alt < 0) return { x: 0, y: 0, visible: false };

  const cosAlt = Math.cos(alt);
  const azimuth =
    Math.atan2(
      -Math.cos(decRad) * Math.sin(haRad),
      Math.sin(decRad) * Math.cos(latRad) -
        Math.cos(decRad) * Math.cos(haRad) * Math.sin(latRad),
    ) + Math.PI;

  const projRadius = Math.tan(Math.PI / 4 - alt / 2);
  const x = projRadius * Math.sin(azimuth);
  const y = -projRadius * Math.cos(azimuth);

  return { x, y, visible: true };
}

function getBodyPosition(
  body: Astronomy.Body,
  date: Date,
  latitude: number,
  longitude: number,
): { ra: number; dec: number } {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const equatorial = Astronomy.Equator(body, date, observer, false, true);
  return { ra: equatorial.ra * 15, dec: equatorial.dec };
}

function getGreenwichSiderealTime(date: Date): number {
  const astroTime = Astronomy.MakeTime(date);
  return Astronomy.SiderealTime(astroTime);
}

const BRIGHT_STARS: { name: string; ra: number; dec: number; mag: number }[] = [
  { name: "Sirius", ra: 101.29, dec: -16.72, mag: -1.46 },
  { name: "Canopus", ra: 95.99, dec: -52.7, mag: -0.74 },
  { name: "Arcturus", ra: 213.92, dec: 19.18, mag: -0.05 },
  { name: "Vega", ra: 279.23, dec: 38.78, mag: 0.03 },
  { name: "Capella", ra: 79.17, dec: 46, mag: 0.08 },
  { name: "Rigel", ra: 78.63, dec: -8.2, mag: 0.13 },
  { name: "Procyon", ra: 114.83, dec: 5.22, mag: 0.34 },
  { name: "Betelgeuse", ra: 88.79, dec: 7.41, mag: 0.5 },
  { name: "Altair", ra: 297.7, dec: 8.87, mag: 0.77 },
  { name: "Aldebaran", ra: 68.98, dec: 16.51, mag: 0.85 },
  { name: "Antares", ra: 247.35, dec: -26.43, mag: 0.96 },
  { name: "Spica", ra: 201.3, dec: -11.16, mag: 0.97 },
  { name: "Pollux", ra: 116.33, dec: 28.03, mag: 1.14 },
  { name: "Fomalhaut", ra: 344.41, dec: -29.62, mag: 1.16 },
  { name: "Deneb", ra: 310.36, dec: 45.28, mag: 1.25 },
  { name: "Regulus", ra: 152.09, dec: 11.97, mag: 1.35 },
  { name: "Castor", ra: 113.65, dec: 31.89, mag: 1.58 },
  { name: "Bellatrix", ra: 81.28, dec: 6.35, mag: 1.64 },
];

const CONSTELLATION_LINES: [number, number][] = [
  [0, 7],
  [7, 5],
  [5, 1],
  [3, 14],
  [8, 15],
  [10, 9],
  [4, 13],
  [12, 16],
  [11, 6],
];

function drawStarChart(
  canvas: HTMLCanvasElement,
  dateStr: string,
  latitude: number,
  longitude: number,
  showConstellations: boolean,
  bgColor: string,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) * 0.85;

  const date = dateStr ? new Date(dateStr) : new Date();

  const gst = getGreenwichSiderealTime(date);
  const lst = (gst + longitude / 15) % 24;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(5,5,30,1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(100,100,200,0.5)";
  ctx.lineWidth = 1;
  ctx.stroke();

  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, (radius * i) / 3, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(60,60,140,0.3)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cx, cy - radius);
  ctx.lineTo(cx, cy + radius);
  ctx.moveTo(cx - radius, cy);
  ctx.lineTo(cx + radius, cy);
  ctx.strokeStyle = "rgba(60,60,140,0.3)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  const lstDeg = lst * 15;

  const projectedStars: {
    x: number;
    y: number;
    mag: number;
    name: string;
    visible: boolean;
  }[] = [];

  BRIGHT_STARS.forEach((star) => {
    const proj = equatorialToStereographic(
      star.ra,
      star.dec,
      latitude,
      longitude,
      lstDeg,
    );
    const normX = proj.x * radius * 0.5;
    const normY = proj.y * radius * 0.5;
    const dist = Math.sqrt(normX * normX + normY * normY);

    projectedStars.push({
      x: cx + normX,
      y: cy + normY,
      mag: star.mag,
      name: star.name,
      visible: proj.visible && dist <= radius,
    });
  });

  if (showConstellations) {
    ctx.strokeStyle = "rgba(100,140,255,0.35)";
    ctx.lineWidth = 1;
    CONSTELLATION_LINES.forEach(([i, j]) => {
      const s1 = projectedStars[i];
      const s2 = projectedStars[j];
      if (s1.visible && s2.visible) {
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.stroke();
      }
    });
  }

  projectedStars.forEach((star) => {
    if (!star.visible) return;
    const size = Math.max(1, 3 - star.mag * 0.6);
    ctx.beginPath();
    ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220,220,255,0.9)";
    ctx.fill();
  });

  const bodies: Astronomy.Body[] = [
    Astronomy.Body.Sun,
    Astronomy.Body.Moon,
    Astronomy.Body.Mercury,
    Astronomy.Body.Venus,
    Astronomy.Body.Mars,
    Astronomy.Body.Jupiter,
    Astronomy.Body.Saturn,
    Astronomy.Body.Uranus,
    Astronomy.Body.Neptune,
  ];

  const celestialBodies: CelestialBody[] = [];

  bodies.forEach((body) => {
    try {
      const pos = getBodyPosition(body, date, latitude, longitude);
      const proj = equatorialToStereographic(
        pos.ra,
        pos.dec,
        latitude,
        longitude,
        lstDeg,
      );
      const normX = proj.x * radius * 0.5;
      const normY = proj.y * radius * 0.5;
      const dist = Math.sqrt(normX * normX + normY * normY);

      if (proj.visible && dist <= radius) {
        const name = Astronomy.Body[body];
        celestialBodies.push({
          name,
          ra: pos.ra,
          dec: pos.dec,
          color: BODY_COLORS[name] || "#FFFFFF",
          radius: name === "Sun" || name === "Moon" ? 8 : 5,
          symbol: BODY_SYMBOLS[name] || "●",
        });
      }
    } catch {}
  });

  celestialBodies.forEach((body) => {
    const proj = equatorialToStereographic(
      body.ra,
      body.dec,
      latitude,
      longitude,
      lstDeg,
    );
    const x = cx + proj.x * radius * 0.5;
    const y = cy + proj.y * radius * 0.5;

    ctx.beginPath();
    ctx.arc(x, y, body.radius, 0, Math.PI * 2);
    ctx.fillStyle = body.color;
    ctx.shadowColor = body.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `${Math.max(9, body.radius + 2)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(body.name, x, y + body.radius + 12);
  });

  ctx.fillStyle = "rgba(180,180,220,0.6)";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`N`, cx - 4, cy - radius + 14);
  ctx.fillText(`S`, cx - 4, cy + radius - 6);
  ctx.fillText(`E`, cx - radius + 6, cy + 4);
  ctx.fillText(`W`, cx + radius - 14, cy + 4);

  ctx.fillStyle = "rgba(180,180,220,0.5)";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  const dateLabel = dateStr || new Date().toISOString().slice(0, 16);
  ctx.fillText(
    `${dateLabel}  ${latitude.toFixed(1)}°N ${longitude.toFixed(1)}°E`,
    cx,
    cy + radius + 18,
  );
}

export const createDefaultCanvasChildStarChartOptions = () => {
  const canvasUnit = canvasStickerOptionsOnlyChild.value.width.unit;

  return {
    type: "starChart",
    date: "",
    latitude: 39.9,
    longitude: 116.4,
    showConstellations: true,
    backgroundColor: {
      type: "pure",
      color: "#0a0a2e",
    },
    width: {
      value: 100,
      unit: "vw",
    },
    height: {
      value: 100,
      unit: "vh",
    },
    position: createPositionDefaultOptions(canvasUnit),
    filter: createFilterDefaultOptions(canvasUnit),
    zIndex: 0,
    ...createBasicDefaultOptions(),
    transform: createTransformDefaultOptions(canvasUnit),
  };
};

export function createCanvasChildStarChart(options: any) {
  return (
    <StarChartChild
      options={options}
      onVnodeUpdated={updateRenderingCanvas}
      onVnodeMounted={updateRenderingCanvas}
    ></StarChartChild>
  );
}

export const StarChartChild = defineComponent({
  props: {
    options: null,
  },
  setup(props) {
    const targetRef = ref<HTMLElement>();
    const canvasRef = ref<HTMLCanvasElement>();

    onCanvasChildSetup({
      targetEl: targetRef,
      options: props.options,
      props,
    });

    const date = computed(() => String(props.options?.date ?? ""));
    const latitude = computed(() => Number(props.options?.latitude ?? 39.9));
    const longitude = computed(() => Number(props.options?.longitude ?? 116.4));
    const showConstellations = computed(
      () => props.options?.showConstellations !== false,
    );
    const bgColor = computed(
      () => props.options?.backgroundColor?.color ?? "#0a0a2e",
    );

    function renderChart() {
      const canvas = canvasRef.value;
      if (!canvas) return;

      canvas.width = canvas.offsetWidth || 512;
      canvas.height = canvas.offsetHeight || 512;

      drawStarChart(
        canvas,
        date.value,
        latitude.value,
        longitude.value,
        showConstellations.value,
        bgColor.value,
      );

      nextTick(() => {
        updateRenderingCanvas();
      });
    }

    watch(
      () => [
        date.value,
        latitude.value,
        longitude.value,
        showConstellations.value,
        bgColor.value,
      ],
      renderChart,
      { immediate: true, deep: true },
    );

    watch(canvasRef, () => {
      nextTick(renderChart);
    });

    return () => {
      const { containerStyle: _containerStyle, style: _style } =
        getPositionInfoFromOptions(props.options.position);

      const containerStyle: any = {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        ..._containerStyle,
      };

      const style: any = {
        flexShrink: 0,
        width: formatToNativeSizeString(props.options.width),
        height: formatToNativeSizeString(props.options.height),
        transform: createTransformString(props.options.transform),
        filter: createFilterFromOptions(props.options.filter),
        zIndex: props.options.zIndex,
        background: props.options.backgroundColor?.color || "transparent",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        ..._style,
      };

      onBeforeReturnRender({
        style,
        options: props.options,
      });

      return (
        <div style={containerStyle}>
          <div ref={targetRef} class="canvas-star-chart-child" style={style}>
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "100%", display: "block" }}
            ></canvas>
          </div>
        </div>
      );
    };
  },
});
