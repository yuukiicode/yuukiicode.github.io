// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // DOM Elements
    const mainHeaderElement = document.getElementById('main-header');
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const allNavLinks = document.querySelectorAll('#main-header nav a.nav-link, #mobile-menu nav a.mobile-nav-link');
    const backToTopButton = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('main section[id]');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const currentYearEl = document.getElementById('current-year');

    // --- Header Scroll Effect ---
    if (mainHeaderElement) {
        ScrollTrigger.create({
            start: "top -80", // Trigger when scrolled 80px past the top
            end: 99999, // A large number to keep it active
            toggleClass: { className: 'header-scrolled', targets: mainHeaderElement }
        });
    }

    // --- Mobile Navigation Toggle ---
    if (mobileNavToggle && mobileMenu) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', String(!isExpanded));
            
            mobileMenu.classList.toggle('menu-open'); 
            mobileMenu.classList.toggle('opacity-0');
            mobileMenu.classList.toggle('invisible');
            mobileMenu.classList.toggle('-translate-y-5'); 
            
            // Toggle body scroll lock
            document.body.classList.toggle('mobile-menu-open', !isExpanded);
        });
    }

    // --- Smooth Scroll for Navigation Links & Mobile Menu Handling ---
    allNavLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const isMobileMenuLinkClicked = this.closest('#mobile-menu') !== null;

                const performScrollLogic = () => {
                    // Always get the most current header element reference right before calculation
                    const currentFixedHeader = document.getElementById('main-header');
                    let headerOffset = 0;

                    // Determine header offset only if not scrolling to #hero
                    if (targetId !== '#hero') {
                        if (currentFixedHeader && currentFixedHeader.offsetHeight > 0) {
                            headerOffset = currentFixedHeader.offsetHeight;
                        } else {
                            // Fallback based on viewport width if header height somehow isn't available
                            // Corresponds to h-20 (80px) and md:h-24 (96px)
                            headerOffset = window.innerWidth < 768 ? 80 : 96; 
                        }
                    }
                    
                    let scrollToPosition = targetElement.offsetTop - headerOffset;
                    // Ensure we don't calculate a scroll position above the very top of the page
                    scrollToPosition = Math.max(0, scrollToPosition);

                    gsap.to(window, {
                        duration: 0.8, 
                        scrollTo: { 
                            y: scrollToPosition, 
                            autoKill: true // Stop animation if user scrolls manually
                        },
                        ease: "power2.inOut"
                    });
                };

                // If the click came from a link within the mobile menu AND the menu is currently open
                if (isMobileMenuLinkClicked && mobileMenu && mobileMenu.classList.contains('menu-open')) {
                    // First, close the mobile menu
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                    mobileMenu.classList.remove('menu-open');
                    mobileMenu.classList.add('opacity-0', 'invisible', '-translate-y-5');
                    document.body.classList.remove('mobile-menu-open'); // Unlock body scroll

                    // Use requestAnimationFrame to ensure the DOM has updated (menu closed, scrollbar restored)
                    // before calculating positions and initiating the scroll.
                    requestAnimationFrame(performScrollLogic);
                } else {
                    // For desktop links or if mobile menu isn't the context, scroll immediately
                    performScrollLogic();
                }
            }
        });
    });

    // --- Active Link Highlighting on Scroll ---
    function updateActiveLink() {
        if (!sections.length) return; // Exit if no sections found

        // Use the actual mainHeaderElement if available, otherwise fallback height for calculations
        const currentFixedHeader = document.getElementById('main-header');
        let headerHeightForActiveLink = 0;
        if (currentFixedHeader) {
            headerHeightForActiveLink = currentFixedHeader.offsetHeight;
        } else {
            headerHeightForActiveLink = window.innerWidth < 768 ? 80 : 96; // Fallback
        }
        
        let currentSectionId = 'hero'; // Default to hero
        // Offset to trigger active state when section top is comfortably below the fixed header
        const scrollYWithOffset = window.scrollY + headerHeightForActiveLink + 60; 

        sections.forEach(section => {
            // Check if the section is the currently active one based on scroll position
            if (section.offsetTop <= scrollYWithOffset && (section.offsetTop + section.offsetHeight) > scrollYWithOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        allNavLinks.forEach(link => {
            link.classList.remove('active-link');
            // Check if the link's href matches the current section and it's not a button styled as a link (like contact)
            if (link.getAttribute('href') === `#${currentSectionId}` && !link.classList.contains('btn-custom')) {
                link.classList.add('active-link');
            }
        });
    }
    // Call on load and on scroll
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); 

    // --- Back to Top Button ---
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            gsap.to(window, { 
                duration: 1, 
                scrollTo: { y: '#hero' }, // Scroll to the top (hero section)
                ease: "power2.inOut" 
            });
        });

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show after 300px scroll
                backToTopButton.classList.remove('opacity-0', 'invisible');
            } else {
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });
    }

    // --- GSAP Animations ---
    // Hero section animations
    gsap.fromTo("#hero h1", 
        { opacity: 0, y: 50, scale: 0.95 }, 
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "expo.out", delay: 0.3 }
    );
    gsap.fromTo("#hero .hero-tagline", 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.6 }
    );
    gsap.fromTo("#hero .btn-custom", 
        { opacity: 0, y: 30, scale: 0.9 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.4)", stagger: 0.15, delay: 0.9 }
    );
    // Header elements fade in
    gsap.fromTo("#main-header .g-fade-in-down", 
        {opacity:0, y:-25}, 
        {opacity:1, y:0, duration:0.7, ease:"power2.out", stagger:0.1, delay:1.2}
    );

    // Helper function for creating scroll-triggered animations
    const createScrollAnimation = (selector, fromVars, toVarsBase, stagger = 0.1) => {
        const elements = gsap.utils.toArray(selector);
        elements.forEach((el, i) => {
            // Use CSS animation-delay if present, otherwise default to 0
            const cssDelay = parseFloat(window.getComputedStyle(el).animationDelay) || 0; 
            const animationDelay = cssDelay + (stagger > 0 ? (i * stagger) : 0);

            gsap.fromTo(el, fromVars, {
                ...toVarsBase, // Spread base 'to' variables
                delay: animationDelay, 
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // Animation starts when element is 85% from top of viewport
                    end: "bottom 15%", // Useful for scrub or complex toggleActions
                    toggleActions: "play none none reverse", // Play on enter, reverse on leave
                }
            });
        });
    };
    
    // Apply scroll animations to various sections
    createScrollAnimation(".section-title.g-fade-in-up", { opacity: 0, y: 50, scale:0.98 }, { opacity: 1, y: 0, scale:1, duration: 0.8, ease: "expo.out" }, 0);
    createScrollAnimation(".section-subtitle.g-fade-in-up", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0);
    
    // Staggered animation for service cards, portfolio cards, and approach cards
    gsap.fromTo(".g-stagger-children > .service-card, .g-stagger-children > .portfolio-placeholder-card", 
        { opacity: 0, y: 40, scale: 0.95 }, 
        { 
            opacity: 1, y: 0, scale: 1, 
            duration: 0.7, 
            ease: "back.out(1.2)", 
            stagger: 0.15,
            scrollTrigger: {
                trigger: ".g-stagger-children", // Parent container as trigger
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );
            
    createScrollAnimation("#about .g-fade-in-left", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }, 0);
    createScrollAnimation("#about .g-fade-in-right", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }, 0);
    createScrollAnimation("#contact-form.g-fade-in-up", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0);

    // --- Contact Form Handling ---
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            const nameInput = document.getElementById('name'); 
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            let isValid = true;
            let statusMessage = '';

            // Basic validation
            if (!nameInput || nameInput.value.trim() === '') { // Added name validation
                statusMessage = 'Please enter your name.';
                isValid = false;
                if(nameInput) nameInput.focus();
            } else if (!emailInput || emailInput.value.trim() === '' || !emailInput.checkValidity()) {
                statusMessage = 'Please enter a valid email address.';
                isValid = false;
                if(emailInput && isValid) emailInput.focus(); // Focus only if name was valid
            } else if (!messageInput || messageInput.value.trim() === '') {
                statusMessage = 'Please write a message.';
                isValid = false;
                if(messageInput && isValid) messageInput.focus(); // Focus only if name/email were valid
            }

            if (!isValid) {
                formStatus.textContent = statusMessage;
                formStatus.className = 'mt-6 text-sm text-red-400'; // Tailwind class for error color
                return;
            }

            // If valid, show sending message
            formStatus.textContent = 'Sending your message...';
            formStatus.className = 'mt-6 text-sm text-yellow-400'; // Tailwind class for processing color
            
            // Simulate form submission (replace with actual AJAX call to a backend)
            setTimeout(() => {
                formStatus.textContent = 'Message sent! I\'ll get back to you soon.';
                formStatus.className = 'mt-6 text-sm text-green-400'; // Tailwind class for success color
                contactForm.reset(); // Clear the form fields
            }, 1500); // Simulate network delay
        });
    }

    // --- Update Current Year in Footer ---
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // --- Console Log for Initialization ---
    console.log("yuukii - Freelance Digital Services Portfolio Initialized.");
});
