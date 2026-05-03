// Custom Cursor
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

document.addEventListener('mousemove', (e) => {
    const { clientX: x, clientY: y } = e;
    
    // Smooth movement for cursor
    cursor.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
    
    // Smooth movement for follower with delay
    follower.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
});

// Hover effect for links
document.querySelectorAll('a, button, .category-card').forEach(link => {
    link.addEventListener('mouseenter', () => {
        follower.style.width = '80px';
        follower.style.height = '80px';
        follower.style.transform += ' translate(-20px, -20px)';
        follower.style.background = 'rgba(212, 175, 55, 0.1)';
    });
    link.addEventListener('mouseleave', () => {
        follower.style.width = '40px';
        follower.style.height = '40px';
        follower.style.background = 'transparent';
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Navbar change background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 5%';
        nav.style.background = 'rgba(255, 255, 255, 0.95)';
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
    } else {
        nav.style.padding = '1.5rem 5%';
        nav.style.background = 'rgba(255, 255, 255, 0.75)';
        nav.style.boxShadow = 'none';
    }
});

// Reveal animations on scroll
const revealItems = document.querySelectorAll('.category-card, .product-card, .section-title, .full-grid-img');

const revealOnScroll = () => {
    revealItems.forEach(item => {
        const itemTop = item.getBoundingClientRect().top;
        const triggerBottom = window.innerHeight * 0.9;

        if (itemTop < triggerBottom) {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }
    });
};

// Set initial styles for reveal
revealItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(50px)';
    item.style.transition = 'all 1s cubic-bezier(0.165, 0.84, 0.44, 1)';
});

// Parallax effect for hero particles
window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    document.querySelectorAll('.floating-particle').forEach((particle, index) => {
        const speed = (index + 1) * 0.2;
        particle.style.transform = `translateY(${scroll * speed}px)`;
    });
    
    // Parallax for banner image
    const parallaxImg = document.querySelector('.parallax-img');
    if (parallaxImg) {
        parallaxImg.style.transform = `translateY(${scroll * 0.1}px)`;
    }
});

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
