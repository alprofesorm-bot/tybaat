document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    const grid = document.getElementById('grid');
    const searchInput = document.getElementById('search');
    const clearBtn = document.getElementById('clear');
    const cartCount = document.getElementById('cartCount');
    const drawerCount = document.getElementById('drawerCount');
    const openCartBtn = document.getElementById('openCart');
    const closeCartBtn = document.getElementById('closeCart');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const itemsContainer = document.getElementById('items');
    const totalEl = document.getElementById('total');
    const emptyState = document.getElementById('empty');
    const countEl = document.getElementById('count');
    const sortSelect = document.getElementById('sort');
    const catsContainer = document.getElementById('cats');
    const toast = document.getElementById('toast');
    const sendBtn = document.getElementById('send');

    let currentCategory = 'all';

    function renderProducts(productsToRender) {
        grid.innerHTML = '';
        countEl.textContent = `${productsToRender.length} منتج`;

        if (productsToRender.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            productsToRender.forEach((p) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="card-img-wrap">
                        <img src="${p.image}" alt="${p.name}">
                    </div>
                    <div class="card-body">
                        <span class="card-brand">${p.brand || 'طيبات'}</span>
                        <h3>${p.name}</h3>
                        <div class="card-footer">
                            <div class="card-price">${p.price} <small>ل.س</small></div>
                            <button class="add-btn" data-name="${p.name}">+</button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }
    }

    function filterAndSortProducts() {
        let result = [...window.PRODUCTS];

        const query = searchInput.value.toLowerCase().trim();
        if (query) {
            clearBtn.style.display = 'flex';
            result = result.filter(p => p.name.toLowerCase().includes(query) || (p.brand && p.brand.toLowerCase().includes(query)));
        } else {
            clearBtn.style.display = 'none';
        }

        if (currentCategory !== 'all') {
            result = result.filter(p => p.category === currentCategory);
        }

        const sortVal = sortSelect.value;
        if (sortVal === 'low') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortVal === 'high') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortVal === 'az') {
            result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        }

        renderProducts(result);
    }

    grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {
            const productName = e.target.getAttribute('data-name');
            const product = window.PRODUCTS.find(p => p.name === productName);

            if (product) {
                const existing = cart.find(item => item.name === product.name);
                if (existing) {
                    existing.qty++;
                } else {
                    cart.push({ ...product, qty: 1 });
                }
                updateCartUI();
                showToast(`تمت إضافة "${product.name}" إلى السلة`);
            }
        }
    });

    function updateCartUI() {
        let totalCount = 0;
        let totalPrice = 0;
        itemsContainer.innerHTML = '';

        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p style="text-align:center; color:#78716c; margin-top:30px;">سلة التسوق فارغة حالياً</p>';
        } else {
            cart.forEach((item, index) => {
                totalCount += item.qty;
                totalPrice += item.price * item.qty;

                const row = document.createElement('div');
                row.className = 'cart-item-row';
                row.innerHTML = `
                    <div>
                        <strong>${item.name}</strong><br>
                        <small style="color:#78716c;">${item.price} ل.س × ${item.qty}</small>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button onclick="changeQty(${index}, 1)" style="width:26px; height:26px; background:#f5f5f4; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">+</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty(${index}, -1)" style="width:26px; height:26px; background:#f5f5f4; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">-</button>
                    </div>
                `;
                itemsContainer.appendChild(row);
            });
        }

        cartCount.textContent = totalCount;
        drawerCount.textContent = totalCount;
        totalEl.textContent = `${totalPrice} ل.س`;
    }

    window.changeQty = function(index, delta) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        updateCartUI();
    };

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 2500);
    }

    openCartBtn.addEventListener('click', () => {
        drawer.classList.add('active');
        overlay.classList.add('active');
    });

    const closeDrawer = () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    };

    closeCartBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    searchInput.addEventListener('input', filterAndSortProducts);
    sortSelect.addEventListener('change', filterAndSortProducts);

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterAndSortProducts();
    });

    catsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('.cats button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-cat');
            filterAndSortProducts();
        }
    });

    sendBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('السلة فارغة!');
            return;
        }
        const name = document.getElementById('custName').value.trim();
        const address = document.getElementById('custAddress').value.trim();

        if (!name || !address) {
            alert('يرجى إدخال الاسم والعنوان بالتفصيل.');
            return;
        }

        let message = `مرحباً، أود طلب المنتجات التالية:\n\n👤 الاسم: ${name}\n📍 العنوان: ${address}\n\n`;
        let total = 0;
        cart.forEach(item => {
            message += `- ${item.name} (${item.qty}x) = ${item.price * item.qty} ل.س\n`;
            total += item.price * item.qty;
        });
        message += `\n💰 المجموع الكلي: ${total} ل.س`;

        const phone = "963958953282";
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    });

    renderProducts(window.PRODUCTS);
});