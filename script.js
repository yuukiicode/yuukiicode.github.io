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
            
            // Toggle Tailwind classes for visibility and animation
            mobileMenu.classList.toggle('menu-open'); // Custom class to track state if needed for CSS
            mobileMenu.classList.toggle('opacity-0');
            mobileMenu.classList.toggle('invisible');
            mobileMenu.classList.toggle('-translate-y-5'); // Animation class
            
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
                const headerHeight = mainHeaderElement ? mainHeaderElement.offsetHeight : 80; // Default to 80px if header not found
                let scrollToPosition = targetElement.offsetTop - headerHeight;
                
                // Ensure top of hero section is exactly at the top of viewport
                if (targetId === '#hero') {
                    scrollToPosition = 0;
                }

                gsap.to(window, {
                    duration: 0.8, // Animation duration
                    scrollTo: { 
                        y: scrollToPosition, 
                        autoKill: true // Stop animation if user scrolls manually
                    },
                    ease: "power2.inOut" // Easing function
                });

                // If mobile menu is open, close it
                if (mobileMenu && mobileMenu.classList.contains('menu-open')) {
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                    mobileMenu.classList.remove('menu-open');
                    mobileMenu.classList.add('opacity-0', 'invisible', '-translate-y-5');
                    document.body.classList.remove('mobile-menu-open'); // Remove scroll lock
                }
            }
        });
    });

    // --- Active Link Highlighting on Scroll ---
    function updateActiveLink() {
        if (!sections.length || !mainHeaderElement) return;

        let currentSectionId = 'hero'; // Default to hero
        const headerHeightForActiveLink = mainHeaderElement.offsetHeight;
        // Offset to trigger active state slightly before section top hits header bottom
        const scrollYWithOffset = window.scrollY + headerHeightForActiveLink + 60; 

        sections.forEach(section => {
            if (section.offsetTop <= scrollYWithOffset && (section.offsetTop + section.offsetHeight) > scrollYWithOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        allNavLinks.forEach(link => {
            link.classList.remove('active-link');
            // Check if the link's href matches the current section and it's not a button styled as a link
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
        gsap.utils.toArray(selector).forEach((el, i) => {
            // Use CSS animation-delay if present, otherwise default to 0
            const cssDelay = parseFloat(el.style.animationDelay) || 0; 
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
    
    // Staggered animation for service cards, portfolio cards, and approach cards (if they use .service-card)
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
            const nameInput = document.getElementById('name'); // Added name input for completeness, though not validated here
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            let isValid = true;
            let statusMessage = '';

            // Basic validation
            if (emailInput.value.trim() === '' || !emailInput.checkValidity()) {
                statusMessage = 'Please enter a valid email address.';
                isValid = false;
                if(emailInput) emailInput.focus();
            } else if (messageInput.value.trim() === '') {
                 statusMessage = 'Please write a message.';
                 isValid = false;
                 if(messageInput) messageInput.focus();
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
                // In a real application, you would send the form data to a server endpoint.
                // For example, using fetch API:
                // fetch('YOUR_SERVER_ENDPOINT', { method: 'POST', body: new FormData(contactForm) })
                // .then(response => response.json())
                // .then(data => { ... handle success ... })
                // .catch(error => { ... handle error ... });

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
    console.log("yuukii - Freelance Digital Services Portfolio Initialized with separated JS.");
});
