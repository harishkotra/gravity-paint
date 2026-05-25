# Gravity Paint

**Gravity Paint** is a mindful, physics-based sandbox painting game built using **React 19**, **Vite**, **p5.js** for custom canvas visualization, and **Matter.js** for lightweight, robust rigid-body physics computation. 

The game combines organic visual aesthetic elements with satisfying fluid/marble-dynamics. Players draw cables (chains) on the screen to physically guide flows of heavy, light, or normal-weight marbles into a collection cup. 

---

## Game & Design Philosophy

Gravity Paint focuses on satisfying, serene interactions.
- **Physical Ropes (Chains):** Individual link segments made of Matter.js rigid-bodies are chained together dynamically by spring constraints (`Matter.Constraint.create`).
- **Golden Anchors:** Draw lines near gold circles to lock them securely in empty space. Unleashed endpoints respond to gravity naturally, causing ropes to sag, swing, and dip.
- **Interactive Spigot Fluid-valve:** Tap or hold to suspend flow, enabling thoughtful route design before dropping the marbles.
- **Harmonized Audio feedback:** Built-in modular synthesizer (using simple oscillator nodes and reverb effects via Web Audio API) coordinates satisfying pinging scales with the physical triggers of collection, dropping, bouncing, and anchors snapping.

---

## Architecture & Flow Layer

Gravity Paint dynamically bridges **React state mechanics** with an **active P5 dynamic scene loops and Matter-JS world update routines**.

```
 +-----------------------------------------------------------------------+
 |                            React UI App                               |
 |     - Stats (Collected, Dropped, Chains Count)                        |
 |     - Current Level Select Sidebar & State Control                    |
 |     - Globals Audio Synthesizer (Web Audio API)                       |
 +-------------------+-----------------------------------+---------------+
                     |                                   |
                     v (CustomEvents)                    v (Props / State)
 +-------------------+-------------------+   +-----------+---------------+
 |            Window Messaging API       |   |      Level Presets Config |
 | - "gravity-paint-reset"               +-->| - obstacles, pegs, paths  |
 | - "gravity-paint-clear-chains"        |   | - spigot location, target |
 +-------------------+-------------------+   +-----------+---------------+
                     |                                   |
                     |                                   v
 +-------------------+-----------------------------------+---------------+
 |                     P5 & Matter.js Sandbox Canvas                     |
 |  ===================================================================  |
 |  |  [p5.setup] -> Create HTML Canvas, Matter.Engine & World         |  |
 |  |  [p5.draw]  -> Clear frame, Step physics, Draw static elements    |  |
 |  |                Update & Draw dynamic ropes (Chains) & Marbles     |  |
 |  |  [p5.mouse] -> Detect mouse Drag/Release to spawn Matter.Body     |  |
 |  |                links & attach dynamic spring constraints          |  |
 |  ===================================================================  |
 +-----------------------------------------------------------------------+
```

---

## Core Technologies

- **Frontend Core:** [React 19](https://react.dev) & [Vite](https://vite.dev) (Single Page Application SPA mode)
- **Visuals Rendering Canvas:** [P5.js](https://p5js.org/) (instance-mode setup running side-by-side with React state synchronization)
- **Physics Engine:** [Matter.js](https://brm.io/matter-js/)
- **UI Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons Library:** [Lucide React](https://lucide.dev)
- **Sound Synth:** Custom CSS Web Audio API Oscillator implementation

---

## Key Code Implementations

### 1. Dynamic Rope/Chain Construction
Each rope painted by the user is a series of tiny circles linked via physics constraints. If endpoints are in proximity of `Golden Anchors` (determined using Euclidean distance), a rigid pin constraint is anchored:

```typescript
// From src/App.tsx (creating segments)
const segmentCount = tempPoints.length;
const links: Matter.Body[] = [];
const constraints: Matter.Constraint[] = [];

for (let i = 0; i < segmentCount; i++) {
  const pt = tempPoints[i];
  const link = Bodies.circle(pt.x, pt.y, 4, {
    density: 0.005,
    friction: 0.08,
    restitution: 0.4,
    collisionFilter: { group: Matter.Body.nextGroup(true) }
  });
  links.push(link);
  World.add(world, link);
}

// Chaining individual particles together
for (let i = 0; i < segmentCount - 1; i++) {
  const con = Constraint.create({
    bodyA: links[i],
    bodyB: links[i + 1],
    stiffness: 0.85,
    length: p.dist(tempPoints[i].x, tempPoints[i].y, tempPoints[i+1].x, tempPoints[i+1].y)
  });
  constraints.push(con);
  World.add(world, con);
}
```

### 2. Events-Driven Communication Pipeline
Vite HMR/React renders separate containers from the P5 context. We use native event emitters to send actions (like `clearDrawnChains` or `resetGameEngine`) directly to P5 without remounting the entire canvas:

```typescript
// Inside React Component UI
const clearDrawnChains = () => {
  setChainsCount(0);
  if (window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent("gravity-paint-clear-chains"));
  }
  GLOBAL_SYNTH.playClick();
};

// Inside custom P5.js sketch Setup
const handleClearChainsEvent = () => {
  if (!world) return;
  chains.forEach(c => {
    if (c) {
      if (c.links) c.links.forEach(l => l && World.remove(world, l));
      if (c.constraints) c.constraints.forEach(con => con && World.remove(world, con));
    }
  });
  chains = [];
  setChainsCount(0);
};
window.addEventListener("gravity-paint-clear-chains", handleClearChainsEvent);
```

---

## 🚀 How to Fork & Run Locally

Feel free to download, inspect, custom-style, or expand.

### 1. Requirements
Ensure you have **Node.js** (v18+) and **npm** installed on your workstation.

### 2. Installation
```bash
# Clone the repository (or create a local fork)
git clone <your-repository-url>
cd gravity-paint

# Install all workspace and packages dependencies
npm install
```

### 3. Run Development Server
```bash
# Serves the app with livereload on port 3000
npm run dev
```
Open your browser to `http://localhost:3000` to preview.

### 4. Direct Production Compilation
```bash
# Compile and build the React Vite distribution static files
npm run build
```
Compiled bundle will settle securely in `/dist` folder.

---

## Opportunities to Contribute & New Features to Add

If you want to contribute, here are great sandbox exercises you can add:

1. **Custom Interactive Level Designer:** Create a mode where players can drag around peg positions, Golden Anchors, and static cups, saving custom challenges to JSON or `localStorage`.
2. **Alternative Rope Textures:** Develop rendering visualizers to paint chains as glowing neon lasers, iron chains, heavy ship ropes, or bouncy elastic bands.
3. **Advanced Marble Types:** 
   - **Lava marbles:** Melt away drawn ropes if contact lasts too long.
   - **Gravitational pull voids:** Vortex obstacles that drag marbles relative to standard screen forces.
4. **Interactive Wind Currents:** Periodic atmospheric wind gusts affecting marble and rope dynamics.
5. **Leaderboards & Sync:** Connect with a cloud database to compare dropped/used chain stats for levels across players around the globe.