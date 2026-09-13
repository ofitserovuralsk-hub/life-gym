// ===================================
// LEAD SUBMISSION (BACKEND API)
// ===================================
// Relative URL: works out of the box when the backend serves this site itself
// (see backend/README.md). If the frontend is hosted separately, change this
// to the backend's full URL, e.g. 'https://api.lifegym-uralsk.kz/api/leads'.
const LEAD_API_URL = '/api/leads';

// Captures utm_source/utm_medium/utm_campaign/utm_content/utm_term from the
// current URL and remembers them for the rest of the browser session, so a
// lead submitted later (after scrolling/navigating within the page) still
// carries the campaign that brought the visitor in.
function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const fromUrl = {};
    let hasUtm = false;

    keys.forEach((key) => {
        const value = params.get(key);
        if (value) {
            fromUrl[key] = value;
            hasUtm = true;
        }
    });

    if (hasUtm) {
        try {
            sessionStorage.setItem('lifegym_utm', JSON.stringify(fromUrl));
        } catch (e) {
            // sessionStorage unavailable (private mode etc.) - not critical
        }
        return fromUrl;
    }

    try {
        const stored = sessionStorage.getItem('lifegym_utm');
        if (stored) return JSON.parse(stored);
    } catch (e) {
        // ignore
    }

    return {};
}

// Sends a lead to the backend. Throws on any non-2xx response or network
// error, so callers can show the existing error UI and let the visitor retry.
async function submitLead(payload) {
    const utm = getUtmParams();

    const body = {
        ...payload,
        utm: {
            source: utm.utm_source || null,
            medium: utm.utm_medium || null,
            campaign: utm.utm_campaign || null,
            content: utm.utm_content || null,
            term: utm.utm_term || null,
        },
        referrer: document.referrer || null,
        pageUrl: window.location.href,
    };

    const response = await fetch(LEAD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error('Lead submission failed with status ' + response.status);
    }

    return response.json();
}

// ===================================
// DOM ELEMENTS
// ===================================
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const scrollProgress = document.getElementById('scrollProgress');
const customCursor = document.getElementById('customCursor');
const scrollToTop = document.getElementById('scrollToTop');

// ===================================
// MOBILE MENU
// ===================================
function toggleMobileMenu() {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !navToggle.contains(e.target)) {
        toggleMobileMenu();
    }
});

// ===================================
// HEADER SCROLL EFFECT
// ===================================
let lastScroll = 0;

function handleScroll() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = 'var(--color-black)';
        header.style.backdropFilter = 'none';
    }
    
    lastScroll = currentScroll;
}

window.addEventListener('scroll', handleScroll);
handleScroll(); // Initial call

// ===================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerHeight = header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// SCROLL PROGRESS BAR
// ===================================
function updateScrollProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    if (scrollProgress) {
        scrollProgress.style.width = scrollPercent + '%';
    }
}

window.addEventListener('scroll', updateScrollProgress);
updateScrollProgress(); // Initial call

// ===================================
// SCROLL TO TOP BUTTON
// ===================================
function handleScrollToTopVisibility() {
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 300) {
        scrollToTop.classList.add('visible');
    } else {
        scrollToTop.classList.remove('visible');
    }
}

window.addEventListener('scroll', handleScrollToTopVisibility);
handleScrollToTopVisibility(); // Initial call

// Scroll to top when button is clicked
if (scrollToTop) {
    scrollToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// ENHANCED SCROLL ANIMATIONS
// ===================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // Add counter animation for stats
            if (entry.target.classList.contains('about-stat-number')) {
                animateCounter(entry.target);
            }
        }
    });
}, observerOptions);

// Observe all reveal elements
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Counter animation function
function animateCounter(element) {
    const target = parseInt(element.textContent);
    const duration = 2000;
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Observe elements for fade-in animation (legacy)
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll(
    '.service-card, .advantage-item, .gallery-item, .trainer-card, .pricing-card, .review-card, .schedule-item'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    fadeObserver.observe(el);
});

// ===================================
// PARALLAX EFFECT
// ===================================
let parallaxElements = document.querySelectorAll('.parallax');

function updateParallax() {
    const scrollTop = window.pageYOffset;
    
    parallaxElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const speed = 0.15;
        const offset = (scrollTop - elementTop) * speed;
        
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
            element.style.transform = `translateY(${offset}px)`;
        }
    });
}

let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }
});

// ===================================
// MAGNETIC BUTTON EFFECT
// ===================================
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
    });
});

// ===================================
// ACTIVE NAVIGATION LINK
// ===================================
const sections = document.querySelectorAll('section[id]');

function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - header.offsetHeight - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ===================================
// ACCESSIBILITY
// ===================================
// Handle keyboard navigation for mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
});

// Add focus styles for better accessibility
const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
);

focusableElements.forEach(el => {
    el.addEventListener('focus', () => {
        el.style.outline = '2px solid var(--color-red)';
        el.style.outlineOffset = '2px';
    });
    
    el.addEventListener('blur', () => {
        el.style.outline = 'none';
        el.style.outlineOffset = '0';
    });
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced scroll handlers for better performance
const debouncedUpdateActive = debounce(updateActiveNavLink, 10);
window.removeEventListener('scroll', updateActiveNavLink);
window.addEventListener('scroll', debouncedUpdateActive);

const debouncedUpdateProgress = debounce(updateScrollProgress, 10);
window.removeEventListener('scroll', updateScrollProgress);
window.addEventListener('scroll', debouncedUpdateProgress);

// ===================================
// PRELOADER (Optional)
// ===================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ===================================
// CONSOLE MESSAGE
// ===================================
// Removed production console.log statements

// ===================================
// TRY GYM FORM SUBMISSION
// ===================================
const tryGymForm = document.getElementById('tryGymForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
const formLoading = document.getElementById('formLoading');
const resetFormBtn = document.getElementById('resetForm');
const retryFormBtn = document.getElementById('retryForm');

// Validation function
function validateForm(form) {
    const nameInput = form.querySelector('input[name="name"], input[name="bookingName"], input[name="paymentName"]');
    const phoneInput = form.querySelector('input[name="phone"], input[name="bookingPhone"], input[name="paymentPhone"]');
    
    let isValid = true;
    
    // Validate name
    if (nameInput) {
        const nameValue = nameInput.value.trim();
        if (nameValue.length < 2) {
            nameInput.setCustomValidity('Имя должно содержать минимум 2 символа');
            isValid = false;
        } else if (!/^[A-Za-zА-Яа-я\s]+$/.test(nameValue)) {
            nameInput.setCustomValidity('Имя должно содержать только буквы');
            isValid = false;
        } else {
            nameInput.setCustomValidity('');
        }
    }
    
    // Validate phone
    if (phoneInput) {
        const phoneValue = phoneInput.value.trim();
        const phonePattern = /^[\+]?7?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
        if (!phonePattern.test(phoneValue)) {
            phoneInput.setCustomValidity('Введите корректный номер телефона');
            isValid = false;
        } else {
            phoneInput.setCustomValidity('');
        }
    }
    
    return isValid;
}

// Add input event listeners to clear validation on typing
document.querySelectorAll('input[name="name"], input[name="bookingName"], input[name="paymentName"], input[name="phone"], input[name="bookingPhone"], input[name="paymentPhone"]').forEach(input => {
    input.addEventListener('input', function() {
        this.setCustomValidity('');
    });
});

const DIRECTION_LABELS = {
    gym: 'Тренажёрный зал',
    personal: 'Персональные тренировки',
    group: 'Групповые тренировки',
    functional: 'Функциональный тренинг',
    cardio: 'Кардио-зона',
    yoga: 'Йога',
};

if (tryGymForm) {
    tryGymForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm(tryGymForm)) {
            tryGymForm.reportValidity();
            return;
        }

        // Show loading state
        tryGymForm.style.display = 'none';
        formLoading.style.display = 'block';

        const formData = new FormData(tryGymForm);
        const direction = formData.get('direction');
        const comment = formData.get('comment');

        submitLead({
            source: 'try-gym',
            name: formData.get('name'),
            phone: formData.get('phone'),
            comment: [
                direction ? `Направление: ${DIRECTION_LABELS[direction] || direction}` : null,
                comment ? comment.trim() : null,
            ].filter(Boolean).join('. ') || null,
        }).then(() => {
            formLoading.style.display = 'none';
            formSuccess.style.display = 'block';
            formSuccess.classList.add('fade-in');
        }).catch(() => {
            formLoading.style.display = 'none';
            formError.style.display = 'block';
        });
    });
}

if (resetFormBtn) {
    resetFormBtn.addEventListener('click', function() {
        // Reset form
        tryGymForm.reset();
        
        // Hide success message and show form
        formSuccess.style.display = 'none';
        tryGymForm.style.display = 'flex';
        
        // Remove animation class
        formSuccess.classList.remove('fade-in');
    });
}

if (retryFormBtn) {
    retryFormBtn.addEventListener('click', function() {
        // Hide error message and show form
        formError.style.display = 'none';
        tryGymForm.style.display = 'flex';
    });
}

// ===================================
// SCHEDULE DAY SWITCHING
// ===================================
const scheduleDayBtns = document.querySelectorAll('.schedule-day-btn');
const scheduleDays = document.querySelectorAll('.schedule-day');

function switchScheduleDay(dayId) {
    // Remove active class from all buttons and days
    scheduleDayBtns.forEach(btn => btn.classList.remove('active'));
    scheduleDays.forEach(day => day.classList.remove('active'));
    
    // Add active class to selected button and day
    const selectedBtn = document.querySelector(`.schedule-day-btn[data-day="${dayId}"]`);
    const selectedDay = document.getElementById(dayId);
    
    if (selectedBtn && selectedDay) {
        selectedBtn.classList.add('active');
        selectedDay.classList.add('active');
    }
}

// Add click event listeners to day buttons
scheduleDayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const dayId = btn.getAttribute('data-day');
        switchScheduleDay(dayId);
    });
});

// ===================================
// CUSTOM CURSOR
// ===================================
if (customCursor && window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });
    
    // Add hover effect to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .trainer-card, .gallery-item, .schedule-item, .schedule-day-btn, .lightbox-close, .lightbox-nav');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            customCursor.classList.add('hover');
        });
        
        el.addEventListener('mouseleave', () => {
            customCursor.classList.remove('hover');
        });
    });
    
    // Keep default cursor visible on desktop
    document.body.style.cursor = 'auto';
}

// ===================================
// MEMBERSHIP CALCULATOR
// ===================================
const durationSelect = document.getElementById('duration');
const trainingSelect = document.getElementById('training');
const totalPriceElement = document.getElementById('totalPrice');
const priceDescriptionElement = document.getElementById('priceDescription');

// Mock pricing data
const basePrices = {
    1: 15000,   // 1 month
    3: 40000,   // 3 months
    6: 70000,   // 6 months
    12: 120000  // 12 months
};

const trainingPrices = {
    none: 0,
    basic: 8000,    // 4 sessions per month
    premium: 15000  // 8 sessions per month
};

const trainingLabels = {
    none: 'без персональных тренировок',
    basic: 'с базовым пакетом (4 тренировки/мес)',
    premium: 'с премиум пакетом (8 тренировок/мес)'
};

const durationLabels = {
    1: '1 месяц',
    3: '3 месяца',
    6: '6 месяцев',
    12: '12 месяцев'
};

function calculatePrice() {
    const duration = parseInt(durationSelect.value);
    const training = trainingSelect.value;
    
    const basePrice = basePrices[duration];
    const trainingPrice = trainingPrices[training];
    
    // Calculate total based on duration for training packages
    let totalTrainingPrice = 0;
    if (training !== 'none') {
        totalTrainingPrice = trainingPrice * duration;
    }
    
    const totalPrice = basePrice + totalTrainingPrice;
    
    // Update display
    totalPriceElement.textContent = totalPrice.toLocaleString('ru-RU') + ' ₸';
    priceDescriptionElement.textContent = `${durationLabels[duration]}, ${trainingLabels[training]}`;
}

// Add event listeners
if (durationSelect && trainingSelect) {
    durationSelect.addEventListener('change', calculatePrice);
    trainingSelect.addEventListener('change', calculatePrice);
    
    // Initial calculation
    calculatePrice();
}

// ===================================
// BOOKING MODAL FUNCTIONALITY
// ===================================
const bookingModal = document.getElementById('bookingModal');
const bookingModalOverlay = document.getElementById('bookingModalOverlay');
const bookingModalClose = document.getElementById('bookingModalClose');
const bookingForm = document.getElementById('bookingForm');
const bookingSuccess = document.getElementById('bookingSuccess');
const bookingError = document.getElementById('bookingError');
const bookingLoading = document.getElementById('bookingLoading');
const bookingReset = document.getElementById('bookingReset');
const bookingRetry = document.getElementById('bookingRetry');

// Modal elements for displaying training info
const bookingTrainingName = document.getElementById('bookingTrainingName');
const bookingTrainingDate = document.getElementById('bookingTrainingDate');
const bookingTrainingTime = document.getElementById('bookingTrainingTime');
const bookingTrainingTrainer = document.getElementById('bookingTrainingTrainer');

// Day name mappings
const dayNames = {
    'monday': 'Понедельник',
    'tuesday': 'Вторник',
    'wednesday': 'Среда',
    'thursday': 'Четверг',
    'friday': 'Пятница',
    'saturday': 'Суббота',
    'sunday': 'Воскресенье'
};

// Function to open booking modal
function openBookingModal(trainingData) {
    // Populate modal with training data
    bookingTrainingName.textContent = trainingData.name;
    bookingTrainingDate.textContent = dayNames[trainingData.day];
    bookingTrainingTime.textContent = trainingData.time;
    bookingTrainingTrainer.textContent = trainingData.trainer;
    
    // Reset form and show form
    bookingForm.reset();
    bookingForm.style.display = 'flex';
    bookingSuccess.style.display = 'none';
    bookingError.style.display = 'none';
    bookingLoading.style.display = 'none';
    
    // Show modal
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close booking modal
function closeBookingModal() {
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Add click event listeners to schedule items
const scheduleItems = document.querySelectorAll('.schedule-item');
scheduleItems.forEach(item => {
    item.addEventListener('click', () => {
        // Get training data from the clicked item
        const time = item.querySelector('.schedule-time').textContent;
        const name = item.querySelector('.schedule-name').textContent;
        const trainer = item.querySelector('.schedule-trainer').textContent;
        
        // Get the current active day
        const activeDay = document.querySelector('.schedule-day.active');
        const dayId = activeDay ? activeDay.id : '';
        
        // Prepare training data
        const trainingData = {
            time: time,
            name: name,
            trainer: trainer.replace('Тренер: ', ''),
            day: dayId
        };
        
        // Open modal with training data
        openBookingModal(trainingData);
    });
    
    // Add keyboard support for schedule items
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});

// Close modal when clicking overlay
if (bookingModalOverlay) {
    bookingModalOverlay.addEventListener('click', closeBookingModal);
}

// Close modal when clicking close button
if (bookingModalClose) {
    bookingModalClose.addEventListener('click', closeBookingModal);
}

// Close modal when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
        closeBookingModal();
    }
});

// Handle form submission
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm(bookingForm)) {
            bookingForm.reportValidity();
            return;
        }
        
        // Show loading state
        bookingForm.style.display = 'none';
        bookingLoading.style.display = 'block';

        const formData = new FormData(bookingForm);

        submitLead({
            source: 'booking',
            name: formData.get('bookingName'),
            phone: formData.get('bookingPhone'),
            planName: bookingTrainingName.textContent,
            planDuration: `${bookingTrainingDate.textContent}, ${bookingTrainingTime.textContent}`,
            comment: `Тренер: ${bookingTrainingTrainer.textContent}`,
        }).then(() => {
            bookingLoading.style.display = 'none';
            bookingSuccess.style.display = 'block';
            bookingSuccess.classList.add('fade-in');
        }).catch(() => {
            bookingLoading.style.display = 'none';
            bookingError.style.display = 'block';
        });
    });
}

// Handle reset button in success message
if (bookingReset) {
    bookingReset.addEventListener('click', closeBookingModal);
}

// Handle retry button in error message
if (bookingRetry) {
    bookingRetry.addEventListener('click', function() {
        bookingError.style.display = 'none';
        bookingForm.style.display = 'flex';
    });
}

// ===================================
// PAYMENT MODAL FUNCTIONALITY
// ===================================
const paymentModal = document.getElementById('paymentModal');
const paymentModalOverlay = document.getElementById('paymentModalOverlay');
const paymentModalClose = document.getElementById('paymentModalClose');
const paymentForm = document.getElementById('paymentForm');
const paymentSuccess = document.getElementById('paymentSuccess');
const paymentError = document.getElementById('paymentError');
const paymentLoading = document.getElementById('paymentLoading');
const paymentReset = document.getElementById('paymentReset');
const paymentRetry = document.getElementById('paymentRetry');

// Modal elements for displaying plan info
const paymentPlanName = document.getElementById('paymentPlanName');
const paymentPlanDuration = document.getElementById('paymentPlanDuration');
const paymentPlanAmount = document.getElementById('paymentPlanAmount');

// Function to open payment modal
function openPaymentModal(planData) {
    // Populate modal with plan data
    paymentPlanName.textContent = planData.name;
    paymentPlanDuration.textContent = planData.duration;
    paymentPlanAmount.textContent = planData.amount;

    // Reset form and show form
    paymentForm.reset();
    paymentForm.style.display = 'flex';
    paymentSuccess.style.display = 'none';
    paymentError.style.display = 'none';
    paymentLoading.style.display = 'none';

    // Show modal
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close payment modal
function closePaymentModal() {
    paymentModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Pricing card "Оплатить онлайн" buttons
document.querySelectorAll('.pricing-pay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.planAmount, 10);
        openPaymentModal({
            name: btn.dataset.planName,
            duration: btn.dataset.planDuration,
            amount: amount.toLocaleString('ru-RU') + ' ₸'
        });
    });
});

// Calculator "Оплатить онлайн" button
const calculatorPayBtn = document.getElementById('calculatorPayBtn');
if (calculatorPayBtn) {
    calculatorPayBtn.addEventListener('click', () => {
        openPaymentModal({
            name: 'Абонемент (калькулятор)',
            duration: priceDescriptionElement.textContent,
            amount: totalPriceElement.textContent
        });
    });
}

// Close modal when clicking overlay
if (paymentModalOverlay) {
    paymentModalOverlay.addEventListener('click', closePaymentModal);
}

// Close modal when clicking close button
if (paymentModalClose) {
    paymentModalClose.addEventListener('click', closePaymentModal);
}

// Close modal when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && paymentModal.classList.contains('active')) {
        closePaymentModal();
    }
});

const PAYMENT_METHOD_LABELS = {
    kaspi: 'Kaspi Pay',
    card: 'Банковская карта',
    cash: 'Наличными при посещении',
};

// Handle form submission
if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm(paymentForm)) {
            paymentForm.reportValidity();
            return;
        }

        // Show loading state
        paymentForm.style.display = 'none';
        paymentLoading.style.display = 'block';

        const formData = new FormData(paymentForm);
        const paymentMethod = formData.get('paymentMethod');

        submitLead({
            source: 'payment',
            name: formData.get('paymentName'),
            phone: formData.get('paymentPhone'),
            email: formData.get('paymentEmail'),
            planName: paymentPlanName.textContent,
            planDuration: paymentPlanDuration.textContent,
            planAmount: paymentPlanAmount.textContent,
            paymentMethod: PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod,
        }).then(() => {
            paymentLoading.style.display = 'none';
            paymentSuccess.style.display = 'block';
            paymentSuccess.classList.add('fade-in');
        }).catch(() => {
            paymentLoading.style.display = 'none';
            paymentError.style.display = 'block';
        });
    });
}

// Handle reset button in success message
if (paymentReset) {
    paymentReset.addEventListener('click', closePaymentModal);
}

// Handle retry button in error message
if (paymentRetry) {
    paymentRetry.addEventListener('click', function() {
        paymentError.style.display = 'none';
        paymentForm.style.display = 'flex';
    });
}

// ===================================
// LIGHTBOX FUNCTIONALITY
// ===================================
const lightbox = document.getElementById('lightbox');
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const galleryItems = document.querySelectorAll('.gallery-item');

let currentImageIndex = 0;
let galleryImages = [];

// Collect all gallery images
function collectGalleryImages() {
    galleryImages = [];
    galleryItems.forEach((item, index) => {
        const src = item.getAttribute('data-src');
        const caption = item.getAttribute('data-caption');
        if (src) {
            galleryImages.push({ src, caption });
        }
    });
}

// Initialize gallery images
collectGalleryImages();

// Function to open lightbox
function openLightbox(index) {
    currentImageIndex = index;
    const imageData = galleryImages[currentImageIndex];
    if (imageData && imageData.src) {
        lightboxImage.src = imageData.src;
        lightboxImage.alt = imageData.caption || 'Gallery image';
        lightboxCaption.textContent = imageData.caption || '';
    }
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Function to close lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Function to update lightbox image
function updateLightboxImage() {
    const imageData = galleryImages[currentImageIndex];
    if (imageData && imageData.src) {
        lightboxImage.src = imageData.src;
        lightboxImage.alt = imageData.caption || 'Gallery image';
        lightboxCaption.textContent = imageData.caption || '';
    }
}

// Function to show next image
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

// Function to show previous image
function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

// Add click event listeners to gallery items
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        openLightbox(index);
    });
    
    // Add keyboard support for gallery items
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(index);
        }
    });
});

// Close lightbox when clicking overlay
if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', closeLightbox);
}

// Close lightbox when clicking close button
if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

// Close lightbox when pressing Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
    if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
        showNextImage();
    }
    if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
        showPrevImage();
    }
});

// Navigation buttons
if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });
    
    // Touch support for mobile
    lightboxNext.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        showNextImage();
    });
}

if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
    
    // Touch support for mobile
    lightboxPrev.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        showPrevImage();
    });
}

// Swipe support for mobile lightbox
let touchStartX = 0;
let touchEndX = 0;

if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - show next image
            showNextImage();
        } else {
            // Swipe right - show previous image
            showPrevImage();
        }
    }
}