// ============================================
// SHARED VARIABLES
// ============================================
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// ============================================
// LOGO COMBINATION LOCK ANIMATION
// ============================================
const logoDials = document.querySelectorAll('.logo-dial');

// Initialize with random characters
logoDials.forEach(dial => {
  dial.textContent = chars[Math.floor(Math.random() * chars.length)];
});

function spinLogoToTarget() {
  const totalDuration = 2500;  // total time until final letter
  const stagger = 180;         // delay between each dial stopping

  logoDials.forEach((dial, index) => {
    const target = dial.getAttribute('data-target');
    let elapsed = 0;
    const startTime = performance.now();

    const interval = setInterval(() => {
      // keep rolling with random characters
      dial.textContent = chars[Math.floor(Math.random() * chars.length)];
    }, 50);  // how fast each dial "rolls"

    // when to stop this dial
    const stopTime = totalDuration + index * stagger;

    function checkStop(time) {
      elapsed = time - startTime;
      if (elapsed >= stopTime) {
        clearInterval(interval);
        dial.textContent = target; // lock in final letter
      } else {
        requestAnimationFrame(checkStop);
      }
    }

    requestAnimationFrame(checkStop);
  });
}

// Auto-spin after intro animation
window.addEventListener('load', () => {
  setTimeout(spinLogoToTarget, 2000); // Wait for intro to finish
});

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
// SHOP ACCESS GATE WITH COMBINATION LOCK
// ============================================
const shopAccessBtn = document.getElementById("shop-access-btn");
const shopAccessInput = document.getElementById("shop-access-code");
const shopAccessResult = document.getElementById("shop-access-result");
const shopSection = document.getElementById("shop");
const gateForm = document.getElementById("gate-form");
const shopDials = document.querySelectorAll(".dial");
const gateCard = document.querySelector(".gate-card");
const brandLock = document.querySelector(".brand-lock");
const FIRST_VISIT_KEY = "st0ln_lock_seen";

// Check if shop was previously unlocked
const shopUnlocked = localStorage.getItem("shopUnlocked") === "true";
if (shopUnlocked && shopSection) {
  shopSection.classList.remove("shop-locked");
  shopSection.classList.add("shop-unlocked");
  unlockKeyHolderProduct();
}

// Initialize shop lock dials
const target = "ST0LN";

// Drop-in animation for the lock
if (brandLock) {
  setTimeout(() => {
    brandLock.classList.add("lock-enter");
  }, 80);
}

// Fill dials with random chars
function randomizeShopDials() {
  shopDials.forEach((dial) => {
    dial.textContent = chars[Math.floor(Math.random() * chars.length)];
  });
}

function spinShopDials() {
  const totalDuration = 1400;
  const stagger = 160;

  shopDials.forEach((dial, index) => {
    const start = performance.now();
    const stopAt = totalDuration + index * stagger;

    const spinner = setInterval(() => {
      dial.textContent = chars[Math.floor(Math.random() * chars.length)];
    }, 45);

    function check(time) {
      const elapsed = time - start;
      if (elapsed >= stopAt) {
        clearInterval(spinner);
        dial.textContent = target[index];
      } else {
        requestAnimationFrame(check);
      }
    }

    requestAnimationFrame(check);
  });
}

// FIRST VISIT ONLY: auto rolling animation
const hasSeenLock = localStorage.getItem(FIRST_VISIT_KEY) === "1";

if (!hasSeenLock && !shopUnlocked) {
  randomizeShopDials();
  setTimeout(() => {
    spinShopDials();
  }, 2500);
  localStorage.setItem(FIRST_VISIT_KEY, "1");
} else {
  // Just set the final word, no auto-roll
  shopDials.forEach((dial, index) => {
    dial.textContent = target[index];
  });
}

// Handle form submission
if (gateForm && shopAccessInput && shopAccessResult && shopSection) {
  gateForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleShopAccess();
  });
}

function handleShopAccess() {
  const value = shopAccessInput.value.trim().toUpperCase();
  shopAccessInput.value = "";

  if (!value) {
    shopAccessResult.textContent = "CODE REQUIRED";
    shopAccessResult.className = "gate-message error";
    return;
  }

  if (value === "UNLOCKED") {
    // Nice spin as a reward
    spinShopDials();
    shopAccessResult.textContent = "ACCESS GRANTED";
    shopAccessResult.className = "gate-message success";
    
    // Unlock shop after brief delay
    setTimeout(() => {
      shopSection.classList.remove("shop-locked");
      shopSection.classList.add("shop-unlocked");
      localStorage.setItem("shopUnlocked", "true");
      unlockKeyHolderProduct();
    }, 1800);
  } else {
    // Wrong code: show "WRONG" on dials, then shake
    const wrongText = "WRONG";
    shopDials.forEach((dial, index) => {
      dial.textContent = wrongText[index];
    });
    
    shopAccessResult.textContent = "INVALID CODE";
    shopAccessResult.className = "gate-message error";
    
    // Shake the whole card
    if (gateCard) {
      gateCard.classList.add("shake");
      setTimeout(() => {
        gateCard.classList.remove("shake");
      }, 400);
    }
    
    // Keep "WRONG" visible for 3 seconds, then spin back to ST0LN
    setTimeout(() => {
      randomizeShopDials();
      spinShopDials();
    }, 3000);
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
