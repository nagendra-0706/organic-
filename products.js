// Product categories and items
const products = {
    vegetables: [
        { id: 'v1', name: 'Fresh Spinach', price: 48, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop', unit: 'bunch' },
        { id: 'v2', name: 'Organic Tomatoes', price: 70, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'v3', name: 'Carrots', price: 65, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'v4', name: 'Bell Peppers', price: 87, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&h=200&fit=crop', unit: 'each' }
    ],
    fruits: [
        { id: 'f1', name: 'Organic Apples', price: 84, image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'f2', name: 'Bananas', price: 65, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'f3', name: 'Oranges', price: 90, image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'f4', name: 'Fresh Berries', price: 97, image: 'https://images.unsplash.com/photo-1563746098251-d35aef196e83?w=200&h=200&fit=crop', unit: 'box' }
    ],
    nuts: [
        { id: 'n1', name: 'Almonds', price: 746, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'n2', name: 'Walnuts', price: 829, image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'n3', name: 'Cashews', price: 912, image: 'https://images.unsplash.com/photo-1590544673792-15a81df14e76?w=200&h=200&fit=crop', unit: 'lb' },
        { id: 'n4', name: 'Mixed Nuts', price: 995, image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=200&h=200&fit=crop', unit: 'lb' }
    ],
    groceries: [
        { id: 'g1', name: 'Rice', price: 1000, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop', unit: 'bag' },
        { id: 'g3', name: 'Chia Seeds', price: 97, image: 'https://images.unsplash.com/photo-1514537099923-4c0fc7c73161?w=200&h=200&fit=crop', unit: 'bag' },
    ]
};

// Shopping cart functionality
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        this.saveCart();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItem(productId);
            }
        }
        this.saveCart();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    clear() {
        this.items = [];
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    getItems() {
        return this.items;
    }
}

// Export for use in other files
window.products = products;
window.ShoppingCart = ShoppingCart;