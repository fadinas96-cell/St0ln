// ============================================
// SHARED VARIABLES
// ============================================
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// ============================================
// LOGO COMBINATION LOCK ANIMATION
// ============================================
const logoDials = document.querySelectorAll('.logo-dial');

// Logo variations that cycle through
const logoVariations = ['STOLN', '5T0LN', '57OLN', 'ST0LN'];
const textVariations = ['ST0LEN', 'ST0L3N', 'ST0LEN', 'STOLEN'];
let currentVariationIndex = 0;

// Initialize with random characters
logoDials.forEach(dial => {
  dial.textContent = chars[Math.floor(Math.random() * chars.length)];
});

function spinLogoToTarget(targetWord = 'ST0LN') {
  const totalDuration = 1500;  // total time until final letter
  const stagger = 180;         // delay between each dial stopping

  logoDials.forEach((dial, index) => {
    const targetChar = targetWord[index];
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
        dial.textContent = targetChar; // lock in final letter
      } else {
        requestAnimationFrame(checkStop);
      }
    }

    requestAnimationFrame(checkStop);
  });
}

// Cycle logo variations on click
function cycleLogoVariation() {
  currentVariationIndex = (currentVariationIndex + 1) % logoVariations.length;
  const nextVariation = logoVariations[currentVariationIndex];
  const nextTextVariation = textVariations[currentVariationIndex];
  
  spinLogoToTarget(nextVariation);
  updateLogoText(nextTextVariation);
}

// Update the STOLEN text
function updateLogoText(newText) {
  const logoText = document.querySelector('.logo-text');
  if (logoText) {
    logoText.textContent = newText;
  }
}

// Auto-cycle logo every 10 seconds
setInterval(cycleLogoVariation, 10000);

// Add click listener to logo for manual cycling
const logo = document.querySelector('.logo');
if (logo) {
  logo.addEventListener('click', cycleLogoVariation);
  logo.style.cursor = 'pointer'; // Show it's clickable
}

// Function to spin gate card dials
function spinGateDials() {
  const gateDials = document.querySelectorAll('.brand-lock .dial');
  if (!gateDials.length) return;

  const targetChars = ['S', 'T', '0', 'L', 'N'];
  const spinDuration = 600;
  const stagger = 80;

  gateDials.forEach((dial, index) => {
    // Add spinning animation
    dial.classList.add('spinning');
    
    let elapsed = 0;
    const startTime = performance.now();

    const interval = setInterval(() => {
      dial.textContent = chars[Math.floor(Math.random() * chars.length)];
    }, 50);

    const stopTime = spinDuration + index * stagger;

    function checkStop(time) {
      elapsed = time - startTime;
      if (elapsed >= stopTime) {
        clearInterval(interval);
        dial.textContent = targetChars[index];
        dial.classList.remove('spinning');
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

function spinShopDials(callback) {
  const totalDuration = 1400;
  const stagger = 160;
  let completedCount = 0;

  shopDials.forEach((dial, index) => {
    // Add spinning animation class
    dial.classList.add('spinning');
    
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
        dial.classList.remove('spinning');
        completedCount++;
        
        // Call callback when all dials have finished spinning
        if (callback && completedCount === shopDials.length) {
          callback();
        }
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
    
    // Trigger success lasers immediately
    triggerSuccessLasers();
    
    // Unlock shop after brief delay
    setTimeout(() => {
      shopSection.classList.remove("shop-locked");
      shopSection.classList.add("shop-unlocked");
      localStorage.setItem("shopUnlocked", "true");
      
      // Trigger celebration animation
      celebrateUnlock();
      
      unlockKeyHolderProduct();
    }, 1800);
  } else {
    // Wrong code: spin dials first, then show "WRONG"
    spinShopDials(() => {
      // After spinning, display "WRONG"
      const wrongText = "WRONG";
      shopDials.forEach((dial, index) => {
        dial.textContent = wrongText[index];
      });
    });
    
    shopAccessResult.textContent = "INVALID ACCESS - KEY REJECTED";
    shopAccessResult.className = "gate-message error";
    
    // Shake the whole card
    if (gateCard) {
      gateCard.classList.add("shake");
      setTimeout(() => {
        gateCard.classList.remove("shake");
      }, 400);
    }
    
    // Trigger red laser security effect
    triggerLaserEffect();
    
    // Keep "WRONG" visible for 3 seconds, then spin back to ST0LN
    setTimeout(() => {
      randomizeShopDials();
      spinShopDials();
    }, 3000);
  }
}

// Success laser effect - solid green lasers that linger
function triggerSuccessLasers() {
  const laserCount = 4; // Fewer lasers - only horizontal
  const goldenRatio = 1.618033988749895;
  
  for (let i = 0; i < laserCount; i++) {
    const laser = document.createElement("div");
    laser.className = "success-laser";
    
    // Use golden ratio to distribute positions
    const goldenAngle = (i * 360 / (goldenRatio * goldenRatio)) % 360;
    const normalizedPos = (goldenAngle / 360) * 100;
    
    // Only horizontal lasers - alternate from left and right
    const fromLeft = i % 2 === 0;
    
    // Shorter duration - quick flash effect
    const duration = 1.2 + (normalizedPos / 100) * 0.3;
    
    // Staggered delay for cascade effect
    const delay = (i / laserCount) * 0.1;
    
    if (fromLeft) {
      // From LEFT edge
      const topPos = 25 + (i * 20); // Distribute vertically
      laser.style.cssText = `
        position: fixed;
        top: ${topPos}%;
        left: -100%;
        width: 150%;
        height: 1px;
        background: #39ff14;
        box-shadow: 0 0 10px #39ff14, 0 0 20px rgba(57, 255, 20, 0.6);
        pointer-events: none;
        z-index: 9997;
        animation: success-laser-sweep ${duration}s linear ${delay}s forwards;
      `;
    } else {
      // From RIGHT edge
      const topPos = 25 + (i * 20); // Distribute vertically
      laser.style.cssText = `
        position: fixed;
        top: ${topPos}%;
        right: -100%;
        width: 150%;
        height: 1px;
        background: #39ff14;
        box-shadow: 0 0 10px #39ff14, 0 0 20px rgba(57, 255, 20, 0.6);
        pointer-events: none;
        z-index: 9997;
        animation: success-laser-sweep-right ${duration}s linear ${delay}s forwards;
      `;
    }
    
    document.body.appendChild(laser);
    
    // Remove laser after animation
    setTimeout(() => {
      laser.remove();
    }, (duration + delay) * 1000);
  }
  
  // Add green success flash
  const greenFlash = document.createElement("div");
  greenFlash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(57, 255, 20, 0.1);
    pointer-events: none;
    z-index: 9996;
    animation: success-flash 1.2s ease-out forwards;
  `;
  document.body.appendChild(greenFlash);
  setTimeout(() => greenFlash.remove(), 1200);
}

// Red laser security effect on wrong code
function triggerLaserEffect() {
  const laserCount = 10; // Number of laser lines
  const goldenRatio = 1.618033988749895; // Golden ratio for natural distribution
  
  for (let i = 0; i < laserCount; i++) {
    const laser = document.createElement("div");
    laser.className = "security-laser";
    
    // Use golden ratio to distribute positions naturally
    const goldenAngle = (i * 360 / (goldenRatio * goldenRatio)) % 360;
    const normalizedPos = (goldenAngle / 360) * 100;
    
    // Determine which edge the laser comes from (4 edges)
    const edge = Math.floor((goldenAngle / 90) % 4);
    
    // Duration based on golden ratio distribution
    const duration = 0.35 + (normalizedPos / 100) * 0.5;
    
    // Delay based on golden ratio for cascade effect
    const delay = (i / laserCount) * 0.2;
    
    if (edge === 0) {
      // From LEFT edge, pointing right
      const topPos = normalizedPos;
      laser.style.cssText = `
        position: fixed;
        top: ${topPos}%;
        left: -100%;
        width: 150%;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent,
          #ff1744 20%,
          #ff5252 50%,
          #ff1744 80%,
          transparent);
        box-shadow: 0 0 10px #ff1744, 0 0 20px rgba(255, 23, 68, 0.6);
        pointer-events: none;
        z-index: 9997;
        animation: laser-sweep ${duration}s linear ${delay}s forwards;
      `;
    } else if (edge === 1) {
      // From TOP edge, pointing down
      const leftPos = normalizedPos;
      laser.style.cssText = `
        position: fixed;
        top: -100%;
        left: ${leftPos}%;
        width: 2px;
        height: 200%;
        background: linear-gradient(180deg, 
          transparent,
          #ff1744 20%,
          #ff5252 50%,
          #ff1744 80%,
          transparent);
        box-shadow: 0 0 10px #ff1744, 0 0 20px rgba(255, 23, 68, 0.6);
        pointer-events: none;
        z-index: 9997;
        animation: laser-vertical ${duration}s linear ${delay}s forwards;
      `;
    } else if (edge === 2) {
      // From RIGHT edge, pointing left
      const topPos = normalizedPos;
      laser.style.cssText = `
        position: fixed;
        top: ${topPos}%;
        right: -100%;
        width: 150%;
        height: 2px;
        background: linear-gradient(270deg, 
          transparent,
          #ff1744 20%,
          #ff5252 50%,
          #ff1744 80%,
          transparent);
        box-shadow: 0 0 10px #ff1744, 0 0 20px rgba(255, 23, 68, 0.6);
        pointer-events: none;
        z-index: 9997;
        animation: laser-sweep-right ${duration}s linear ${delay}s forwards;
      `;
    } else {
      // From BOTTOM edge, pointing up
      const leftPos = normalizedPos;
      laser.style.cssText = `
        position: fixed;
        bottom: -100%;
        left: ${leftPos}%;
        width: 2px;
        height: 200%;
        background: linear-gradient(0deg, 
          transparent,
          #ff1744 20%,
          #ff5252 50%,
          #ff1744 80%,
          transparent);
        box-shadow: 0 0 10px #ff1744, 0 0 20px rgba(255, 23, 68, 0.6);
        pointer-events: none;
        z-index: 9997;
        animation: laser-vertical-up ${duration}s linear ${delay}s forwards;
      `;
    }
    
    document.body.appendChild(laser);
    
    // Remove laser after animation
    setTimeout(() => {
      laser.remove();
    }, (duration + delay) * 1000);
  }
  
  // Add red screen flash effect
  const redFlash = document.createElement("div");
  redFlash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 23, 68, 0.15);
    pointer-events: none;
    z-index: 9996;
    animation: laser-flash 0.3s ease-out forwards;
  `;
  document.body.appendChild(redFlash);
  setTimeout(() => redFlash.remove(), 300);
}

// Celebration animation when shop unlocks
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

// Celebration animation when shop unlocks
function celebrateUnlock() {
  const shopSection = document.querySelector(".shop-gate");
  if (!shopSection) return;
  
  // Create confetti particles
  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "confetti-particle";
    
    // Random horizontal position
    const startX = Math.random() * window.innerWidth;
    const startY = -20;
    
    // Random animation duration and delay
    const duration = 2 + Math.random() * 1;
    const delay = Math.random() * 0.2;
    
    // Random angle and spread
    const angle = (Math.random() * 360) * Math.PI / 180;
    const velocity = 3 + Math.random() * 5;
    const endX = Math.cos(angle) * velocity * 100;
    const endY = Math.sin(angle) * velocity * 100 + window.innerHeight;
    
    particle.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: 8px;
      height: 8px;
      background: ${['#2dd4bf', '#14b8a6', '#e8e3d9', '#c3c7c9'][Math.floor(Math.random() * 4)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0%'};
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      animation: confetti-fall ${duration}s linear ${delay}s forwards;
      --tx: ${endX}px;
      --ty: ${endY}px;
      --rotate: ${Math.random() * 720}deg;
    `;
    
    document.body.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      particle.remove();
    }, (duration + delay) * 1000);
  }
  
  // Add flash effect
  const flash = document.createElement("div");
  flash.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(45, 212, 191, 0.3);
    pointer-events: none;
    z-index: 9998;
    animation: celebration-flash 0.6s ease-out forwards;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
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
