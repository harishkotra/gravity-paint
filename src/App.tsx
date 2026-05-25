import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import Matter from "matter-js";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Share2, 
  Award, 
  Info, 
  Flame, 
  Volume1, 
  Check, 
  LayoutGrid, 
  Sparkles, 
  HelpCircle,
  X,
  Eraser
} from "lucide-react";

// ==========================================
// CRYSTAL MELODY SYNTH (Web Audio API)
// ==========================================
class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {}

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx.currentTime);
    }
  }

  playPing(index: number = 0) {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Satisfying pentatonic scale (A major pentatonic for dreamy harmonies)
    const scale = [220.00, 246.94, 277.18, 329.63, 369.99, 440.00, 493.88, 554.37, 659.25, 739.99, 880.00, 987.77, 1108.73, 1318.51];
    const baseFreq = scale[index % scale.length];

    // Main chime oscillator
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(baseFreq, now);

    // Minor metallic chime overtones
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

    const osc3 = this.ctx.createOscillator();
    const gain3 = this.ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(baseFreq * 2.5, now);

    // Smooth exponentially declining decay envelope
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    gain2.gain.setValueAtTime(0.04, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    gain3.gain.setValueAtTime(0.02, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Routing
    if (this.masterVolume) {
      osc1.connect(gain1);
      gain1.connect(this.masterVolume);

      osc2.connect(gain2);
      gain2.connect(this.masterVolume);

      osc3.connect(gain3);
      gain3.connect(this.masterVolume);
    }

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + 1.3);
    osc2.stop(now + 0.6);
    osc3.stop(now + 0.35);
  }

  playBoing() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Quick soft spring snap
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.12);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    if (this.masterVolume) {
      osc.connect(gain);
      gain.connect(this.masterVolume);
    }
    
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    
    if (this.masterVolume) {
      osc.connect(gain);
      gain.connect(this.masterVolume);
    }
    osc.start(now);
    osc.stop(now + 0.07);
  }
}

const GLOBAL_SYNTH = new SoundSynth();

// ==========================================
// LEVEL PRESET SCHEMAS
// ==========================================
interface LevelPreset {
  id: number;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" | "Freeplay";
  difficultyColor: string;
  description: string;
  anchors: { x: number; y: number }[];
  pegs: { x: number; y: number; r: number }[];
  bucketX?: number;
  bucketY?: number;
}

const LEVEL_PRESETS: LevelPreset[] = [
  {
    id: 1,
    name: "The Soft Funnel",
    difficulty: "Beginner",
    difficultyColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Connect the anchors with high sweeping ropes to catch and guide the falling marbles into the center glass bucket.",
    anchors: [
      { x: 90, y: 190 },
      { x: 310, y: 190 },
      { x: 130, y: 340 },
      { x: 270, y: 340 },
      { x: 200, y: 250 }
    ],
    pegs: [],
    bucketX: 200,
    bucketY: 550
  },
  {
    id: 2,
    name: "Zig-Zag Cascades",
    difficulty: "Intermediate",
    difficultyColor: "bg-sky-100 text-sky-800 border-sky-200",
    description: "Draw alternating diagonal slide ropes. Marbles must bounce from left to right, then pour back to the side-shifted basket.",
    anchors: [
      { x: 120, y: 150 },
      { x: 310, y: 200 },
      { x: 90, y: 300 },
      { x: 290, y: 380 },
      { x: 160, y: 460 },
      { x: 240, y: 460 }
    ],
    pegs: [
      { x: 200, y: 270, r: 8 }
    ],
    bucketX: 135,
    bucketY: 560
  },
  {
    id: 3,
    name: "Split Peg Plinko",
    difficulty: "Advanced",
    difficultyColor: "bg-amber-100 text-amber-800 border-amber-200",
    description: "Solid buffer pins split the flow streams asunder. Weave dual custom pocket lines on each side to redirect them to the right-shifted container.",
    anchors: [
      { x: 70, y: 190 },
      { x: 330, y: 190 },
      { x: 100, y: 370 },
      { x: 300, y: 370 },
      { x: 200, y: 450 }
    ],
    pegs: [
      { x: 200, y: 150, r: 12 },
      { x: 130, y: 280, r: 8 },
      { x: 270, y: 280, r: 8 },
      { x: 200, y: 330, r: 10 }
    ],
    bucketX: 265,
    bucketY: 550
  },
  {
    id: 4,
    name: "Tether Pendulum",
    difficulty: "Expert",
    difficultyColor: "bg-rose-100 text-rose-800 border-rose-200",
    description: "Use the single center sky anchor point to hang a giant swinging hammock, or anchor multi-segment kinetic nets directing to the deep bucket.",
    anchors: [
      { x: 200, y: 110 },
      { x: 60, y: 260 },
      { x: 340, y: 260 },
      { x: 120, y: 420 },
      { x: 280, y: 420 }
    ],
    pegs: [
      { x: 90, y: 180, r: 6 },
      { x: 310, y: 180, r: 6 }
    ],
    bucketX: 160,
    bucketY: 540
  },
  {
    id: 5,
    name: "Sandbox Playground",
    difficulty: "Freeplay",
    difficultyColor: "bg-purple-100 text-purple-800 border-purple-200",
    description: "An wide-open configuration containing 8 golden pegs in a balanced grid. Paint and design custom gravitational contraptions directly into a central bucket!",
    anchors: [
      { x: 80, y: 150 },
      { x: 200, y: 150 },
      { x: 320, y: 150 },
      { x: 120, y: 300 },
      { x: 280, y: 300 },
      { x: 80, y: 450 },
      { x: 200, y: 450 },
      { x: 320, y: 450 }
    ],
    pegs: [
      { x: 200, y: 250, r: 7 }
    ],
    bucketX: 230,
    bucketY: 560
  }
];

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Synchronized States
  const [levelIndex, setLevelIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("gravity-paint-level-index");
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < LEVEL_PRESETS.length) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }
    return 0;
  });
  const [collected, setCollected] = useState<number>(0);
  const [dropped, setDropped] = useState<number>(0);
  const [faucetActive, setFaucetActive] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [chainsCount, setChainsCount] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [gameState, setGameState] = useState<"intro" | "playing" | "won">("intro");
  const [showHowTo, setShowHowTo] = useState<boolean>(false);
  const [showSloppyMessage, setShowSloppyMessage] = useState<boolean>(false);
  const [streamSpeed, setStreamSpeed] = useState<number>(24); // Spawning rate in frames

  // Persist current level index to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem("gravity-paint-level-index", levelIndex.toString());
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }, [levelIndex]);

  // Global refs to communicate states instantly inside P5 draw loop
  const collectedRef = useRef(collected);
  const droppedRef = useRef(dropped);
  const faucetActiveRef = useRef(faucetActive);
  const streamSpeedRef = useRef(streamSpeed);
  const gameStateRef = useRef(gameState);
  const showSloppyMessageRef = useRef(showSloppyMessage);

  // Synchronize refs
  useEffect(() => { collectedRef.current = collected; }, [collected]);
  useEffect(() => { droppedRef.current = dropped; }, [dropped]);
  useEffect(() => { faucetActiveRef.current = faucetActive; }, [faucetActive]);
  useEffect(() => { streamSpeedRef.current = streamSpeed; }, [streamSpeed]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { showSloppyMessageRef.current = showSloppyMessage; }, [showSloppyMessage]);

  // Sloppy Loss Condition: reset current level if dropped count exceeds 5
  useEffect(() => {
    if (dropped > 5 && gameState === "playing") {
      setShowSloppyMessage(true);
      resetGameEngine();
      
      // Keep message for 4.5 seconds or until dismissed
      const timer = setTimeout(() => {
        setShowSloppyMessage(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [dropped, gameState]);

  // Handle Level Loading inside P5 Context
  const levelRef = useRef<LevelPreset>(LEVEL_PRESETS[levelIndex]);
  useEffect(() => {
    levelRef.current = LEVEL_PRESETS[levelIndex];
    resetGameEngine();
  }, [levelIndex]);

  // Safe Mute implementation
  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    GLOBAL_SYNTH.setMuted(nextMuted);
    GLOBAL_SYNTH.playClick();
  };

  // Trigger immediate physics and UI reset
  const resetGameEngine = () => {
    setCollected(0);
    setDropped(0);
    setGameState("playing");
    setChainsCount(0);
    setIsCopied(false);
    
    // Send a secure callback to trigger p5 container reload
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("gravity-paint-reset"));
    }
    GLOBAL_SYNTH.playClick();
  };

  // Clear only drawn chains (keeps marbles, particles, and progress)
  const clearDrawnChains = () => {
    setChainsCount(0);
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("gravity-paint-clear-chains"));
    }
    GLOBAL_SYNTH.playClick();
  };

  const copyShareText = () => {
    const isPerfect = dropped <= 5;
    const url = window.location.href;
    const shareText = isPerfect
      ? `I am 100% Satisfied 💧 Gravity Paint: I guided 50 colorful marbles perfectly with only ${dropped} drops! Such a serene physics flow. Play here: ${url} #GravityPaint`
      : `Gravity Paint: I guided 50 dynamic marbles into the glass bucket! Try this beautifully relaxing sandbox game: ${url} #GravityPaint`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      setIsCopied(true);
      GLOBAL_SYNTH.playPing(10);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  // Master Game Canvas Loop integration
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const sketch = (p: p5) => {
      // Matter.JS module aliases
      const { Engine, World, Bodies, Constraint, Body, Composite } = Matter;

      let engine: Matter.Engine;
      let world: Matter.World;
      
      // Canvas dimensions
      const canvasWidth = 400;
      const canvasHeight = 600;

      // Entities arrays
      interface PhysicsChain {
        links: Matter.Body[];
        constraints: Matter.Constraint[];
        color: string;
      }

      interface Marble {
        body: Matter.Body;
        color: string;
        fadeTimer: number; // For satisfying absorption melt anim
        isAbsorbed: boolean;
        size: number;
        type: "normal" | "heavy" | "light";
      }

      interface CustomParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        color: string;
        alpha: number;
      }

      interface ConfettiParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        color: string;
        size: number;
        rotation: number;
        vRotation: number;
      }

      let marbles: Marble[] = [];
      let chains: PhysicsChain[] = [];
      let staticPegs: Matter.Body[] = [];
      let anchorBodies: { x: number; y: number; body: Matter.Body }[] = [];
      let bucketBodies: Matter.Body[] = [];
      
      // Floating particles on marble capture
      let particles: CustomParticle[] = [];
      let confetti: ConfettiParticle[] = [];

      // Drawing states
      let isDrawing = false;
      let tempPoints: { x: number; y: number }[] = [];
      let snappedStartAnchor: { x: number; y: number; body: Matter.Body } | null = null;

      // Visual Juice
      let shakeAmount = 0;
      let bucketGlow = 0;

      p.setup = () => {
        const pCanvas = p.createCanvas(canvasWidth, canvasHeight);
        // Force fluid CSS scaling keeping inner logical coords at 400x600 constant
        pCanvas.addClass("w-full h-full object-contain rounded-2xl touch-none select-none");

        // Initialize engine and set smooth gravity
        engine = Engine.create({
          gravity: { x: 0, y: 0.85, scale: 0.001 }
        });
        world = engine.world;

        // Establish static world boundaries (sides and top)
        const leftWall = Bodies.rectangle(-5, canvasHeight / 2, 10, canvasHeight, { isStatic: true, friction: 0.05, restitution: 0.5 });
        const rightWall = Bodies.rectangle(canvasWidth + 5, canvasHeight / 2, 10, canvasHeight, { isStatic: true, friction: 0.05, restitution: 0.5 });
        const topWall = Bodies.rectangle(canvasWidth / 2, -10, canvasWidth, 20, { isStatic: true, friction: 0.05 });
        World.add(world, [leftWall, rightWall, topWall]);

        loadActivePresetEntities();
      };

      const loadActivePresetEntities = () => {
        if (!world) return;
        // Clear anything old
        marbles.forEach(m => {
          if (m && m.body) World.remove(world, m.body);
        });
        chains.forEach(c => {
          if (c) {
            if (c.links) c.links.forEach(l => l && World.remove(world, l));
            if (c.constraints) c.constraints.forEach(con => con && World.remove(world, con));
          }
        });
        staticPegs.forEach(peg => {
          if (peg) World.remove(world, peg);
        });
        anchorBodies.forEach(anc => {
          if (anc && anc.body) World.remove(world, anc.body);
        });
        bucketBodies.forEach(b => {
          if (b) World.remove(world, b);
        });

        marbles = [];
        chains = [];
        staticPegs = [];
        anchorBodies = [];
        bucketBodies = [];
        particles = [];
        confetti = [];
        tempPoints = [];
        isDrawing = false;
        snappedStartAnchor = null;

        const currentPreset = levelRef.current;

        // Build anchors (Small static circle triggers)
        currentPreset.anchors.forEach(anc => {
          const body = Bodies.circle(anc.x, anc.y, 8, { isStatic: true, isSensor: true });
          World.add(world, body);
          anchorBodies.push({ x: anc.x, y: anc.y, body });
        });

        // Build level static pegs
        currentPreset.pegs.forEach(pData => {
          const body = Bodies.circle(pData.x, pData.y, pData.r, { isStatic: true, friction: 0.1, restitution: 0.6 });
          World.add(world, body);
          staticPegs.push(body);
        });

        // Assemble the Dynamic Bucket for this level
        const bx = currentPreset.bucketX ?? 200;
        const by = currentPreset.bucketY ?? 550;
        const bucketBottom = Bodies.rectangle(bx, by, 68, 12, { isStatic: true, friction: 0.04 });
        const bucketLeft = Bodies.rectangle(bx - 38, by - 26, 10, 55, { isStatic: true, friction: 0.04, angle: -0.12 });
        const bucketRight = Bodies.rectangle(bx + 38, by - 26, 10, 55, { isStatic: true, friction: 0.04, angle: 0.12 });
        bucketBodies = [bucketBottom, bucketLeft, bucketRight];
        World.add(world, bucketBodies);

        setChainsCount(0);
      };

      // Custom event receiver to reset smoothly without recreation latency
      const handleGameResetEvent = () => {
        loadActivePresetEntities();
        setGameState("playing");
      };
      window.addEventListener("gravity-paint-reset", handleGameResetEvent);

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

      // Save a cleanup handler on the p5 instance to remove the global window listener safely
      (p as any).cleanup = () => {
        window.removeEventListener("gravity-paint-reset", handleGameResetEvent);
        window.removeEventListener("gravity-paint-clear-chains", handleClearChainsEvent);
      };

      p.draw = () => {
         // Run physics frame update
         // Apply custom gravity adjustments per marble type:
         marbles.forEach(m => {
           if (!m.isAbsorbed) {
             if (m.type === "heavy") {
               // Heavy (Steel) ball is less affected by gravity (sags lines less)
               // Set custom upward lift force to neutralize 55% of gravity force
               const liftY = -m.body.mass * 0.00045;
               Body.applyForce(m.body, m.body.position, { x: 0, y: liftY });
             } else if (m.type === "light") {
               // Light (Bubble) ball is more easily affected by gravity (sags lines more)
               // Set custom downward pull to multiply gravity acceleration!
               const pullY = m.body.mass * 0.00035;
               Body.applyForce(m.body, m.body.position, { x: 0, y: pullY });
             }
           }
         });

         // We use safe constant delta timing to prevent marble tunneling at higher drops
         Engine.update(engine, 1000 / 60);

         // Apply visual screen-shake transform if active
         p.push();
         if (shakeAmount > 0.1) {
           p.translate(p.random(-shakeAmount, shakeAmount), p.random(-shakeAmount, shakeAmount));
           shakeAmount *= 0.88; // decay
         }

         // 1. Draw Satisfying Grid Background (Soft architectural dots)
         p.background(255, 251, 240); // Vibrant Palette warm cream background
         p.stroke(255, 232, 204);     // #FFE8CC Soft peach dots
         p.strokeWeight(2.5);
         for (let x = 20; x < canvasWidth; x += 25) {
           for (let y = 20; y < canvasHeight; y += 25) {
             p.point(x, y);
           }
         }

         // Draw Spigot guiding lines inside the background
         p.stroke(255, 232, 204, 140);
         p.strokeWeight(1);
         p.line(200, 30, 200, canvasHeight);

         // 2. Render Static Level Pegs/Obstacles
         staticPegs.forEach(peg => {
           const pos = peg.position;
           const r = (peg as any).circleRadius;
           
           // Soft outer highlight matching theme peach
           p.noStroke();
           p.fill(251, 146, 60, 50); // translucent orange-400 shadow
           p.ellipse(pos.x, pos.y, r * 2.3, r * 2.3);

           p.fill(251, 146, 60); // Vibrant theme orange-400 peg
           p.stroke(255);
           p.strokeWeight(1.5);
           p.ellipse(pos.x, pos.y, r * 2, r * 2);

           // inner reflective shine
           p.noStroke();
           p.fill(255, 210);
           p.ellipse(pos.x - r * 0.35, pos.y - r * 0.35, r * 0.4, r * 0.4);
         });

         // 3. Spawning Logic of Marbles (from spigot at x=200, y=30)
         const activeState = gameStateRef.current;
         if (faucetActiveRef.current && activeState === "playing" && !showSloppyMessageRef.current) {
           if (p.frameCount % streamSpeedRef.current === 0) {
             spawnMarble();
           }
         }

         // 4. Render and Update Marbles
         for (let i = marbles.length - 1; i >= 0; i--) {
           const m = marbles[i];
           
           if (!m.isAbsorbed) {
             const pos = m.body.position;
             const r = (m.body as any).circleRadius;

             // Handle bottom off-screen drops
             if (pos.y > canvasHeight + 15) {
               World.remove(world, m.body);
               marbles.splice(i, 1);
               
               // Increment drop count
               if (!showSloppyMessageRef.current) setDropped(prev => {
                 const next = prev + 1;
                 return next;
               });
               continue;
             }

             // Draw Shiny volumetric styled marble based on type
             p.push();
             p.translate(pos.x, pos.y);
             p.rotate(m.body.angle);
             p.noStroke();
             
             if (m.type === "heavy") {
               // Metallic steel marble ball render style
               p.fill(130, 135, 145);
               p.ellipse(0, 0, r * 2, r * 2);

               p.noFill();
               p.stroke(255, 255, 255, 150);
               p.strokeWeight(1.5);
               p.arc(0, 0, r * 1.4, r * 1.4, p.PI + p.QUARTER_PI, p.TWO_PI);
               p.stroke(35, 40, 50, 95);
               p.strokeWeight(1.0);
               p.arc(0, 0, r * 1.4, r * 1.4, p.QUARTER_PI, p.PI);

               p.noStroke();
               p.fill(255, 240);
               p.ellipse(-r * 0.38, -r * 0.38, r * 0.55, r * 0.55);
             } else if (m.type === "light") {
               // Translucent neon glowing bubble marble render style
               p.stroke(244, 143, 177, 220); // soft pink/purple bubble edge
               p.strokeWeight(1.5);
               p.fill(255, 230, 242, 110); // slightly transparent body
               p.ellipse(0, 0, r * 2, r * 2);

               p.noStroke();
               p.fill(255, 235);
               p.ellipse(-r * 0.32, -r * 0.32, r * 0.45, r * 0.45);
             } else {
               // Standard Glass Marble design
               p.fill(m.color);
               p.ellipse(0, 0, r * 2, r * 2);

               // Shading swirl core
               p.stroke(255, 110);
               p.strokeWeight(1);
               p.noFill();
               p.arc(0, 0, r * 1.3, r * 1.3, p.QUARTER_PI, p.HALF_PI + p.QUARTER_PI);

               // Bright glossy volumetric highlight
               p.noStroke();
               p.fill(255, 200);
               p.ellipse(-r * 0.35, -r * 0.35, r * 0.5, r * 0.5);
             }
             p.pop();

             // Bucket Area Dynamic Capture Check
             const bx = levelRef.current.bucketX ?? 200;
             const by = levelRef.current.bucketY ?? 550;

             if (pos.x > bx - 35 && pos.x < bx + 35 && pos.y > by - 42 && pos.y < by + 2) {
               m.isAbsorbed = true;
               World.remove(world, m.body); // Dissolve immediately from physics to prevent grid clogs

               // Increment score & run visuals
               if (!showSloppyMessageRef.current) setCollected(prev => {
                 const updated = prev + 1;
                 // Run satisfying ping feedback
                 GLOBAL_SYNTH.playPing(updated);
                 shakeAmount = p.constrain(shakeAmount + 4.5, 0, 15);
                 bucketGlow = 1.0;

                 // Fire micro particle splatter
                 for (let k = 0; k < 12; k++) {
                   particles.push({
                     x: pos.x + p.random(-10, 10),
                     y: pos.y + p.random(-5, 0),
                     vx: p.random(-2.5, 2.5),
                     vy: p.random(-5, -1.5),
                     size: p.random(3.2, 6.2),
                     color: m.color,
                     alpha: 255
                   });
                 }

                 // If captured 50, trigger win state!
                 if (updated >= 50 && gameStateRef.current === "playing") {
                   setGameState("won");
                 }
                 return updated;
               });
             }

           } else {
             // Collected Shrink Absorption Animation
             m.fadeTimer -= 0.08;
             if (m.fadeTimer <= 0) {
               marbles.splice(i, 1);
             } else {
               // Draw shrinking / dissolving marble drifting down dynamic center of bucket
               const bx = levelRef.current.bucketX ?? 200;
               const by = levelRef.current.bucketY ?? 550;
               const pullX = p.lerp(m.body.position.x, bx, 0.15); // float into local bucket center
               const pullY = p.lerp(m.body.position.y, by - 10, 0.15);
               const curR = m.size * m.fadeTimer;

               p.push();
               p.noStroke();
               p.fill(p.red(p.color(m.color)), p.green(p.color(m.color)), p.blue(p.color(m.color)), m.fadeTimer * 255);
               p.ellipse(pullX, pullY, curR * 2, curR * 2);
               p.fill(255, m.fadeTimer * 200);
               p.ellipse(pullX - curR * 0.3, pullY - curR * 0.3, curR * 0.4, curR * 0.4);
               p.pop();
             }
           }
         }

        // 5. Draw Active Physics Chains
        chains.forEach(chain => {
          if (chain.links.length < 2) return;

          p.push();
          p.noFill();
          
          // Outer thick translucent dynamic shadow tube
          p.strokeCap(p.ROUND);
          p.strokeJoin(p.ROUND);
          p.strokeWeight(12);
          const shadowCol = p.color(chain.color);
          p.stroke(230, 230, 239, 180);
          p.beginShape();
          chain.links.forEach(l => p.vertex(l.position.x, l.position.y));
          p.endShape();

          // Main gorgeous thick pastel tube rope representation
          p.strokeWeight(7.5);
          p.stroke(chain.color);
          p.beginShape();
          chain.links.forEach(l => p.vertex(l.position.x, l.position.y));
          p.endShape();

          // Inner reflective highlight tube (neon vinyl wire look)
          p.strokeWeight(1.5);
          p.stroke(255, 255, 255, 180);
          p.beginShape();
          chain.links.forEach(l => p.vertex(l.position.x, l.position.y - 1.2));
          p.endShape();

          // Draw end connecting nodes
          p.noStroke();
          p.fill(chain.color);
          const first = chain.links[0].position;
          const last = chain.links[chain.links.length - 1].position;
          p.ellipse(first.x, first.y, 7, 7);
          p.ellipse(last.x, last.y, 7, 7);

          p.pop();
        });

        // 6. Draw Spigot Head (Metallic sleek funnel)
        p.push();
        p.rectMode(p.CENTER);
        
        // Shadow banner
        p.noStroke();
        p.fill(255, 232, 204, 120); // matching theme #FFE8CC
        p.rect(200, 13, 50, 20, 4);

        // Core spigot nozzle
        p.fill(30, 41, 59); // Slate-800 brand color
        p.stroke(255);
        p.strokeWeight(1.5);
        p.rect(200, 10, 44, 14, 4);

        // Glowing stream nozzle indicator light
        const statusGlow = faucetActiveRef.current && activeState === "playing"
          ? p.color(251, 146, 60, 180 + p.sin(p.frameCount * 0.2) * 75) // bright orange pulse
          : p.color(100, 116, 139); // dark slate-500
        p.fill(statusGlow);
        p.noStroke();
        p.ellipse(200, 10, 8, 8);

        // Funnel spout
        p.fill(30, 41, 59); // Slate-800 brand color
        p.rect(200, 22, 18, 10, 2);
        
        // Spawning drop preview
        if (faucetActiveRef.current && activeState === "playing") {
          const spawnSoonRatio = (p.frameCount % streamSpeedRef.current) / streamSpeedRef.current;
          p.fill(251, 146, 60, spawnSoonRatio * 220); // fading orange-400 preview droplet
          p.ellipse(200, 30 + spawnSoonRatio * 5, 5, 5 + spawnSoonRatio * 4);
        }
        p.pop();

        // 7. Draw the Anchors & Tether Preview Indicators
        anchorBodies.forEach(anc => {
          const mD = p.dist(p.mouseX, p.mouseY, anc.x, anc.y);
          const isTargeted = mD <= 32;

          p.push();
          p.noFill();

          // Outer pulsing ring indicator to prompt snapping
          if (isTargeted) {
            p.stroke(251, 146, 60, 235); // orange-400
            p.strokeWeight(1.8);
            const dPulse = 26 + p.sin(p.frameCount * 0.18) * 6;
            p.ellipse(anc.x, anc.y, dPulse, dPulse);
            
            // magnetic indicator line if drawing
            if (isDrawing && tempPoints.length > 0) {
              p.stroke(251, 146, 60, 140);
              p.strokeWeight(1.2);
              (p.drawingContext as any).setLineDash([3, 4]);
              const lastPt = tempPoints[tempPoints.length - 1];
              p.line(anc.x, anc.y, lastPt.x, lastPt.y);
              (p.drawingContext as any).setLineDash([]);
            }
          } else {
            p.stroke(255, 232, 204, 150); // Soft theme #FFE8CC outline
            p.strokeWeight(1.2);
            p.ellipse(anc.x, anc.y, 22, 22);
          }

          // Core Anchor pin
          p.fill(251, 146, 60); // Vibrant orange-400 central peg
          p.noStroke();
          p.ellipse(anc.x, anc.y, 11, 11);

          // Center bevel point
          p.fill(255);
          p.ellipse(anc.x - 1.8, anc.y - 1.8, 3, 3);
          p.pop();
        });

        // 8. Render Drawing State & Dotted Line Guides
        if (isDrawing && tempPoints.length > 0) {
          p.push();
          p.noFill();
          // Glow ribbon behind raw preview
          p.stroke(251, 146, 60, 45); // matching peach glow
          p.strokeWeight(10);
          p.beginShape();
          tempPoints.forEach(pt => p.vertex(pt.x, pt.y));
          p.endShape();

          // Crisp drawn line preview
          p.stroke(30, 41, 59); // Slate-850 architectural draw line! Super satisfying
          p.strokeWeight(4.5);
          p.beginShape();
          tempPoints.forEach(pt => p.vertex(pt.x, pt.y));
          p.endShape();

          // Snap guidance to current mouse
          // If hovering near a terminating anchor, snap guide lines
          const trailingAnchor = findClosestAnchor(p.mouseX, p.mouseY, 32);
          if (trailingAnchor) {
            p.stroke(251, 146, 60);
            p.strokeWeight(2.5);
            p.line(tempPoints[tempPoints.length - 1].x, tempPoints[tempPoints.length - 1].y, trailingAnchor.x, trailingAnchor.y);
          } else {
            // Draw standard dashed drawing guide to pointer
            p.stroke(30, 41, 59, 110);
            p.strokeWeight(1.5);
            drawDashedLine(p, tempPoints[tempPoints.length - 1].x, tempPoints[tempPoints.length - 1].y, p.mouseX, p.mouseY, 5, 4);
          }
          p.pop();
        }

        // 9. Render Catching Bucket
        p.push();
        p.noFill();
        
        const bx = levelRef.current.bucketX ?? 200;
        const by = levelRef.current.bucketY ?? 550;

        // Amber glowing outline when absorbing
        if (bucketGlow > 0.02) {
          p.stroke(245, 158, 11, bucketGlow * 160);
          p.strokeWeight(11 * bucketGlow);
          p.beginShape();
          p.vertex(bx - 48, by - 55);
          p.vertex(bx - 32, by);
          p.vertex(bx + 32, by);
          p.vertex(bx + 48, by - 55);
          p.endShape();
          bucketGlow -= 0.04; // decay glow
        }

        // Main glass cup container frame
        p.stroke(245, 158, 11, 235); // amber core
        p.strokeWeight(5.5);
        p.strokeCap(p.ROUND);
        p.strokeJoin(p.ROUND);
        p.beginShape();
        p.vertex(bx - 48, by - 55); // left flared rim
        p.vertex(bx - 32, by); // flat bottom left
        p.vertex(bx + 32, by); // flat bottom right
        p.vertex(bx + 48, by - 55); // right flared rim
        p.endShape();

        // Shaded soft amber glass volume
        p.noStroke();
        p.fill(245, 158, 11, 16);
        p.beginShape();
        p.vertex(bx - 46, by - 55);
        p.vertex(bx - 30, by - 2);
        p.vertex(bx + 30, by - 2);
        p.vertex(bx + 46, by - 55);
        p.endShape();

        p.pop();

        // 10. Update and Render Burst Capture Particles
        for (let idx = particles.length - 1; idx >= 0; idx--) {
          const part = particles[idx];
          part.x += part.vx;
          part.y += part.vy;
          part.vy += 0.12; // light upward ambient gravity
          part.alpha -= 8;

          if (part.alpha <= 0) {
            particles.splice(idx, 1);
          } else {
            p.noStroke();
            p.fill(p.red(p.color(part.color)), p.green(p.color(part.color)), p.blue(p.color(part.color)), part.alpha);
            p.ellipse(part.x, part.y, part.size, part.size);
          }
        }

        // 11. Celebrating Confetti Particle loop (Triggers when won)
        if (activeState === "won") {
          // Keep spawning magical confetti drops randomly at top
          if (p.frameCount % 2 === 0 && confetti.length < 80) {
            const confettiColors = ["#FFADAD", "#FFD6A5", "#FDFFB6", "#CAFFBF", "#9BF6FF", "#A0C4FF", "#BDB2FF", "#FFC6FF"];
            confetti.push({
              x: p.random(0, canvasWidth),
              y: -10,
              vx: p.random(-1.5, 1.5),
              vy: p.random(1.2, 3),
              color: p.random(confettiColors),
              size: p.random(6, 11),
              rotation: p.random(0, p.TWO_PI),
              vRotation: p.random(-0.06, 0.06)
            });
          }

          for (let cIdx = confetti.length - 1; cIdx >= 0; cIdx--) {
            const c = confetti[cIdx];
            c.x += c.vx + p.sin(p.frameCount * 0.05 + c.size) * 0.4; // sway
            c.y += c.vy;
            c.rotation += c.vRotation;

            if (c.y > canvasHeight + 10) {
              confetti.splice(cIdx, 1);
            } else {
              p.push();
              p.translate(c.x, c.y);
              p.rotate(c.rotation);
              p.rectMode(p.CENTER);
              p.noStroke();
              p.fill(c.color);
              p.rect(0, 0, c.size, c.size * 0.5, 2);
              p.pop();
            }
          }
        }

        // 12. Clean up unanchored fallen chains
        for (let cIdx = chains.length - 1; cIdx >= 0; cIdx--) {
          const chain = chains[cIdx];
          const allFallen = chain.links.every(l => l.position.y > canvasHeight + 15);
          if (allFallen) {
            chain.links.forEach(l => World.remove(world, l));
            chain.constraints.forEach(con => World.remove(world, con));
            chains.splice(cIdx, 1);
            setChainsCount(chains.length);
          }
        }

        // Complete screen translate popping
        p.pop();
      };

      // Spawns a newly configured marble at the spigot site
      const spawnMarble = () => {
        const marbleSize = p.random(6.5, 8.2);
        const types: ("normal" | "heavy" | "light")[] = ["normal", "heavy", "light"];
        const chosenType = p.random(types);

        let density = 0.002;
        let color = "#9BF6FF";

        if (chosenType === "heavy") {
          // 'heavy' is less affected by gravity (sags lines less -> low density)
          density = 0.0004; // Extremely low density means minimal stretching force on chain constraints
          color = "#94A3B8"; // Sleek Metallic Gray
        } else if (chosenType === "light") {
          // 'light' is more easily affected by gravity (sags lines more -> high density)
          density = 0.0125; // Extremely high density means it sags lines heavily
          color = "#F472B6"; // Shiny Glowing Neon Pink Bubble
        } else {
          // Standard gorgeous glass marble
          const normalColors = ["#FFAAA6", "#FFD3B6", "#CCE2CB", "#E8C1A5", "#D8B4F8", "#9BF6FF", "#FFC6FF"];
          color = p.random(normalColors);
          density = 0.002;
        }

        // Spawn slightly randomized near spigot outlet at y=32
        const mBody = Bodies.circle(200 + p.random(-5, 5), 32, marbleSize, {
          restitution: 0.55,
          friction: 0.015,
          density: density,
          collisionFilter: { group: 1 }
        });
        
        // Push slightly downwards initially
        Matter.Body.setVelocity(mBody, { x: p.random(-0.4, 0.4), y: 1.25 });
        World.add(world, mBody);

        marbles.push({
          body: mBody,
          color: color,
          fadeTimer: 1.0,
          isAbsorbed: false,
          size: marbleSize,
          type: chosenType
        });
      };

      // Helper function to find closest anchor pin in range
      const findClosestAnchor = (px: number, py: number, maxDistance: number) => {
        let closest = null;
        let minDist = maxDistance;

        anchorBodies.forEach(anc => {
          const d = p.dist(px, py, anc.x, anc.y);
          if (d < minDist) {
            minDist = d;
            closest = anc;
          }
        });
        return closest;
      };

      // Helper dash drawer
      const drawDashedLine = (pRef: p5, x1: number, y1: number, x2: number, y2: number, delta: number, gap: number) => {
        const d = pRef.dist(x1, y1, x2, y2);
        const steps = d / (delta + gap);
        for (let i = 0; i < steps; i++) {
          const t1 = i / steps;
          const t2 = (i + 0.55) / steps;
          pRef.line(
            pRef.lerp(x1, x2, t1), pRef.lerp(y1, y2, t1),
            pRef.lerp(x1, x2, t2), pRef.lerp(y1, y2, t2)
          );
        }
      };

      // ==========================================
      // CANVAS POINTER / INTUITIVE MOUSE GESTURES
      // ==========================================
      p.mousePressed = () => {
        if (gameStateRef.current === "won") return;

        // Check canvas bounding box bounds
        if (p.mouseX >= 0 && p.mouseX <= canvasWidth && p.mouseY >= 0 && p.mouseY <= canvasHeight) {
          isDrawing = true;
          
          // Detect snap start connection
          const snapStart = findClosestAnchor(p.mouseX, p.mouseY, 32);
          if (snapStart) {
            snappedStartAnchor = snapStart;
            tempPoints = [{ x: snapStart.x, y: snapStart.y }];
            GLOBAL_SYNTH.playBoing();
          } else {
            snappedStartAnchor = null;
            tempPoints = [{ x: p.mouseX, y: p.mouseY }];
          }
        }
      };

      p.mouseDragged = () => {
        if (!isDrawing) return;

        const maxDistBetweenLinks = 16.5; // segment distance limits
        const lastPt = tempPoints[tempPoints.length - 1];
        const distToPrev = p.dist(p.mouseX, p.mouseY, lastPt.x, lastPt.y);

        if (distToPrev > maxDistBetweenLinks) {
          // If we drag close to another anchor pin, lock snap dragging
          const anchorLock = findClosestAnchor(p.mouseX, p.mouseY, 28);
          if (anchorLock) {
            // Check if it's the start anchor - prevent recursive locking
            if (snappedStartAnchor && anchorLock.body === snappedStartAnchor.body && tempPoints.length < 3) {
              return;
            }
            tempPoints.push({ x: anchorLock.x, y: anchorLock.y });
            isDrawing = false; // complete line
            instantiateChainPhysics();
          } else {
            tempPoints.push({ x: p.mouseX, y: p.mouseY });
            // Soft drawing drip ticks
            if (p.frameCount % 9 === 0) {
              GLOBAL_SYNTH.playBoing();
            }
          }
        }
      };

      p.mouseReleased = () => {
        if (!isDrawing) return;
        isDrawing = false;

        if (tempPoints.length > 1) {
          // Snaps end of rope to nearest matching anchor
          const lastIndex = tempPoints.length - 1;
          const snapEnd = findClosestAnchor(tempPoints[lastIndex].x, tempPoints[lastIndex].y, 32);
          
          if (snapEnd) {
            // Prevent same double snap point loop
            if (snappedStartAnchor && snapEnd.body === snappedStartAnchor.body && tempPoints.length < 4) {
              tempPoints = [];
              return;
            }
            tempPoints[lastIndex] = { x: snapEnd.x, y: snapEnd.y };
          }
          instantiateChainPhysics();
        } else {
          tempPoints = [];
        }
      };

      // Converts the drafted path into active Matter.js chains
      const instantiateChainPhysics = () => {
        const linkRadius = 4.2;
        const pts = [...tempPoints];
        tempPoints = [];
        if (pts.length < 2) return;

        // Build composite bodies
        const linkBodies = pts.map((pt) => {
          return Bodies.circle(pt.x, pt.y, linkRadius, {
            density: 0.004,
            friction: 0.1,
            restitution: 0.4,
            collisionFilter: { group: -1 } // self collide exclusion
          });
        });

        // Add all chain nodes to the system
        World.add(world, linkBodies);

        // Chain mutual ties connection
        const linkConstraints: Matter.Constraint[] = [];
        for (let i = 0; i < linkBodies.length - 1; i++) {
          const expectedLength = p.dist(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
          const c = Constraint.create({
            bodyA: linkBodies[i],
            bodyB: linkBodies[i + 1],
            stiffness: 0.95,
            length: expectedLength
          });
          World.add(world, c);
          linkConstraints.push(c);
        }

        // Hook up snapping constraints to actual anchor nodes
        // Hook up start anchor anchor constraint
        if (snappedStartAnchor) {
          const startC = Constraint.create({
            bodyA: snappedStartAnchor.body,
            bodyB: linkBodies[0],
            stiffness: 0.98,
            length: 1
          });
          World.add(world, startC);
          linkConstraints.push(startC);
        }

        // Hook up end anchor constraint if within proximity
        const finalPt = pts[pts.length - 1];
        const snapEnd = findClosestAnchor(finalPt.x, finalPt.y, 32);
        if (snapEnd) {
          const endC = Constraint.create({
            bodyA: snapEnd.body,
            bodyB: linkBodies[linkBodies.length - 1],
            stiffness: 0.98,
            length: 1
          });
          World.add(world, endC);
          linkConstraints.push(endC);
          GLOBAL_SYNTH.playBoing();
        }

        const chainPastelColors = [
          "#FFAAA6", // soft pastel rose-peach
          "#FFD3B6", // warm apricot
          "#A0C4FF", // vibrant blue pastel
          "#CAFFBF", // soft green pastel
          "#FFC6FF"  // lovely lilac pink
        ];
        const chainCol = p.random(chainPastelColors);

        chains.push({
          links: linkBodies,
          constraints: linkConstraints,
          color: chainCol
        });

        setChainsCount(chains.length);
        GLOBAL_SYNTH.playBoing();
        
        // Reset snapped state
        snappedStartAnchor = null;
      };
    };

    // Mount P5 context inside the DOM container securely
    const customP5 = new p5(sketch, canvasContainerRef.current);
    p5InstanceRef.current = customP5;

    // Standard teardown on exit
    return () => {
      if (p5InstanceRef.current) {
        if (typeof (p5InstanceRef.current as any).cleanup === "function") {
          (p5InstanceRef.current as any).cleanup();
        }
        p5InstanceRef.current.remove();
      }
    };
  }, []);

  const currentLevel = LEVEL_PRESETS[levelIndex];
  const isPerfectRun = dropped <= 5;

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-start p-3 sm:p-6 text-slate-700 antialiased font-sans select-none"
      style={{ 
        backgroundImage: "radial-gradient(#FFE8CC 1.5px, transparent 1.5px)", 
        backgroundSize: "32px 32px", 
        backgroundColor: "#FFFBF0" 
      }}
    >
      
      {/* HEADER SECTION */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 px-6 py-5 bg-white border-2 border-[#FFE8CC] rounded-3xl shadow-xs z-10 animate-fade-in">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center shadow-md shadow-orange-100 transform rotate-[-3deg] hover:rotate-0 transition-transform">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight uppercase leading-none">
                Gravity Paint
              </h1>
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest font-sans mt-1.5 leading-none">
                Vibrant Sandbox Level Editor
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex items-center flex-wrap justify-center gap-2.5">
          <button
            onClick={() => setShowHowTo(true)}
            title="How to Play"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black bg-white border-2 border-[#FFE8CC] hover:bg-[#FFFBF0] rounded-xl transition shadow-sm text-slate-700 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-orange-400" />
            <span>GUIDE</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2.5 sm:px-4 sm:py-2.5 bg-white border-2 border-[#FFE8CC] hover:bg-[#FFFBF0] rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            title={muted ? "Unmute" : "Mute Sound"}
          >
            {muted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-black hidden sm:inline text-rose-500 uppercase">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black hidden sm:inline text-orange-500 uppercase">Audio ON</span>
              </>
            )}
          </button>

          <button
            onClick={clearDrawnChains}
            className="px-5 py-2.5 bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:scale-[1.03] active:scale-95 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            title="Clear drawn lines but keep marble score and progress"
          >
            <Eraser className="w-4 h-4 text-orange-400" />
            <span>CLEAR CHAINS</span>
          </button>

          <button
            onClick={resetGameEngine}
            className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 hover:scale-[1.03] active:scale-95 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-slate-200 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-orange-300" />
            <span>RESET RUN</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDE BAR / LEVEL CONFIG & PROGRESS DETAILS */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* CAMPAIGN LEVEL PRESENTS CARD */}
          <div className="bg-white border-2 border-[#FFE8CC] rounded-3xl p-5 shadow-sm">
            <h2 className="text-xs font-black tracking-widest text-[#E8C1A5] text-orange-400 uppercase flex items-center gap-1.5 mb-4">
              <LayoutGrid className="w-4 h-4 text-orange-400" />
              Campaign Presets
            </h2>

            <div className="flex flex-col gap-3">
              {LEVEL_PRESETS.map((lvl, index) => {
                const isActive = levelIndex === index;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      setLevelIndex(index);
                      GLOBAL_SYNTH.playClick();
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-start relative overflow-hidden cursor-pointer ${
                      isActive
                        ? "bg-orange-50/40 border-orange-300 ring-4 ring-orange-100"
                        : "bg-stone-50/55 border-transparent hover:border-orange-100 hover:bg-orange-50/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-sans font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black">
                          {lvl.id}
                        </span>
                        {lvl.name}
                      </span>
                      <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${lvl.difficultyColor}`}>
                        {lvl.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pl-6 font-medium">
                      {lvl.description}
                    </p>
                    {isActive && (
                      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-orange-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE LEVEL BRIEF */}
          <div className="bg-orange-50/25 border-2 border-[#FFE8CC] rounded-3xl p-5 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-orange-500 font-sans">
              Active Objective
            </span>
            <h3 className="text-xl font-black text-slate-800">
              {currentLevel.name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              {currentLevel.description}
            </p>
            <div className="flex gap-4 mt-2 border-t border-[#FFE8CC]/60 pt-2.5 text-xs font-mono font-bold text-slate-500">
              <div>
                <span className="text-orange-500 font-extrabold">{currentLevel.anchors.length}</span> Anchors
              </div>
              <div>
                <span className="text-orange-500 font-extrabold">{currentLevel.pegs.length}</span> Pegs
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE COLUMN - THE PHYSICAL CANVAS CONVEYOR */}
        <div className="lg:col-span-4 flex flex-col items-center gap-4">
          
          {/* THE CANVAS SHELL Frame */}
          <div className="relative w-full max-w-[400px] bg-white border-4 border-[#FFE8CC] rounded-[32px] p-2 shadow-xl shadow-orange-100/50">
            
            {/* IN-GAME TOP HEADER HUD */}
            <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between pointer-events-none">
              
              {/* DROPS DROPPED ERROR TALLY */}
              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md shadow-md border-2 border-[#FFE8CC] rounded-full px-3 py-1.5">
                <span className="text-[10px] font-black text-slate-400">LOST:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((idx) => {
                    const isMelted = dropped >= idx;
                    return (
                      <span 
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 inline-block ${
                          isMelted 
                            ? "bg-stone-200 text-stone-300 scale-90" 
                            : isPerfectRun 
                              ? "bg-orange-400 animate-pulse ring-2 ring-orange-100" 
                              : "bg-amber-400"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* STABILITY PREFERNCE STATUS INDICATOR */}
              <div className={`px-3 py-1.5 rounded-full shadow-md border-2 text-[10px] font-black text-white tracking-wider flex items-center gap-1 bg-white/95 ${
                isPerfectRun
                  ? "border-[#FFE8CC] text-orange-500 bg-white"
                  : "border-slate-200 text-slate-600 bg-white"
              }`}>
                {isPerfectRun ? (
                  <>
                    <Flame className="w-3.5 h-3.5 text-orange-400 inline bg-orange-100 p-0.5 rounded-full animate-bounce" />
                    <span>PERFECT OK</span>
                  </>
                ) : (
                  <>
                    <Info className="w-3.5 h-3.5 text-slate-400 inline" />
                    <span>CASUAL ELIGIBLE</span>
                  </>
                )}
              </div>
            </div>

            {/* MOUNTED CANVAS COMPONENT */}
            <div 
              ref={canvasContainerRef} 
              className="relative w-full aspect-[2/3] overflow-hidden bg-[#FFFBF0] rounded-2xl border-2 border-[#FFE8CC]/80 shadow-inner"
            />

            {/* SPIGOT WATER DRAWER TRIGGER */}
            <div className="flex items-center justify-between mt-3 px-2">
              <div className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                <span>Active Chains:</span>
                <span className="text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded font-black font-sans text-[10px]">
                  {chainsCount}
                </span>
              </div>

              {/* TAP SPOUT SPEED BAR */}
              <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-100/80">
                <span className="text-[9px] font-black text-slate-400 uppercase">Spigot Flow:</span>
                <select 
                  value={streamSpeed}
                  onChange={(e) => {
                    setStreamSpeed(Number(e.target.value));
                    GLOBAL_SYNTH.playClick();
                  }}
                  className="bg-white border-2 border-[#FFE8CC] text-[10px] font-black rounded-lg px-2 py-1 text-slate-700 focus:outline-none cursor-pointer hover:bg-orange-50/20"
                >
                  <option value={15}>Torrent (Fast)</option>
                  <option value={24}>Drizzle (Normal)</option>
                  <option value={42}>Drip (Slow)</option>
                </select>
              </div>
            </div>

            {/* SLOPPY LOSS OVERLAY */}
            {showSloppyMessage && (
              <div className="absolute inset-2 bg-slate-900/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-5 z-30 animate-fade-in text-white touch-none">
                <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-950/40 mb-3.5 transform rotate-[4deg] animate-bounce">
                  <Info className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-black text-rose-400 uppercase tracking-widest leading-none mb-1.5 font-sans">
                  SLOPPY RUN!
                </h3>
                <p className="text-[11px] text-slate-300 max-w-[240px] leading-relaxed font-bold font-sans">
                  You lost more than <strong className="text-white font-extrabold">5 marbles</strong> off-screen! The level has been restarted. Let's paint a safer route!
                </p>
                <button
                  onClick={() => {
                    setShowSloppyMessage(false);
                    GLOBAL_SYNTH.playClick();
                  }}
                  className="mt-5 w-full max-w-[180px] py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-md cursor-pointer border border-rose-400/30"
                >
                  Got it, Retry!
                </button>
              </div>
            )}

            {/* CELEBRATORY FULL COVERAGE WIN SCREEN */}
            {gameState === "won" && (
              <div className="absolute inset-2 bg-slate-900/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-5 z-30 animate-fade-in">
                
                {/* 100% Satisfying Badge conditionally */}
                {isPerfectRun ? (
                  <div className="p-6 bg-white border-4 border-[#CAFFBF] rounded-[32px] shadow-2xl transform rotate-[-2deg] flex flex-col items-center gap-3.5 mb-5 scale-95 touch-none">
                    <div className="text-[#70E000] text-3xl font-black italic tracking-tighter drop-shadow-sm leading-none">
                      100% SATISFYING
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-300 animate-bounce"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-bounce delay-75"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-300 animate-bounce delay-150"></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-white border-4 border-[#FFE8CC] rounded-[32px] shadow-xl mb-4 flex flex-col items-center gap-2 scale-95">
                    <Check className="w-10 h-10 text-emerald-500" />
                    <span className="font-display font-black text-xl tracking-tight uppercase text-slate-800">
                      Level Complete!
                    </span>
                    <span className="text-[10px] font-mono text-slate-405 font-bold uppercase tracking-wider">
                      50 Marbles Safely Collected
                    </span>
                  </div>
                )}

                <div className="text-slate-300 text-xs max-w-xs mb-4 space-y-1.5">
                  <p className="leading-relaxed text-slate-300">
                    You perfectly routed <strong className="text-white">50 Marbles</strong> inside the vessel!
                  </p>
                  <div className="bg-slate-800 border border-slate-700/60 p-2.5 rounded-xl text-[10px] font-mono space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Total Missed:</span>
                      <span className={isPerfectRun ? "text-[#70E000] font-bold animate-pulse" : "text-amber-400 font-bold"}>
                        {dropped} drops
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Chains Used:</span>
                      <span className="text-white font-bold">{chainsCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full max-w-xs">
                  {levelIndex < LEVEL_PRESETS.length - 1 ? (
                    <button
                      onClick={() => {
                        const nextIndex = levelIndex + 1;
                        setLevelIndex(nextIndex);
                        setGameState("playing");
                        resetGameEngine();
                      }}
                      className="w-full py-3 px-4 bg-orange-400 hover:bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-1.5 transform active:scale-95 transition-all text-xs cursor-pointer select-none shadow-lg shadow-orange-950/20 border border-orange-300"
                    >
                      <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
                      <span>PLAY NEXT LEVEL</span>
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs font-black text-emerald-400 uppercase tracking-widest animate-pulse font-sans">
                      🎉 Campaign Completed! 🎉
                    </div>
                  )}

                  <button
                    onClick={copyShareText}
                    className="w-full py-2 px-4 bg-[#A0C4FF] text-white font-black rounded-xl shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 transform active:scale-95 transition-all text-xs cursor-pointer select-none"
                  >
                    <Share2 className="w-4 h-4 text-white stroke-[3px]" />
                    <span>{isCopied ? "Copied Link! 💧" : "SHARE MY RUN"}</span>
                  </button>

                  <button
                    onClick={resetGameEngine}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold rounded-lg transition-all text-[9px] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try This Level Again</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN - LIVE PROGRESS PANEL & GAME THERAPY GUIDELINE */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* HARMONY HUD SCORE CARD */}
          <div className="bg-white border-2 border-[#FFE8CC] rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="text-xs font-black tracking-widest text-orange-500 uppercase mb-3">
              Satisfying Dashboard
            </h2>

            {/* MARBLE COLLECTION FILL TALLY */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold font-display text-slate-800 tracking-tighter">
                {collected}
              </span>
              <span className="text-slate-400 font-bold text-sm">/ 50 collected</span>
            </div>

            {/* PROGRESS FILL LEVEL BEAM */}
            <div className="w-full bg-slate-100 h-3 rounded-full mb-3 overflow-hidden border border-slate-200/50">
              <div 
                className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${
                  collected >= 50 
                    ? "from-emerald-400 to-teal-500" 
                    : isPerfectRun 
                      ? "from-orange-400 to-amber-500" 
                      : "from-amber-400 to-orange-450"
                }`}
                style={{ width: `${Math.min((collected / 50) * 100, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#FFE8CC]/60 mt-2 text-xs">
              <div className="bg-[#FFFBF0]/60 p-3 rounded-2xl border border-[#FFE8CC]/55">
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-0.5">Dropped</span>
                <span className={`text-base font-black ${isPerfectRun ? "text-slate-705" : "text-orange-600 animate-pulse"}`}>
                  {dropped} balls
                </span>
              </div>

              <div className="bg-[#FFFBF0]/60 p-3 rounded-2xl border border-[#FFE8CC]/55">
                <span className="block text-[10px] font-black text-slate-400 uppercase mb-0.5">Spigot Spacing</span>
                <span className="text-base font-black text-slate-705">
                  {streamSpeed} frames
                </span>
              </div>
            </div>

            {/* MARBLE TYPES LEGEND */}
            <div className="mt-4 pt-3.5 border-t border-[#FFE8CC]/60 flex flex-col gap-2">
              <span className="text-[9px] font-black tracking-widest text-[#E8C1A5] uppercase">
                Active Marble Types
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                <div className="bg-stone-50/50 p-2 rounded-xl flex flex-col items-center border border-stone-100">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-200 mb-1 inline-block border-2 border-white shadow-xs" />
                  <span className="text-slate-700 text-[10px]">Glass</span>
                  <span className="text-[7.5px] text-slate-400 uppercase font-mono mt-0.5 leading-none">Normal</span>
                </div>
                <div className="bg-stone-50/50 p-2 rounded-xl flex flex-col items-center border border-stone-100">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-400 mb-1 inline-block border-2 border-white shadow-xs" />
                  <span className="text-slate-705 text-[10px]">Steel</span>
                  <span className="text-[7.5px] text-slate-500 uppercase font-mono mt-0.5 leading-none">Heavy/Steady</span>
                </div>
                <div className="bg-stone-50/50 p-2 rounded-xl flex flex-col items-center border border-stone-100">
                  <span className="w-3.5 h-3.5 rounded-full bg-pink-400 mb-1 inline-block border-2 border-white shadow-xs animate-pulse" />
                  <span className="text-pink-700 text-[10px]">Bubble</span>
                  <span className="text-[7.5px] text-pink-500 uppercase font-mono mt-0.5 leading-none">Light/Sags</span>
                </div>
              </div>
            </div>

            {/* SPAWN FLUID CONTROLLER */}
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Spigot Control Valve</span>
              <button
                onClick={() => {
                  setFaucetActive(!faucetActive);
                  GLOBAL_SYNTH.playClick();
                }}
                className={`w-full py-3 px-4 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  faucetActive
                    ? "bg-slate-800 border border-slate-900 text-white hover:bg-slate-700 shadow-md"
                    : "bg-orange-50 border-2 border-orange-200 text-orange-700 hover:bg-orange-100 shadow-sm"
                }`}
              >
                {faucetActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Hold Marble Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-orange-750 text-orange-750" />
                    <span>Resume Marble Stream</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QUICK TUTORIAL HARMONY MEMO */}
          <div className="bg-slate-800 text-slate-100 rounded-[32px] p-6 shadow-md border-b-4 border-slate-900">
            <h3 className="font-display font-black text-xs text-yellow-300 mb-3.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Info className="w-4 h-4 text-yellow-300" />
              How To Play
            </h3>
            <ul className="text-xs space-y-3 leading-relaxed text-slate-200/90 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Paint Chains:</strong> Click/drag inside the canvas to draw physical cables. Marbles will bounce off them!
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Gravity Snapping:</strong> Draw rope endpoints near <strong>Golden Anchors</strong> to tether/anchor them in empty space.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Sway & Sag Physics:</strong> If ends are untethered, gravity will cause the rope to sag, swing, or fall off-screen!
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>
                  <strong>The Goal:</strong> Securely guide 50 flowing marbles into the amber glass cup at the bottom.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CAFFBF] mt-1.5 shrink-0" />
                <span className="text-[#CAFFBF] font-black">
                  <strong>100% Satisfying Badge:</strong> Fill the bucket with 5 or fewer marble drops lost off the bottom!
                </span>
              </li>
            </ul>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-8 py-6 border-t-2 border-[#FFE8CC] bg-white w-full max-w-5xl rounded-3xl text-center text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-xs flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <span>Gravity Paint © {new Date().getFullYear()} • Powered by p5.js & Matter.js</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span>
          Built By <a href="https://harishkotra.me" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Harish Kotra</a>
        </span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span>
          <a href="https://dailybuild.xyz" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Checkout my other builds</a>
        </span>
      </footer>

      {/* DETAILED INTERACTIVE HELP GUIDE DIALOG */}
      {showHowTo && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-[#FFE8CC] rounded-[32px] w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
            <button
              onClick={() => {
                setShowHowTo(false);
                GLOBAL_SYNTH.playClick();
              }}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-405 hover:text-slate-600 hover:bg-stone-100 transition"
              title="Close"
            >
              <X className="w-5 h-5 cursor-pointer" />
            </button>

            <div className="flex items-center gap-1.5 mb-4">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              <h3 className="font-sans font-black text-lg text-slate-800 uppercase">
                Gravity Paint Guide
              </h3>
            </div>

            <div className="text-xs text-slate-600 space-y-3.5 leading-relaxed font-medium">
              <p>
                Welcome to <strong>Gravity Paint</strong>, a mindful physical painting puzzle! Your mouse or finger is a brush drawing heavy, gravity-aware ropes that support bouncing marbles.
              </p>
              
              <div className="p-4 bg-[#FFFBF0] border border-[#FFE8CC] rounded-2xl space-y-1.5 text-slate-850">
                <div className="font-extrabold flex items-center gap-1.5 text-orange-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  What makes chains sag or swing?
                </div>
                <p>
                  Every chain is created dynamically. If neither end is drawn near a golden <strong>Anchor point</strong>, the chain has no support and falls downwards! Anchoring one end lets it swing like a pendulum. Anchoring both ends creates a suspension bridge.
                </p>
              </div>

              <div className="p-4 bg-[#CAFFBF]/30 border border-[#CAFFBF] rounded-2xl space-y-1.5 text-[#52A000]">
                <div className="font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#70E000]" />
                  The 100% Satisfying Rule
                </div>
                <p>
                  To secure the legendary <strong>100% SATISFYING</strong> badge, you must carefully fill the vessel up to 50 marbles while losing no more than <strong>5 marbles</strong> off-screen! Turn off the Spigot valve while painting to conserve balls and fine-tune your design.
                </p>
              </div>

              <p className="font-bold text-slate-500 text-[11px]">
                Tip: You can change levels in the campaign sidebar for different puzzle terrains and peg obstacles!
              </p>
            </div>

            <button
              onClick={() => {
                setShowHowTo(false);
                GLOBAL_SYNTH.playClick();
              }}
              className="w-full mt-6 py-3.5 bg-[#A0C4FF] hover:bg-blue-400 text-white font-black rounded-2xl transition shadow-lg shadow-blue-100 flex items-center justify-center uppercase tracking-widest text-xs cursor-pointer"
            >
              Start Painting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
