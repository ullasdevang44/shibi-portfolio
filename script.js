document.addEventListener('DOMContentLoaded', () => {
    // --- Utility: Check if element exists ---
    const elementExists = (selector) => document.querySelector(selector) !== null;

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Scroll Arrow ---
    const scrollArrow = document.querySelector('.scroll-arrow');
    if (scrollArrow) {
        scrollArrow.addEventListener('click', (e) => {
            e.preventDefault();
            const skillsSection = document.querySelector('#skills');
            if (skillsSection) {
                skillsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Theme Toggle ---
    const themeToggleButton = document.querySelector('.theme-toggle');
    const body = document.body;
    if (themeToggleButton) {
        const applyTheme = (isDark) => {
            body.classList.toggle('dark-mode', isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggleButton.setAttribute('aria-pressed', isDark);
        };

        const getInitialTheme = () => {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        };

        const isDark = getInitialTheme();
        applyTheme(isDark);

        themeToggleButton.addEventListener('click', () => {
            applyTheme(!body.classList.contains('dark-mode'));
        });
    } else {
        console.warn('Theme toggle button not found.');
    }

    // --- Hamburger Menu ---
    const hamburgerButton = document.querySelector('.hamburger');
    const navigationLinks = document.querySelector('.nav-links');
    if (hamburgerButton && navigationLinks) {
        hamburgerButton.setAttribute('aria-expanded', 'false');
        hamburgerButton.setAttribute('aria-controls', 'nav-links');

        const toggleMenu = () => {
            const isOpen = navigationLinks.classList.toggle('active');
            hamburgerButton.classList.toggle('active', isOpen);
            body.classList.toggle('nav-open', isOpen);
            hamburgerButton.setAttribute('aria-expanded', isOpen);
            // Focus trap for accessibility
            if (isOpen) {
                navigationLinks.querySelector('a').focus();
            }
        };

        hamburgerButton.addEventListener('click', toggleMenu);

        // Close menu on link click
        navigationLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navigationLinks.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (
                !navigationLinks.contains(e.target) &&
                !hamburgerButton.contains(e.target) &&
                navigationLinks.classList.contains('active')
            ) {
                toggleMenu();
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navigationLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    } else {
        console.warn('Hamburger button or nav links not found.');
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    const submitButton = contactForm?.querySelector('button[type="submit"]');

    if (contactForm && formStatus && submitButton) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Client-side validation
            const name = contactForm.querySelector('#name')?.value.trim();
            const email = contactForm.querySelector('#email')?.value.trim();
            const message = contactForm.querySelector('#message')?.value.trim();
            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill in all fields.';
                formStatus.className = 'form-status error';
                formStatus.style.display = 'block';
                return;
            }
            if (!/\S+@\S+\.\S+/.test(email)) {
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.className = 'form-status error';
                formStatus.style.display = 'block';
                return;
            }

            const formData = new FormData(contactForm);
            const originalButtonText = submitButton.textContent;

            // Processing state
            formStatus.textContent = 'Sending message...';
            formStatus.className = 'form-status processing';
            formStatus.style.display = 'block';
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
                .then(response => {
                    if (response.ok) {
                        formStatus.textContent = 'Thank you! Your message has been sent successfully.';
                        formStatus.className = 'form-status success';
                        contactForm.reset();
                        setTimeout(() => {
                            formStatus.style.opacity = '0';
                            setTimeout(() => {
                                formStatus.textContent = '';
                                formStatus.className = 'form-status';
                                formStatus.style.display = 'none';
                                formStatus.style.opacity = '1';
                            }, 300);
                        }, 5000);
                    } else {
                        response.json().then(data => {
                            formStatus.textContent =
                                data.errors?.map(err => err.message).join(', ') ||
                                'There was a problem submitting your form.';
                            formStatus.className = 'form-status error';
                        }).catch(() => {
                            formStatus.textContent = 'An unexpected error occurred.';
                            formStatus.className = 'form-status error';
                        });
                    }
                })
                .catch(() => {
                    formStatus.textContent = 'Network error. Please try again later.';
                    formStatus.className = 'form-status error';
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                });
        });
    } else {
        if (!contactForm) console.warn('Contact form not found.');
        if (!formStatus) console.warn('Form status element not found.');
        if (!submitButton) console.warn('Submit button not found.');
    }

    // --- Update Footer Year ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});