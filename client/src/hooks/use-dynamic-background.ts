import { useState, useEffect, useCallback } from 'react';

interface UserActivity {
  mouseX: number;
  mouseY: number;
  scrollY: number;
  currentPage: string;
  interactionCount: number;
  lastInteraction: number;
  hoverIntensity: number;
  scrollSpeed: number;
}

interface GradientState {
  primaryHue: number;
  secondaryHue: number;
  intensity: number;
  position: { x: number; y: number };
  rotation: number;
  opacity: number;
}

export const useDynamicBackground = () => {
  const [activity, setActivity] = useState<UserActivity>({
    mouseX: 0,
    mouseY: 0,
    scrollY: 0,
    currentPage: '/',
    interactionCount: 0,
    lastInteraction: Date.now(),
    hoverIntensity: 0,
    scrollSpeed: 0,
  });

  const [gradientState, setGradientState] = useState<GradientState>({
    primaryHue: 270, // Purple
    secondaryHue: 120, // Green
    intensity: 0.15,
    position: { x: 30, y: 20 },
    rotation: 0,
    opacity: 0.8,
  });

  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  // Track mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    
    setActivity(prev => ({
      ...prev,
      mouseX: x,
      mouseY: y,
      lastInteraction: Date.now(),
      interactionCount: prev.interactionCount + 1,
    }));
  }, []);

  // Track scroll behavior
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    const direction = currentScrollY > lastScrollY ? 'down' : 'up';
    
    setLastScrollY(currentScrollY);
    setScrollDirection(direction);
    
    setActivity(prev => ({
      ...prev,
      scrollY: currentScrollY,
      scrollSpeed: scrollDelta,
      lastInteraction: Date.now(),
    }));
  }, [lastScrollY]);

  // Track hover interactions
  const handleHoverStart = useCallback(() => {
    setActivity(prev => ({
      ...prev,
      hoverIntensity: Math.min(prev.hoverIntensity + 0.1, 1),
      lastInteraction: Date.now(),
    }));
  }, []);

  // Update gradient based on activity
  useEffect(() => {
    const updateGradient = () => {
      const timeSinceLastInteraction = Date.now() - activity.lastInteraction;
      const isActive = timeSinceLastInteraction < 2000; // Active within 2 seconds
      
      setGradientState(prev => {
        let newState = { ...prev };
        
        // Base colors for different pages
        if (window.location.pathname.includes('/mods')) {
          newState.primaryHue = 260; // Blue-purple
          newState.secondaryHue = 180; // Cyan
        } else if (window.location.pathname.includes('/cart')) {
          newState.primaryHue = 340; // Pink
          newState.secondaryHue = 60; // Yellow
        } else if (window.location.pathname.includes('/profile')) {
          newState.primaryHue = 300; // Magenta
          newState.secondaryHue = 150; // Teal
        } else {
          newState.primaryHue = 270; // Purple
          newState.secondaryHue = 120; // Green
        }
        
        // Mouse position influences gradient position
        newState.position.x = 20 + (activity.mouseX * 0.6);
        newState.position.y = 10 + (activity.mouseY * 0.4);
        
        // Scroll influences intensity and rotation
        const scrollProgress = Math.min(activity.scrollY / 1000, 1);
        newState.intensity = 0.1 + (scrollProgress * 0.2) + (activity.hoverIntensity * 0.1);
        newState.rotation = scrollProgress * 180;
        
        // Scroll speed affects opacity
        const speedIntensity = Math.min(activity.scrollSpeed / 50, 1);
        newState.opacity = 0.6 + (speedIntensity * 0.3) + (isActive ? 0.2 : 0);
        
        // Scroll direction affects hue shift
        if (scrollDirection === 'down') {
          newState.primaryHue = (newState.primaryHue + 5) % 360;
        } else {
          newState.primaryHue = (newState.primaryHue - 5 + 360) % 360;
        }
        
        // Interaction count affects secondary hue
        newState.secondaryHue = (newState.secondaryHue + (activity.interactionCount * 2)) % 360;
        
        return newState;
      });
    };

    const interval = setInterval(updateGradient, 100);
    return () => clearInterval(interval);
  }, [activity, scrollDirection]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .card, .mod-card');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', handleHoverStart);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      interactiveElements.forEach(element => {
        element.removeEventListener('mouseenter', handleHoverStart);
      });
    };
  }, [handleMouseMove, handleScroll, handleHoverStart]);

  // Decay hover intensity over time
  useEffect(() => {
    const interval = setInterval(() => {
      setActivity(prev => ({
        ...prev,
        hoverIntensity: Math.max(prev.hoverIntensity - 0.05, 0),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Generate CSS variables for the dynamic background
  const backgroundStyle = {
    '--dynamic-primary-hue': gradientState.primaryHue,
    '--dynamic-secondary-hue': gradientState.secondaryHue,
    '--dynamic-intensity': gradientState.intensity,
    '--dynamic-position-x': `${gradientState.position.x}%`,
    '--dynamic-position-y': `${gradientState.position.y}%`,
    '--dynamic-rotation': `${gradientState.rotation}deg`,
    '--dynamic-opacity': gradientState.opacity,
  } as React.CSSProperties;

  return {
    backgroundStyle,
    activity,
    gradientState,
    isActive: Date.now() - activity.lastInteraction < 2000,
  };
};