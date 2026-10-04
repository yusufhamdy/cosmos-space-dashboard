const NASA_API_KEY = "TCocnMAn6eOOT5gzLqCZlvsPM3RP7luGJzipkDKq"; 
const APOD_URL = "https://api.nasa.gov/planetary/apod";
const MIN_DATE = "1995-06-16";

const dateLabel = document.getElementById("apod-date");
const dateInput = document.getElementById("apod-date-input");
const dateInputText = dateInput.parentElement.querySelector("span");
const loadButton = document.getElementById("load-date-btn");
const todayButton = document.getElementById("today-apod-btn");
const container = document.getElementById("apod-image-container");
const loading = document.getElementById("apod-loading");
const image = document.getElementById("apod-image");
const fullResButton = container.querySelector("button");
const title = document.getElementById("apod-title");
const dateDetail = document.getElementById("apod-date-detail");
const explanation = document.getElementById("apod-explanation");
const copyright = document.getElementById("apod-copyright");
const dateInfo = document.getElementById("apod-date-info");
const mediaType = document.getElementById("apod-media-type");

let fullResUrl = "";

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function setLoading(isLoading, message) {
  loading.classList.toggle("hidden", !isLoading);
  image.classList.toggle("hidden", isLoading);
  if (isLoading) {
    loading.querySelector("p").textContent = message;
  }
}

function removeFrame() {
  const frame = container.querySelector("iframe");
  if (frame) frame.remove();
}

function showMedia(data) {
  removeFrame();

  if (data.media_type === "video") {
    const frame = document.createElement("iframe");
    frame.src = data.url;
    frame.title = data.title;
    frame.className = "w-full h-full";
    frame.allowFullscreen = true;
    image.classList.add("hidden");
    container.appendChild(frame);
  } else {
    image.src = data.url;
    image.alt = data.title;
    image.classList.remove("hidden");
  }
}

function showApod(data) {
  showMedia(data);
  fullResUrl = data.hdurl || data.url;
  fullResButton.classList.toggle("hidden", !fullResUrl);

  title.textContent = data.title;
  explanation.textContent = data.explanation;
  copyright.textContent = data.copyright
    ? `© ${data.copyright.replace(/\s+/g, " ").trim()}`
    : "No copyright information";
  dateLabel.textContent = `Astronomy Picture of the Day - ${formatDate(data.date)}`;
  dateDetail.innerHTML = `<i class="far fa-calendar mr-2"></i>${data.date}`;
  dateInfo.textContent = data.date;
  mediaType.textContent = data.media_type === "video" ? "Video" : "Image";
  dateInput.value = data.date;
  dateInputText.textContent = formatDate(data.date);
}

function showError(message) {
  title.textContent = "Could not load the image";
  explanation.textContent = message;
  copyright.textContent = "";
  fullResButton.classList.add("hidden");
}

async function loadApod(date) {
  const url = new URL(APOD_URL);
  url.searchParams.set("api_key", NASA_API_KEY);
  if (date) url.searchParams.set("date", date);

  removeFrame();
  setLoading(true, date ? `Loading image for ${formatDate(date)}...` : "Loading today's image...");

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`NASA API returned status ${response.status}.`);
    }
    showApod(await response.json());
    return true;
  } catch (error) {
    showError(error.message || "Please try again in a moment.");
    return false;
  } finally {
    loading.classList.add("hidden");
    image.classList.toggle("hidden", Boolean(container.querySelector("iframe")));
  }
}

function loadSelectedDate() {
  const date = dateInput.value;
  if (!date || date < MIN_DATE || (dateInput.max && date > dateInput.max)) {
    showError(`Please choose a date between ${formatDate(MIN_DATE)} and ${formatDate(dateInput.max)}.`);
    return;
  }
  loadApod(date);
}

export async function initApod() {
  dateInput.max = new Date().toISOString().slice(0, 10);

  loadButton.addEventListener("click", loadSelectedDate);
  todayButton.addEventListener("click", () => loadApod());
  fullResButton.addEventListener("click", () => {
    window.open(fullResUrl, "_blank", "noopener");
  });
  dateInput.addEventListener("change", () => {
    dateInputText.textContent = dateInput.value ? formatDate(dateInput.value) : "";
  });

  const loaded = await loadApod();
  if (loaded) dateInput.max = dateInput.value;
}
