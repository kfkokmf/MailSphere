function DeleteItem() {
  const dynamicContent = document.getElementById('dynamic-content');

  if (document.getElementById('content-delete')) {
    dynamicContent.innerHTML = '';
  } else {
    dynamicContent.innerHTML = `
      <div class="content-delete" id="content-delete">
        <h1>Delete Brand</h1>
        <div id="brand-list" class="brand-list">
          <!-- Lista de Brands será renderizada aqui -->
        </div>
      </div>
    `;

    fetch('http://127.0.0.1:3000/api/brands')
      .then(response => response.json())
      .then(brands => {
        const brandList = document.getElementById('brand-list');
        brands.forEach(brand => {
          const brandItem = document.createElement('div');
          brandItem.classList.add('brand-item');
          brandItem.innerHTML = `
            <span>${brand.name}</span>
            <button onclick="confirmDeleteBrand('${brand.id}', '${brand.name}')">Remove</button>
          `;
          brandList.appendChild(brandItem);
        });
      })
      .catch(error => {
        console.error('Error fetching brands:', error);
      });
  }
}

function confirmDeleteBrand(brandId, brandName) {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerHTML = `
    <div class="popup-content">
      <h2>Confirm Deletion</h2>
      <p>Are you sure you want to delete the brand "${brandName}" and all its associated emails?</p>
      <div class="popup-buttons">
        <button class="cancel-button" onclick="closePopup()">Cancel</button>
        <button class="confirm-button" id="confirmDeleteButton" disabled>Continue (5)</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);

  const confirmButton = document.getElementById('confirmDeleteButton');
  let deleteTimer;
  let timeLeft = 5;

  function startTimer() {
    clearTimeout(deleteTimer);
    timeLeft = 5;
    confirmButton.disabled = true;
    confirmButton.innerText = `Continue (${timeLeft})`;

    deleteTimer = setInterval(() => {
      timeLeft--;
      confirmButton.innerText = `Continue (${timeLeft})`;

      if (timeLeft === 0) {
        clearInterval(deleteTimer);
        confirmButton.disabled = false;
        confirmButton.style.backgroundColor = '#4CAF50';
        confirmButton.innerText = 'Continue';
      }
    }, 1000);
  }

  startTimer();

  confirmButton.onclick = () => {
    clearInterval(deleteTimer);
    deleteBrandAndEmails(brandId);
    closePopup();
  };
}

function closePopup() {
  const popup = document.querySelector('.popup');
  if (popup) {
    popup.remove();
  }
}

function deleteBrand(brandId) {
  fetch(`http://127.0.0.1:3000/api/brands/${brandId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete brand.');
      }
      return response.json();
    })
    .then(() => {
      alert('Brand deleted successfully!');
      DeleteItem();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to delete brand.');
    });
}

function deleteBrandAndEmails(brandId) {
  fetch(`http://127.0.0.1:3000/api/emails?brand=${brandId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete associated emails.');
      }
      return response.json();
    })
    .then(() => {
      deleteBrand(brandId);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to delete associated emails.');
    });
}
