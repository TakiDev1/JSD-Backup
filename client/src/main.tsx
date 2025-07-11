import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
const style = document.createElement("style");
style.textContent = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1a1a1f;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #7300ff;
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #8b1aff;
  }
  
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  
  .floating {
    animation: float 6s ease-in-out infinite;
  }
  
  .floating-delay-1 {
    animation-delay: 1s;
  }
  
  .floating-delay-2 {
    animation-delay: 2s;
  }
  
  .glow-effect {
    position: relative;
  }
  
  .glow-effect::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #7300ff, #00e5ff);
    z-index: -1;
    filter: blur(15px);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit;
  }
  
  .glow-effect:hover::after {
    opacity: 0.7;
  }
  
  .card-3d {
    transition: transform 0.5s ease;
    transform-style: preserve-3d;
  }
  
  .card-3d:hover {
    transform: perspective(1000px) rotateY(10deg) rotateX(5deg);
  }
  
  .particles-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
  }
`;
document.head.appendChild(style);

// Add font imports
const fontLinks = document.createElement("link");
fontLinks.rel = "stylesheet";
fontLinks.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap";
document.head.appendChild(fontLinks);

// Add Font Awesome for icons
const faLink = document.createElement("link");
faLink.rel = "stylesheet";
faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(faLink);

// Set page title
document.title = "JSD Mods - Premium BeamNG Drive Modifications";

// Create root and render the app
createRoot(document.getElementById("root")!).render(<App />);
