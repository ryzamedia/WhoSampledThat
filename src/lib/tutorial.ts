import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Utility function to check if we're on mobile
const isMobileView = () => window.innerWidth < 768; // md breakpoint is 768px

export const createTutorial = (_onSkip: () => void, onComplete: () => void, onStepChange?: (step: number) => void) => {
  const isMobile = isMobileView();
  
  const driverInstance = driver({
    showProgress: true,
    allowClose: true,
    showButtons: ['next', 'previous'],
    disableActiveInteraction: false,
    popoverClass: 'custom-popover-width',
    overlayClickBehavior: 'close',
    steps: [
      {
        element: isMobile ? '.tutorial-original-sample-mobile' : '.tutorial-original-sample-desktop',
        popover: {
          title: '1. Listen and guess',
          description: 'Play the original sample. Guess out loud which NEW artist and song used it. Use Replay to listen again. Bonus: name the original sample.',
          side: isMobile ? 'top' : 'bottom', align: 'center', showButtons: ['next']
        }
      },
      {
        element: isMobile ? '.tutorial-new-song-mobile' : '.tutorial-new-song-desktop',
        popover: {
          title: '2. Reveal the answers',
          description: 'After everyone has guessed, play the new song. Tap Reveal on each track to see its artist and song title.',
          side: isMobile ? 'top' : 'bottom', align: 'center'
        }
      },
      {
        element: '.tutorial-players-section',
        popover: {
          title: '3. Award points',
          description: 'Tap a correct category under each player to add 1 point. Tap again to undo. Each player can earn up to 3 points per round. Then choose Next round; scores save automatically.',
          side: 'top', align: 'center', nextBtnText: 'Let’s play'
        }
      }
    ],
    onHighlightStarted: (_element, _step, options) => {
      if (onStepChange) {
        onStepChange(options.state.activeIndex || 0);
      }
    },
    onDestroyed: () => {
      onComplete();
    }
  });
  
  // Handle window resize events to recalculate positions
  const handleResize = () => {
    if (driverInstance.isActive()) {
      // Small delay to allow layout changes to complete
      setTimeout(() => {
        driverInstance.refresh();
      }, 100);
    }
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  
  // Clean up event listeners when tutorial is destroyed
  const originalDestroy = driverInstance.destroy.bind(driverInstance);
  driverInstance.destroy = () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    originalDestroy();
  };
  
  return driverInstance;
};

export const tutorialStyles = `
  .driver-popover {
    background: linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%);
    border: 1px solid #4f46e5;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 90vw !important;
  }
  
  /* Desktop width adjustments - make boxes smaller */
  @media (min-width: 769px) {
    .driver-popover.custom-popover-width {
      max-width: 320px !important;
      width: 320px !important;
    }
  }
  
  /* Mobile-specific adjustments */
  @media (max-width: 768px) {
    .driver-popover {
      max-width: 95vw !important;
      margin: 10px !important;
    }
    
    .driver-popover-title {
      font-size: 1.1rem !important;
    }
    
    .driver-popover-description {
      font-size: 0.9rem !important;
    }
    
    .driver-popover-next-btn,
    .driver-popover-prev-btn {
      padding: 8px 16px !important;
      font-size: 0.9rem !important;
    }
  }
  
  .driver-popover::before {
    border-color: #4f46e5 !important;
  }
  
  .driver-popover::after {
    border-color: #1e1b4b !important;
  }
  
  .driver-popover-title {
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .driver-popover-description {
    color: #e2e8f0;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .driver-popover-next-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .driver-popover-next-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  .driver-popover-prev-btn {
    background: transparent;
    color: #94a3b8;
    border: 1px solid #475569;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .driver-popover-prev-btn:hover {
    color: #ffffff;
    border-color: #64748b;
  }
  
  /* Hide the close button completely since we only want backdrop click to close */
  .driver-popover-close-btn {
    display: none !important;
  }
  
  .driver-popover-progress-text {
    color: #94a3b8;
    font-size: 0.875rem;
  }
`; 