// script.js

// This data represents rows in your SQL "Products" table
const appliances = [
    {
        id: 1,
        name: "Smart Inverter Refrigerator",
        price: "$899",
        specs: "450L, Double Door",
        image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500"
    },
    {
        id: 2,
        name: "Front Load Washing Machine",
        price: "$550",
        specs: "8kg, 1400 RPM",
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500"
    },
    {
        id: 3,
        name: "Microwave Oven",
        price: "$120",
        specs: "20L, Grill + Solo",
        image: "https://images.unsplash.com/photo-1574765345711-2354a9d31f21?w=500"
    }
];

function displayProducts() {
    const grid = document.getElementById('productGrid');
    
    grid.innerHTML = appliances.map(product => `
        <div class="card">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.specs}</p>
            <p class="price">${product.price}</p>
            <button onclick="alert('Added ${product.name} to inquiry list')">Inquire Now</button>
        </div>
    `).join('');
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Initializing the display
window.onload = displayProducts;