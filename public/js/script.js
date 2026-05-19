// URL API REST
const apiUrl = 'data/api.json';
const itemsPerPage = 10;
let currentPage = 1;
let allData = [];
let cart = [];

// Crear tarjetas
function createCard(data) {
    return `
        <div class="card">
            <img src="${data.image}" alt="${data.title}">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
            <span class="price">$${data.price}</span>
            <span class="rating">${'⭐'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}</span>
            <p><button class="add-to-cart" data-id="${data.id}">Add to cart</button></p>
        </div>
    `;
}

// Mostrar tarjetas
function displayCards(filteredData) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const cardsToShow = filteredData.slice(startIndex, endIndex);
    const cardContainer = document.querySelector('#card-container');
    cardContainer.style.transform = 'translateX(100%)';
    setTimeout(() => {
        cardContainer.innerHTML = cardsToShow.map(createCard).join('');
        cardContainer.style.transform = 'translateX(0)';
    }, 100);
    // Botones de paginación
    document.querySelector('#prevButton').disabled = currentPage === 1;
    document.querySelector('#nextButton').disabled = endIndex >= filteredData.length;
}

// Obtener datos de la API y mostrar las tarjetas
async function fetchAndDisplayCards() {
    try {
        const response = await fetch(apiUrl);
        allData = await response.json();
        displayCards(allData);
        loadCart();  // Cargar carrito solo después de que los datos de la API estén listos
    } catch (error) {
        console.error('Error al obtener los datos de la API:', error);
    }
}

// Filtrar tarjetas en la búsqueda
function filterCards(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredData = allData.filter(data =>
        data.title.toLowerCase().includes(searchTerm) ||
        data.description.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // Restablecer a la página 1
    displayCards(filteredData);
}

// Paginación
function handlePagination(event) {
    if (event.target.closest('#prevButton')) {
        if (currentPage > 1) {
            currentPage--;
            displayCards(allData);
        }
    } else if (event.target.closest('#nextButton')) {
        if ((currentPage * itemsPerPage) < allData.length) {
            currentPage++;
            displayCards(allData);
        }
    }
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cargar carrito desde localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartModal();
    }
}

// Añadir productos al carrito
function addToCart(productId) {
    const product = allData.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartModal();
        saveCart();  // Guardar el carrito en localStorage
    }
}

// Eliminar productos del carrito
function removeFromCart(productId) {
    cart = cart.filter(p => p.id !== productId);
    updateCartModal();
    saveCart();  // Guardar el carrito en localStorage
}

// Actualizar el modal del carrito
function updateCartModal() {
    const cartItemsContainer = document.querySelector('#cartItems');
    const cartTotalElement = document.querySelector('#cartTotal');
    const cartCountElement = document.querySelector('#cartCount');

    const itemCounts = cart.reduce((counts, item) => {
        counts[item.id] = (counts[item.id] || 0) + 1;
        return counts;
    }, {});
    const uniqueCartItems = Object.keys(itemCounts).map(id => {
        const item = allData.find(item => item.id === parseInt(id));
        return {
            ...item,
            quantity: itemCounts[id]
        };
    });
    cartItemsContainer.innerHTML = uniqueCartItems.map(item => `
                <div class="cart-item">
                    <span>${item.title}</span> - <span>$${item.price} x ${item.quantity}</span>
                    <button onclick="removeFromCart(${item.id})">Delete</button>
                </div>
            `).join('');

    const total = uniqueCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    // Actualizar el contador de productos
    const totalItems = cart.reduce((count, item) => count + 1, 0);
    cartCountElement.textContent = totalItems;
    // Mostrar u ocultar el contador de productos
    cartCountElement.style.display = totalItems > 0 ? 'block' : 'none';
}

// Abrir el modal del carrito
function openCartModal() {
    document.querySelector('#cartModal').style.display = 'flex';
}

// Cerrar el modal del carrito
function closeCartModal() {
    document.querySelector('#cartModal').style.display = 'none';
}

// Cargar tarjetas y carrito al cargar la página
window.onload = function () {
    fetchAndDisplayCards();
};

// Buscar en el input
document.querySelector('#searchInput').addEventListener('input', filterCards);

// Eventos de los botones de paginación
document.querySelector('#prevButton').addEventListener('click', handlePagination);
document.querySelector('#nextButton').addEventListener('click', handlePagination);

// Eventos de los botones de añadir al carrito
document.querySelector('#card-container').addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart')) {
        const productId = parseInt(event.target.getAttribute('data-id'));
        addToCart(productId);
    }
});

document.querySelector('#cartButton').addEventListener('click', openCartModal);
document.querySelector('#closeModal').addEventListener('click', closeCartModal);