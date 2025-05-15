function ViewItem() {
    attachEventListeners();
    buildHTML();
}

async function buildHTML() {
    await fetchBrands();
}

function attachEventListeners() {
    document
      .getElementById("toggle-filters")
      .addEventListener("click", function () {
        const contentRight = document.getElementById("content-right");
        const filters_h1 = document.getElementById("filters-h1");
        const filters = document.getElementById("filters");

        if (contentRight.style.height === "30px") {
          contentRight.style.width = "300px";
          contentRight.style.height = "auto";
          filters_h1.style.display = "block";
          filters.style.display = "block";
          this.textContent = "−";
        } else {
          contentRight.style.width = "auto";
          contentRight.style.height = "30px";
          filters_h1.style.display = "none";
          filters.style.display = "none";
          this.textContent = "+";
        }
    });
  
    // Listener for view buton
    document
      .getElementById("toggle-brands")
      .addEventListener("click", function () {
        const brandList = document.getElementById("brand-list");
        if (brandList.style.display === "none") {
          brandList.style.display = "block";
          this.textContent = "−";
        } else {
          brandList.style.display = "none";
          this.textContent = "+";
        }
    });
}

async function fetchBrands() {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/brands");
      const brands = await res.json();
  
      const brandList = document.getElementById("brand-list");
      brands.forEach((brand) => {
        const brandItem = `
      <div class="filter-item">
        <input type="checkbox" id="${brand.id}" name="brand" value="${brand.name}" />
        <label for="${brand.id}">${brand.name}</label>
      </div>`;
        brandList.innerHTML += brandItem;
      });
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
}

ViewItem();