// Smooth scroll for "ENTER THE GATE" button
document.querySelectorAll("[data-scroll]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const target = btn.getAttribute("data-scroll");
    const el = document.querySelector(target);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ============================================
// SHOP ACCESS GATE
// ============================================
const shopAccessBtn = document.getElementById("shop-access-btn");
const shopAccessInput = document.getElementById("shop-access-code");
const shopAccessResult = document.getElementById("shop-access-result");
const shopSection = document.getElementById("shop");

// Check if shop was previously unlocked
const shopUnlocked = localStorage.getItem("shopUnlocked") === "true";
if (shopUnlocked && shopSection) {
  shopSection.classList.remove("shop-locked");
  shopSection.classList.add("shop-unlocked");
  unlockKeyHolderProduct();
}

if (shopAccessBtn && shopAccessInput && shopAccessResult && shopSection) {
  shopAccessBtn.addEventListener("click", handleShopAccess);
  shopAccessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleShopAccess();
  });
}

function handleShopAccess() {
  const value = shopAccessInput.value.trim().toUpperCase();

  if (!value) {
    shopAccessResult.textContent = "CODE REQUIRED";
    shopAccessResult.style.color = "#9BA0A3";
    return;
  }

  if (value === "UNLOCKED") {
    shopAccessResult.textContent = "ACCESS GRANTED ✓";
    shopAccessResult.style.color = "#C3C7C9";
    
    // Unlock shop after brief delay
    setTimeout(() => {
      shopSection.classList.remove("shop-locked");
      shopSection.classList.add("shop-unlocked");
      localStorage.setItem("shopUnlocked", "true");
      unlockKeyHolderProduct();
    }, 800);
  } else {
    shopAccessResult.textContent = "ACCESS DENIED";
    shopAccessResult.style.color = "#9BA0A3";
    
    // Shake animation on wrong code
    shopAccessInput.style.animation = "shake 0.4s";
    setTimeout(() => {
      shopAccessInput.style.animation = "";
    }, 400);
  }
}

// Function to unlock the Key Holder exclusive product
function unlockKeyHolderProduct() {
  const keyHolderBtn = document.querySelector('[data-id="3"].add-to-cart-btn');
  if (keyHolderBtn) {
    keyHolderBtn.disabled = false;
    keyHolderBtn.classList.remove('locked');
    keyHolderBtn.textContent = 'ADD TO CART';
    
    // Add a special visual effect
    setTimeout(() => {
      keyHolderBtn.style.animation = 'pulse 0.5s ease';
      setTimeout(() => {
        keyHolderBtn.style.animation = '';
      }, 500);
    }, 400);
  }
}

// Global function to reset shop lock (for testing)
window.resetShopLock = function() {
  localStorage.removeItem("shopUnlocked");
  location.reload();
  console.log("🔒 Shop lock has been reset. Page reloading...");
};

// Reveal-on-scroll (IntersectionObserver)
const revealSections = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealSections.forEach((section) => observer.observe(section));
} else {
  // Fallback: show everything
  revealSections.forEach((s) => s.classList.add("visible"));
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
const mobileNavLinks = document.querySelectorAll(".mobile-nav a");

if (mobileMenuToggle && mobileMenuOverlay) {
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenuToggle.classList.toggle("active");
    mobileMenuOverlay.classList.toggle("active");
    document.body.style.overflow = mobileMenuOverlay.classList.contains("active") ? "hidden" : "";
  });

  // Close menu when clicking a link
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenuToggle.classList.remove("active");
      mobileMenuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    });
  });
}

// ============================================
// SHOPPING CART SYSTEM
// ============================================
let cart = JSON.parse(localStorage.getItem("stolenCart")) || [];

const cartBtn = document.querySelector(".cart-btn");
const cartSidebar = document.querySelector(".cart-sidebar");
const cartBackdrop = document.querySelector(".cart-backdrop");
const cartClose = document.querySelector(".cart-close");
const cartCount = document.querySelector(".cart-count");
const cartItemsContainer = document.querySelector(".cart-items");
const cartTotalAmount = document.querySelector(".cart-total-amount");
const checkoutBtn = document.querySelector(".checkout-btn");

// Open cart
if (cartBtn) {
  cartBtn.addEventListener("click", openCart);
}

// Close cart
if (cartClose) {
  cartClose.addEventListener("click", closeCart);
}

if (cartBackdrop) {
  cartBackdrop.addEventListener("click", closeCart);
}

function openCart() {
  cartSidebar?.classList.add("active");
  cartBackdrop?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartSidebar?.classList.remove("active");
  cartBackdrop?.classList.remove("active");
  document.body.style.overflow = "";
}

// Add to cart buttons
const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");

addToCartBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled || btn.classList.contains("locked")) return;

    const id = btn.getAttribute("data-id");
    const name = btn.getAttribute("data-name");
    const price = parseFloat(btn.getAttribute("data-price"));

    addToCart({ id, name, price });

    // Visual feedback
    btn.textContent = "ADDED ✓";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = "ADD TO CART";
      btn.classList.remove("added");
    }, 1500);
  });
});

function addToCart(item) {
  // Check if item already in cart
  const existingItem = cart.find((i) => i.id === item.id);

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }

  updateCart();
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCart();
  saveCart();
}

function updateCart() {
  // Update count badge
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
  }

  // Update cart items display
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="cart-empty">Your identity vault is empty.</p>';
    } else {
      cartItemsContainer.innerHTML = cart
        .map(
          (item) => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-icon">🔒</div>
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            <p class="cart-item-price">$${item.price} ${item.quantity > 1 ? `× ${item.quantity}` : ""}</p>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">Remove</button>
        </div>
      `
        )
        .join("");

      // Add remove button listeners
      document.querySelectorAll(".cart-item-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          removeFromCart(btn.getAttribute("data-id"));
        });
      });
    }
  }

  // Update total
  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  if (cartTotalAmount) {
    cartTotalAmount.textContent = `$${total}`;
  }
}

function saveCart() {
  localStorage.setItem("stolenCart", JSON.stringify(cart));
}

// Checkout button
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Add some pieces to your identity vault first.");
      return;
    }

    // Simple checkout simulation
    const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    alert(
      `🔒 ACCESS VERIFICATION REQUIRED\n\nTotal: $${total}\n\nThis is a demo. In production, this would redirect to a secure checkout page with payment processing (Stripe, PayPal, etc.)`
    );
  });
}

// Initialize cart on page load
updateCart();
