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
                const closeMobileMenu = () => {
                    if (mobileMenu && mobileMenu.classList.contains('menu-open')) {
                        mobileNavToggle.setAttribute('aria-expanded', 'false');
                        mobileMenu.classList.remove('menu-open');
                        mobileMenu.classList.add('opacity-0', 'invisible', '-translate-y-5');
                        document.body.classList.remove('mobile-menu-open');
                        return true; // Indicate menu was closed
                    }
                    return false; // Menu was not open or not present
                };

                const performScroll = () => {
                    const headerElementForOffset = document.getElementById('main-header');
                    let headerOffset = 0;

                    // Only apply header offset if not scrolling to the #hero section
                    // and the header element is present and has a height.
                    if (targetId !== '#hero') {
                        if (headerElementForOffset && headerElementForOffset.offsetHeight > 0) {
                            headerOffset = headerElementForOffset.offsetHeight;
                        } else {
                            // Fallback static header height if dynamic one isn't available
                            // Considers typical mobile (h-20 = 80px) vs desktop (md:h-24 = 96px)
                            headerOffset = window.innerWidth < 768 ? 80 : 96;
                        }
                    }
                    
                    let scrollToPosition = targetElement.offsetTop - headerOffset;
                    // Ensure scrollToPosition is not negative (e.g. if header is taller than element's offset from top)
                    scrollToPosition = Math.max(0, scrollToPosition);

                    gsap.to(window, {
                        duration: 0.8, // Animation duration
                        scrollTo: { 
                            y: scrollToPosition, 
                            autoKill: true // Stop animation if user scrolls manually
                        },
                        ease: "power2.inOut" // Easing function
                    });
                };

                if (closeMobileMenu()) {
                    // If mobile menu was closed, use requestAnimationFrame
                    // to ensure layout updates (like body scrollbar) are processed
                    // before calculating scroll positions.
                    requestAnimationFrame(performScroll);
                } else {
                    // If menu was not open (e.g., desktop link click), scroll immediately.
                    performScroll();
                }
            }
        });
    });

    // --- Active Link Highlighting on Scroll ---
    function updateActiveLink() {
        if (!sections.length || !mainHeaderElement) return;

        let currentSectionId = 'hero'; 
        const headerHeightForActiveLink = mainHeaderElement.offsetHeight;
        // Offset to trigger active state slightly before section top hits header bottom
        // or when a good portion of the section is visible.
        const scrollYWithOffset = window.scrollY + headerHeightForActiveLink + 60; 

        sections.forEach(section => {
            if (section.offsetTop <= scrollYWithOffset && (section.offsetTop + section.offsetHeight) > scrollYWithOffset) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        allNavLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${currentSectionId}` && !link.classList.contains('btn-custom')) {
                link.classList.add('active-link');
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call

    // --- Back to Top Button ---
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            gsap.to(window, { 
                duration: 1, 
                scrollTo: { y: '#hero' }, 
                ease: "power2.inOut" 
            });
        });

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { 
                backToTopButton.classList.remove('opacity-0', 'invisible');
            } else {
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });
    }

    // --- GSAP Animations ---
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
    gsap.fromTo("#main-header .g-fade-in-down", 
        {opacity:0, y:-25}, 
        {opacity:1, y:0, duration:0.7, ease:"power2.out", stagger:0.1, delay:1.2}
    );

    const createScrollAnimation = (selector, fromVars, toVarsBase, stagger = 0.1) => {
        gsap.utils.toArray(selector).forEach((el, i) => {
            const cssDelay = parseFloat(el.style.animationDelay) || 0; 
            const animationDelay = cssDelay + (stagger > 0 ? (i * stagger) : 0);

            gsap.fromTo(el, fromVars, {
                ...toVarsBase, 
                delay: animationDelay, 
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", 
                    end: "bottom 15%", 
                    toggleActions: "play none none reverse", 
                }
            });
        });
    };
    
    createScrollAnimation(".section-title.g-fade-in-up", { opacity: 0, y: 50, scale:0.98 }, { opacity: 1, y: 0, scale:1, duration: 0.8, ease: "expo.out" }, 0);
    createScrollAnimation(".section-subtitle.g-fade-in-up", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0);
    
    gsap.fromTo(".g-stagger-children > .service-card, .g-stagger-children > .portfolio-placeholder-card", 
        { opacity: 0, y: 40, scale: 0.95 }, 
        { 
            opacity: 1, y: 0, scale: 1, 
            duration: 0.7, 
            ease: "back.out(1.2)", 
            stagger: 0.15,
            scrollTrigger: {
                trigger: ".g-stagger-children", 
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
            e.preventDefault(); 
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            let isValid = true;
            let statusMessage = '';

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
                formStatus.className = 'mt-6 text-sm text-red-400'; 
                return;
            }

            formStatus.textContent = 'Sending your message...';
            formStatus.className = 'mt-6 text-sm text-yellow-400'; 
            
            setTimeout(() => {
                formStatus.textContent = 'Message sent! I\'ll get back to you soon.';
                formStatus.className = 'mt-6 text-sm text-green-400'; 
                contactForm.reset(); 
            }, 1500); 
        });
    }

    // --- Update Current Year in Footer ---
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // --- Console Log for Initialization ---
    console.log("yuukii - Freelance Digital Services Portfolio Initialized.");
});
