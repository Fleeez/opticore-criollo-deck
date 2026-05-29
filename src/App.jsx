import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  TrendingDown,
  ShieldAlert,
  Activity,
  Check,
  Bot,
  Send,
  Key,
  RotateCcw,
  Sparkles,
  Globe,
  Mic,
  Calendar,
  MessageSquare,
  GitMerge,
  Users,
  ShieldCheck,
  Sliders
} from 'lucide-react';

const TOTAL_SLIDES = 9;

// Interactive 3D Card
function PremiumCard({ children, className = "", style = {} }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2) * 5; // Max 5deg tilt
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2) * -5;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`cyber-card-premium rounded-2xl transition-all duration-300 ease-out cursor-default relative overflow-hidden ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        ...style
      }}
    >
      {children}
    </div>
  );
}

// Custom Cursor Component
function CustomCursor() {
  const innerX = useMotionValue(-100);
  const innerY = useMotionValue(-100);
  const outerTargetX = useMotionValue(-100);
  const outerTargetY = useMotionValue(-100);

  // Smooth springs for outer ring and glowing spotlight
  const outerX = useSpring(outerTargetX, { damping: 30, stiffness: 220, mass: 0.6 });
  const outerY = useSpring(outerTargetY, { damping: 30, stiffness: 220, mass: 0.6 });
  const glowX = useSpring(outerTargetX, { damping: 45, stiffness: 120, mass: 1 });
  const glowY = useSpring(outerTargetY, { damping: 45, stiffness: 120, mass: 1 });

  // Liquid squash/stretch velocity springs
  const stretchX = useSpring(1, { damping: 25, stiffness: 200 });
  const stretchY = useSpring(1, { damping: 25, stiffness: 200 });
  const stretchRotate = useSpring(0, { damping: 25, stiffness: 200 });

  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Snapped target element bounds for morphing
  const [hoveredBounds, setHoveredBounds] = useState(null);
  
  // Custom cursor styling state (morphing shape)
  const [cursorStyle, setCursorStyle] = useState({
    width: 28,
    height: 28,
    borderRadius: '50%'
  });

  // Embers trail state
  const [sparks, setSparks] = useState([]);
  const lastSparkTime = useRef(0);
  
  // Track velocity
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });
  const velocity = useRef({ vx: 0, vy: 0, speed: 0, angle: 0 });

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    document.body.classList.add('custom-cursor-active');

    const moveCursor = (e) => {
      const now = Date.now();
      const dt = now - lastMousePos.current.time || 16;
      const vx = (e.clientX - lastMousePos.current.x) / dt * 16; // scaled velocity
      const vy = (e.clientY - lastMousePos.current.y) / dt * 16;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx) * 180 / Math.PI;

      velocity.current = { vx, vy, speed, angle };
      lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };

      innerX.set(e.clientX);
      innerY.set(e.clientY);

      // Handle interactive magnetic snapping and morphing
      if (hoveredBounds) {
        // magnetic pulling towards cursor inside button
        const pullX = hoveredBounds.x + (e.clientX - hoveredBounds.x) * 0.25;
        const pullY = hoveredBounds.y + (e.clientY - hoveredBounds.y) * 0.25;
        outerTargetX.set(pullX);
        outerTargetY.set(pullY);
      } else {
        outerTargetX.set(e.clientX);
        outerTargetY.set(e.clientY);
      }

      if (!isVisible) setIsVisible(true);

      // Spawning sparks trail on movement
      if (now - lastSparkTime.current > 35 && speed > 2 && !hoveredBounds) {
        const angleRad = (angle * Math.PI) / 180;
        const offsetDist = 12;
        const sparkX = e.clientX - Math.cos(angleRad) * offsetDist;
        const sparkY = e.clientY - Math.sin(angleRad) * offsetDist;

        setSparks(prev => [
          ...prev.slice(-15),
          {
            id: Math.random(),
            x: sparkX,
            y: sparkY,
            vx: (Math.random() - 0.5) * 1.5 - Math.cos(angleRad) * (speed * 0.05),
            vy: (Math.random() - 0.5) * 1.5 - Math.sin(angleRad) * (speed * 0.05) - 0.8, // rise up
            size: Math.random() * 3 + 2,
            maxLife: 20 + Math.random() * 15,
            life: 20 + Math.random() * 15,
            color: Math.random() > 0.4 ? '#C8A261' : '#FAF8F5'
          }
        ]);
        lastSparkTime.current = now;
      }
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    // Track active bounds on hover
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
      
      if (interactiveEl) {
        const rect = interactiveEl.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(interactiveEl);
        const bounds = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          borderRadius: computedStyle.borderRadius || '8px'
        };
        setHoveredBounds(bounds);
        setCursorStyle({
          width: bounds.width + 12,
          height: bounds.height + 12,
          borderRadius: bounds.borderRadius
        });
        setHovered(true);
      } else {
        setHoveredBounds(null);
        setCursorStyle({
          width: 28,
          height: 28,
          borderRadius: '50%'
        });
        setHovered(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isVisible, hoveredBounds]);

  // Decays velocity and updates sparks trail in frame loops
  useEffect(() => {
    let frame;
    const update = () => {
      setSparks(prev =>
        prev
          .map(s => ({
            ...s,
            x: s.x + s.vx,
            y: s.y + s.vy,
            life: s.life - 1
          }))
          .filter(s => s.life > 0)
      );

      // Decelerate and update squash and stretch springs
      const speed = velocity.current.speed;
      const targetScaleX = 1 + Math.min(speed * 0.015, 0.8);
      const targetScaleY = 1 - Math.min(speed * 0.008, 0.4);
      
      stretchX.set(hoveredBounds ? 1 : targetScaleX);
      stretchY.set(hoveredBounds ? 1 : targetScaleY);
      stretchRotate.set(hoveredBounds ? 0 : velocity.current.angle);

      velocity.current.speed *= 0.88; // decay

      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [hoveredBounds]);

  if (!isVisible) return null;

  return (
    <>
      {/* Background Spotlight Glow (Dorado / Blanco) */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none fixed top-0 left-0 w-0 h-0 z-2"
      >
        <div className="custom-cursor-glow -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Sparks trail elements */}
      {sparks.map(spark => (
        <div
          key={spark.id}
          className="fixed pointer-events-none rounded-full z-[9998]"
          style={{
            left: spark.x,
            top: spark.y,
            width: spark.size,
            height: spark.size,
            backgroundColor: spark.color,
            opacity: spark.life / spark.maxLife,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 6px ${spark.color}`
          }}
        />
      ))}

      {/* Outer Snapping & Stretching Ring */}
      <motion.div
        style={{ x: outerX, y: outerY }}
        className="pointer-events-none fixed top-0 left-0 w-0 h-0 z-[9999]"
      >
        <motion.div
          className="custom-cursor-outer -translate-x-1/2 -translate-y-1/2"
          style={{
            width: cursorStyle.width,
            height: cursorStyle.height,
            borderRadius: cursorStyle.borderRadius,
            backgroundColor: hovered ? 'rgba(200, 162, 97, 0.04)' : 'rgba(0, 0, 0, 0)',
            scaleX: stretchX,
            scaleY: stretchY,
            rotate: stretchRotate
          }}
          animate={{
            scale: clicked ? 0.85 : 1
          }}
          transition={{
            scale: { type: 'spring', stiffness: 450, damping: 12 },
            width: { type: 'spring', stiffness: 350, damping: 22 },
            height: { type: 'spring', stiffness: 350, damping: 22 },
            borderRadius: { duration: 0.2 },
            backgroundColor: { duration: 0.25 }
          }}
        >
          {/* Rotating dashed outline ring (looks futuristic / cybernetic) */}
          <div className="custom-cursor-dashed" />
        </motion.div>
      </motion.div>

      {/* Inner Dot */}
      <motion.div
        style={{ x: innerX, y: innerY }}
        className="pointer-events-none fixed top-0 left-0 w-0 h-0 z-[10000]"
      >
        <motion.div
          className="custom-cursor-inner -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: clicked ? 1.4 : hovered ? 0.6 : 1
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 12 }}
        />
      </motion.div>
    </>
  );
}

export default function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const containerRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // ROI Calculator States
  const [avgTicket, setAvgTicket] = useState(25);
  const [tablesPerDay, setTablesPerDay] = useState(6);
  
  // Interactive Chat State (Bruno AI)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bruno', text: '🍷 ¡Hola! Soy Bruno, el maître virtual de Criollo. Respondo WhatsApp en segundos, agendo tus mesas y respondo preguntas de la carta en tiempo real.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Franchise Stepper State
  const [activeStep, setActiveStep] = useState(0);

  // Contact Form State
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Interactive Menu Flipping State
  const [menuFlipped, setMenuFlipped] = useState(false);

  // Interactive Diagnostic Tab State
  const [diagnosticTab, setDiagnosticTab] = useState('fuga');

  // Rising embers particles state
  const [particles, setParticles] = useState([]);

  // Generate embers in the background
  useEffect(() => {
    const generatedParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 10
    }));
    setParticles(generatedParticles);
  }, []);

  // Sync scroll position with state
  const handleScroll = () => {
    if (!containerRef.current) return;
    if (isNavigatingRef.current) return;
    const scrollPosition = containerRef.current.scrollLeft;
    const slideWidth = containerRef.current.clientWidth;
    const index = Math.round(scrollPosition / slideWidth);
    if (index !== activeSlide && index >= 0 && index < TOTAL_SLIDES) {
      setActiveSlide(index);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeSlide]);

  // Adjust scroll position on window resize to avoid half-slide misalignment
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const slideWidth = containerRef.current.clientWidth;
        containerRef.current.scrollLeft = activeSlide * slideWidth;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSlide]);

  // Keyboard navigation listener (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToSlide(activeSlide + 1);
      } else if (e.key === 'ArrowLeft') {
        goToSlide(activeSlide - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlide]);

  // Navigation function
  const goToSlide = (index) => {
    if (index < 0 || index >= TOTAL_SLIDES || !containerRef.current) return;
    isNavigatingRef.current = true;
    const slideWidth = containerRef.current.clientWidth;
    containerRef.current.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
    setActiveSlide(index);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 600);
  };

  // Bruno AI Chat triggers
  const triggerChatResponse = (userText, responseText) => {
    if (isTyping) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'bruno', text: responseText }]);
    }, 1200);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const elementVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  // Funnel Data Content
  const funnelSteps = [
    {
      title: "01. Prospección de Autoridad",
      tag: "Filtro Anti-Curiosos",
      desc: "Con la operación cubierta y blindada por Bruno, pasamos a la fase de expansión. Pero atención acá: no les armamos un formulario tonto donde la gente simplemente hace clic en 'tengo 60 mil dólares' (porque cualquiera miente en internet para curiosear). Diseñamos un portal de alta conversión que proyecta solidez, posiciona la marca y pre-filtra de inmediato."
    },
    {
      title: "02. Fricción Inteligente",
      tag: "Perfil & NDA Digital",
      desc: "Si el prospecto pasa el filtro inicial de capital, el sistema le exige una barrera de 'Fricción Inteligente': debe validar su perfil de LinkedIn, detallar su experiencia comercial previa y la zona geográfica exacta donde quiere abrir. Recién cuando completa todo ese perfil operativo, el sistema le hace firmar el NDA digital y le permite agendar una videollamada."
    },
    {
      title: "03. Radiografía Dashboard",
      tag: "Airtable & Cierre",
      desc: "Ustedes no van a perder tiempo filtrando curiosos por WhatsApp ni respondiendo mensajes sin sentido. Cuando se sienten en la computadora, en su panel central (Airtable) van a tener la radiografía completa, validada e histórica del inversor antes de decirle 'hola'. Solo hablan con personas calificadas con intenciones reales."
    }
  ];


  return (
    <div className="relative h-screen w-screen bg-raizBg text-textPrimary font-sans overflow-hidden select-none grid-bg">
      <CustomCursor />
      {/* Cyber Ember Particles floating upward */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              animation: `riseUp ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-8 py-6 md:px-16 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cardBg border border-goldAccent/15 shadow-md">
            <span className="font-display font-extrabold text-goldAccent text-base">O</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs tracking-wider text-textPrimary font-bold">Opticore</span>
              <span className="h-1 w-1 rounded-full bg-goldAccent"></span>
              <span className="text-[9px] text-textSecondary font-bold tracking-wider uppercase">Tech Agency</span>
            </div>
            <p className="text-[8px] text-textSecondary/80 tracking-wider font-mono uppercase">Criollo Pitch Deck SPA</p>
          </div>
        </div>

        {/* Slide Counter / Indicators */}
        <div className="flex items-center gap-3.5 pointer-events-auto bg-[#12100E]/90 backdrop-blur-md px-4 py-2 rounded-full border border-goldAccent/20 shadow-lg">
          {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeSlide === idx 
                  ? 'w-6 bg-goldAccent shadow-[0_0_8px_rgba(200,162,97,0.5)]' 
                  : 'w-1.5 bg-textSecondary/30 hover:bg-textSecondary/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
          <span className="text-[10px] text-goldAccent font-mono ml-1 font-bold">0{activeSlide + 1} / 0{TOTAL_SLIDES}</span>
        </div>
      </header>

      {/* Floating Side Navigation Controls */}
      <div className="absolute inset-y-0 left-0 z-20 w-16 md:w-28 flex items-center justify-start pl-6 pointer-events-none">
        <AnimatePresence>
          {activeSlide > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(18, 16, 14, 0.95)' }}
              onClick={() => goToSlide(activeSlide - 1)}
              className="pointer-events-auto w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-cardBg/90 backdrop-blur-md border border-goldAccent/15 shadow-lg text-textSecondary hover:text-textPrimary cursor-pointer transition-all"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-y-0 right-0 z-20 w-16 md:w-28 flex items-center justify-end pr-6 pointer-events-none">
        <AnimatePresence>
          {activeSlide < TOTAL_SLIDES - 1 && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(18, 16, 14, 0.95)' }}
              onClick={() => goToSlide(activeSlide + 1)}
              className="pointer-events-auto w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-cardBg/90 backdrop-blur-md border border-goldAccent/15 shadow-lg text-textSecondary hover:text-textPrimary cursor-pointer transition-all"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Slide Snap Container */}
      <div
        ref={containerRef}
        className="flex flex-row overflow-x-auto snap-x snap-mandatory h-screen w-full no-scrollbar z-10"
      >
        
        {/* SLIDE 1: Portada (El Gancho High-Ticket) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 0 ? "visible" : "hidden"}
            className="max-w-6xl w-full text-center flex flex-col items-center justify-center"
          >
            {/* Tagline Badge */}
            <motion.div
              variants={elementVariants}
              className="mb-6 inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-cardBg border border-goldAccent/25 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-goldAccent shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-goldAccent" />
              <span>Propuesta de Infraestructura Tecnológica & IA</span>
            </motion.div>

            {/* H1 Title */}
            <motion.h1
              variants={elementVariants}
              className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 font-display leading-tight w-full"
            >
              <span className="text-goldAccent">Criollo: </span>
              <span className="bg-gradient-to-r from-textPrimary via-[#FAF8F5] to-goldAccent bg-clip-text text-transparent text-glow-gold">
                Bodegón posta con tecnología de verdad.
              </span>
              <span className="block text-xl md:text-3xl font-display font-medium text-textSecondary mt-3 tracking-wider uppercase">
                De Experiencia Gastronómica a Ecosistema Escalable
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={elementVariants}
              className="text-sm md:text-lg text-textSecondary font-sans font-light tracking-wide max-w-4xl mb-8 leading-relaxed"
            >
              Ingeniería en Inteligencia Artificial y Desarrollo Digital a Medida para Automatizar la Operación, Fidelizar Clientes de Forma Predictiva y Multiplicar la Rentabilidad.
            </motion.p>

            {/* Primary Action Button */}
            <motion.div variants={elementVariants} className="pointer-events-auto">
              <button
                onClick={() => goToSlide(1)}
                className="group relative px-9 py-4 rounded-full bg-goldAccent text-[#080706] font-display font-bold text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 shadow-[0_15px_30px_rgba(200,162,97,0.25)] cursor-pointer"
              >
                Comenzar Auditoría
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>

          {/* Footer Animado */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
            <div className="flex items-center gap-2.5 bg-cardBg/80 backdrop-blur-sm border border-goldAccent/10 rounded-full px-6 py-3 shadow-md">
              <span className="text-[10px] text-textSecondary font-mono tracking-widest uppercase">
                Presentado por Opticore
              </span>
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4 text-goldAccent" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* SLIDE 2: El Diagnóstico (El Dolor Operativo) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-20 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 1 ? "visible" : "hidden"}
            className="max-w-6xl w-full flex flex-col justify-center items-center h-full"
          >
            {/* Section Header */}
            <div className="text-center mb-8">
              <motion.span
                variants={elementVariants}
                className="text-[10px] font-mono text-goldAccent font-bold tracking-widest uppercase mb-2 block"
              >
                Modelo de Negocio para Franquiciados
              </motion.span>
              <motion.h2
                variants={elementVariants}
                className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-textPrimary mb-3"
              >
                Mística Gastronómica, Operada con Precisión de Software
              </motion.h2>
              <motion.p
                variants={elementVariants}
                className="text-xs md:text-sm text-textSecondary max-w-2xl mx-auto leading-relaxed"
              >
                El inversor moderno no compra solo recetas; busca un modelo de negocio de alta productividad. Fusionamos la calidad de Criollo con tecnología que optimiza el tiempo, la organización y la rentabilidad de cada local.
              </motion.p>
            </div>

            {/* 3 Cyber Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pointer-events-auto">
              
              {/* Card 1: Excelencia Gastronómica */}
              <PremiumCard
                className="p-6 h-[295px] flex flex-col justify-between border-t-4 border-t-goldAccent"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-goldAccent/10 border border-goldAccent/25 flex items-center justify-center text-goldAccent mb-4 shadow-[0_0_15px_rgba(200,162,97,0.15)]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-extrabold text-lg md:text-xl text-textPrimary mb-2">
                    Prestigio Gastronómico Validado
                  </h3>
                  <p className="text-xs md:text-sm text-textSecondary leading-relaxed font-sans">
                    Tus locales transmiten historia, sabor y calidad culinaria de primer nivel. Un producto clásico y consolidado que atrae clientes de manera orgánica, posicionando a la franquicia como un referente indiscutible.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-goldAccent font-bold uppercase tracking-wider">
                  Marca de Alta Demanda
                </div>
              </PremiumCard>

              {/* Card 2: Productividad & Tiempo */}
              <PremiumCard
                className="p-6 h-[295px] flex flex-col justify-between border-t-4 border-t-goldAccent"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-goldAccent/10 border border-goldAccent/25 flex items-center justify-center text-goldAccent mb-4 shadow-[0_0_15px_rgba(200,162,97,0.15)]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-extrabold text-lg md:text-xl text-textPrimary mb-2">
                    Productividad & Tiempo
                  </h3>
                  <p className="text-xs md:text-sm text-textSecondary leading-relaxed font-sans">
                    La tecnología blinda la operación diaria de tu local. Bruno AI atiende WhatsApp en segundos, concreta reservas y libera al personal de tareas manuales repetitivas, optimizando el tiempo y reduciendo costos de personal.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-goldAccent font-bold uppercase tracking-wider">
                  Eficiencia Operativa
                </div>
              </PremiumCard>

              {/* Card 3: Organización Centralizada */}
              <PremiumCard
                className="p-6 h-[295px] flex flex-col justify-between border-t-4 border-t-goldAccent"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-goldAccent/10 border border-goldAccent/25 flex items-center justify-center text-goldAccent mb-4 shadow-[0_0_15px_rgba(200,162,97,0.15)]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-extrabold text-lg md:text-xl text-textPrimary mb-2">
                    Organización Centralizada
                  </h3>
                  <p className="text-xs md:text-sm text-textSecondary leading-relaxed font-sans">
                    El 84% de los inversores de hoy prefiere franquicias con tecnología en su ADN. Conectamos reservas, historial de clientes y viabilidad en Airtable: control total de cada local sin planillas de papel ni desorganización.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-goldAccent font-bold uppercase tracking-wider">
                  Tecnología de Escalabilidad
                </div>
              </PremiumCard>

            </div>
          </motion.div>
        </div>

        {/* SLIDE 3: Pilar 1 - Ecosistema Web Premium (La Vidriera Digital Interactiva) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-20 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 2 ? "visible" : "hidden"}
            className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full"
          >
            {/* Left Column - Copywriting */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <motion.span
                variants={elementVariants}
                className="text-[10px] font-mono text-goldAccent font-bold tracking-widest uppercase mb-3 block"
              >
                Pilar 01: Presencia Corporativa
              </motion.span>
              <motion.h2
                variants={elementVariants}
                className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-textPrimary mb-6"
              >
                Una Sola Identidad: Prestigio y Coherencia en Cada Pantalla
              </motion.h2>
              
              <motion.p
                variants={elementVariants}
                className="text-sm md:text-base text-textSecondary leading-relaxed mb-8"
              >
                Tu marca debe verse igual de profesional en cada rincón digital. Creamos un ecosistema único que traslada la mística, el sabor y la historia de Criollo a la web.
              </motion.p>

              <div className="space-y-5">
                {[
                  {
                    title: "Coherencia y Confianza de Marca",
                    desc: "Tus clientes experimentan el mismo prestigio online que en tus salones físicos. Unificar la estética de tus sedes consolida tu marca como un clásico indiscutible."
                  },
                  {
                    title: "Tecnología que Abre el Apetito",
                    desc: "No es solo información; es una experiencia interactiva. Tus comensales recorren tu menú en 3D y reservan su mesa sintiendo el calor de las brasas desde el móvil."
                  },
                  {
                    title: "Proyección para Franquicias",
                    desc: "Demostrá a tus futuros franquiciados que adquieren una marca consolidada, profesional y lista para replicarse. Un ecosistema digital sólido que transmite seguridad y orden corporativo."
                  },
                  {
                    title: "Mística y Vanguardia Unificadas",
                    desc: "Atraé inversores mostrando un negocio que respeta su cultura, historia y tradición de bodegón, pero que opera con herramientas tecnológicas de última generación en un solo lugar."
                  }
                ].map((item, idx) => (
                  <motion.div key={idx} variants={elementVariants} className="flex gap-4 items-start">
                    <div className="mt-1 w-5 h-5 rounded-full bg-goldAccent/10 border border-goldAccent/25 flex items-center justify-center text-goldAccent flex-shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-textPrimary uppercase tracking-wider">{item.title}</h4>
                      <p className="text-xs text-textSecondary mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Interactive Menu Mockup */}
            <div className="lg:col-span-6 flex justify-center pointer-events-auto">
              <motion.div
                variants={cardVariants}
                className="relative w-full max-w-[420px] h-[360px]"
                onClick={() => setMenuFlipped(!menuFlipped)}
              >
                <div 
                  className={`w-full h-full relative rounded-2xl p-8 cyber-card-premium flex flex-col justify-between border border-goldAccent/15 shadow-2xl transition-all duration-700 [transform-style:preserve-3d] cursor-pointer ${
                    menuFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between [backface-visibility:hidden] h-full w-full">
                    <div>
                      <div className="flex justify-between items-center border-b border-goldAccent/15 pb-4 mb-4">
                        <span className="text-[10px] font-mono text-goldAccent uppercase tracking-widest font-bold">criollo.com/menu</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-fireAccent" />
                          <div className="w-2 h-2 rounded-full bg-goldAccent" />
                          <div className="w-2 h-2 rounded-full bg-emeraldAccent" />
                        </div>
                      </div>
                      
                      <span className="text-[9px] font-mono text-fireAccent tracking-widest uppercase font-bold">Plato Destacado del Bodegón</span>
                      <h3 className="font-display font-extrabold text-2xl text-textPrimary mt-1">"Provo y Gustó"</h3>
                      <p className="text-xs text-textSecondary mt-3 leading-relaxed">
                        Provoleta de campo dorada al fuego, terminada con hilos de miel orgánica, orégano silvestre y aceite de oliva extra virgen.
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-goldAccent/10">
                      <span className="text-[10px] text-textSecondary uppercase tracking-wider font-mono">Haz clic para dar la vuelta</span>
                      <span className="text-xs font-bold text-goldAccent font-mono">$12 USD</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] h-full w-full bg-raizBg rounded-2xl border border-goldAccent/15">
                    <div>
                      <span className="text-[9px] font-mono text-goldAccent tracking-widest uppercase font-bold">Optimización de Conversión</span>
                      <h3 className="font-display font-extrabold text-2xl text-textPrimary mt-1">Ecosistema Opticore</h3>
                      <p className="text-xs text-textSecondary mt-4 leading-relaxed">
                        Este plato se ofrece automáticamente mediante sugerencia inteligente por **Bruno AI** al 82% de las reservas registradas por WhatsApp.
                      </p>
                      <div className="mt-5 p-3 rounded-lg bg-goldAccent/5 border border-goldAccent/15 text-[11px] text-goldAccent leading-relaxed">
                        <strong>Impacto:</strong> Incrementa el ticket de compra promedio del restaurante en un 18.5% antes de que el cliente llegue a la mesa.
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-goldAccent/10">
                      <span className="text-[10px] text-textSecondary uppercase tracking-wider font-mono">Volver al Menú</span>
                      <span className="text-[10px] text-emeraldAccent font-bold font-mono">Cross-Selling Activo</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>

        {/* SLIDE 4: Pilar 2 - Motor Operativo (Chat Interactivo de Bruno AI - LEFT UNTOUCHED) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-20 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 3 ? "visible" : "hidden"}
            className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full"
          >
            {/* Left Column - Copywriter Benefits */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <motion.span
                variants={elementVariants}
                className="text-[10px] font-mono text-goldAccent font-bold tracking-widest uppercase mb-1.5 block"
              >
                Pilar 02: Inteligencia Conversacional
              </motion.span>
              <motion.h2
                variants={elementVariants}
                className="text-2xl md:text-4xl font-extrabold tracking-tight font-display text-textPrimary mb-3"
              >
                Bruno: Tu Maître Virtual de Alta Gama
              </motion.h2>

              <motion.p
                variants={elementVariants}
                className="text-xs md:text-sm text-textSecondary leading-relaxed mb-5"
              >
                El asistente digital autónomo que blinda tu operación, reactiva clientes y atiende cada canal en segundos con el tono y reglas operativas de tu marca.
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
                {[
                  {
                    icon: <Globe className="w-5 h-5 text-goldAccent" />,
                    title: "Multilingüe Nativo",
                    desc: "Habla español, inglés y portugués. Detecta y adapta el idioma del comensal."
                  },
                  {
                    icon: <Mic className="w-5 h-5 text-goldAccent" />,
                    title: "Escucha Audios",
                    desc: "Procesa y comprende notas de voz, interpretando solicitudes complejas."
                  },
                  {
                    icon: <Calendar className="w-5 h-5 text-goldAccent" />,
                    title: "Reservas en Firme",
                    desc: "Agenda y asigna cubiertos en tu planilla en tiempo real y sin overbookings."
                  },
                  {
                    icon: <MessageSquare className="w-5 h-5 text-goldAccent" />,
                    title: "Instagram & WhatsApp",
                    desc: "Opera en WhatsApp e Instagram DM, centralizando la captura de leads."
                  },
                  {
                    icon: <GitMerge className="w-5 h-5 text-goldAccent" />,
                    title: "Fidelización IA",
                    desc: "Reactiva automáticamente a quienes no reservan desde hace 25 a 35 días."
                  },
                  {
                    icon: <Users className="w-5 h-5 text-goldAccent" />,
                    title: "Escala Simultánea",
                    desc: "Atiende más de 100 conversaciones al mismo tiempo con cero demoras."
                  },
                  {
                    icon: <ShieldCheck className="w-5 h-5 text-goldAccent" />,
                    title: "Precisión Absoluta",
                    desc: "No descansa ni se olvida. Se entrena y personaliza ante cualquier excepción."
                  },
                  {
                    icon: <Sliders className="w-5 h-5 text-goldAccent" />,
                    title: "Diseño a Medida",
                    desc: "Fusión nativa que se adapta al tono, menú y reglas de tu restaurante."
                  }
                ].map((item, idx) => (
                  <motion.div key={idx} variants={elementVariants} className="flex gap-3.5 items-start bg-goldAccent/5 p-3 md:p-3.5 rounded-xl border border-goldAccent/10">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-textPrimary uppercase tracking-wide">{item.title}</h4>
                      <p className="text-[11px] md:text-xs text-textSecondary leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - REAL INTERACTIVE CHAT WINDOW */}
            <div className="lg:col-span-5 w-full flex flex-col justify-center items-center pointer-events-auto">
              <motion.div
                variants={cardVariants}
                className="bg-cardBg rounded-2xl border border-goldAccent/15 shadow-2xl p-6 w-full max-w-[370px] h-[400px] flex flex-col justify-between relative overflow-hidden"
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b border-goldAccent/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-goldAccent/10 flex items-center justify-center text-goldAccent shadow-sm relative">
                      <Bot className="w-5 h-5" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emeraldAccent rounded-full border-2 border-cardBg animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-textPrimary">Bruno</h4>
                      <p className="text-[10px] text-emeraldAccent font-semibold">Online • Criollo AI</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatMessages([{ sender: 'bruno', text: '🍷 ¡Hola! Soy Bruno, el maître virtual de Criollo. Respondo WhatsApp en segundos, agendo tus mesas y respondo preguntas de la carta en tiempo real.' }])}
                    className="text-[9px] font-mono text-textSecondary hover:text-white px-2.5 py-1 rounded bg-raizBg border border-goldAccent/10"
                  >
                    Resetear
                  </button>
                </div>

                {/* Messages Display */}
                <div className="flex-grow overflow-y-auto py-4 space-y-3.5 no-scrollbar flex flex-col justify-end">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs p-3.5 rounded-2xl leading-relaxed max-w-[90%] shadow-sm ${
                        msg.sender === 'bruno' 
                          ? 'bg-raizBg text-textPrimary rounded-tl-none border border-goldAccent/10 self-start' 
                          : msg.sender === 'system'
                          ? 'bg-fireAccent/10 text-fireAccent border border-fireAccent/20 rounded-lg text-[10px] self-center w-full py-2 px-3 text-center'
                          : 'bg-goldAccent text-raizBg font-semibold rounded-tr-none self-end'
                      }`}
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <div className="bg-raizBg text-textSecondary text-xs p-3 rounded-2xl rounded-tl-none self-start border border-goldAccent/10 animate-pulse">
                      Bruno está procesando...
                    </div>
                  )}
                </div>

                {/* Pre-defined user queries buttons */}
                <div className="border-t border-goldAccent/10 pt-4 flex flex-col gap-2">
                  <div className="text-[9px] font-mono text-textSecondary uppercase tracking-widest mb-1">Simular Interacción:</div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => triggerChatResponse(
                        "¿Tienen mesas hoy a la noche?", 
                        "🍷 ¡Por supuesto! Me quedan disponibles 2 mesas en León Morra 40 para el turno de las 21:15. ¿Querés reservarla? Te sugiero dejar pre-ordenada la provoleta 'Provo y Gustó'."
                      )}
                      className="text-[9px] bg-raizBg border border-goldAccent/15 text-textPrimary px-2.5 py-1 rounded-full hover:bg-goldAccent/5 text-left transition-colors"
                    >
                      📅 Reservar Mesa
                    </button>
                    <button
                      onClick={() => triggerChatResponse(
                        "¿Qué vino me recomiendas?", 
                        "🍷 Para acompañar tu ojo de bife o nuestra provoleta clásica, te sugiero un Malbec Reserva. ¿Te gustaría que agregue una copa o botella a tu mesa?"
                      )}
                      className="text-[9px] bg-raizBg border border-goldAccent/15 text-textPrimary px-2.5 py-1 rounded-full hover:bg-goldAccent/5 text-left transition-colors"
                    >
                      🍷 Recomendar Vino
                    </button>
                    <button
                      onClick={() => triggerChatResponse(
                        "¿Qué opciones vegetarianas tienen?", 
                        "🥗 ¡Excelente elección! Contamos con nuestra provoleta clásica de campo al carbón, vegetales asados de la huerta a las brasas y ensaladas gourmet. ¿Te anoto alguna de entrada?"
                      )}
                      className="text-[9px] bg-raizBg border border-goldAccent/15 text-textPrimary px-2.5 py-1 rounded-full hover:bg-goldAccent/5 text-left transition-colors"
                    >
                      🥗 Menú Vegetariano
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>

          </motion.div>
        </div>

        {/* SLIDE 5: Pilar 3 - La Máquina de Expansión (Embudo Interactivo) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-20 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 4 ? "visible" : "hidden"}
            className="max-w-6xl w-full flex flex-col justify-center items-center h-full"
          >
            {/* Section Header */}
            <div className="text-center mb-6">
              <motion.span
                variants={elementVariants}
                className="text-[10px] font-mono text-goldAccent font-bold tracking-widest uppercase mb-3 block"
              >
                Pilar 03: Escalabilidad de Franquicias
              </motion.span>
              <motion.h2
                variants={elementVariants}
                className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-textPrimary mb-3"
              >
                Expansión Inteligente: Embudo de Franquicias
              </motion.h2>
            </div>

            {/* Funnel Copy */}
            <motion.h3
              variants={elementVariants}
              className="text-xl md:text-3xl font-display font-medium text-textSecondary text-center mb-8 max-w-2xl"
            >
              "Filtramos curiosos, te entregamos socios capitalistas."
            </motion.h3>

            {/* Interactive Funnel Indicator */}
            <div className="flex gap-4 md:gap-8 my-8 pointer-events-auto">
              {funnelSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`px-4 py-2 border-b-2 font-mono text-xs md:text-sm tracking-wider uppercase transition-all duration-300 ${
                    activeStep === idx 
                      ? 'border-goldAccent text-goldAccent font-bold' 
                      : 'border-transparent text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  Fase 0{idx + 1}
                </button>
              ))}
            </div>

            {/* Funnel content display with animation */}
            <div className="w-full max-w-3xl min-h-[280px] md:min-h-[240px] flex flex-col justify-center items-center text-center px-6 pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="bg-cardBg/50 border border-goldAccent/10 rounded-2xl p-8 shadow-2xl relative"
                >
                  <span className="text-[10px] font-mono text-goldAccent font-bold uppercase tracking-widest bg-goldAccent/10 px-3 py-1 rounded-full mb-3 inline-block">
                    {funnelSteps[activeStep].tag}
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-textPrimary mt-2 mb-4">
                    {funnelSteps[activeStep].title}
                  </h3>
                  <p className="text-sm md:text-base text-textSecondary max-w-2xl leading-relaxed">
                    {funnelSteps[activeStep].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Visual Minimalist Funnel SVG */}
            <div className="mt-8 relative w-full max-w-md h-12 flex items-center justify-center">
              <svg className="w-full h-full text-goldAccent/25" viewBox="0 0 500 40" fill="none" stroke="currentColor" strokeWidth="1">
                <line x1="20" y1="20" x2="480" y2="20" />
                <line x1="160" y1="20" x2="160" y2="35" strokeDasharray="3 3" />
                <line x1="340" y1="20" x2="340" y2="35" strokeDasharray="3 3" />
                <circle cx="250" cy="20" r="4.5" className="fill-fireAccent" />
              </svg>
              <div className="absolute bottom-0 text-[8px] font-mono uppercase tracking-widest text-textSecondary">Embudo de Calificación y Cierre</div>
            </div>

          </motion.div>
        </div>

        {/* SLIDE 6: Interactive ROI Business Tool */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-20 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 5 ? "visible" : "hidden"}
            className="max-w-6xl w-full flex flex-col justify-center items-center h-full"
          >
            {/* Section Header */}
            <div className="text-center mb-10">
              <motion.span
                variants={elementVariants}
                className="text-[10px] font-mono text-goldAccent font-bold tracking-widest uppercase mb-3 block"
              >
                Calculadora Financiera
              </motion.span>
              <motion.h2
                variants={elementVariants}
                className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-textPrimary"
              >
                Calcula tu Retorno de Inversión (ROI)
              </motion.h2>
              <motion.p
                variants={elementVariants}
                className="text-sm md:text-lg text-textSecondary font-sans mt-3 max-w-2xl mx-auto leading-relaxed"
              >
                Descubre cómo el ecosistema de Opticore recupera reservas caídas y multiplica tu facturación mensual.
              </motion.p>
            </div>

            {/* Slider Controls and Live Math output grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full max-w-5xl items-center pointer-events-auto">
              
              {/* Controls Column */}
              <div className="lg:col-span-6 bg-cardBg border border-goldAccent/15 p-8 rounded-2xl shadow-xl flex flex-col gap-8">
                
                {/* Tables Slider */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-textPrimary">Mesas Salvadas al día:</label>
                    <span className="text-2xl font-mono font-bold text-goldAccent">{tablesPerDay}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={tablesPerDay} 
                    onChange={(e) => setTablesPerDay(parseInt(e.target.value))} 
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-textSecondary mt-2">
                    <span>1 mesa</span>
                    <span>20 mesas / día</span>
                  </div>
                </div>

                {/* Ticket Slider */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-textPrimary">Ticket Promedio por Mesa:</label>
                    <span className="text-2xl font-mono font-bold text-goldAccent">${avgTicket} USD</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={avgTicket} 
                    onChange={(e) => setAvgTicket(parseInt(e.target.value))}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-textSecondary mt-2">
                    <span>$10 USD</span>
                    <span>$100 USD</span>
                  </div>
                </div>

              </div>

              {/* Math Output Column */}
              <div className="lg:col-span-6 grid grid-cols-2 gap-5 h-full">
                
                {/* Result 1: Monthly Billings */}
                <div className="bg-[#12100E] border border-goldAccent/10 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-md">
                  <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest block mb-2">Facturación Extra Mensual</span>
                  <div>
                    <span className="text-3xl md:text-4xl font-black text-goldAccent">
                      ${(tablesPerDay * avgTicket * 30).toLocaleString()}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-textSecondary ml-1">USD</span>
                  </div>
                </div>

                {/* Result 2: Annual Billings */}
                <div className="bg-[#12100E] border border-goldAccent/10 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-md">
                  <span className="text-[10px] font-mono text-textSecondary uppercase tracking-widest block mb-2">Facturación Extra Anual</span>
                  <div>
                    <span className="text-3xl md:text-4xl font-black text-goldAccent">
                      ${(tablesPerDay * avgTicket * 30 * 12).toLocaleString()}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-textSecondary ml-1">USD</span>
                  </div>
                </div>

                {/* Result 3: Setup Recovery Days */}
                <div className="col-span-2 bg-gradient-to-r from-goldAccent/10 to-fireAccent/10 border border-goldAccent/25 rounded-2xl p-5 md:p-6 flex items-center justify-between shadow-lg">
                  <div>
                    <h4 className="font-bold text-textPrimary text-base md:text-lg mb-1">Recuperación del Setup ($450 USD)</h4>
                    <p className="text-xs md:text-sm text-textSecondary">Tiempo estimado para rentabilizar la inversión inicial de Opticore.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl md:text-4xl font-black text-goldAccent">
                      {Math.max(1, Math.round(450 / (tablesPerDay * avgTicket)))}
                    </span>
                    <span className="text-xs md:text-sm font-bold text-textPrimary ml-1 font-mono uppercase block">Días</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Note badge */}
            <div className="mt-8 text-[11px] text-textSecondary font-mono italic">
              * iCal Sync con Airbnb/Booking y desarrollo hotelero disponible como extensión modular del ecosistema.
            </div>
          </motion.div>
        </div>

        {/* SLIDE 7: Visión Multi-Sector (El Motor Turístico) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-16 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 6 ? "visible" : "hidden"}
            className="max-w-5xl w-full flex flex-col justify-center items-center h-full"
          >
            {/* Subtle Badge */}
            <motion.div
              variants={elementVariants}
              className="mb-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-goldAccent/10 border border-goldAccent/20 text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-goldAccent uppercase pointer-events-auto"
            >
              <span>Vertical de Desarrollo en Curso</span>
            </motion.div>

            {/* Title & Subtitle */}
            <div className="text-center mb-4 max-w-3xl">
              <motion.h2
                variants={elementVariants}
                className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-textPrimary mb-2"
              >
                Más allá de la Gastronomía: El Motor Turístico
              </motion.h2>
              <motion.p
                variants={elementVariants}
                className="text-xs md:text-sm text-textSecondary font-sans leading-relaxed"
              >
                La misma arquitectura de IA, adaptada para dominar el sector de alojamientos y reservas.
              </motion.p>
            </div>

            {/* Justification Box (Comparison standard vs custom) */}
            <motion.div
              variants={elementVariants}
              className="w-full max-w-5xl bg-goldAccent/5 border border-goldAccent/10 rounded-2xl p-4 mb-4 text-center text-xs text-textSecondary font-sans leading-relaxed pointer-events-auto"
            >
              <span className="font-bold text-goldAccent block mb-1 tracking-wider font-mono text-[9px]">PROPUESTA DE VALOR ADAPTADA:</span>
              Con Criollo (restaurante) bonificamos la instalación porque Bruno es un producto estandarizado de reservas. Para alojamientos turísticos, creamos a <strong className="text-textPrimary font-semibold">Clara AI</strong>: una solución de software a medida adaptada a la operativa y herramientas del sector hotelero.
            </motion.div>

            {/* 6-Card Solutions Grid (Larger 2-column layout for readability on laptops) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-5xl pointer-events-auto mt-2">
              {[
                {
                  icon: <GitMerge className="w-6 h-6 text-goldAccent" />,
                  title: "Sincronización iCal Activa",
                  desc: "Conexión nativa y bidireccional con Airbnb, Booking y Expedia. Bloqueo automático e instantáneo de fechas para erradicar por completo el overbooking."
                },
                {
                  icon: <TrendingDown className="w-6 h-6 text-goldAccent" />,
                  title: "Cerrar Reservas Directas",
                  desc: "Deriva consultas de Booking a WhatsApp e Instagram de inmediato. Ahorrate el 20% de comisiones por intermediación de las plataformas."
                },
                {
                  icon: <Globe className="w-6 h-6 text-goldAccent" />,
                  title: "Anfitriona Virtual 24/7",
                  desc: "Habla español, inglés y portugués nativo. Responde al instante dudas de check-in, tarifas o si se aceptan mascotas a cualquier hora."
                },
                {
                  icon: <Smartphone className="w-6 h-6 text-goldAccent" />,
                  title: "Catálogo Multimedia Activo",
                  desc: "Envía fotos de las habitaciones, videos del complejo, ubicación por Google Maps y normas de la casa al instante."
                },
                {
                  icon: <Activity className="w-6 h-6 text-goldAccent" />,
                  title: "Gestión de Pagos y Señas",
                  desc: "Envía links de pago de señas y detecta la recepción del comprobante de transferencia bancaria de forma completamente autónoma."
                },
                {
                  icon: <Users className="w-6 h-6 text-goldAccent" />,
                  title: "Follow-up Post-Checkout",
                  desc: "Envía mensajes post-estadía automáticos para solicitar reseñas de 5 estrellas en Google e invitar al huésped a regresar con descuentos."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={elementVariants}
                  className="bg-cardBg border border-goldAccent/10 hover:border-goldAccent/30 transition-all duration-300 p-5 rounded-2xl flex gap-4 items-start shadow-lg"
                >
                  <div className="p-3 rounded-xl bg-goldAccent/10 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base md:text-lg text-textPrimary mb-1.5">
                      {item.title}
                    </h4>
                    <p className="text-xs md:text-sm text-textSecondary leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* SLIDE 8: La Estrategia del "Blueprint" (Diagnóstico Pago) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-16 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 7 ? "visible" : "hidden"}
            className="max-w-5xl w-full flex flex-col justify-center items-center h-full"
          >
            {/* Subtle Badge */}
            <motion.div
              variants={elementVariants}
              className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-goldAccent/10 border border-goldAccent/20 text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-goldAccent uppercase pointer-events-auto"
            >
              <span>Metodología de Ingeniería</span>
            </motion.div>

            {/* Header */}
            <div className="text-center mb-6 max-w-3xl">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display text-textPrimary mb-2">
                La Estrategia del Blueprint (Diagnóstico Pago)
              </h2>
              <p className="text-xs md:text-sm text-textSecondary font-sans leading-relaxed">
                Nadie construye un edificio sin pagarle primero al arquitecto para que haga los planos y verifique si el terreno aguanta. En el desarrollo de software a medida, operamos bajo el mismo principio de seguridad.
              </p>
            </div>

            {/* Content: Left side (The risk-free offer) vs Right side (Interactive Senior Questions) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-4xl items-stretch pointer-events-auto">
              
              {/* Left Column: Blueprint Hook & Zero-Risk */}
              <div className="lg:col-span-6 bg-cardBg border border-goldAccent/15 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-goldAccent/10 border border-goldAccent/25 text-[9px] font-mono font-bold tracking-widest text-goldAccent uppercase mb-3">
                    Mapeo de Viabilidad Técnica
                  </div>
                  <h3 className="font-display font-bold text-lg md:text-xl text-textPrimary mb-2">
                    Construcción con Riesgo Cero
                  </h3>
                  <p className="text-xs text-textSecondary leading-relaxed mb-3">
                    Para no hacerte gastar miles de dólares a ciegas en un bot que no sabemos si se adapta a tu operativa, nuestro protocolo en Opticore es arrancar con un Mapeo de Viabilidad Técnica.
                  </p>
                  <p className="text-xs text-textSecondary leading-relaxed mb-3">
                    Nos sentamos a auditar a fondo tus procesos, analizo cómo conectar tu Airbnb/Booking con nuestra Inteligencia Artificial, y te entrego un plano exacto de cómo va a funcionar <strong className="text-goldAccent font-semibold">&quot;Clara AI&quot;</strong> y cuánto te va a costar el desarrollo final.
                  </p>
                </div>
                
                {/* The Price & Risk reversal guarantee box */}
                <div className="bg-[#12100E] border border-goldAccent/15 rounded-xl p-3 md:p-4 flex flex-col gap-2.5 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-textSecondary uppercase">Valor del Diagnóstico</span>
                    <span className="text-xl font-mono font-bold text-goldAccent">$150 USD</span>
                  </div>
                  <div className="text-[10px] text-emeraldAccent bg-[#10B981]/5 border border-emeraldAccent/15 rounded-lg py-2 px-2.5 leading-normal">
                    <strong>Garantía Opticore:</strong> Si decidís avanzar con la construcción del sistema, te descontamos el 100% del valor del diagnóstico del precio final de desarrollo.
                  </div>
                </div>
              </div>

              {/* Right Column: Senior Diagnostic Interactive Checklist */}
              <div className="lg:col-span-6 bg-cardBg border border-goldAccent/15 rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <h3 className="font-mono text-[9px] md:text-[10px] font-bold text-goldAccent tracking-widest uppercase mb-3">
                    Preguntas de Diagnóstico Senior
                  </h3>
                  
                  {/* Tabs control */}
                  <div className="flex gap-1.5 mb-3 border-b border-goldAccent/10 pb-2">
                    {[
                      { key: 'fuga', label: '💸 Fugas de Capital' },
                      { key: 'operativo', label: '⏳ Operativo' },
                      { key: 'tech', label: '⚙️ Tecnología' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setDiagnosticTab(tab.key)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold tracking-wide transition-all ${
                          diagnosticTab === tab.key
                            ? 'bg-goldAccent text-raizBg font-bold shadow-md shadow-goldAccent/10'
                            : 'text-textSecondary hover:text-textPrimary hover:bg-goldAccent/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content display with AnimatePresence */}
                  <div className="min-h-[160px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {diagnosticTab === 'fuga' && (
                        <motion.div
                          key="fuga"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 text-xs text-textSecondary"
                        >
                          <p className="italic border-l-2 border-goldAccent/30 pl-3 leading-relaxed">
                            &quot;Siendo realistas... de cada 10 personas que te consultan precios por WhatsApp, ¿cuántas terminan alquilando y cuántas te dejan en visto porque tardaste en responder o encontraron otra cabaña antes?&quot;
                          </p>
                          <p className="italic border-l-2 border-goldAccent/30 pl-3 leading-relaxed">
                            &quot;¿Qué porcentaje de tus reservas mensuales vienen por Booking/Airbnb (donde dejás el 20% de comisión) frente a las reservas directas por WhatsApp (ganancia limpia)?&quot;
                          </p>
                        </motion.div>
                      )}

                      {diagnosticTab === 'operativo' && (
                        <motion.div
                          key="operativo"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 text-xs text-textSecondary"
                        >
                          <p className="italic border-l-2 border-goldAccent/30 pl-3 leading-relaxed">
                            &quot;Imaginemos un viernes a las 11 de la noche. Entra una consulta preguntando si hay lugar para el fin de semana largo, precio y si aceptan mascotas. ¿Quién contesta ese mensaje hoy? ¿Estás vos pegado al teléfono o tenés a alguien designado?&quot;
                          </p>
                          <p className="italic border-l-2 border-goldAccent/30 pl-3 leading-relaxed">
                            &quot;¿Te pasó alguna vez el dolor de cabeza de tener un 'Overbooking' (sobreventa) porque alguien reservó por WhatsApp y al mismo tiempo te entró una reserva por Booking?&quot;
                          </p>
                        </motion.div>
                      )}

                      {diagnosticTab === 'tech' && (
                        <motion.div
                          key="tech"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="space-y-3 text-xs text-textSecondary"
                        >
                          <p className="italic border-l-2 border-goldAccent/30 pl-3 leading-relaxed">
                            &quot;Actualmente, ¿cómo tenés centralizado tu calendario? ¿Usás un Channel Manager (un software que unifica todo) o entrás a la app de Airbnb y de Booking a tachar los días a mano?&quot;
                          </p>
                          <p className="italic border-l-2 border-goldAccent/30 pl-3 leading-relaxed">
                            &quot;Cuando alguien te confirma por WhatsApp, ¿cómo le cobrás la seña para bloquear la fecha? ¿Le pasás un CBU a mano y le pedís que te mande el comprobante?&quot;
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="border-t border-goldAccent/10 pt-4 text-center mt-3">
                  <span className="text-[9px] text-textSecondary font-mono uppercase tracking-wider block">
                    Un diagnóstico de nivel senior desarma el negocio para volver a armarlo mejor.
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>

{/* SLIDE 9: La Alianza Estratégica (Inversión) */}
        <div className="min-w-full h-screen shrink-0 snap-center flex flex-col items-center justify-center px-8 md:px-16 py-16 relative overflow-hidden z-10">
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate={activeSlide === 8 ? "visible" : "hidden"}
            className="max-w-4xl w-full flex flex-col justify-center items-center h-full"
          >
            {/* Dark Pricing Card Container */}
            <div className="w-full max-w-4xl pointer-events-auto">
              <motion.div
                variants={cardVariants}
                className="bg-cardBg text-textPrimary p-6 md:p-8 rounded-2xl shadow-2xl border border-goldAccent/15 flex flex-col justify-between gap-6 w-full"
              >
                {/* Header inside the Card */}
                <div className="text-center pb-4 border-b border-goldAccent/10">
                  <span className="text-[10px] font-mono text-goldAccent font-bold tracking-widest uppercase mb-1.5 block">
                    Inversión & Alianza
                  </span>
                  <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display text-textPrimary mb-2">
                    Un salto de calidad sin riesgo inicial
                  </h2>
                  <p className="text-xs md:text-sm text-textSecondary font-sans font-medium mt-1 max-w-xl mx-auto leading-relaxed">
                    Oferta exclusiva &quot;Socio Fundador&quot; para el despliegue del ecosistema Criollo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 md:divide-x md:divide-goldAccent/10">
                  {/* Setup */}
                  <div className="md:pr-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono text-goldAccent tracking-widest uppercase block mb-1.5">Implementación</span>
                      <h3 className="font-display font-bold text-xl md:text-2xl text-textPrimary mb-3">Setup Integral</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl md:text-4xl font-black text-glow-gold text-textPrimary">$450</span>
                        <span className="text-sm font-semibold text-textSecondary ml-1">USD</span>
                        <span className="text-[10px] text-textSecondary/80 ml-2 font-mono">(Única vez)</span>
                      </div>
                      <ul className="space-y-3 text-xs text-textSecondary">
                        <li className="flex gap-2.5 items-center">
                          <Check className="w-4 h-4 text-goldAccent flex-shrink-0" />
                          <span>Landing de Franquicias Premium</span>
                        </li>
                        <li className="flex gap-2.5 items-center">
                          <Check className="w-4 h-4 text-goldAccent flex-shrink-0" />
                          <span>Motor Bruno AI</span>
                        </li>
                        <li className="flex gap-2.5 items-center font-bold text-textPrimary">
                          <Check className="w-4 h-4 text-goldAccent flex-shrink-0" />
                          <span>Web Principal de Criollo 100% Bonificada</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* SaaS */}
                  <div className="pt-8 md:pt-0 md:pl-6 border-t md:border-t-0 border-goldAccent/10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-mono text-goldAccent tracking-widest uppercase">Licencia SaaS</span>
                        <span className="text-[8px] md:text-[9px] bg-emeraldAccent/15 text-emeraldAccent px-1.5 py-0.5 rounded font-mono font-bold uppercase">Primer mes 100% Bonificado</span>
                      </div>
                      <h3 className="font-display font-bold text-xl md:text-2xl text-textPrimary mb-3">Mantenimiento y Soporte</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl md:text-4xl font-black text-glow-gold text-textPrimary">$220</span>
                        <span className="text-xs font-semibold text-textSecondary ml-1">/ mes</span>
                      </div>
                      <ul className="space-y-3 text-xs text-textSecondary">
                        <li className="flex gap-2.5 items-center">
                          <Check className="w-4 h-4 text-goldAccent flex-shrink-0" />
                          <span>Hosting de todo el ecosistema web</span>
                        </li>
                        <li className="flex gap-2.5 items-center">
                          <Check className="w-4 h-4 text-goldAccent flex-shrink-0" />
                          <span>Soporte técnico</span>
                        </li>
                        <li className="flex gap-2.5 items-center">
                          <Check className="w-4 h-4 text-goldAccent flex-shrink-0" />
                          <span>Consumo de Inteligencia Artificial</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-goldAccent/10 pt-4 text-center mt-3">
                  <span className="text-[10px] md:text-xs text-textSecondary font-mono tracking-widest uppercase">
                    Iniciamos el desarrollo con un anticipo del 50%. El futuro de tu marca empieza hoy.
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

              </div>
    </div>
  );
}
