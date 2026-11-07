// Places desks on an isometric floor, one zone per department.
// World units: u runs to the lower right, v to the lower left; one desk cell
// is CELL x CELL. Screen position of a world point is (u - v, (u + v) / 2).

export const CELL = 140;
const GAP = 0.7; // aisle between zones, in cells
const MARGIN = 80; // floor around the outermost desks
const DECAL_STRIP = 30; // floor in front of a zone that carries its name
export const WALL_HEIGHT = 190;
const ZONE_PAD = 22;

export const iso = (u, v, h = 0) => ({ x: u - v, y: (u + v) / 2 - h });

const UNASSIGNED = "General";

export const buildLayout = (people) => {
  const groups = new Map();
  people.forEach((person) => {
    const key = person.department || UNASSIGNED;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(person);
  });

  const zones = [...groups.entries()]
    .sort(([a, pa], [b, pb]) => {
      if (a === UNASSIGNED) return 1;
      if (b === UNASSIGNED) return -1;
      return pb.length - pa.length || a.localeCompare(b);
    })
    .map(([name, members]) => {
      const cols = Math.min(3, members.length);
      return {
        name,
        members: [...members].sort((x, y) => x.name.localeCompare(y.name)),
        cols,
        rows: Math.ceil(members.length / cols),
      };
    });

  // Shelf packing: zones left to right along u, wrapping to a new row along v
  const totalCells = zones.reduce((sum, z) => sum + (z.cols + GAP) * (z.rows + GAP), 0);
  const widest = zones.reduce((max, z) => Math.max(max, z.cols), 1);
  const shelfWidth = Math.max(widest, Math.ceil(Math.sqrt(totalCells) * 1.15));

  let u = 0;
  let v = 0;
  let shelfRows = 0;
  let maxU = 0;
  zones.forEach((zone) => {
    if (u > 0 && u + zone.cols > shelfWidth) {
      u = 0;
      v += shelfRows + GAP;
      shelfRows = 0;
    }
    zone.u = u;
    zone.v = v;
    u += zone.cols + GAP;
    maxU = Math.max(maxU, zone.u + zone.cols);
    shelfRows = Math.max(shelfRows, zone.rows);
  });
  const maxV = v + shelfRows;

  const floor = {
    u0: -MARGIN,
    v0: -MARGIN,
    u1: maxU * CELL + MARGIN,
    v1: maxV * CELL + MARGIN,
  };

  // Screen bounds: walls rise from the back edges, desks reach ~180 above their tile
  const corners = [
    iso(floor.u0, floor.v0, WALL_HEIGHT),
    iso(floor.u1, floor.v0, WALL_HEIGHT),
    iso(floor.u0, floor.v1, WALL_HEIGHT),
    iso(floor.u1, floor.v1),
    iso(floor.u0, floor.v1),
    iso(floor.u1, floor.v0),
  ];
  const minX = Math.min(...corners.map((c) => c.x)) - 40;
  const maxX = Math.max(...corners.map((c) => c.x)) + 40;
  const minY = Math.min(...corners.map((c) => c.y)) - 40;
  const maxY = Math.max(...corners.map((c) => c.y)) + 60;

  const toScreen = (pu, pv, h = 0) => {
    const p = iso(pu, pv, h);
    return { x: p.x - minX, y: p.y - minY };
  };

  const stations = [];
  zones.forEach((zone) => {
    zone.members.forEach((person, i) => {
      const cu = zone.u + (i % zone.cols);
      const cv = zone.v + Math.floor(i / zone.cols);
      const center = toScreen((cu + 0.5) * CELL, (cv + 0.5) * CELL);
      // Desks further down the screen are drawn over the ones behind them
      stations.push({ person, x: center.x, y: center.y, depth: Math.round((cu + cv) * 10), zone: zone.name });
    });
    const zu0 = zone.u * CELL + ZONE_PAD;
    const zv0 = zone.v * CELL + ZONE_PAD;
    const zu1 = (zone.u + zone.cols) * CELL - ZONE_PAD;
    const zv1 = (zone.v + zone.rows) * CELL - ZONE_PAD;
    // The rug runs a strip past the front row; the team name is painted on it
    const front = zv1 + DECAL_STRIP;
    zone.rug = [toScreen(zu0, zv0), toScreen(zu1, zv0), toScreen(zu1, front), toScreen(zu0, front)];
    zone.decal = toScreen(zu0 + 12, front - 6);
    zone.width = zu1 - zu0 - 24;
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
    floor,
    zones,
    stations,
    toScreen,
  };
};
