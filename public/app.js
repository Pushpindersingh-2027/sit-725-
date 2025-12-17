document.getElementById("loadBtn").addEventListener("click", loadPlants);

async function loadPlants() {
  const container = document.getElementById("plantsContainer");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch("/api/plants");
    const data = await res.json();

    container.innerHTML = "";

    data.plants.forEach((p) => {
      container.innerHTML += `
        <div class="col s12 m6 l4">
          <div class="card hoverable">
            <div class="card-image">
              <img src="${p.image}" alt="${p.name}">
              <span class="card-title">${p.name}</span>
            </div>
            <div class="card-content">
              <p><b>Type:</b> ${p.type}</p>
              <p><b>Care:</b> ${p.care}</p>
              <p>${p.description}</p>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    container.innerHTML = `<p class="red-text">Failed to load plants.</p>`;
    console.error(err);
  }
}
