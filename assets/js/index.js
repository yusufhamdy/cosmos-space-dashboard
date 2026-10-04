import { initApod } from "./apod.js";
import { initLaunches } from "./launches.js";
import { initPlanets } from "./planets.js";

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");

function showSection(sectionId) {
  sections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== sectionId);
  });

  navLinks.forEach((link) => {
    const isActive = link.dataset.section === sectionId;
    link.classList.toggle("bg-blue-500/10", isActive);
    link.classList.toggle("text-blue-400", isActive);
    link.classList.toggle("text-slate-300", !isActive);
    link.classList.toggle("hover:bg-slate-800", !isActive);
  });

  sidebar.classList.remove("sidebar-open");
  window.scrollTo({ top: 0 });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(link.dataset.section);
  });
});

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("sidebar-open");
});

initApod();
initLaunches();
initPlanets();
