function AddItem() {
  const dynamicContent = document.getElementById('dynamic-content');

  if (document.getElementById('content-add')) {
    dynamicContent.innerHTML = '';
  } else {
    renderInitialForm(dynamicContent);
  }
}

function renderInitialForm(container) {
  container.innerHTML = `
    <div class="content-add" id="content-add">
      <h1>Add Item</h1>
      <form id="step-1-form">
        <label for="item-type">Select Type:</label>
        <select id="item-type" name="item-type" required>
          <option value="" disabled selected>Select an option</option>
          <option value="email">Email</option>
          <option value="brand">Brand</option>
        </select>
        <button type="button" onclick="nextStep()">Next</button>
      </form>
    </div>
  `;
}

function nextStep() {
  const itemType = document.getElementById('item-type').value;
  const dynamicContent = document.getElementById('dynamic-content');

  if (!itemType) {
    alert('Please select an item type.');
    return;
  }

  if (itemType === 'email') {
    renderEmailTypeForm(dynamicContent);
  } else if (itemType === 'brand') {
    renderBrandForm(dynamicContent);
  }
}

function renderEmailTypeForm(container) {
  container.innerHTML = `
    <div class="content-add" id="content-add">
      <h1>Select Email Type</h1>
      <form id="step-2-form">
        <label for="email-type">Select Email Type:</label>
        <select id="email-type" name="email-type" required>
          <option value="" disabled selected>Select an option</option>
          <option value="campaign">Campaign</option>
          <option value="flow">Flow</option>
        </select>
        <button type="button" onclick="showEmailForm()">Next</button>
      </form>
    </div>
  `;
}

function renderBrandForm(container) {
  container.innerHTML = `
    <div class="content-add" id="content-add">
      <h1>Add Brand</h1>
      <form id="brand-form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required />
        <label for="niche">Niche:</label>
        <input type="text" id="niche" name="niche" />
        <label for="website">Website:</label>
        <input type="url" id="website" name="website" required />
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" />
        <button type="submit">Submit</button>
      </form>
    </div>
  `;

  document.getElementById('brand-form').addEventListener('submit', function (event) {
    event.preventDefault();
    submitForm(this, 'http://127.0.0.1:3000/api/brands');
  });
}

function showEmailForm() {
  const emailType = document.getElementById('email-type').value;
  const dynamicContent = document.getElementById('dynamic-content');

  if (!emailType) {
    alert('Please select an email type.');
    return;
  }

  fetch('http://127.0.0.1:3000/api/emails')
    .then(response => response.json())
    .then(emails => {
      const uniqueValues = new Set(emails.map(email => email[emailType]).filter(Boolean));
      renderEmailForm(dynamicContent, emailType, uniqueValues);
    })
    .catch(error => {
      console.error('Error fetching emails:', error);
    });
}

function renderEmailForm(container, emailType, uniqueValues) {
  const radioButtons = Array.from(uniqueValues).map(value => `
    <div class="radio-container">
      <input type="radio" id="${value}" name="${emailType}" value="${value}" />
      <label for="${value}">${value}</label>
    </div>
  `).join('');

  fetch('http://127.0.0.1:3000/api/brands')
    .then(response => response.json())
    .then(brands => {
      const brandOptions = brands.map(brand => `
        <div class="radio-container">
          <input type="radio" id="${brand.id}" name="brand" value="${brand.id}" />
          <label for="${brand.id}">${brand.name}</label>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="content-add" id="content-add">
          <h1>Add Email</h1>
          <form id="email-form">
            <label for="subject">Subject:</label>
            <input type="text" id="subject" name="subject" required />
            <label for="body">Body:</label>
            <textarea id="body" name="body" required></textarea>
            <label for="date">Date:</label>
            <input type="datetime-local" id="date" name="date" required />
            <label for="brand">Brand:</label>
            <div id="brand-fields">
              ${brandOptions}
            </div>
            <label for="${emailType}">${emailType.charAt(0).toUpperCase() + emailType.slice(1)}:</label>
            <div id="${emailType}-fields">
              <div class="radio-container">
                <input type="radio" id="other" name="${emailType}" value="other" />
                <label for="other">Other:</label>
                <input type="text" id="other-${emailType}" name="other-${emailType}" placeholder="Type here if you selected 'Other'" />
              </div>
              ${radioButtons}
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      `;

      document.getElementById('email-form').addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(this, 'http://127.0.0.1:3000/api/emails');
      });
    })
    .catch(error => {
      console.error('Error fetching brands:', error);
    });
}

function submitForm(form, apiEndpoint) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  console.log('Form data:', data);

  fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    console.log('Response status:', response.status);
    return response.json().then(data => ({ status: response.status, body: data }));
  })
  .then(result => {
    console.log('Response body:', result.body);
    if (result.status === 200) {
      alert('Item added successfully!');
      form.reset();
    } else {
      alert('Failed to add item. Status: ' + result.status);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to add item.');
  });
}

AddItem();