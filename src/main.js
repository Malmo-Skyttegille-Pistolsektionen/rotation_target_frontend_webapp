// Import Shoelace
import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

// Set the base path to the Shoelace assets (local for offline support)
setBasePath('/shoelace-assets/');

import { initializeRunTab } from './ui/views/run_tab.js';
import { initializeAudiosTab } from './ui/views/audios_tab.js';
import { initializeProgramsTab } from './ui/views/programs_tab.js';
import { initializeSettingsTab } from './ui/views/settings_tab.js';
import { connectToEventStream } from './apis/sse-client.js';
import { loadAudios } from './models/audios.js';

import { SSETypes } from "./common/sse-types.js";


function handleSSEEvent(type, payload) {
  const event = new CustomEvent(type, { detail: payload });
  document.dispatchEvent(event);
}

document.addEventListener("DOMContentLoaded", async () => {


  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
  const appName = "Malmö Skyttegille Rotation Target";
  const appTitle = `${appName} v${appVersion}`;
  document.title = appTitle;
  document.querySelector("#footer span").textContent = appTitle;

  try {
    await loadAudios();
  } catch (error) {
    console.error("Failed to load audios:", error);
  }

  // Initialize tabs
  await initializeRunTab();

  // Cache DOM elements at the top
  const runTabButton = document.getElementById("run-tab-button");
  const audioTabButton = document.getElementById("audio-tab-button");
  const programsTabButton = document.getElementById("programs-tab-button");
  const settingsTabButton = document.getElementById("settings-tab-button");
  
  // Mobile navigation buttons
  const mobileRunTabButton = document.getElementById("mobile-run-tab-button");
  const mobileAudioTabButton = document.getElementById("mobile-audio-tab-button");
  const mobileProgramsTabButton = document.getElementById("mobile-programs-tab-button");
  const mobileSettingsTabButton = document.getElementById("mobile-settings-tab-button");
  
  const runSection = document.getElementById("run-section");
  const audioSection = document.getElementById("audio-section");
  const programsSection = document.getElementById("programs-section");
  const settingsSection = document.getElementById("settings-section");
  
  // Helper function to update both desktop and mobile tab states
  function setActiveTab(tab) {
    const tabs = [
      { desktop: runTabButton, mobile: mobileRunTabButton, name: "run" },
      { desktop: audioTabButton, mobile: mobileAudioTabButton, name: "audio" },
      { desktop: programsTabButton, mobile: mobileProgramsTabButton, name: "programs" },
      { desktop: settingsTabButton, mobile: mobileSettingsTabButton, name: "settings" }
    ];
    
    const sections = [
      { element: runSection, name: "run" },
      { element: audioSection, name: "audio" },
      { element: programsSection, name: "programs" },
      { element: settingsSection, name: "settings" }
    ];
    
    // Update tab states
    tabs.forEach(({ desktop, mobile, name }) => {
      const isActive = name === tab;
      desktop?.classList.toggle("active", isActive);
      mobile?.classList.toggle("active", isActive);
    });
    
    // Update section visibility
    sections.forEach(({ element, name }) => {
      element?.classList.toggle("hidden", name !== tab);
    });
  }
  // Tab switching logic - Desktop
  runTabButton.addEventListener("click", async () => {
    setActiveTab("run");
    await initializeRunTab();
  });

  audioTabButton.addEventListener("click", async () => {
    setActiveTab("audio");
    await initializeAudiosTab();
  });

  programsTabButton.addEventListener("click", () => {
    setActiveTab("programs");
    initializeProgramsTab();
  });

  settingsTabButton.addEventListener("click", () => {
    setActiveTab("settings");
    initializeSettingsTab();
  });
  
  // Tab switching logic - Mobile
  mobileRunTabButton.addEventListener("click", async () => {
    setActiveTab("run");
    await initializeRunTab();
  });

  mobileAudioTabButton.addEventListener("click", async () => {
    setActiveTab("audio");
    await initializeAudiosTab();
  });

  mobileProgramsTabButton.addEventListener("click", () => {
    setActiveTab("programs");
    initializeProgramsTab();
  });

  mobileSettingsTabButton.addEventListener("click", () => {
    setActiveTab("settings");
    initializeSettingsTab();
  });

  // Broadcast SSE events
  connectToEventStream(handleSSEEvent);

  let heartbeatCounter = 0;

  document.addEventListener("sse_status", (e) => {
    const status = e.detail.status;
    const statusEl = document.getElementById("sse-status");
    console.log(`SSE status event: ${status} (heartbeat: ${heartbeatCounter})`);
    if (statusEl) {
      statusEl.textContent = `SSE (${heartbeatCounter}): ${status}`;
      statusEl.className = `sse-status-${status}`;
    }
  });
  // Heartbeat event handler
  let heartbeatResetCounter = 0; // Counter for number of resets

  document.addEventListener(SSETypes.HeartBeat, (e) => {
    const heartbeatId = e?.detail?.id;
    if (heartbeatId === "reset") {
      heartbeatCounter = 0;
      heartbeatResetCounter++;
      console.log(`SSE heartbeat counter reset (total resets: ${heartbeatResetCounter})`);
    } else {
      heartbeatCounter++;
      console.log(`SSE heartbeat: ${heartbeatCounter}`);
    }
    const statusEl = document.getElementById("sse-status");
    if (statusEl) {
      const status = window.sseConnectionStatus || "unknown";
      statusEl.textContent = `SSE (${heartbeatCounter} : ${heartbeatId}, resets: ${heartbeatResetCounter}): ${status}`;
    }
  });
});

