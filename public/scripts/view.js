function ViewItem() {
    buildHTML();
}

async function buildHTML() {
    await fetchEmails();
    document.querySelector(".loading").style.display = "none";
}

async function fetchEmails() {
    const emailList = document.getElementById("email-list");  // Garantindo que a variável é definida no início
    try {
        const response = await fetch("http://127.0.0.1:3000/api/emails/latest-by-brand");
        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.statusText);  // Lançando um erro se a resposta não for ok
        }
        const latestEmails = await response.json();
        emailList.innerHTML = '';  // Limpar a lista existente antes de adicionar novos itens

        latestEmails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.className = 'email-item';
            emailItem.innerHTML = `
                <div class="brand-container">
                    <h2 class="brand-header">${email.brand}</h2>
                    <button class="email-button">Action</button>
                </div>
                <div class="email-body">${email.body}</div>
            `;
            emailList.appendChild(emailItem);
        });
    } catch (error) {
        console.error("Error fetching latest emails:", error);
        emailList.innerHTML = '<p>Error loading emails. Please try again later.</p>';  // Exibindo uma mensagem de erro no DOM
    }
}

ViewItem();
