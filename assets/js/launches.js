const LAUNCHES_URL = "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";
const FALLBACK_IMAGE = "./assets/images/launch-placeholder.png";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const featuredBox = document.getElementById("featured-launch");
const grid = document.getElementById("launches-grid");
const countLabel = document.getElementById("launches-count");
const countLabelMobile = document.getElementById("launches-count-mobile");

function escapeHtml(text) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(text).replace(/[&<>"']/g, (char) => entities[char]);
}

function shorten(text, maxLength) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength).trim()}...` : clean;
}

function getLaunchInfo(launch) {
  const net = new Date(launch.net);
  const precision = launch.net_precision?.id ?? 0;
  const isMonthOnly = precision >= 7;
  const hasExactTime = precision <= 2;
  const description = launch.mission?.description;

  return {
    name: launch.name,
    status: launch.status?.abbrev ?? "TBD",
    isGo: launch.status?.abbrev === "Go",
    provider: launch.launch_service_provider?.name ?? "Unknown",
    rocket: launch.rocket?.configuration?.name ?? "Unknown",
    location: launch.pad?.location?.name ?? "Unknown",
    country: launch.pad?.country?.alpha_3_code ?? "N/A",
    image: launch.image?.image_url ?? FALLBACK_IMAGE,
    description: description ? shorten(description, 260) : "No description available.",
    daysLeft: Math.max(0, Math.ceil((net - Date.now()) / DAY_IN_MS)),
    date(month) {
      return net.toLocaleDateString("en-US", {
        year: "numeric",
        month: isMonthOnly ? "long" : month,
        day: isMonthOnly ? undefined : "numeric",
        timeZone: "UTC",
      });
    },
    time: hasExactTime
      ? `${net.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`
      : "TBD",
  };
}

function imageTag(info, classes) {
  return `<img class="${classes}" src="${escapeHtml(info.image)}" alt="${escapeHtml(info.name)}"
    onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'" />`;
}

function featuredTemplate(info) {
  const badge = info.isGo ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400";
  const detail = (icon, label, value) => `
    <div class="bg-slate-900/50 rounded-xl p-4">
      <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas ${icon}"></i>${label}</p>
      <p class="font-semibold text-sm">${escapeHtml(value)}</p>
    </div>`;

  return `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
              <i class="fas fa-star"></i>Featured Launch
            </span>
            <span class="px-4 py-1.5 ${badge} rounded-full text-sm font-semibold">${escapeHtml(info.status)}</span>
          </div>
          <h3 class="text-3xl font-bold mb-3 leading-tight">${escapeHtml(info.name)}</h3>
          <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
            <div class="flex items-center gap-2"><i class="fas fa-building"></i><span>${escapeHtml(info.provider)}</span></div>
            <div class="flex items-center gap-2"><i class="fas fa-rocket"></i><span>${escapeHtml(info.rocket)}</span></div>
          </div>
          <div class="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/20 rounded-xl mb-6">
            <i class="fas fa-clock text-2xl text-blue-400"></i>
            <div>
              <p class="text-2xl font-bold text-blue-400">${info.daysLeft}</p>
              <p class="text-xs text-slate-400">Days Until Launch</p>
            </div>
          </div>
          <div class="grid xl:grid-cols-2 gap-4 mb-6">
            ${detail("fa-calendar", "Launch Date", info.date("long"))}
            ${detail("fa-clock", "Launch Time", info.time)}
            ${detail("fa-map-marker-alt", "Location", info.location)}
            ${detail("fa-globe", "Country", info.country)}
          </div>
          <p class="text-slate-300 leading-relaxed">${escapeHtml(info.description)}</p>
        </div>
        <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
          ${imageTag(info, "absolute inset-0 w-full h-full object-cover")}
          <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
      </div>
    </div>`;
}

function cardTemplate(info) {
  const badge = info.isGo ? "bg-green-500/90" : "bg-yellow-500/90";
  const row = (icon, value, extra = "") => `
    <div class="flex items-center gap-2 text-sm">
      <i class="fas ${icon} text-slate-500 w-4"></i>
      <span class="text-slate-300 ${extra}">${escapeHtml(value)}</span>
    </div>`;

  return `
    <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group">
      <div class="relative h-48 bg-slate-900/50">
        ${imageTag(info, "w-full h-full object-cover")}
        <div class="absolute top-3 right-3">
          <span class="px-3 py-1 ${badge} text-white rounded-full text-xs font-semibold">${escapeHtml(info.status)}</span>
        </div>
      </div>
      <div class="p-5">
        <div class="mb-3">
          <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">${escapeHtml(info.name)}</h4>
          <p class="text-sm text-slate-400 flex items-center gap-2"><i class="fas fa-building text-xs"></i>${escapeHtml(info.provider)}</p>
        </div>
        <div class="space-y-2">
          ${row("fa-calendar", info.date("short"))}
          ${row("fa-clock", info.time)}
          ${row("fa-rocket", info.rocket)}
          ${row("fa-map-marker-alt", info.location, "line-clamp-1")}
        </div>
      </div>
    </div>`;
}

function showError(message) {
  const html = `<p class="text-slate-400">${message}</p>`;
  featuredBox.innerHTML = html;
  grid.innerHTML = "";
}

export async function initLaunches() {
  featuredBox.innerHTML = '<p class="text-slate-400">Loading launches...</p>';
  grid.innerHTML = "";

  try {
    const response = await fetch(LAUNCHES_URL);
    if (!response.ok) {
      throw new Error(`Launch API returned status ${response.status}.`);
    }
    const { results } = await response.json();
    if (results.length === 0) {
      showError("No upcoming launches found.");
      return;
    }
    const launches = results.map((launch) => getLaunchInfo(launch));

    featuredBox.innerHTML = featuredTemplate(launches[0]);
    grid.innerHTML = launches.map(cardTemplate).join("");
    countLabel.textContent = `${launches.length} Launches`;
    countLabelMobile.textContent = launches.length;
  } catch (error) {
    showError(`Could not load launches. ${escapeHtml(error.message)}`);
  }
}
