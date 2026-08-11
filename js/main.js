/**
 * SKYHAUL TRANSIT INC. - Premium Motion & Interaction System
 * Lightweight, hardware-accelerated, and dependency-free.
 */

document.addEventListener("DOMContentLoaded", () => {
    initPreloader();
    initScrollProgress();
    initStickyHeader();
    initMobileMenu();
    initCustomCursor();
    initTextRevealSplitter();
    initScrollReveal();
    initAnimatedCounters();
    initMagneticButtons();
    initMultiStepForm();
    initFAQForms();
    initFAQAccordions();
});

/* ==========================================================
   1. Preloader System
   ========================================================== */
function initPreloader() {
    const preloader = document.querySelector(".preloader");
    const progressBar = document.querySelector(".preloader-progress");
    
    if (!preloader || !progressBar) return;
    
    // Simulate initial loading progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressBar.style.width = `${progress}%`;
    }, 80);

    // Fade out when window is fully loaded
    window.addEventListener("load", () => {
        clearInterval(interval);
        progressBar.style.width = "100%";
        
        setTimeout(() => {
            preloader.classList.add("fade-out");
            // Trigger initial viewport animations
            document.querySelectorAll('[data-reveal]').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add("revealed");
                }
            });
        }, 300);
    });
}

/* ==========================================================
   2. Scroll Progress & Sticky Header
   ========================================================== */
function initScrollProgress() {
    const scrollBar = document.querySelector(".scroll-progress");
    if (!scrollBar) return;
    
    window.addEventListener("scroll", () => {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollBar.style.width = `${scrolled}%`;
    });
}

function initStickyHeader() {
    const header = document.querySelector(".header");
    if (!header) return;
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

/* ==========================================================
   3. Mobile Navigation Menu
   ========================================================== */
function initMobileMenu() {
    const burger = document.querySelector(".burger");
    const nav = document.querySelector(".nav");
    
    if (!burger || !nav) return;
    
    // Inject mobile nav footer dynamically to keep HTML clean and centralized
    if (!nav.querySelector(".mobile-nav-footer")) {
        const footerDiv = document.createElement("div");
        footerDiv.className = "mobile-nav-footer";
        footerDiv.innerHTML = `
            <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: var(--weight-semibold);">24/7 Dispatch Support</p>
            <a href="tel:2232032018" style="font-family: var(--font-heading); font-size: 1.2rem; font-weight: var(--weight-bold); color: var(--color-brand-orange); display: flex; align-items: center; gap: 0.35rem; margin-bottom: 1rem;"><i class="ri-phone-fill"></i> +1 (223) 203-2018</a>
            
        `;
        nav.appendChild(footerDiv);
    }
    
    burger.addEventListener("click", () => {
        nav.classList.toggle("open");
        
        // Animate Burger Lines
        const spans = burger.querySelectorAll("span");
        if (nav.classList.contains("open")) {
            spans[0].style.transform = "rotate(45deg) translate(6px, 6px)";
            spans[1].style.opacity = "0";
            spans[2].style.transform = "rotate(-45deg) translate(5px, -5px)";
        } else {
            spans[0].style.transform = "none";
            spans[1].style.opacity = "1";
            spans[2].style.transform = "none";
        }
    });

    // Close mobile nav when clicking outside of it
    document.addEventListener("click", (e) => {
        if (nav.classList.contains("open") && !nav.contains(e.target) && !burger.contains(e.target)) {
            burger.click();
        }
    });

    // Close menu on click of nav links on mobile
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            // Do not close menu if it's the dropdown toggle itself on mobile
            if (window.innerWidth <= 1023 && link.classList.contains("dropdown-toggle")) {
                return;
            }
            if (nav.classList.contains("open")) {
                burger.click();
            }
        });
    });

    // Mobile Dropdown Accordion Toggle
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".nav-dropdown");
    const dropdownIcon = document.querySelector(".dropdown-icon");

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener("click", (e) => {
            if (window.innerWidth <= 1023) {
                e.preventDefault(); // Prevent navigating on mobile click
                dropdownMenu.classList.toggle("open");
                if (dropdownIcon) dropdownIcon.classList.toggle("open");
            }
        });
    }
}

/* ==========================================================
   4. Custom Magnetic Cursor
   ========================================================== */
function initCustomCursor() {
    const cursor = document.querySelector(".custom-cursor");
    const cursorRing = document.querySelector(".custom-cursor-ring");
    
    if (!cursor || !cursorRing) return;
    
    // Disable custom cursor on touch/mobile devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        cursor.style.display = "none";
        cursorRing.style.display = "none";
        return;
    }

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Smooth physics animation for the outer cursor ring
    function animateRing() {
        // Linear interpolation: ring position catches up to mouse position
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover interactions for links & buttons
    const interactives = document.querySelectorAll("a, button, .btn, input, select, textarea, .form-step-node, .service-card, .equipment-card");
    interactives.forEach(item => {
        item.addEventListener("mouseenter", () => {
            cursor.classList.add("hovered");
            cursorRing.classList.add("hovered");
        });
        item.addEventListener("mouseleave", () => {
            cursor.classList.remove("hovered");
            cursorRing.classList.remove("hovered");
        });
    });
}

/* ==========================================================
   5. Text Reveal Splitter
   ========================================================== */
function initTextRevealSplitter() {
    const textElements = document.querySelectorAll("[data-reveal-text]");
    
    textElements.forEach(el => {
        const text = el.textContent.trim();
        el.innerHTML = ""; // Clear original text
        
        // Split by words
        const words = text.split(" ");
        words.forEach((word, idx) => {
            const maskContainer = document.createElement("span");
            maskContainer.className = "text-mask-container";
            
            const maskLine = document.createElement("span");
            maskLine.className = "text-mask-line";
            maskLine.style.transitionDelay = `${idx * 40}ms`;
            maskLine.textContent = word + (idx < words.length - 1 ? "\u00A0" : ""); // Keep spacing
            
            maskContainer.appendChild(maskLine);
            el.appendChild(maskContainer);
        });
        
        // Also ensure element has the base reveal attribute
        if (!el.hasAttribute("data-reveal")) {
            el.setAttribute("data-reveal", "fade-in");
        }
    });
}

/* ==========================================================
   6. Scroll Reveal Observer
   ========================================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll("[data-reveal]");
    
    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -8% 0px", // Trigger slightly before entering full viewport
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, observerOptions);

    reveals.forEach(el => observer.observe(el));
}

/* ==========================================================
   7. Animated Counters (Statistics)
   ========================================================== */
function initAnimatedCounters() {
    const counters = document.querySelectorAll(".count-up");
    
    const counterObserverOptions = {
        root: null,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseFloat(target.getAttribute("data-count"));
                const duration = 2000; // 2 seconds
                let startTimestamp = null;

                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                    
                    // Ease out quadratic
                    const easeProgress = progress * (2 - progress);
                    const currentVal = easeProgress * endVal;

                    if (target.getAttribute("data-decimals") === "1") {
                        target.textContent = currentVal.toFixed(1);
                    } else {
                        target.textContent = Math.floor(currentVal);
                    }

                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        // Ensure exact final number is set
                        target.textContent = target.getAttribute("data-count");
                    }
                };

                window.requestAnimationFrame(step);
                observer.unobserve(target);
            }
        });
    }, counterObserverOptions);

    counters.forEach(counter => observer.observe(counter));
}

/* ==========================================================
   8. Magnetic Button Hover Interaction
   ========================================================== */
function initMagneticButtons() {
    const magneticItems = document.querySelectorAll(".btn, .magnetic");
    
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    magneticItems.forEach(item => {
        // We wrap items in an inner/outer frame if necessary, but we can animate the element directly
        item.style.transition = "transform var(--transition-magnetic)";

        item.addEventListener("mousemove", (e) => {
            const bounds = item.getBoundingClientRect();
            // Calculate mouse coordinates relative to button center
            const x = e.clientX - bounds.left - bounds.width / 2;
            const y = e.clientY - bounds.top - bounds.height / 2;
            
            // Magnetic strength (pull strength)
            const strength = 0.25; 
            
            item.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });

        item.addEventListener("mouseleave", () => {
            item.style.transform = "translate(0px, 0px)";
        });
    });
}

/* ==========================================================
   9. Multi-step Quote Form
   ========================================================== */
function initMultiStepForm() {
    const formPanes = document.querySelectorAll(".form-pane");
    const steps = document.querySelectorAll(".form-step-node");
    const stepProgress = document.querySelector(".form-step-progress");
    const nextButtons = document.querySelectorAll(".form-next-btn");
    const prevButtons = document.querySelectorAll(".form-prev-btn");
    const quoteForm = document.getElementById("shipper-quote-form");
    const successScreen = document.querySelector(".success-screen");
    
    if (formPanes.length === 0) return;

    let currentStepIdx = 0;

    function updateFormProgress() {
        // Update panes
        formPanes.forEach((pane, idx) => {
            if (idx === currentStepIdx) {
                pane.classList.add("active");
            } else {
                pane.classList.remove("active");
            }
        });

        // Update step nodes
        steps.forEach((step, idx) => {
            if (idx === currentStepIdx) {
                step.className = "form-step-node active";
            } else if (idx < currentStepIdx) {
                step.className = "form-step-node completed";
            } else {
                step.className = "form-step-node";
            }
        });

        // Update line progress
        if (stepProgress && steps.length > 1) {
            const progressPct = (currentStepIdx / (steps.length - 1)) * 100;
            stepProgress.style.width = `${progressPct}%`;
        }
    }

    nextButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Simple validation check before proceeding
            const currentPane = formPanes[currentStepIdx];
            const inputs = currentPane.querySelectorAll("input[required], select[required]");
            let allValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    allValid = false;
                    input.style.borderColor = "red";
                    // Add micro-animation shake to invalid input
                    input.animate([
                        { transform: 'translateX(-5px)' },
                        { transform: 'translateX(5px)' },
                        { transform: 'translateX(-5px)' },
                        { transform: 'translateX(0)' }
                    ], { duration: 200 });
                } else {
                    input.style.borderColor = "";
                }
            });

            if (!allValid) return;

            if (currentStepIdx < formPanes.length - 1) {
                currentStepIdx++;
                updateFormProgress();
            }
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            if (currentStepIdx > 0) {
                currentStepIdx--;
                updateFormProgress();
            }
        });
    });

    if (quoteForm) {
        quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = quoteForm.querySelector("button[type='submit']");
    if (submitBtn) {
        submitBtn.innerHTML = "Processing Freight Quote...";
        submitBtn.disabled = true;
    }

    // ✅ COLLECT ALL FORM DATA (ALL STEPS)
    const formData = {
        origin: document.getElementById("origin-input").value,
        destination: document.getElementById("destination-input").value,
        date: document.getElementById("date-input").value,

        equipment: document.getElementById("equipment-input").value,
        weight: document.getElementById("weight-input").value,
        commodity: document.getElementById("commodity-input").value,
        notes: document.getElementById("notes-input").value,

        company: document.getElementById("company-input").value,
        name: document.getElementById("name-input").value,
        email: document.getElementById("email-input").value,
        phone: document.getElementById("phone-input").value,

        // ✅ reCAPTCHA token
        recaptcha: grecaptcha.getResponse()
    };

    // ❗ CHECK captcha
    if (!formData.recaptcha) {
        alert("Please verify reCAPTCHA");
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Submit Freight Quote";
        }
        return;
    }

    // Resolve API Endpoint dynamically (local port 5000 vs relative production path)
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const apiEndpoint = isLocal ? "http://localhost:5000/send-quote" : "/send-quote";

    try {
        const res = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        // 🔥 SAFE PARSING
        const text = await res.text();
        console.log("SERVER RESPONSE:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Invalid server response. Please contact support.");
        }

        if (data.success) {
            quoteForm.style.display = "none";
            const formSteps = document.querySelector(".form-steps");
            if (formSteps) {
                formSteps.style.display = "none";
            }

            if (successScreen) {
                successScreen.style.display = "block";
            }
        } else {
            alert("Error sending quote: " + (data.message || "Please check your input and try again."));
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "Submit Freight Quote";
            }
        }

    } catch (err) {
        console.error(err);
        alert("Server error: " + err.message);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Submit Freight Quote";
        }
    }
        }); // 👈 submit event close
    } // 👈 initMultiStepForm function close
}

/* ==========================================================
   10. FAQ Split Query Forms
   ========================================================== */
function initFAQForms() {
    const faqForms = document.querySelectorAll(".faq-query-form");
    
    faqForms.forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector("button[type='submit']");
            if (!submitBtn) return;
            submitBtn.innerHTML = 'Sending Query... <i class="ri-loader-4-line ri-spin btn-icon"></i>';
            submitBtn.disabled = true;
            
            // Simulate API request
            setTimeout(() => {
                const card = form.closest(".faq-form-card");
                if (card) {
                    // Create success overlay
                    const successDiv = document.createElement("div");
                    successDiv.style.textAlign = "center";
                    successDiv.style.padding = "2rem 0";
                    successDiv.innerHTML = `
                        <div class="success-icon-wrap" style="width:60px; height:60px; font-size:2rem; margin-bottom:1rem; background-color:#d1fae5; color:#10b981; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
                            <i class="ri-checkbox-circle-line"></i>
                        </div>
                        <h4 style="font-family:var(--font-heading); margin-bottom:0.5rem; font-weight:700;">Query Received!</h4>
                        <p style="font-size:0.85rem; color:var(--color-text-muted);">A logistics coordinator will email you an answer in under 15 minutes.</p>
                    `;
                    
                    form.style.display = "none";
                    const title = card.querySelector("h3");
                    const subtitle = card.querySelector("p");
                    if (title) title.style.display = "none";
                    if (subtitle) subtitle.style.display = "none";
                    
                    card.appendChild(successDiv);
                    successDiv.animate([
                        { opacity: 0, transform: 'scale(0.95)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ], { duration: 300, easing: 'ease-out' });
                }
            }, 1000);
        });
    });
}

/* ==========================================================
   11. FAQ Accordion Toggle (Global)
   ========================================================== */
function initFAQAccordions() {
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach(q => {
        q.addEventListener("click", () => {
            const item = q.parentElement;
            const isActive = item.classList.contains("active");
            
            // Close siblings in same grid
            const grid = item.closest(".faq-grid");
            if (grid) {
                grid.querySelectorAll(".faq-item").forEach(el => {
                    el.classList.remove("active");
                });
            }
            
            if (!isActive) {
                item.classList.add("active");
            }
        });
    });
}
