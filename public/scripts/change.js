function ChangeItem() {
  const dynamicContent = document.getElementById('dynamic-content');

  if (document.getElementById('content-change')) {
    dynamicContent.innerHTML = ''; // Remove o conteúdo se já existir
  } else {
    dynamicContent.innerHTML = `
      <div class="content-change" id="content-change">
        <h1>Change Item</h1>
        <!-- Adicione aqui o formulário ou conteúdo adicional -->
      </div>
    `;
  }
}
