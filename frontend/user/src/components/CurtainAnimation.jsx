import React, { useEffect, useState } from 'react';

const CurtainAnimation = ({ message, onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Trigger animation sequence on mount
    const startAnimation = () => {
      // 1. Open curtains and expand scene
      setIsOpen(true);
      setIsExpanding(true);
      setIsFadingOut(true);

      // 2. Wait for animation to finish then call onComplete
      // Animation durations (4x slower):
      // Curtain opening: 8s
      // Scene expansion: 10s
      // Text zoom/fade: 20s
      // Ground rising: 24s
      // Total approx 28s
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 28000);
    };

    // Small delay to ensure render before animation starts
    const timer = setTimeout(startAnimation, 100);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <div id="starter" className={isFadingOut ? 'fade-out' : ''} style={styles.starter}>
        {/* Placeholder for starter element if needed, currently auto-playing */}
      </div>

      <div id="scene" className={isExpanding ? 'expand' : ''} style={styles.scene}>
        <div id="curtain" className={isOpen ? 'open' : ''} style={styles.curtain}>
          <div className="left" style={styles.curtainLeft}></div>
          <div className="right" style={styles.curtainRight}></div>
        </div>

        <h1 style={styles.h1}>{message || "Welcome to Nepal Telecom Retired Employee Society"}</h1>

        <div className="ground" style={styles.ground}></div>
      </div>

      <style>{`
        @import url("https://fonts.googleapis.com/css?family=Open+Sans:800|Roboto+Condensed:700i");

        /* Keyframes */
        @keyframes expand-scene-horizontally {
          from { width: 100vw; left: 0; background-color: #003399; }
          to { width: 100vw; left: 0; background-color: transparent; pointer-events: none; }
        }
        @keyframes expand-scene-vertically {
          from { top: 0; height: 100vh; }
          to { top: 0; height: 100vh; }
        }
        @keyframes curtain-opening {
          from { filter: brightness(180%); }
          to { filter: brightness(100%); }
        }
        @keyframes left-curtain-opening {
          from { transform: translate(0) rotate(0) scale(1,1); }
          to { transform: translate(-100%) rotate(20deg) scale(0,2); }
        }
        @keyframes right-curtain-opening {
          from { transform: translate(0) rotate(0) scale(1,1); }
          to { transform: translate(100%) rotate(-20deg) scale(0,2); }
        }
        @keyframes ground-rising {
          from { top: 133%; }
          to { top: 105%; }
        }
        @keyframes text-zoom {
          from { transform: scale(0.75); }
          to { transform: scale(1); }
        }
        @keyframes text-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes text-glowing {
          from { text-shadow: 0 0 10px white; }
          to { text-shadow: 0 0 10px white, 0 0 20px white, 0 0 30px #FFD700; }
        }
        @keyframes fade-out {
          from { color: black; opacity: 1; }
          to { color: white; opacity: 0; }
        }

        /* Classes triggered by state */
        #scene.expand {
          width: 100vw;
          left: 0;
          background-color: #003399; /* Nepal Telecom Blue */
          box-shadow: none;
          animation-fill-mode: forwards;
          animation-name: expand-scene-horizontally, expand-scene-vertically;
          animation-duration: 10s, 6s; /* 4x slower */
          animation-timing-function: ease-in-out, ease-in-out;
          animation-delay: 0s, 10s; /* 4x slower */
          animation-iteration-count: 1, 1;
        }

        #curtain.open .left, #curtain.open .right {
          filter: brightness(100%);
        }
        #curtain.open .left {
          animation-fill-mode: forwards;
          animation-name: curtain-opening, left-curtain-opening;
          animation-duration: 8s, 16s; /* 4x slower */
          animation-timing-function: ease-in-out, ease-in-out;
        }
        #curtain.open .right {
          animation-fill-mode: forwards;
          animation-name: curtain-opening, right-curtain-opening;
          animation-duration: 8s, 16s; /* 4x slower */
          animation-timing-function: ease-in-out, ease-in-out;
        }

        #scene.expand .ground {
          animation-fill-mode: forwards;
          animation-name: ground-rising;
          animation-duration: 24s; /* 4x slower */
          animation-timing-function: ease-out;
        }

        #scene.expand h1 {
          animation-fill-mode: forwards;
          animation-name: text-zoom, text-fade-in, text-glowing;
          animation-duration: 20s, 4s, 4s; /* 4x slower */
          animation-timing-function: ease-out, ease-in-out, ease-in-out;
          animation-delay: 12s, 12s, 0s; /* 4x slower */
          animation-iteration-count: 1, 1, infinite;
          animation-direction: normal, normal, alternate;
        }

        .fade-out {
          animation-fill-mode: forwards;
          animation-name: fade-out;
          animation-duration: 4s; /* 4x slower */
          animation-timing-function: ease-in;
        }
      `}</style>
    </>
  );
};

const styles = {
  starter: {
    display: 'none',
  },
  scene: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#003399', // Nepal Telecom Blue
    zIndex: 10000,
  },
  curtain: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'transparent',
    position: 'relative',
    zIndex: 2
  },
  curtainLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    backgroundColor: '#FFD700', // Golden Yellow
    backgroundImage: 'none',
    transformOrigin: 'top right',
    boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.5)',
  },
  curtainRight: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: '50%',
    height: '100%',
    backgroundColor: '#FFD700', // Golden Yellow
    backgroundImage: 'none',
    transformOrigin: 'top left',
    boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.5)',
  },
  ground: {
    position: 'absolute',
    left: '50%',
    top: '133%',
    width: '10000px',
    height: '10000px',
    marginLeft: '-5000px',
    borderRadius: '100%',
    backgroundColor: '#002266', // Darker Blue
    boxShadow: '0 0 100px 100px #003399',
    zIndex: 1
  },
  h1: {
    position: 'absolute',
    left: '0', // Center horizontally relative to viewport width
    top: '50%',
    transform: 'translateY(-50%) scale(0.75)', // Center vertically and set initial scale
    width: '100%',
    textAlign: 'center',
    fontFamily: '"Open Sans", sans-serif',
    fontSize: '5vw', // Responsive font size for long text
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    opacity: 0,
    zIndex: 3,
    padding: '0 20px', // Prevent text touching edges
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    whiteSpace: 'normal', // Allow wrapping
    lineHeight: '1.2',
  }
};

export default CurtainAnimation;
