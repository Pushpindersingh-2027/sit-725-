document.getElementById("loadBtn").addEventListener("click", loadPlants);
document.getElementById("addPlantBtn").addEventListener("click", addPlant);

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
              <p>${p.description || ""}</p>
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

async function addPlant(e) {
  e.preventDefault();

  const plant = {
    name: document.getElementById("plantName").value,
    type: document.getElementById("plantType").value,
    care: document.getElementById("plantCare").value,
    image: document.getElementById("plantImage").value,
    description: document.getElementById("plantDescription").value
  };

  try {
    const res = await fetch("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plant)
    });

    if (!res.ok) {
      const err = await res.json();
      M.toast({ html: err.error || "Failed to add plant" });
      return;
    }

    M.toast({ html: "✅ Plant added!" });

    // Clear form
    document.getElementById("plantName").value = "";
    document.getElementById("plantType").value = "";
    document.getElementById("plantCare").value = "";
    document.getElementById("plantImage").value = "";
    document.getElementById("plantDescription").value = "";
    M.updateTextFields();

    // Refresh list automatically
    loadPlants();
  } catch (err) {
    console.error(err);
    M.toast({ html: "❌ Error adding plant" });
  }
}
