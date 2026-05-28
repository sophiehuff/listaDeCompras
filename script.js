// Função para obter ícone SVG baseado na categoria
function getCategoryIcon(category) {
  const icons = {
    Alimentos: `<svg class="category-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
      <path d="M 50 25 Q 40 20 35 30" stroke="#880e4f" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>`,
    Limpeza: `<svg class="category-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 70 L 35 30 L 65 30 L 70 70 Q 70 75 65 75 L 35 75 Q 30 75 30 70 Z" stroke="#880e4f" stroke-width="2" fill="none" opacity="0.6"/>
      <line x1="40" y1="30" x2="40" y2="20" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
      <line x1="60" y1="30" x2="60" y2="20" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
    </svg>`,
    Higiene: `<svg class="category-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="30" fill="none" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
      <circle cx="40" cy="40" r="6" fill="none" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
      <circle cx="60" cy="40" r="6" fill="none" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
      <path d="M 40 60 Q 50 65 60 60" stroke="#880e4f" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>`,
    Roupas: `<svg class="category-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 35 25 L 30 45 L 35 75 L 65 75 L 70 45 L 65 25 Z" stroke="#880e4f" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M 35 25 L 25 40" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
      <path d="M 65 25 L 75 40" stroke="#880e4f" stroke-width="2" opacity="0.6"/>
    </svg>`,
    Outros: `<svg class="category-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="50" height="50" stroke="#880e4f" stroke-width="2" fill="none" rx="5" opacity="0.6"/>
      <circle cx="50" cy="50" r="8" stroke="#880e4f" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>`,
  };
  return icons[category] || icons["Outros"];
}

// Elementos do DOM
const itemInput = document.getElementById("itemInput");
const categorySelect = document.getElementById("categorySelect");
const addBtn = document.getElementById("addBtn");
const shoppingList = document.getElementById("shoppingList");
const filterBtns = document.querySelectorAll(".filter-btn");
const totalItemsSpan = document.getElementById("totalItems");
const completedItemsSpan = document.getElementById("completedItems");

// Array para armazenar os itens
let items = [];
let currentFilter = "todos";

// Carrega itens do localStorage ao iniciar
function loadItems() {
  const savedItems = localStorage.getItem("shoppingItems");
  if (savedItems) {
    items = JSON.parse(savedItems);
    renderList();
    updateStats();
  }
}

// Salva itens no localStorage
function saveItems() {
  localStorage.setItem("shoppingItems", JSON.stringify(items));
}

// Adiciona um novo item à lista
function addItem() {
  const itemText = itemInput.value.trim();
  const category = categorySelect.value;

  if (itemText === "") {
    alert("Por favor, digite um item válido!");
    itemInput.focus();
    return;
  }

  const newItem = {
    id: Date.now(),
    text: itemText,
    category: category,
    completed: false,
    createdAt: new Date().toLocaleString(),
  };

  items.push(newItem);
  saveItems();
  renderList();
  updateStats();

  // Efeito visual de sucesso no botão
  addBtn.style.animation = "none";
  setTimeout(() => {
    addBtn.style.animation = "pulse 0.6s ease-out";
  }, 10);

  // Limpa o campo de entrada
  itemInput.value = "";
  itemInput.focus();
}

// Remove um item da lista
function deleteItem(id) {
  // Encontra e anima a remoção do elemento
  const checkbox = document.querySelector(`input[onchange*="${id}"]`);
  if (checkbox) {
    const li = checkbox.closest("li");
    if (li) {
      li.style.animation = "none";
      li.style.opacity = "0";
      li.style.transform = "translateX(-100%)";
      li.style.transition = "all 0.4s ease-out";

      setTimeout(() => {
        items = items.filter((item) => item.id !== id);
        saveItems();
        renderList();
        updateStats();
      }, 400);
      return;
    }
  }

  items = items.filter((item) => item.id !== id);
  saveItems();
  renderList();
  updateStats();
}

// Marca um item como comprado/não comprado
function toggleCompleted(id) {
  const item = items.find((item) => item.id === id);
  if (item) {
    item.completed = !item.completed;
    saveItems();

    // Efeito visual no item
    const liElement = document.querySelector(
      `li:has(input[onchange*="${id}"])`,
    );
    if (liElement) {
      liElement.style.animation = "none";
      setTimeout(() => {
        liElement.style.animation = "pulse 0.5s ease-out";
      }, 10);
    }

    renderList();
    updateStats();
  }
}

// Renderiza a lista de compras
function renderList() {
  shoppingList.innerHTML = "";

  if (items.length === 0) {
    shoppingList.innerHTML =
      '<div class="empty-message">Sua lista está vazia. Adicione itens para começar! 🛍️</div>';
    return;
  }

  const filteredItems = items.filter((item) => {
    if (currentFilter === "todos") return true;
    if (currentFilter === "pendentes") return !item.completed;
    if (currentFilter === "comprados") return item.completed;
  });

  if (filteredItems.length === 0) {
    shoppingList.innerHTML =
      '<div class="empty-message">Nenhum item encontrado nesta categoria! ✨</div>';
    return;
  }

  filteredItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = item.completed ? "completed" : "";
    li.style.animationDelay = `${index * 0.1}s`;
    li.innerHTML = `
            <input 
                type="checkbox" 
                class="item-checkbox" 
                ${item.completed ? "checked" : ""}
                onchange="toggleCompleted(${item.id})"
            >
            <div class="item-icon">
              ${getCategoryIcon(item.category)}
            </div>
            <div class="item-content">
                <div class="item-text">${escapeHtml(item.text)}</div>
                <span class="item-category">${item.category}</span>
            </div>
            <button class="btn-delete" onclick="deleteItem(${item.id})">Remover</button>
        `;
    shoppingList.appendChild(li);
  });
}

// Atualiza as estatísticas
function updateStats() {
  const total = items.length;
  const completed = items.filter((item) => item.completed).length;

  totalItemsSpan.textContent = total;
  completedItemsSpan.textContent = completed;
}

// Escapa caracteres especiais para segurança
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Event Listeners

// Adiciona item ao clicar no botão
addBtn.addEventListener("click", addItem);

// Adiciona item ao pressionar Enter
itemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addItem();
  }
});

// Filtros de categoria
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove a classe active de todos os botões
    filterBtns.forEach((b) => b.classList.remove("active"));
    // Adiciona a classe active ao botão clicado
    btn.classList.add("active");
    // Atualiza o filtro atual
    currentFilter = btn.dataset.filter;
    // Re-renderiza a lista
    renderList();
  });
});

// Carrega os itens ao carregar a página
window.addEventListener("load", loadItems);

// Focus no campo de entrada ao carregar
window.addEventListener("load", () => {
  itemInput.focus();
});
