const PLANETS_URL = "https://solar-system-opendata-proxy.vercel.app/api/planets";
const AU_IN_KM = 149597870.7;
const EARTH_MASS_KG = 5.97237e24;
const EARTH_GRAVITY = 9.80665;
const NOT_AVAILABLE = "N/A";

const PLANET_ORDER = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
const BADGE_CLASSES = {
  mercury: "bg-orange-500/50 text-orange-200",
  venus: "bg-orange-500/50 text-orange-200",
  earth: "bg-blue-500/50 text-blue-200",
  mars: "bg-red-500/50 text-red-200",
  jupiter: "bg-purple-500/50 text-purple-200",
  saturn: "bg-yellow-500/50 text-yellow-200",
  uranus: "bg-cyan-500/50 text-cyan-200",
  neptune: "bg-blue-500/50 text-blue-200",
};
const PLANET_COLORS = {
  mercury: "#eab308",
  venus: "#f97316",
  earth: "#3b82f6",
  mars: "#ef4444",
  jupiter: "#fb923c",
  saturn: "#facc15",
  uranus: "#06b6d4",
  neptune: "#2563eb",
};
const SUPERSCRIPTS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻" };

const planetCards = document.querySelectorAll(".planet-card");
const comparisonBody = document.getElementById("planet-comparison-tbody");
const factsList = document.getElementById("planet-facts");
const detailImage = document.getElementById("planet-detail-image");
const detailName = document.getElementById("planet-detail-name");

let planets = [];

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function isMissing(value) {
  return value === null || value === undefined || value === "" || value === 0;
}

function formatNumber(value, digits = 0) {
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function formatMillionKm(value) {
  return `${formatNumber(value / 1e6, 1)}M km`;
}

function formatPower(value) {
  const exponent = String(value.massExponent ?? value.volExponent);
  return [...exponent].map((char) => SUPERSCRIPTS[char]).join("");
}

function getPlanet(body) {
  const id = body.englishName.toLowerCase();
  return {
    id,
    name: body.englishName,
    type: body.type,
    description: body.description,
    badge: BADGE_CLASSES[id],
    color: PLANET_COLORS[id],
    image: `./assets/images/${id}.png`,
    moons: body.moons ? body.moons.length : 0,
    distanceKm: body.semimajorAxis,
    body,
  };
}

function updateCards() {
  planetCards.forEach((card) => {
    const planet = planets.find((item) => item.id === card.dataset.planetId);
    if (planet) {
      card.querySelector("p").textContent = `${(planet.distanceKm / AU_IN_KM).toFixed(2)} AU`;
    }
  });
}

function comparisonRow(planet) {
  const { body } = planet;
  const cell = (value) =>
    `<td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${value}</td>`;
  const mass = (body.mass.massValue * 10 ** body.mass.massExponent) / EARTH_MASS_KG;

  return `
    <tr data-planet-id="${planet.id}" class="hover:bg-slate-800/30 transition-colors">
      <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
        <div class="flex items-center space-x-2 md:space-x-3">
          <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color: ${planet.color}"></div>
          <span class="font-semibold text-sm md:text-base whitespace-nowrap">${planet.name}</span>
        </div>
      </td>
      ${cell((planet.distanceKm / AU_IN_KM).toFixed(2))}
      ${cell(formatNumber(body.meanRadius * 2))}
      ${cell(mass.toFixed(3))}
      ${cell(`${formatNumber(body.sideralOrbit)} days`)}
      ${cell(planet.moons)}
      <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
        <span class="px-2 py-1 rounded text-xs ${planet.badge}">${planet.type}</span>
      </td>
    </tr>`;
}

function buildFacts(planet) {
  const { body } = planet;
  const facts = [];

  const position = PLANET_ORDER.indexOf(planet.id);
  if (position !== -1) facts.push(`${planet.name} is the ${ORDINALS[position]} planet from the Sun`);

  facts.push(planet.moons === 0 ? "Has no known moons" : `Has ${formatNumber(planet.moons)} known ${planet.moons === 1 ? "moon" : "moons"}`);

  if (!isMissing(body.sideralRotation)) {
    facts.push(`One day lasts about ${formatNumber(Math.abs(body.sideralRotation), 1)} Earth hours`);
  }
  if (!isMissing(body.sideralOrbit)) {
    facts.push(`One year lasts about ${formatNumber(body.sideralOrbit)} Earth days`);
  }
  if (!isMissing(body.gravity)) {
    facts.push(`Surface gravity is ${(body.gravity / EARTH_GRAVITY).toFixed(2)}× Earth's`);
  }
  return facts;
}

function showFacts(planet) {
  const facts = buildFacts(planet);
  if (facts.length === 0) return;

  factsList.innerHTML = facts
    .map(
      (fact) => `
        <li class="flex items-start">
          <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
          <span class="text-slate-300">${fact}</span>
        </li>`
    )
    .join("");
}

function showPlanet(planet) {
  const { body } = planet;

  detailImage.src = planet.image;
  detailImage.alt = `${planet.name} planet`;
  detailName.textContent = planet.name;
  setText("planet-detail-description", planet.description);

  setText("planet-distance", formatMillionKm(body.semimajorAxis));
  setText("planet-radius", `${formatNumber(body.meanRadius)} km`);
  document.getElementById("planet-mass").textContent =
    `${body.mass.massValue.toFixed(2)} × 10${formatPower(body.mass)} kg`;
  setText("planet-density", `${body.density.toFixed(2)} g/cm³`);
  setText("planet-orbital-period", `${formatNumber(body.sideralOrbit)} days`);
  setText("planet-rotation", `${formatNumber(Math.abs(body.sideralRotation), 2)} hrs`);
  setText("planet-moons", planet.moons);
  setText("planet-gravity", `${body.gravity.toFixed(2)} m/s²`);

  setText("planet-discoverer", body.discoveredBy || NOT_AVAILABLE);
  setText("planet-discovery-date", body.discoveryDate || NOT_AVAILABLE);
  setText("planet-body-type", body.bodyType || NOT_AVAILABLE);
  document.getElementById("planet-volume").textContent = body.vol
    ? `${body.vol.volValue.toFixed(2)} × 10${formatPower(body.vol)} km³`
    : NOT_AVAILABLE;

  setText("planet-perihelion", formatMillionKm(body.perihelion));
  setText("planet-aphelion", formatMillionKm(body.aphelion));
  setText("planet-eccentricity", body.eccentricity);
  setText("planet-inclination", `${body.inclination.toFixed(2)}°`);
  setText("planet-axial-tilt", `${body.axialTilt.toFixed(2)}°`);
  setText("planet-temp", isMissing(body.avgTemp) ? NOT_AVAILABLE : `${Math.round(body.avgTemp - 273.15)}°C`);
  setText("planet-escape", `${(body.escape / 1000).toFixed(1)} km/s`);

  showFacts(planet);

  comparisonBody.querySelectorAll("tr").forEach((row) => {
    row.classList.toggle("bg-blue-500/5", row.dataset.planetId === planet.id);
  });
}

export async function initPlanets() {
  try {
    const response = await fetch(PLANETS_URL);
    if (!response.ok) {
      throw new Error(`Planets API returned status ${response.status}.`);
    }
    const { bodies } = await response.json();

    planets = bodies
      .filter((body) => body.isPlanet)
      .map(getPlanet)
      .sort((a, b) => PLANET_ORDER.indexOf(a.id) - PLANET_ORDER.indexOf(b.id));

    updateCards();
    comparisonBody.innerHTML = planets.map(comparisonRow).join("");
    showPlanet(planets.find((planet) => planet.id === "earth") ?? planets[0]);
  } catch (error) {
    comparisonBody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-slate-400">Could not load planets. ${error.message}</td></tr>`;
    return;
  }

  planetCards.forEach((card) => {
    card.addEventListener("click", () => {
      const planet = planets.find((item) => item.id === card.dataset.planetId);
      if (!planet) return;
      showPlanet(planet);
      detailName.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}
