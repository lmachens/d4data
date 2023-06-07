import continent from "../json/base/meta/World/Sanctuary_Eastern_Continent.wrl.json" assert { type: "json" };

// const SCALE = continent.unk_d9c79d2.unk_ae5bfbd;
const SCALE = 0.083492;
const DEG_45 = Math.PI / 4; // 45 degrees in radians
const OFFSET = {
  x: 113.2,
  y: -227.4,
};

export const normalizePoint = ({ x, y }) => {
  const scaledX = x * SCALE;
  const scaledY = y * SCALE;
  const rotatedX = scaledX * Math.cos(DEG_45) - scaledY * Math.sin(DEG_45);
  const rotatedY = scaledX * Math.sin(DEG_45) + scaledY * Math.cos(DEG_45);
  return [-rotatedY + OFFSET.y, -rotatedX + OFFSET.x];
};
