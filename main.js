// Custom Cursor
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

document.addEventListener('mousemove', (e) => {
    const { clientX: x, clientY: y } = e;
    cursor.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
    follower.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
});

// Chatbot Toggle
const chatTrigger = document.getElementById('chat-trigger');
const chatWrapper = document.getElementById('chat-wrapper');
const closeChat = document.getElementById('close-chat');

chatTrigger.addEventListener('click', () => {
    chatWrapper.classList.toggle('chat-hidden');
    chatTrigger.style.display = chatWrapper.classList.contains('chat-hidden') ? 'flex' : 'none';
});

closeChat.addEventListener('click', () => {
    chatWrapper.classList.add('chat-hidden');
    chatTrigger.style.display = 'flex';
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
    
    const parallaxImg = document.querySelector('.parallax-img');
    if (parallaxImg) {
        parallaxImg.style.transform = `translateY(${scroll * 0.1}px)`;
    }
});

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ==========================================
// WINGS JEWELLERY DESIGN STUDIO ENGINE
// ==========================================

const customizerState = {
    baseType: 'necklace',
    metalType: 'rose',
    baseShape: 'heart',
    gemstoneType: 'diamond',
    gemstoneCut: 'round',
    gemstoneSize: 12,
    engravingText: '',
    engravingFont: 'cursive',
    charms: [
        { id: 1, type: 'wing', position: 0.5, swingAngle: -8 }
    ]
};

const chainPaths = {
    necklace: 'M 70 70 C 130 280, 370 280, 430 70',
    bracelet: 'M 100 130 C 150 290, 350 290, 400 130',
    anklet: 'M 80 150 C 140 310, 360 310, 420 150'
};

const charmSVGs = {
    wing: `
        <circle cx="0" cy="5" r="4.5" fill="none" stroke="url(#metal-grad-placeholder)" stroke-width="2" />
        <path d="M 0 9.5 C -8 11.5, -15 20.5, -15 29.5 C -15 38.5, -8 44.5, 0 52.5 C 3.5 45.5, 6.5 38.5, 6.5 29.5 C 6.5 20.5, 4.5 11.5, 0 9.5 Z" fill="url(#metal-grad-placeholder)" />
        <path d="M -2.5 15.5 C -7.5 20.5, -9.5 26.5, -9.5 31.5" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
        <path d="M -2.5 22.5 C -6.5 25.5, -7.5 30.5, -7.5 34.5" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
    `,
    heart: `
        <circle cx="0" cy="5" r="4.5" fill="none" stroke="url(#metal-grad-placeholder)" stroke-width="2" />
        <path d="M 0 9.5 C -7 5.5, -13.5 9.5, -13.5 16.5 C -13.5 23.5, -7 30.5, 0 37.5 C 7 30.5, 13.5 23.5, 13.5 16.5 C 13.5 9.5, 7 5.5, 0 9.5 Z" fill="url(#metal-grad-placeholder)" />
        <path d="M -4.5 13.5 C -7 14.5, -9.5 18, -8.5 20.5" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1" />
    `,
    star: `
        <circle cx="0" cy="5" r="4.5" fill="none" stroke="url(#metal-grad-placeholder)" stroke-width="2" />
        <path d="M 0 9.5 L 3.5 19.5 L 13.5 23 L 3.5 26.5 L 0 36.5 L -3.5 26.5 L -13.5 23 L -3.5 19.5 Z" fill="url(#metal-grad-placeholder)" />
        <circle cx="0" cy="23" r="1.8" fill="#ffffff" opacity="0.85" />
    `,
    moon: `
        <circle cx="0" cy="5" r="4.5" fill="none" stroke="url(#metal-grad-placeholder)" stroke-width="2" />
        <path d="M -4.5 10.5 A 12.5 12.5 0 1 0 7.5 23 A 10.5 10.5 0 1 1 -4.5 10.5 Z" fill="url(#metal-grad-placeholder)" />
    `,
    butterfly: `
        <circle cx="0" cy="5" r="4.5" fill="none" stroke="url(#metal-grad-placeholder)" stroke-width="2" />
        <path d="M 0 18.5 C -3.5 13, -10.5 13, -10.5 18.5 C -10.5 23, -6 24, 0 19.5 C 6 24, 10.5 23, 10.5 18.5 C 10.5 13, 3.5 13, 0 18.5 Z M 0 18.5 C -2.5 22, -7 25.5, -7 29 C -7 32.5, -3.5 32.5, 0 28 C 3.5 32.5, 7 32.5, 7 29 C 7 25.5, 2.5 22, 0 18.5 Z" fill="url(#metal-grad-placeholder)" />
        <line x1="0" y1="18.5" x2="-2.5" y2="10.5" stroke="url(#metal-grad-placeholder)" stroke-width="1" />
        <line x1="0" y1="18.5" x2="2.5" y2="10.5" stroke="url(#metal-grad-placeholder)" stroke-width="1" />
        <circle cx="-2.5" cy="10.5" r="1" fill="url(#metal-grad-placeholder)" />
        <circle cx="2.5" cy="10.5" r="1" fill="url(#metal-grad-placeholder)" />
    `,
    infinity: `
        <circle cx="0" cy="5" r="4.5" fill="none" stroke="url(#metal-grad-placeholder)" stroke-width="2" />
        <path d="M -7 12.5 C -11.5 8, -15 12.5, -8 18 C -1.5 23.5, 1.5 8, 8 13.5 C 15 19, 11.5 23.5, 8 18 C 1.5 12.5, -1.5 23.5, -7 12.5 Z" fill="none" stroke="url(#metal-grad-placeholder)" stroke-width="2.5" stroke-linecap="round" />
    `
};

const presets = {
    wings: {
        baseType: 'necklace',
        metalType: 'rose',
        baseShape: 'none',
        gemstoneType: 'diamond',
        gemstoneCut: 'round',
        gemstoneSize: 12,
        engravingText: '',
        engravingFont: 'cursive',
        charms: [
            { id: 1, type: 'wing', position: 0.5, swingAngle: -8 }
        ]
    },
    lunar: {
        baseType: 'necklace',
        metalType: 'silver',
        baseShape: 'none',
        gemstoneType: 'sapphire',
        gemstoneCut: 'pear',
        gemstoneSize: 11,
        engravingText: '',
        engravingFont: 'cursive',
        charms: [
            { id: 1, type: 'moon', position: 0.4, swingAngle: 5 },
            { id: 2, type: 'star', position: 0.6, swingAngle: -3 }
        ]
    },
    eternal: {
        baseType: 'necklace',
        metalType: 'gold',
        baseShape: 'heart',
        gemstoneType: 'ruby',
        gemstoneCut: 'heart',
        gemstoneSize: 9,
        engravingText: 'FOREVER',
        engravingFont: 'serif',
        charms: [
            { id: 1, type: 'heart', position: 0.32, swingAngle: -10 }
        ]
    },
    minimal: {
        baseType: 'necklace',
        metalType: 'silver',
        baseShape: 'none',
        gemstoneType: 'diamond',
        gemstoneCut: 'round',
        gemstoneSize: 10,
        engravingText: '',
        engravingFont: 'sans',
        charms: []
    }
};

const fontFamilies = {
    cursive: "'Alex Brush', cursive",
    serif: "'Playfair Display', serif",
    sans: "'Outfit', sans-serif"
};

// SVG DOM elements
const chainPathEl = document.getElementById('chain-path');
const chainHighlightEl = document.getElementById('chain-highlight');
const pendantBaseGroup = document.getElementById('pendant-base-group');
const engravingGroup = document.getElementById('engraving-group');
const charmsGroup = document.getElementById('charms-group');
const gemstonesGroup = document.getElementById('gemstones-group');
const bailGroup = document.getElementById('bail-group');
const canvasSparkle = document.getElementById('sparkle-effect');

// Helper: Calculate point along the chain path
function getPointOnChain(position) {
    if (!chainPathEl) return { x: 250, y: 250 };
    try {
        const pathLength = chainPathEl.getTotalLength();
        return chainPathEl.getPointAtLength(position * pathLength);
    } catch (e) {
        return { x: 250, y: 220 };
    }
}

// Render dynamic elements
function updateJewelryRender() {
    if (!chainPathEl) return;

    const metalGrad = `url(#${customizerState.metalType}-metal)`;
    const dPath = chainPaths[customizerState.baseType];

    // 1. Update Chain Path & Highlights
    chainPathEl.setAttribute('d', dPath);
    chainHighlightEl.setAttribute('d', dPath);
    chainPathEl.setAttribute('stroke', metalGrad);

    // Update highlights based on style (we keep classic look here or adapt)
    chainHighlightEl.setAttribute('stroke-dasharray', '2 8');

    // Update bail rings
    const bailRing1 = document.getElementById('bail-ring-1');
    const bailRing2 = document.getElementById('bail-ring-2');
    
    const midPoint = getPointOnChain(0.5);

    if (bailRing1 && bailRing2 && bailGroup) {
        if (customizerState.baseShape === 'none' && customizerState.gemstoneType === 'none' && customizerState.charms.length === 0) {
            bailGroup.style.display = 'none';
        } else {
            bailGroup.style.display = 'block';
            bailRing1.setAttribute('cx', midPoint.x);
            bailRing1.setAttribute('cy', midPoint.y + 22);
            bailRing1.setAttribute('stroke', metalGrad);

            bailRing2.setAttribute('cx', midPoint.x);
            bailRing2.setAttribute('cy', midPoint.y + 31);
            bailRing2.setAttribute('stroke', metalGrad);
        }
    }

    // 2. Render Pendant Base
    pendantBaseGroup.innerHTML = '';
    
    if (customizerState.baseShape === 'round') {
        const cy = midPoint.y + 72;
        pendantBaseGroup.innerHTML = `
            <circle cx="${midPoint.x}" cy="${midPoint.y + 22}" r="11" fill="none" stroke="${metalGrad}" stroke-width="2.5" />
            <circle cx="${midPoint.x}" cy="${cy}" r="38" fill="${metalGrad}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
            <circle cx="${midPoint.x}" cy="${cy}" r="33" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1" stroke-dasharray="2 3" />
        `;
    } else if (customizerState.baseShape === 'heart') {
        const cy = midPoint.y + 74;
        pendantBaseGroup.innerHTML = `
            <circle cx="${midPoint.x}" cy="${midPoint.y + 22}" r="11" fill="none" stroke="${metalGrad}" stroke-width="2.5" />
            <path d="M ${midPoint.x} ${cy - 16} C ${midPoint.x - 27} ${cy - 44}, ${midPoint.x - 37} ${cy - 12}, ${midPoint.x} ${cy + 25} C ${midPoint.x + 37} ${cy - 12}, ${midPoint.x + 27} ${cy - 44}, ${midPoint.x} ${cy - 16} Z" fill="${metalGrad}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
            <path d="M ${midPoint.x} ${cy - 10} C ${midPoint.x - 21} ${cy - 33}, ${midPoint.x - 28} ${cy - 8}, ${midPoint.x} ${cy + 19} C ${midPoint.x + 28} ${cy - 8}, ${midPoint.x + 21} ${cy - 33}, ${midPoint.x} ${cy - 10} Z" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" stroke-dasharray="2 2" />
        `;
    } else if (customizerState.baseShape === 'bar') {
        pendantBaseGroup.innerHTML = `
            <circle cx="${midPoint.x}" cy="${midPoint.y + 22}" r="11" fill="none" stroke="${metalGrad}" stroke-width="2.5" />
            <rect x="${midPoint.x - 14}" y="${midPoint.y + 30}" width="28" height="78" rx="6" ry="6" fill="${metalGrad}" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
            <rect x="${midPoint.x - 10}" y="${midPoint.y + 34}" width="20" height="70" rx="4" ry="4" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" stroke-dasharray="2 3" />
        `;
    }

    // 3. Render Gemstones
    gemstonesGroup.innerHTML = '';
    const gemType = customizerState.gemstoneType;
    const R = customizerState.gemstoneSize / 2;

    if (gemType !== 'none') {
        let gcx = midPoint.x;
        let gcy = midPoint.y + 48; // Solitaire mode

        if (customizerState.baseShape === 'round') {
            gcy = midPoint.y + 72;
        } else if (customizerState.baseShape === 'heart') {
            gcy = midPoint.y + 66;
        } else if (customizerState.baseShape === 'bar') {
            gcy = midPoint.y + 64;
        }

        let gemHTML = '';
        const prongOffset = R * 0.95;
        const metalGradText = metalGrad;

        // Solitaire connector if no base
        if (customizerState.baseShape === 'none') {
            gemHTML += `<circle cx="${midPoint.x}" cy="${midPoint.y + 22}" r="11" fill="none" stroke="${metalGrad}" stroke-width="2.5" />`;
            gemHTML += `<line x1="${midPoint.x}" y1="${midPoint.y + 33}" x2="${midPoint.x}" y2="${gcy - R}" stroke="${metalGrad}" stroke-width="3" />`;
        }

        // Gem cut rendering
        if (customizerState.gemstoneCut === 'round') {
            gemHTML += `<circle cx="${gcx}" cy="${gcy}" r="${R}" fill="url(#gem-${gemType})" filter="url(#gem-glow)" />`;
            gemHTML += `<circle cx="${gcx}" cy="${gcy}" r="${R * 0.5}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="0.8" />`;
            gemHTML += `<path d="M ${gcx} ${gcy - R} L ${gcx} ${gcy - R * 0.5} M ${gcx} ${gcy + R} L ${gcx} ${gcy + R * 0.5} M ${gcx - R} ${gcy} L ${gcx - R * 0.5} ${gcy} M ${gcx + R} ${gcy} L ${gcx + R * 0.5} ${gcy} M ${gcx - R * 0.7} ${gcy - R * 0.7} L ${gcx - R * 0.35} ${gcy - R * 0.35} M ${gcx + R * 0.7} ${gcy - R * 0.7} L ${gcx + R * 0.35} ${gcy - R * 0.35} M ${gcx - R * 0.7} ${gcy + R * 0.7} L ${gcx - R * 0.35} ${gcy + R * 0.35} M ${gcx + R * 0.7} ${gcy + R * 0.7} L ${gcx + R * 0.35} ${gcy + R * 0.35}" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" />`;
        } else if (customizerState.gemstoneCut === 'heart') {
            const heartPath = `M ${gcx} ${gcy - R * 0.7} C ${gcx - R * 1.25} ${gcy - R * 1.55}, ${gcx - R * 1.7} ${gcy - R * 0.3}, ${gcx} ${gcy + R * 1.15} C ${gcx + R * 1.7} ${gcy - R * 0.3}, ${gcx + R * 1.25} ${gcy - R * 1.55}, ${gcx} ${gcy - R * 0.7} Z`;
            gemHTML += `<path d="${heartPath}" fill="url(#gem-${gemType})" filter="url(#gem-glow)" />`;
            gemHTML += `<path d="M ${gcx} ${gcy - R * 0.7} L ${gcx} ${gcy + R * 1.15} M ${gcx - R * 0.75} ${gcy - R * 0.8} L ${gcx} ${gcy} M ${gcx + R * 0.75} ${gcy - R * 0.8} L ${gcx} ${gcy} M ${gcx - R * 0.8} ${gcy + R * 0.15} L ${gcx} ${gcy} M ${gcx + R * 0.8} ${gcy + R * 0.15} L ${gcx} ${gcy} M ${gcx - R * 0.3} ${gcy - R * 0.25} L ${gcx} ${gcy} M ${gcx + R * 0.3} ${gcy - R * 0.25} L ${gcx} ${gcy}" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" fill="none" />`;
        } else if (customizerState.gemstoneCut === 'pear') {
            const pearPath = `M ${gcx} ${gcy - R * 1.35} C ${gcx - R * 1.15} ${gcy - R * 0.3}, ${gcx - R * 1.15} ${gcy + R * 0.75}, ${gcx} ${gcy + R * 1.15} C ${gcx + R * 1.15} ${gcy + R * 0.75}, ${gcx + R * 1.15} ${gcy - R * 0.3}, ${gcx} ${gcy - R * 1.35} Z`;
            gemHTML += `<path d="${pearPath}" fill="url(#gem-${gemType})" filter="url(#gem-glow)" />`;
            gemHTML += `<path d="M ${gcx} ${gcy - R * 1.35} L ${gcx} ${gcy + R * 1.15} M ${gcx - R * 0.7} ${gcy} L ${gcx} ${gcy - R * 0.3} M ${gcx + R * 0.7} ${gcy} L ${gcx} ${gcy - R * 0.3} M ${gcx - R * 0.6} ${gcy + R * 0.55} L ${gcx} ${gcy} M ${gcx + R * 0.6} ${gcy + R * 0.55} L ${gcx} ${gcy} M ${gcx} ${gcy - R * 0.3} L ${gcx} ${gcy}" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" fill="none" />`;
        } else if (customizerState.gemstoneCut === 'emerald') {
            const w = R * 1.5;
            const h = R * 2.1;
            const emeraldPath = `M ${gcx - w * 0.35} ${gcy - h * 0.5} L ${gcx + w * 0.35} ${gcy - h * 0.5} L ${gcx + w * 0.5} ${gcy - h * 0.35} L ${gcx + w * 0.5} ${gcy + h * 0.35} L ${gcx + w * 0.35} ${gcy + h * 0.5} L ${gcx - w * 0.35} ${gcy + h * 0.5} L ${gcx - w * 0.5} ${gcy + h * 0.35} L ${gcx - w * 0.5} ${gcy - h * 0.35} Z`;
            gemHTML += `<path d="${emeraldPath}" fill="url(#gem-${gemType})" filter="url(#gem-glow)" />`;
            const w2 = w * 0.65;
            const h2 = h * 0.65;
            gemHTML += `<path d="M ${gcx - w2 * 0.35} ${gcy - h2 * 0.5} L ${gcx + w2 * 0.35} ${gcy - h2 * 0.5} L ${gcx + w2 * 0.5} ${gcy - h2 * 0.35} L ${gcx + w2 * 0.5} ${gcy + h2 * 0.35} L ${gcx + w2 * 0.35} ${gcy + h2 * 0.5} L ${gcx - w2 * 0.35} ${gcy + h2 * 0.5} L ${gcx - w2 * 0.5} ${gcy + h2 * 0.35} L ${gcx - w2 * 0.5} ${gcy - h2 * 0.35} Z" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" />`;
            gemHTML += `<path d="M ${gcx - w * 0.35} ${gcy - h * 0.5} L ${gcx - w2 * 0.35} ${gcy - h2 * 0.5} M ${gcx + w * 0.35} ${gcy - h * 0.5} L ${gcx + w2 * 0.35} ${gcy - h2 * 0.5} M ${gcx + w * 0.5} ${gcy + h * 0.35} L ${gcx + w2 * 0.5} ${gcy + h2 * 0.35} M ${gcx - w * 0.5} ${gcy + h * 0.35} L ${gcx - w2 * 0.5} ${gcy - h2 * 0.35} M ${gcx - w * 0.5} ${gcy - h * 0.35} L ${gcx - w2 * 0.5} ${gcy - h2 * 0.35} M ${gcx + w * 0.5} ${gcy - h * 0.35} L ${gcx + w2 * 0.5} ${gcy - h2 * 0.35} M ${gcx + w * 0.35} ${gcy + h * 0.5} L ${gcx + w2 * 0.35} ${gcy + h2 * 0.5} M ${gcx - w * 0.35} ${gcy + h * 0.5} L ${gcx - w2 * 0.35} ${gcy + h2 * 0.5}" stroke="rgba(255,255,255,0.45)" stroke-width="0.8" />`;
        }

        // Metal Setting Prongs
        gemHTML += `
            <circle cx="${gcx - prongOffset}" cy="${gcy - prongOffset}" r="2.2" fill="${metalGradText}" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
            <circle cx="${gcx + prongOffset}" cy="${gcy - prongOffset}" r="2.2" fill="${metalGradText}" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
            <circle cx="${gcx - prongOffset}" cy="${gcy + prongOffset}" r="2.2" fill="${metalGradText}" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
            <circle cx="${gcx + prongOffset}" cy="${gcy + prongOffset}" r="2.2" fill="${metalGradText}" stroke="rgba(255,255,255,0.3)" stroke-width="0.5" />
        `;

        gemstonesGroup.innerHTML = gemHTML;
    }

    // 4. Render Engraving
    engravingGroup.innerHTML = '';
    const engText = customizerState.engravingText.trim().toUpperCase();

    if (engText && customizerState.baseShape !== 'none') {
        const textFont = fontFamilies[customizerState.engravingFont];
        const textColor = (customizerState.metalType === 'silver') ? 'rgba(30, 36, 42, 0.6)' : 'rgba(50, 38, 28, 0.65)';
        
        let egcx = midPoint.x;
        let egcy = midPoint.y + 44;
        let fontSz = '15px';
        let rotString = '';

        if (customizerState.baseShape === 'round') {
            egcy = (gemType !== 'none') ? midPoint.y + 96 : midPoint.y + 76;
            fontSz = '14px';
        } else if (customizerState.baseShape === 'heart') {
            egcy = (gemType !== 'none') ? midPoint.y + 88 : midPoint.y + 78;
            fontSz = '13px';
        } else if (customizerState.baseShape === 'bar') {
            egcy = (gemType !== 'none') ? midPoint.y + 92 : midPoint.y + 74;
            fontSz = '10px';
            rotString = `transform="rotate(-90, ${egcx}, ${egcy})"`;
            if (gemType !== 'none') {
                rotString = ''; // Horizontal when gem is present
                fontSz = '8.5px';
            }
        }

        engravingGroup.innerHTML = `
            <text x="${egcx}" y="${egcy}" 
                  fill="${textColor}" 
                  font-family="${textFont}" 
                  font-size="${fontSz}" 
                  font-weight="bold"
                  text-anchor="middle" 
                  dominant-baseline="middle"
                  letter-spacing="1.5"
                  ${rotString}>
                  ${engText}
            </text>
        `;
    }

    // 5. Render Charms
    charmsGroup.innerHTML = '';
    let charmsHTML = '';

    customizerState.charms.forEach(charm => {
        const pt = getPointOnChain(charm.position);
        let charmTemplate = charmSVGs[charm.type];
        // Inject gradient
        charmTemplate = charmTemplate.replace(/url\(#metal-grad-placeholder\)/g, metalGrad);

        charmsHTML += `
            <g class="charm-element" transform="translate(${pt.x}, ${pt.y}) rotate(${charm.swingAngle}) scale(0.72)" filter="url(#shadow)">
                ${charmTemplate}
            </g>
        `;
    });

    charmsGroup.innerHTML = charmsHTML;

    // 6. Update Price
    calculatePrice();
}

// Calculate customizer price
function calculatePrice() {
    let basePrice = 29.0;
    let additionsPrice = 0.0;

    // Metal upgrades
    if (customizerState.metalType === 'gold') additionsPrice += 15.0;
    else if (customizerState.metalType === 'rose') additionsPrice += 18.0;

    // Base type adjustments
    if (customizerState.baseType === 'bracelet') additionsPrice -= 5.0;
    else if (customizerState.baseType === 'anklet') additionsPrice -= 2.0;

    // Pendant shape upgrade
    if (customizerState.baseShape !== 'none') additionsPrice += 10.0;

    // Gemstones pricing
    const gemType = customizerState.gemstoneType;
    if (gemType !== 'none') {
        const gemOption = document.querySelector(`.gem-option[data-value="${gemType}"]`);
        if (gemOption) {
            const gemCost = parseFloat(gemOption.dataset.price || 0);
            additionsPrice += gemCost;
            
            // Size factor
            if (customizerState.gemstoneSize > 8) {
                additionsPrice += (customizerState.gemstoneSize - 8) * 1.5;
            }
        }
    }

    // Charms pricing
    additionsPrice += customizerState.charms.length * 8.0;

    // Engraving pricing
    if (customizerState.engravingText.trim().length > 0 && customizerState.baseShape !== 'none') {
        additionsPrice += 6.0;
    }

    const total = basePrice + additionsPrice;

    // Update Summary DOM
    const basePriceEl = document.getElementById('summary-base-price');
    const additionsPriceEl = document.getElementById('summary-additions-price');
    const totalPriceEl = document.getElementById('summary-total-price');

    if (basePriceEl) basePriceEl.textContent = `$${basePrice.toFixed(2)}`;
    if (additionsPriceEl) additionsPriceEl.textContent = `$${additionsPrice.toFixed(2)}`;
    if (totalPriceEl) totalPriceEl.textContent = `$${total.toFixed(2)}`;
}

// Rebuild active charms UI panel list
function rebuildActiveCharmsList() {
    const container = document.getElementById('active-charms-container');
    if (!container) return;

    if (customizerState.charms.length === 0) {
        container.innerHTML = `
            <h4>Active Charms & Placement</h4>
            <div class="no-charms-msg">No charms added yet. Click "+" above to start.</div>
        `;
        return;
    }

    let html = '<h4>Active Charms & Placement</h4>';
    
    customizerState.charms.forEach(charm => {
        let iconClass = 'fa-feather-pointed';
        let name = 'Angel Wing';

        if (charm.type === 'heart') { name = 'Tiny Heart'; iconClass = 'fa-heart'; }
        else if (charm.type === 'star') { name = 'Star'; iconClass = 'fa-star'; }
        else if (charm.type === 'moon') { name = 'Crescent Moon'; iconClass = 'fa-moon'; }
        else if (charm.type === 'butterfly') { name = 'Butterfly'; iconClass = 'fa-feather'; }
        else if (charm.type === 'infinity') { name = 'Infinity'; iconClass = 'fa-infinity'; }

        html += `
            <div class="active-charm-row" data-id="${charm.id}">
                <div class="active-charm-info">
                    <i class="fa-solid ${iconClass}"></i>
                    <span>${name}</span>
                </div>
                <input type="range" class="active-charm-slider" min="0.08" max="0.92" step="0.01" value="${charm.position}">
                <button class="active-charm-delete"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        `;
    });

    container.innerHTML = html;

    // Event bindings
    container.querySelectorAll('.active-charm-row').forEach(row => {
        const id = parseInt(row.dataset.id);
        const slider = row.querySelector('.active-charm-slider');
        const delBtn = row.querySelector('.active-charm-delete');

        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const charm = customizerState.charms.find(c => c.id === id);
            if (charm) {
                charm.position = val;
                updateJewelryRender();
            }
        });

        delBtn.addEventListener('click', () => {
            customizerState.charms = customizerState.charms.filter(c => c.id !== id);
            updateJewelryRender();
            rebuildActiveCharmsList();
            triggerSparkle(row.getBoundingClientRect().left, row.getBoundingClientRect().top);
        });
    });
}

// Sparkle animation
function triggerSparkle(x, y) {
    if (!canvasSparkle) return;
    
    const rect = document.getElementById('canvas-container').getBoundingClientRect();
    let left = 250;
    let top = 250;
    
    if (x && y) {
        left = x - rect.left;
        top = y - rect.top;
    } else {
        const midPoint = getPointOnChain(0.5);
        left = midPoint.x;
        top = midPoint.y + 60;
    }

    canvasSparkle.style.left = `${left - 15}px`;
    canvasSparkle.style.top = `${top - 15}px`;
    canvasSparkle.style.opacity = '1';
    canvasSparkle.style.transform = 'scale(0)';
    canvasSparkle.style.transition = 'none';

    setTimeout(() => {
        canvasSparkle.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
        canvasSparkle.style.transform = 'scale(3.5)';
        canvasSparkle.style.opacity = '0';
    }, 50);
}

// Sync UI inputs with Customizer State
function syncUIWithState() {
    // 1. Base Select
    document.querySelectorAll('#base-type-select button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === customizerState.baseType);
    });

    // 2. Metal Select
    document.querySelectorAll('#metal-select .metal-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.value === customizerState.metalType);
    });

    // 3. Base Shape Select
    document.querySelectorAll('#base-shape-select button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === customizerState.baseShape);
    });

    // 4. Gemstone Select
    document.querySelectorAll('#gem-type-select .gem-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.value === customizerState.gemstoneType);
    });

    const cutWrapper = document.getElementById('gem-cut-wrapper');
    const sizeWrapper = document.getElementById('gem-size-wrapper');
    if (cutWrapper && sizeWrapper) {
        const display = (customizerState.gemstoneType === 'none') ? 'none' : 'block';
        cutWrapper.style.display = display;
        sizeWrapper.style.display = display;
    }

    // 5. Gemstone Cut Select
    document.querySelectorAll('#gem-cut-select button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === customizerState.gemstoneCut);
    });

    // 6. Gemstone size slider
    const gemSlider = document.getElementById('gem-size-slider');
    const gemValueSpan = document.getElementById('gem-size-value');
    if (gemSlider && gemValueSpan) {
        gemSlider.value = customizerState.gemstoneSize;
        gemValueSpan.textContent = `Medium (${customizerState.gemstoneSize}mm)`;
    }

    // 7. Engraving input
    const engInput = document.getElementById('engraving-input');
    const engCount = document.getElementById('engraving-char-count');
    if (engInput && engCount) {
        engInput.value = customizerState.engravingText;
        engCount.textContent = customizerState.engravingText.length;
    }

    // 8. Engraving Font
    document.querySelectorAll('#engraving-font-select .font-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.value === customizerState.engravingFont);
    });

    // 9. Rebuild active charms
    rebuildActiveCharmsList();
}

// Bind Customizer Events
function initCustomizer() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            const targetPane = document.getElementById(`${btn.dataset.tab}-tab`);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // Preset cards selection
    document.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
            const pKey = card.dataset.preset;
            const template = presets[pKey];
            if (template) {
                document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                // Clone state values
                customizerState.baseType = template.baseType;
                customizerState.metalType = template.metalType;
                customizerState.baseShape = template.baseShape;
                customizerState.gemstoneType = template.gemstoneType;
                customizerState.gemstoneCut = template.gemstoneCut;
                customizerState.gemstoneSize = template.gemstoneSize;
                customizerState.engravingText = template.engravingText;
                customizerState.engravingFont = template.engravingFont;
                customizerState.charms = JSON.parse(JSON.stringify(template.charms));

                syncUIWithState();
                updateJewelryRender();
                triggerSparkle();
            }
        });
    });

    // Base Type select
    document.querySelectorAll('#base-type-select button').forEach(btn => {
        btn.addEventListener('click', () => {
            customizerState.baseType = btn.dataset.value;
            if (customizerState.baseType !== 'necklace' && customizerState.baseShape === 'bar') {
                customizerState.baseShape = 'round';
            }
            syncUIWithState();
            updateJewelryRender();
        });
    });

    // Metal Select
    document.querySelectorAll('#metal-select .metal-option').forEach(opt => {
        opt.addEventListener('click', () => {
            customizerState.metalType = opt.dataset.value;
            syncUIWithState();
            updateJewelryRender();
            triggerSparkle();
        });
    });

    // Base Shape Select
    document.querySelectorAll('#base-shape-select button').forEach(btn => {
        btn.addEventListener('click', () => {
            customizerState.baseShape = btn.dataset.value;
            syncUIWithState();
            updateJewelryRender();
        });
    });

    // Gemstone Type Select
    document.querySelectorAll('#gem-type-select .gem-option').forEach(opt => {
        opt.addEventListener('click', () => {
            customizerState.gemstoneType = opt.dataset.value;
            syncUIWithState();
            updateJewelryRender();
            triggerSparkle();
        });
    });

    // Gemstone Cut Select
    document.querySelectorAll('#gem-cut-select button').forEach(btn => {
        btn.addEventListener('click', () => {
            customizerState.gemstoneCut = btn.dataset.value;
            syncUIWithState();
            updateJewelryRender();
        });
    });

    // Gemstone Size Slider
    const gemSlider = document.getElementById('gem-size-slider');
    if (gemSlider) {
        gemSlider.addEventListener('input', (e) => {
            customizerState.gemstoneSize = parseInt(e.target.value);
            document.getElementById('gem-size-value').textContent = `Medium (${customizerState.gemstoneSize}mm)`;
            updateJewelryRender();
        });
    }

    // Engraving Input
    const engInput = document.getElementById('engraving-input');
    if (engInput) {
        engInput.addEventListener('input', (e) => {
            customizerState.engravingText = e.target.value;
            document.getElementById('engraving-char-count').textContent = e.target.value.length;
            updateJewelryRender();
        });
    }

    // Engraving Font Style select
    document.querySelectorAll('#engraving-font-select .font-option').forEach(opt => {
        opt.addEventListener('click', () => {
            customizerState.engravingFont = opt.dataset.value;
            syncUIWithState();
            updateJewelryRender();
        });
    });

    // Add Charm grid items
    document.querySelectorAll('.charm-item').forEach(item => {
        const addBtn = item.querySelector('.charm-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (customizerState.charms.length >= 6) {
                    alert('Design Studio Note: You can add up to 6 charms to a single design to ensure premium aesthetic balance.');
                    return;
                }

                const type = item.dataset.charm;
                const newId = customizerState.charms.length > 0 
                    ? Math.max(...customizerState.charms.map(c => c.id)) + 1 
                    : 1;

                let pos = 0.25;
                if (customizerState.charms.length === 1) pos = 0.75;
                else if (customizerState.charms.length === 2) pos = 0.35;
                else if (customizerState.charms.length === 3) pos = 0.65;
                else if (customizerState.charms.length === 4) pos = 0.15;
                else if (customizerState.charms.length === 5) pos = 0.85;

                const swing = Math.floor(Math.random() * 20) - 10;

                customizerState.charms.push({
                    id: newId,
                    type: type,
                    position: pos,
                    swingAngle: swing
                });

                updateJewelryRender();
                rebuildActiveCharmsList();
                triggerSparkle();
            });
        }
    });

    // Wishlist save button
    const saveBtn = document.getElementById('save-design');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            triggerSparkle();
            alert('Your bespoke Wings layout design has been saved to your account!');
        });
    }

    // Add to cart button -> Opens Bespoke Checkout modal
    const addToCartBtn = document.getElementById('add-to-cart-design');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            triggerSparkle();
            const rect = addToCartBtn.getBoundingClientRect();
            triggerSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            openCheckout();
        });
    }

    // Initial load sync, draw, and display reviews
    syncUIWithState();
    updateJewelryRender();
    displayReviews();
    checkLowStockAlerts();
}

// ==========================================
// E-COMMERCE HUB EXTENSION SYSTEM (API INTERGRATION)
// ==========================================

const BACKEND_URL = 'http://localhost:5000';
let isLiveBackend = false;
let currentUser = null;
let currentToken = null;
let liveProducts = [];
let pendingLiveReviews = [];

// State Databases (Mock fallback & state cache)
const ECommerceDB = {
    reviews: [
        { id: 1, user: "Elena Park", rating: 5, comment: "Absolutely breathtaking! The Rose Gold Wings of Elegance pendant is extremely light-weight and sparkles with true Korean sophistication.", isApproved: true },
        { id: 2, user: "Ji-Woo Kim", rating: 5, comment: "I customized a Moon pendant in pure Silver with a teardrop sapphire. The design studio was so fluid and easy to use. INSANE detail!", isApproved: true }
    ],
    coupons: [
        { code: "WINGS50", type: "flat", value: 50.0 },
        { code: "WELCOME10", type: "percent", value: 10.0 }
    ],
    orders: {},
    loyalty: { points: 1500, tier: "Gold" }, // Mock loyalty
    activeCoupon: null,
    stockThreshold: 5,
    catalogStock: {
        "Butterfly Whisper Necklace": 4, // low stock!
        "Tiny Heart Bracelet": 12,
        "Butterfly Charm Anklet": 8
    }
};

// Database Status Indicator Sync
function updateConnectionStatusUI(live) {
    const badges = [
        { id: 'auth-connection-badge', dot: 'auth-connection-dot', text: 'auth-connection-text' },
        { id: 'admin-connection-badge', dot: 'admin-connection-dot', text: 'admin-connection-text' },
        { id: 'checkout-connection-badge', dot: 'checkout-connection-dot', text: 'checkout-connection-text' }
    ];
    
    badges.forEach(b => {
        const badgeEl = document.getElementById(b.id);
        const dotEl = document.getElementById(b.dot);
        const textEl = document.getElementById(b.text);
        
        if (badgeEl && dotEl && textEl) {
            if (live) {
                badgeEl.className = 'connection-status-badge live';
                dotEl.className = 'live-indicator-dot live';
                textEl.textContent = 'Database: Live (Connected)';
            } else {
                badgeEl.className = 'connection-status-badge mock';
                dotEl.className = 'live-indicator-dot mock';
                textEl.textContent = 'Database: Offline (Mock Mode)';
            }
        }
    });
}

// Check live backend server status
async function checkBackendConnection() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        
        const res = await fetch(`${BACKEND_URL}/`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
            isLiveBackend = true;
            console.log('Wings Jewellers Live Database Mode Connected.');
            updateConnectionStatusUI(true);
            
            // Auto-load token profile
            const savedToken = localStorage.getItem('wings_token');
            if (savedToken) {
                await loadUserProfile(savedToken);
            }
            
            await syncLiveReviews();
            await syncAdminDashboard();
        } else {
            throw new Error('Unresponsive');
        }
    } catch (e) {
        isLiveBackend = false;
        console.log('Wings Jewellers Offline Mock Sandbox Active.');
        updateConnectionStatusUI(false);
    }
}

// Fetch user profile from live database
async function loadUserProfile(token) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.data;
            currentToken = token;
            updateUserNavUI(true);
            await syncLoyaltyPoints(); // Fetch loyalty points
        } else {
            localStorage.removeItem('wings_token');
            currentUser = null;
            currentToken = null;
            updateUserNavUI(false);
        }
    } catch (e) {
        console.error('Error fetching live user profile:', e);
    }
}

// Fetch Loyalty Points
async function syncLoyaltyPoints() {
    let points = 0;
    if (isLiveBackend && currentUser) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/enhancements/loyalty/points`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await res.json();
            if (data.success) {
                points = data.data.points;
            }
        } catch (e) { console.error('Error fetching loyalty points:', e); }
    } else {
        points = ECommerceDB.loyalty.points;
    }
    const display = document.getElementById('loyalty-points-display');
    if (display) display.textContent = points;
}

// Redeem Loyalty Points
document.getElementById('redeem-points-btn')?.addEventListener('click', async () => {
    const msgEl = document.getElementById('redeem-msg');
    if (!msgEl) return;
    
    msgEl.style.display = 'block';
    if (isLiveBackend) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/enhancements/loyalty/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify({ pointsToRedeem: 100 })
            });
            const data = await res.json();
            if (data.success) {
                msgEl.textContent = `Success! Promo Code generated: ${data.data.discountCode}`;
                msgEl.style.color = '#38a169';
                syncLoyaltyPoints();
            } else {
                msgEl.textContent = `Error: ${data.message}`;
                msgEl.style.color = '#e53e3e';
            }
        } catch (e) {
            msgEl.textContent = 'Server error during redemption.';
            msgEl.style.color = '#e53e3e';
        }
    } else {
        if (ECommerceDB.loyalty.points >= 100) {
            ECommerceDB.loyalty.points -= 100;
            syncLoyaltyPoints();
            const code = `LOYALTY-100-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
            ECommerceDB.coupons.push({ code, type: 'flat', value: 10 });
            msgEl.textContent = `Success! Mock Promo Code generated: ${code}`;
            msgEl.style.color = '#38a169';
        } else {
            msgEl.textContent = 'Insufficient points for redemption.';
            msgEl.style.color = '#e53e3e';
        }
    }
});

// Update navbar user portal display
function updateUserNavUI(loggedIn) {
    const userDisplay = document.getElementById('user-display-name');
    const authNavIcon = document.getElementById('auth-nav-icon');
    
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const profileDetails = document.getElementById('auth-profile-details');
    const tabs = document.getElementById('auth-modal-tabs');
    
    if (loggedIn && currentUser) {
        if (userDisplay) {
            userDisplay.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
        }
        if (authNavIcon) {
            authNavIcon.innerHTML = '<i class="fa-solid fa-circle-user" style="color: var(--accent-gold); font-size: 1.25rem;"></i>';
        }
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (tabs) tabs.style.display = 'none';
        
        if (profileDetails) {
            profileDetails.style.display = 'block';
            document.getElementById('profile-user-name').textContent = currentUser.name;
            document.getElementById('profile-user-email').textContent = `${currentUser.email} (${currentUser.role.toUpperCase()})`;
        }
    } else {
        if (userDisplay) userDisplay.textContent = '';
        if (authNavIcon) authNavIcon.innerHTML = '<i class="fa-solid fa-user"></i>';
        
        if (tabs) tabs.style.display = 'flex';
        
        const btnLogin = document.getElementById('tab-btn-login');
        const btnRegister = document.getElementById('tab-btn-register');
        if (btnLogin) btnLogin.classList.add('active');
        if (btnRegister) btnRegister.classList.remove('active');
        
        if (loginForm) {
            loginForm.classList.add('active');
            loginForm.style.display = 'block';
        }
        if (registerForm) {
            registerForm.classList.remove('active');
            registerForm.style.display = 'none';
        }
        if (profileDetails) profileDetails.style.display = 'none';
    }
}

// Sync reviews from live MongoDB
async function syncLiveReviews() {
    if (!isLiveBackend) return;
    try {
        const resProd = await fetch(`${BACKEND_URL}/api/products`);
        const dataProd = await resProd.json();
        if (dataProd.success && dataProd.data.length > 0) {
            liveProducts = dataProd.data;
            
            let compiledReviews = [];
            for (const prod of liveProducts) {
                const resRev = await fetch(`${BACKEND_URL}/api/reviews/product/${prod._id}`);
                const dataRev = await resRev.json();
                if (dataRev.success && dataRev.data.length > 0) {
                    dataRev.data.forEach(r => {
                        compiledReviews.push({
                            id: r._id,
                            user: r.userName || "Verified Client",
                            rating: r.rating,
                            comment: r.comment,
                            isApproved: r.isApproved
                        });
                    });
                }
            }
            if (compiledReviews.length > 0) {
                ECommerceDB.reviews = compiledReviews;
            }
        }
    } catch (e) {
        console.error('Error syncing reviews:', e);
    }
}

// Sync admin dashboard moderations and stats
async function syncAdminDashboard() {
    const salesEl = document.getElementById('admin-stat-sales');
    const ordersEl = document.getElementById('admin-stat-orders');
    const ordersList = document.getElementById('admin-orders-list');
    
    if (isLiveBackend && currentUser && currentUser.role === 'admin') {
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/dashboard`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await res.json();
            if (data.success) {
                pendingLiveReviews = data.data.pendingReviews;
                const lbl = document.getElementById('admin-reviews-pending-label');
                if (lbl) {
                    lbl.textContent = `Pending Reviews Awaiting Approval: ${pendingLiveReviews.length}`;
                }
                
                // Update stats
                if (salesEl) salesEl.textContent = `$${data.data.stats.totalSales}`;
                if (ordersEl) ordersEl.textContent = data.data.stats.ordersCount;
                
                // Update recent orders list
                if (ordersList) {
                    if (data.data.recentOrders.length > 0) {
                        ordersList.innerHTML = data.data.recentOrders.map(o => `
                            <div style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 5px;">
                                <strong>ID:</strong> ${o._id}<br>
                                <strong>Status:</strong> <span style="color:var(--accent-gold);">${o.orderStatus}</span> - $${o.totalPrice}
                            </div>
                        `).join('');
                    } else {
                        ordersList.innerHTML = '<p style="color: var(--light-brown); text-align: center;">No recent live orders</p>';
                    }
                }
            }
        } catch (e) {
            console.error('Error syncing admin stats:', e);
        }
    } else {
        updateAdminReviewPendingCount();
        
        // Mock stats
        let totalSales = 0;
        const mockOrders = Object.values(ECommerceDB.orders);
        mockOrders.forEach(o => totalSales += o.amount);
        
        if (salesEl) salesEl.textContent = `$${totalSales.toFixed(2)}`;
        if (ordersEl) ordersEl.textContent = mockOrders.length;
        
        if (ordersList) {
            if (mockOrders.length > 0) {
                ordersList.innerHTML = mockOrders.map(o => `
                    <div style="border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 5px;">
                        <strong>ID:</strong> ${o.orderId}<br>
                        <strong>Status:</strong> <span style="color:var(--accent-gold);">${o.status}</span> - $${o.amount}
                    </div>
                `).join('');
            } else {
                ordersList.innerHTML = '<p style="color: var(--light-brown); text-align: center;">No recent mock orders</p>';
            }
        }
    }
    
    // Sync coupons display
    const couponsList = document.getElementById('admin-active-coupons');
    if (couponsList) {
        if (ECommerceDB.coupons.length > 0) {
            couponsList.innerHTML = ECommerceDB.coupons.map(c => `
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 4px 0;">
                    <strong>${c.code}</strong>
                    <span>${c.value}${c.type === 'percent' ? '%' : '$'} OFF</span>
                </div>
            `).join('');
        } else {
            couponsList.innerHTML = '<p style="color: var(--light-brown); text-align: center;">No active coupons</p>';
        }
    }
}

// Review stars input selection
const starsSelector = document.getElementById('stars-selector');
let selectedReviewRating = 5;

if (starsSelector) {
    const stars = starsSelector.querySelectorAll('i');
    const updateStarsUI = (val) => {
        stars.forEach((star, idx) => {
            star.classList.toggle('active', idx < val);
        });
    };
    updateStarsUI(selectedReviewRating);

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedReviewRating = parseInt(star.dataset.rating);
            updateStarsUI(selectedReviewRating);
        });
    });
}

// Render verified reviews list
const displayReviews = () => {
    const listContainer = document.getElementById('reviews-display-list');
    if (!listContainer) return;

    const approved = ECommerceDB.reviews.filter(r => r.isApproved);
    if (approved.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--light-brown); font-style: italic;">No reviews published yet. Be the first to custom design one and review it!</p>`;
        return;
    }

    listContainer.innerHTML = approved.map(r => {
        const starsHTML = Array(r.rating).fill('<i class="fa-solid fa-star"></i>').join('') + 
                          Array(5 - r.rating).fill('<i class="fa-regular fa-star"></i>').join('');
        return `
            <div class="review-item-card" style="animation: fadeInUp 0.6s forwards; margin-bottom: 12px;">
                <div class="review-item-header">
                    <span class="review-item-user">${r.user}</span>
                    <span class="review-item-stars">${starsHTML}</span>
                </div>
                <p style="color: var(--light-brown); font-size: 0.9rem;">"${r.comment}"</p>
            </div>
        `;
    }).join('');
};

// Create a review
const reviewForm = document.getElementById('review-form');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('review-user-input');
        const commentInput = document.getElementById('review-comment-input');
        
        if (nameInput && commentInput) {
            const comment = commentInput.value;
            
            if (isLiveBackend) {
                if (!currentUser) {
                    alert('Authentication Required: Please log in using the Account Portal icon at the top right before submitting reviews.');
                    document.getElementById('auth-modal-overlay').classList.add('active');
                    return;
                }
                
                try {
                    let productId = liveProducts.length > 0 ? liveProducts[0]._id : null;
                    if (!productId) {
                        const resProd = await fetch(`${BACKEND_URL}/api/products`);
                        const dataProd = await resProd.json();
                        if (dataProd.success && dataProd.data.length > 0) {
                            liveProducts = dataProd.data;
                            productId = liveProducts[0]._id;
                        }
                    }
                    
                    if (!productId) {
                        alert('Error: Could not locate catalog product IDs on server.');
                        return;
                    }
                    
                    const res = await fetch(`${BACKEND_URL}/api/reviews`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({
                            productId,
                            rating: selectedReviewRating,
                            comment
                        })
                    });
                    
                    const data = await res.json();
                    if (data.success) {
                        alert('Bespoke Review Submitted! Requires Administrator approval to publish.');
                        nameInput.value = '';
                        commentInput.value = '';
                        await syncAdminDashboard();
                    } else {
                        alert(data.message || 'You have already reviewed this product.');
                    }
                } catch (err) {
                    alert('Server connection error. Failed to post review.');
                }
            } else {
                // Mock review composer
                const newRev = {
                    id: ECommerceDB.reviews.length + 1,
                    user: nameInput.value,
                    rating: selectedReviewRating,
                    comment: commentInput.value,
                    isApproved: false
                };
                ECommerceDB.reviews.push(newRev);
                
                nameInput.value = '';
                commentInput.value = '';
                
                alert('Thank you! Your custom jewelry review has been submitted for moderation. You can approve it instantly via the Admin Panel on the bottom left.');
                updateAdminReviewPendingCount();
            }
        }
    });
}

// Checkout Modal Actions
const chkModal = document.getElementById('checkout-modal-overlay');
const openCheckout = () => {
    if (!chkModal) return;
    
    calculatePrice();
    const baseCostText = document.getElementById('summary-base-price').textContent;
    const addCostText = document.getElementById('summary-additions-price').textContent;
    const totalCostText = document.getElementById('summary-total-price').textContent;

    document.getElementById('chk-base-price').textContent = baseCostText;
    document.getElementById('chk-additions-price').textContent = addCostText;
    
    ECommerceDB.activeCoupon = null;
    document.getElementById('chk-discount-row').style.display = 'none';
    document.getElementById('chk-coupon-input').value = '';
    document.getElementById('chk-coupon-status').textContent = '';
    
    document.getElementById('chk-total-price').textContent = totalCostText;
    chkModal.classList.add('active');
};

const closeCheckout = () => {
    if (chkModal) chkModal.classList.remove('active');
};

document.getElementById('close-checkout-modal')?.addEventListener('click', closeCheckout);

// Apply Promo Coupon
const applyCouponBtn = document.getElementById('chk-apply-coupon');
if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
        const input = document.getElementById('chk-coupon-input');
        const status = document.getElementById('chk-coupon-status');
        const code = input.value.trim().toUpperCase();

        if (!code) return;

        const coupon = ECommerceDB.coupons.find(c => c.code === code);
        if (coupon) {
            ECommerceDB.activeCoupon = coupon;
            
            const baseCost = parseFloat(document.getElementById('chk-base-price').textContent.replace('$', ''));
            const additionsCost = parseFloat(document.getElementById('chk-additions-price').textContent.replace('$', ''));
            const subtotal = baseCost + additionsCost;
            
            let discount = 0;
            if (coupon.type === 'percent') {
                discount = (subtotal * coupon.value) / 100;
            } else {
                discount = coupon.value;
            }
            
            discount = Math.min(discount, subtotal);
            const grandTotal = subtotal - discount;

            document.getElementById('chk-discount-price').textContent = `-$${discount.toFixed(2)}`;
            document.getElementById('chk-discount-row').style.display = 'flex';
            document.getElementById('chk-total-price').textContent = `$${grandTotal.toFixed(2)}`;

            status.textContent = 'Success: Promo code applied successfully!';
            status.style.color = '#38a169';
        } else {
            status.textContent = 'Error: Invalid, expired, or inactive coupon code.';
            status.style.color = '#e53e3e';
        }
    });
}

// Gateway Selector toggles
const payOptRazorpay = document.getElementById('pay-opt-razorpay');
const payOptCashfree = document.getElementById('pay-opt-cashfree');
let selectedGateway = 'razorpay';

if (payOptRazorpay && payOptCashfree) {
    payOptRazorpay.addEventListener('click', () => {
        payOptRazorpay.classList.add('active');
        payOptCashfree.classList.remove('active');
        selectedGateway = 'razorpay';
    });

    payOptCashfree.addEventListener('click', () => {
        payOptCashfree.classList.add('active');
        payOptRazorpay.classList.remove('active');
        selectedGateway = 'cashfree';
    });
}

// Shipping Checkout Form submission
const checkoutShippingForm = document.getElementById('checkout-shipping-form');
if (checkoutShippingForm) {
    checkoutShippingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const address = document.getElementById('chk-address-input').value;
        const phone = document.getElementById('chk-phone-input').value;
        const amountText = document.getElementById('chk-total-price').textContent;
        const amount = parseFloat(amountText.replace('$', ''));
        
        closeCheckout();

        if (isLiveBackend) {
            if (!currentUser) {
                alert('Authentication Required: Please log in using the Account Portal icon at the top right before completing secure payments.');
                document.getElementById('auth-modal-overlay').classList.add('active');
                return;
            }
            
            try {
                // 1. Create live Mongoose Order
                const orderData = {
                    shippingAddress: {
                        address,
                        phone,
                        city: 'Seoul',
                        postalCode: '04321',
                        country: 'South Korea'
                    },
                    orderItems: [{
                        name: `Bespoke Custom ${customizerState.baseType.toUpperCase()}`,
                        quantity: 1,
                        price: amount,
                        customization: {
                            baseType: customizerState.baseType,
                            metalType: customizerState.metalType,
                            baseShape: customizerState.baseShape,
                            gemstoneType: customizerState.gemstoneType,
                            gemstoneCut: customizerState.gemstoneCut,
                            gemstoneSize: customizerState.gemstoneSize,
                            engravingText: customizerState.engravingText,
                            engravingFont: customizerState.engravingFont,
                            charms: customizerState.charms.map(c => ({
                                type: c.type,
                                position: c.position,
                                swingAngle: c.swingAngle
                            }))
                        }
                    }]
                };
                
                if (ECommerceDB.activeCoupon) {
                    orderData.couponCode = ECommerceDB.activeCoupon.code;
                }
                
                const resOrder = await fetch(`${BACKEND_URL}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify(orderData)
                });
                
                const orderResult = await resOrder.json();
                if (!orderResult.success) {
                    alert(orderResult.message || 'Failed to create order on server.');
                    return;
                }
                
                const liveOrder = orderResult.data;
                const dbOrderId = liveOrder._id;
                
                // 2. Load and verify cryptographic signature from selected gateway
                if (selectedGateway === 'razorpay') {
                    // Create Razorpay Order
                    const resPay = await fetch(`${BACKEND_URL}/api/payment/razorpay/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({
                            amount: liveOrder.totalPrice,
                            orderId: dbOrderId
                        })
                    });
                    
                    const payResult = await resPay.json();
                    if (!payResult.success) {
                        alert('Razorpay session initialization failed.');
                        return;
                    }
                    
                    if (!window.Razorpay) {
                        const script = document.createElement('script');
                        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                        script.onload = () => initiateLiveRazorpayCheckout(liveOrder, payResult.data);
                        document.body.appendChild(script);
                    } else {
                        initiateLiveRazorpayCheckout(liveOrder, payResult.data);
                    }
                } else {
                    // Create Cashfree session
                    const resCF = await fetch(`${BACKEND_URL}/api/payment/cashfree/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentToken}`
                        },
                        body: JSON.stringify({
                            amount: liveOrder.totalPrice,
                            orderId: dbOrderId
                        })
                    });
                    
                    const cfResult = await resCF.json();
                    if (!cfResult.success) {
                        alert('Cashfree session initialization failed.');
                        return;
                    }
                    
                    alert('Redirecting to secure Cashfree Payments window...');
                    
                    // Simulate redirects & Backend signature verification
                    setTimeout(async () => {
                        const mockCfPaymentId = `pay_cf_mock_${Date.now()}`;
                        try {
                            const resVerify = await fetch(`${BACKEND_URL}/api/payment/cashfree/verify`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${currentToken}`
                                },
                                body: JSON.stringify({
                                    orderId: dbOrderId,
                                    cf_order_id: cfResult.data.cf_order_id || cfResult.data.id,
                                    mock_payment_id: mockCfPaymentId
                                })
                            });
                            
                            const verifyData = await resVerify.json();
                            if (verifyData.success) {
                                simulateLivePaymentSuccess(verifyData.data);
                            } else {
                                alert('Cashfree payment signature verification failed.');
                            }
                        } catch (err) {
                            alert('Server connection error during payment signature verification.');
                        }
                    }, 1500);
                }
            } catch (err) {
                alert(`Live Connection Refused: ${err.message}. Proceeding to mock fallback...`);
                triggerMockFallbackOrder(address, phone, amount);
            }
        } else {
            triggerMockFallbackOrder(address, phone, amount);
        }
    });
}

// Initiate live Razorpay checkout window
function initiateLiveRazorpayCheckout(liveOrder, rzpData) {
    const options = {
        key: rzpData.key || "rzp_test_mockKeyId123",
        amount: rzpData.amount, // in paise
        currency: rzpData.currency || "INR",
        name: "Wings Jewellers",
        description: "Bespoke Jewelry Customizer Piece",
        image: "logo.jpg",
        order_id: rzpData.id,
        handler: async function (response) {
            try {
                const resVerify = await fetch(`${BACKEND_URL}/api/payment/razorpay/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify({
                        orderId: liveOrder._id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id || `pay_mock_rzp_${Date.now()}`,
                        razorpay_signature: response.razorpay_signature
                    })
                });
                const verifyData = await resVerify.json();
                if (verifyData.success) {
                    simulateLivePaymentSuccess(verifyData.data);
                } else {
                    alert('Razorpay payment signature verification failed.');
                }
            } catch (err) {
                alert('Connection error during payment signature verification.');
            }
        },
        prefill: {
            contact: liveOrder.shippingAddress.phone,
            email: currentUser.email
        },
        theme: {
            color: "#D4AF37"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

// Sync live database verification to client state
function simulateLivePaymentSuccess(dbOrder) {
    ECommerceDB.orders[dbOrder._id] = {
        orderId: dbOrder._id,
        address: dbOrder.shippingAddress.address,
        phone: dbOrder.shippingAddress.phone,
        amount: dbOrder.totalPrice,
        gateway: dbOrder.paymentMethod,
        customizerState: dbOrder.orderItems[0].customization,
        status: dbOrder.orderStatus,
        date: new Date(dbOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    ECommerceDB.catalogStock["Butterfly Whisper Necklace"] = Math.max(0, ECommerceDB.catalogStock["Butterfly Whisper Necklace"] - 1);
    checkLowStockAlerts();

    const formattedOrder = {
        orderId: dbOrder._id,
        amount: dbOrder.totalPrice
    };
    triggerBrandedEmail(formattedOrder);

    alert(`Live Payment Signature Verified Successfully!\nTransaction Recorded: ${dbOrder.paymentResult.cfPaymentId}\nOrder ID: ${dbOrder._id}\n\nYour bespoke Wings order has been securely recorded on the MongoDB server!`);

    const trackingInput = document.getElementById('track-order-id-input');
    if (trackingInput) {
        trackingInput.value = dbOrder._id;
        searchOrderTracking(dbOrder._id);
    }
}

// Trigger mock fallback orders
function triggerMockFallbackOrder(address, phone, amount) {
    const orderId = `WINGS-${Math.floor(100000 + Math.random() * 900000)}`;
    const order = {
        orderId,
        address,
        phone,
        amount,
        gateway: selectedGateway,
        customizerState: JSON.parse(JSON.stringify(customizerState)),
        status: 'Pending',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    
    ECommerceDB.orders[orderId] = order;

    if (selectedGateway === 'razorpay') {
        if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => initiateRazorpayCheckout(order);
            document.body.appendChild(script);
        } else {
            initiateRazorpayCheckout(order);
        }
    } else {
        alert(`Redirecting to secure Cashfree Payments window...`);
        setTimeout(() => {
            simulatePaymentSuccess(order);
        }, 1500);
    }
}

// Initiate Razorpay Checkout Window (Mock fallback)
function initiateRazorpayCheckout(order) {
    const options = {
        key: "rzp_test_mockKeyId123",
        amount: Math.round(order.amount * 100),
        currency: "INR",
        name: "Wings Jewellers",
        description: "Bespoke Jewelry Customizer Piece",
        image: "logo.jpg",
        handler: function (response) {
            simulatePaymentSuccess(order, response.razorpay_payment_id || `pay_mock_rzp_${Date.now()}`);
        },
        prefill: {
            contact: order.phone,
            email: "customer@wingsjewellers.com"
        },
        notes: {
            address: order.address
        },
        theme: {
            color: "#D4AF37"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

// Simulate Payment Success (Mock fallback)
function simulatePaymentSuccess(order, transactionId = `pay_mock_cf_${Date.now()}`) {
    order.status = 'Processing';
    order.transactionId = transactionId;

    ECommerceDB.catalogStock["Butterfly Whisper Necklace"] = Math.max(0, ECommerceDB.catalogStock["Butterfly Whisper Necklace"] - 1);
    checkLowStockAlerts();

    triggerBrandedEmail(order);

    alert(`Payment Success!\nTransaction Verified: ${transactionId}\nOrder ID: ${order.orderId}\n\nYour Wings order has been submitted. Check your transactional email mailbox on the right for confirmation.`);
    
    const trackingInput = document.getElementById('track-order-id-input');
    if (trackingInput) {
        trackingInput.value = order.orderId;
        searchOrderTracking(order.orderId);
    }
}

// Trigger Branded Email Simulator
function triggerBrandedEmail(order) {
    const emailDrawer = document.getElementById('email-notif-drawer');
    if (!emailDrawer) return;

    document.getElementById('email-intro-text').innerHTML = `
        Your custom jewelry piece has been successfully paid for and sent to our artisan design studio in Seoul for custom handcrafting!<br><br>
        Our master silversmiths are currently fabricating your piece according to your custom metrics.
    `;

    document.getElementById('email-order-id').textContent = order.orderId;
    document.getElementById('email-order-status').textContent = 'CRAFTING';
    document.getElementById('email-order-status').style.color = '#D4AF37';

    let name = "Bespoke " + customizerState.baseType.toUpperCase();
    if (customizerState.baseShape !== 'none') {
        name += ` (Metal: ${customizerState.metalType}, Shape: ${customizerState.baseShape}`;
        if (customizerState.gemstoneType !== 'none') {
            name += `, Gem: ${customizerState.gemstoneType}`;
        }
        name += `)`;
    }

    document.getElementById('email-item-name').textContent = name;
    document.getElementById('email-item-total').textContent = `$${order.amount.toFixed(2)}`;
    document.getElementById('email-order-details').style.display = 'block';

    emailDrawer.classList.add('active');
}

// Close email drawer
document.getElementById('email-drawer-close')?.addEventListener('click', () => {
    document.getElementById('email-notif-drawer')?.classList.remove('active');
});

// Invoice generator using print layouts
const downloadInvoice = (orderId) => {
    const order = ECommerceDB.orders[orderId];
    if (!order) return;

    document.getElementById('invoice-num-lbl').textContent = `Invoice #: INV-${orderId}`;
    document.getElementById('inv-shipping-address').textContent = order.address;
    document.getElementById('inv-shipping-phone').textContent = `Phone: ${order.phone}`;
    document.getElementById('inv-date-lbl').textContent = order.date;
    document.getElementById('inv-payment-mode').textContent = `${order.gateway.toUpperCase()} Secured Checkout`;

    let name = "Bespoke Jewelry Customizer Piece: " + order.customizerState.baseType.toUpperCase();
    if (order.customizerState.baseShape !== 'none') {
        name += ` [Base: ${order.customizerState.baseShape.toUpperCase()}, Metal: ${order.customizerState.metalType.toUpperCase()}`;
        if (order.customizerState.gemstoneType !== 'none') {
            name += `, Gem: ${order.customizerState.gemstoneType.toUpperCase()}`;
        }
        name += `]`;
    }
    
    document.getElementById('inv-product-desc-title').textContent = name;
    
    const subtotal = order.amount / 1.03;
    const tax = order.amount - subtotal;

    document.getElementById('inv-unit-price-val').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('inv-total-price-val').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('inv-subtotal-val').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('inv-tax-val').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('inv-grandtotal-val').textContent = `$${order.amount.toFixed(2)}`;

    window.print();
};

document.getElementById('invoice-download-trigger')?.addEventListener('click', () => {
    const trackingInput = document.getElementById('track-order-id-input');
    if (trackingInput && trackingInput.value.trim()) {
        downloadInvoice(trackingInput.value.trim());
    }
});

// Return and Reversal trigger
document.getElementById('order-reversal-trigger')?.addEventListener('click', () => {
    const trackingInput = document.getElementById('track-order-id-input');
    if (!trackingInput) return;

    const orderId = trackingInput.value.trim();
    const order = ECommerceDB.orders[orderId];
    
    if (order) {
        if (order.status === 'Processing' || order.status === 'Pending') {
            const conf = confirm(`Cancel / Return Order ID: ${orderId}?\nThis will reverse the payment of $${order.amount.toFixed(2)} and issue a refund to your ${order.gateway} account.`);
            if (conf) {
                order.status = 'Refunded';
                searchOrderTracking(orderId);
                
                document.getElementById('email-order-status').textContent = 'REFUNDED';
                document.getElementById('email-order-status').style.color = '#e53e3e';
                document.getElementById('email-intro-text').innerHTML = `
                    We have processed your cancel / return request for Order ID: ${orderId}.<br>
                    Your refund of $${order.amount.toFixed(2)} has been successfully credited back to your original payment account.
                `;
                document.getElementById('email-notif-drawer')?.classList.add('active');
                
                alert('Order Cancelled successfully. Your full refund is being processed!');
            }
        } else if (order.status === 'Refunded') {
            alert('Order has already been cancelled and refunded.');
        } else {
            alert('Orders in Shipped or Delivered status cannot be cancelled instantly. Please contact Wings Concierge via chatbot to initiate an offline return.');
        }
    }
});

// Order Tracking timeline tracker (live and mock synced)
const searchOrderTracking = async (orderId) => {
    const panel = document.getElementById('tracking-result-panel');
    const desc = document.getElementById('tracking-desc-text');
    if (!panel) return;
    
    let order = null;
    
    if (isLiveBackend && currentUser) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            const data = await res.json();
            if (data.success) {
                const dbOrder = data.data;
                order = {
                    orderId: dbOrder._id,
                    address: dbOrder.shippingAddress.address,
                    phone: dbOrder.shippingAddress.phone,
                    amount: dbOrder.totalPrice,
                    gateway: dbOrder.paymentMethod || 'Razorpay',
                    customizerState: dbOrder.orderItems[0].customization,
                    status: dbOrder.orderStatus,
                    date: new Date(dbOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                };
                ECommerceDB.orders[orderId] = order;
            }
        } catch (e) {
            console.error('Error fetching live order stats:', e);
        }
    }
    
    if (!order) {
        order = ECommerceDB.orders[orderId];
    }

    if (!order) {
        alert('Order ID not found in transaction logs.');
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    
    const nodes = {
        placed: document.getElementById('step-node-pending'),
        crafting: document.getElementById('step-node-processing'),
        shipped: document.getElementById('step-node-shipped'),
        delivered: document.getElementById('step-node-delivered')
    };

    Object.values(nodes).forEach(n => {
        n.classList.remove('active', 'completed');
    });

    const progressIndicator = document.getElementById('tracking-progress-indicator');

    if (order.status === 'Pending') {
        nodes.placed.classList.add('active');
        progressIndicator.style.width = '0%';
        desc.textContent = "Awaiting payment verification before handcrafting.";
    } else if (order.status === 'Processing') {
        nodes.placed.classList.add('completed');
        nodes.crafting.classList.add('active');
        progressIndicator.style.width = '33%';
        desc.textContent = "Payment Verified! Our master artisans in Seoul are custom handcrafting your design piece.";
    } else if (order.status === 'Shipped') {
        nodes.placed.classList.add('completed');
        nodes.crafting.classList.add('completed');
        nodes.shipped.classList.add('active');
        progressIndicator.style.width = '66%';
        desc.textContent = "Bespoke masterpiece dispatched! Delivery is currently in transit via express carrier.";
    } else if (order.status === 'Delivered') {
        nodes.placed.classList.add('completed');
        nodes.crafting.classList.add('completed');
        nodes.shipped.classList.add('completed');
        nodes.delivered.classList.add('active');
        progressIndicator.style.width = '100%';
        desc.textContent = "Masterpiece safely delivered! We hope you cherish your Wings Jewellers creation.";
    } else if (order.status === 'Refunded') {
        desc.textContent = "Transaction Reversed. Full order value has been refunded.";
        progressIndicator.style.width = '0%';
    }
};

document.getElementById('track-order-btn')?.addEventListener('click', () => {
    const input = document.getElementById('track-order-id-input');
    if (input) searchOrderTracking(input.value.trim());
});

// Admin deck triggers
const adminDrawer = document.getElementById('admin-control-drawer');
document.getElementById('admin-deck-open')?.addEventListener('click', async () => {
    adminDrawer?.classList.add('active');
    await syncAdminDashboard();
});

document.getElementById('admin-deck-close')?.addEventListener('click', () => {
    adminDrawer?.classList.remove('active');
});

function updateAdminReviewPendingCount() {
    const count = ECommerceDB.reviews.filter(r => !r.isApproved).length;
    const lbl = document.getElementById('admin-reviews-pending-label');
    if (lbl) lbl.textContent = `Pending Reviews Awaiting Approval: ${count}`;
}

// Admin approve reviews (Moderator first)
document.getElementById('admin-approve-reviews-btn')?.addEventListener('click', async () => {
    if (isLiveBackend) {
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Access Denied: Only users logged in as Admin role can moderate reviews.');
            document.getElementById('auth-modal-overlay').classList.add('active');
            return;
        }
        
        if (pendingLiveReviews.length === 0) {
            alert('No pending reviews found.');
            return;
        }
        
        let successCount = 0;
        try {
            for (const rev of pendingLiveReviews) {
                const res = await fetch(`${BACKEND_URL}/api/reviews/${rev._id}/approve`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${currentToken}` }
                });
                const data = await res.json();
                if (data.success) successCount++;
            }
            alert(`Success: Approved ${successCount} pending reviews successfully!`);
            await syncLiveReviews();
            await syncAdminDashboard();
            displayReviews();
        } catch (e) {
            alert('Server error while approving reviews.');
        }
    } else {
        let count = 0;
        ECommerceDB.reviews.forEach(r => {
            if (!r.isApproved) {
                r.isApproved = true;
                count++;
            }
        });

        if (count > 0) {
            alert(`Success: ${count} pending reviews approved for publication.`);
            displayReviews();
            updateAdminReviewPendingCount();
        } else {
            alert('No pending reviews found.');
        }
    }
});

// Admin inventory control
const stockAlertBar = document.getElementById('stock-alerts-banner');
const thresholdSlider = document.getElementById('admin-threshold-slider');
const thresholdNum = document.getElementById('admin-threshold-num');

function checkLowStockAlerts() {
    if (!stockAlertBar) return;
    const low = Object.values(ECommerceDB.catalogStock).some(qty => qty < ECommerceDB.stockThreshold);
    stockAlertBar.style.display = low ? 'flex' : 'none';
}

if (thresholdSlider && thresholdNum) {
    thresholdSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        ECommerceDB.stockThreshold = val;
        thresholdNum.textContent = val;
        checkLowStockAlerts();
    });
}

document.getElementById('admin-replenish-stock')?.addEventListener('click', () => {
    Object.keys(ECommerceDB.catalogStock).forEach(key => {
        ECommerceDB.catalogStock[key] = 12;
    });
    checkLowStockAlerts();
    alert('Catalog inventory counts successfully replenished back to normal levels!');
});

// Admin new coupon generator
document.getElementById('admin-create-coupon-btn')?.addEventListener('click', async () => {
    const codeInput = document.getElementById('admin-new-coupon-code');
    const valInput = document.getElementById('admin-new-coupon-val');
    const typeSelect = document.getElementById('admin-new-coupon-type');

    if (codeInput && valInput && typeSelect && codeInput.value.trim() && valInput.value) {
        const code = codeInput.value.trim().toUpperCase();
        const value = parseFloat(valInput.value);
        const type = typeSelect.value;

        if (isLiveBackend && currentUser && currentUser.role === 'admin') {
            try {
                const res = await fetch(`${BACKEND_URL}/api/admin/coupons`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                    body: JSON.stringify({ code, discountType: type, discountValue: value, expiryDate: new Date(Date.now() + 30*24*60*60*1000) })
                });
                const data = await res.json();
                if (data.success) {
                    alert(`Live Promo coupon generated!\nCode: ${code}`);
                } else {
                    alert(data.message || 'Error generating live coupon');
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            ECommerceDB.coupons.push({ code, type, value });
            alert(`Mock Promo coupon generated successfully!\nCode: ${code}\nPromotion: ${value}${type === 'percent' ? '% Off' : ' Flat $'}`);
        }
        
        codeInput.value = '';
        valInput.value = '';
        await syncAdminDashboard();
    } else {
        alert('Please specify coupon code and value.');
    }
});

// ==========================================
// PRODUCT DETAIL PAGE (PDP) MODAL ENGINE
// ==========================================

// Full product catalog data (mock, synced from backend when live)
const productCatalog = [
    {
        id: 'prod_001',
        name: 'Butterfly Whisper Necklace',
        price: 29.00, originalPrice: 39.00, discount: 26,
        category: 'Necklaces',
        metal: 'Rose Gold 925 Sterling Silver',
        weight: '3.2g', dimensions: '45cm chain, 1.8cm pendant',
        stock: 4, rating: 4.8, reviews: 24,
        description: 'A delicate rose gold necklace featuring a hand-crafted butterfly pendant. Perfect for everyday elegance. Lightweight, hypoallergenic, and inspired by the soft minimalism of Korean jewelry culture.',
        images: [
            'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1887',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1887',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1887'
        ],
        sampleReviews: [
            { user: 'Elena Park', rating: 5, comment: 'Absolutely breathtaking! So lightweight and delicate. Got so many compliments!' },
            { user: 'Ji-Woo Kim', rating: 5, comment: 'The quality is amazing for the price. The butterfly charm is so intricate.' },
            { user: 'Sarah M.', rating: 4, comment: 'Beautiful piece, arrived in gorgeous packaging. Perfect gift.' }
        ]
    },
    {
        id: 'prod_002',
        name: 'Tiny Heart Bracelet',
        price: 24.00, originalPrice: 24.00, discount: 0,
        category: 'Bracelets',
        metal: 'Silver 925 Sterling Silver',
        weight: '2.5g', dimensions: '18cm adjustable chain',
        stock: 12, rating: 5.0, reviews: 18,
        description: 'A slim silver bracelet adorned with a petite heart charm. The adjustable lobster clasp ensures a perfect fit for all wrist sizes. Hypoallergenic and tarnish-resistant.',
        images: [
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070',
            'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=1964',
            'https://images.unsplash.com/photo-1590548784585-643d2b9f292c?q=80&w=1964'
        ],
        sampleReviews: [
            { user: 'Mia Chen', rating: 5, comment: 'So dainty and elegant. Fits perfectly on my small wrist.' },
            { user: 'Priya S.', rating: 5, comment: 'Excellent quality, the clasp is very secure. Love it!' }
        ]
    },
    {
        id: 'prod_003',
        name: 'Butterfly Charm Anklet',
        price: 26.00, originalPrice: 32.00, discount: 19,
        category: 'Anklets',
        metal: 'Gold-Plated 925 Sterling Silver',
        weight: '4.1g', dimensions: '22–25cm adjustable',
        stock: 8, rating: 4.7, reviews: 31,
        description: 'A graceful gold-plated anklet featuring two hand-crafted butterfly charms that catch the light with every step. Inspired by Korean minimalist fashion. Adjustable for a comfortable, secure fit.',
        images: [
            'https://images.unsplash.com/photo-1535633302704-c02fbc751c0a?q=80&w=1887',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1887',
            'https://images.unsplash.com/photo-1590548784585-643d2b9f292c?q=80&w=1964'
        ],
        sampleReviews: [
            { user: 'Anika R.', rating: 5, comment: 'The gold plating looks very premium. Received so many compliments on it!' },
            { user: 'Lisa T.', rating: 4, comment: 'Very pretty and lightweight. Perfect for summer.' },
            { user: 'Hana B.', rating: 5, comment: 'Packaging was stunning and the anklet is even more beautiful in person.' }
        ]
    }
];

// Wishlist state (per session)
const wishlistSet = new Set();

// Helper: render star icons from rating number
function renderStars(rating) {
    let html = '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="fa-regular fa-star"></i>';
    return html;
}

// Helper: get stock status class and label
function getStockInfo(stock) {
    if (stock === 0) return { cls: 'outofstock', label: 'Out of Stock' };
    if (stock <= 5) return { cls: 'lowstock', label: `Low Stock — Only ${stock} Left!` };
    return { cls: 'instock', label: `In Stock (${stock} Available)` };
}

let pdpCurrentProduct = null;
let pdpQty = 1;

function openPDP(productId) {
    const product = productCatalog.find(p => p.id === productId);
    if (!product) return;
    pdpCurrentProduct = product;
    pdpQty = 1;

    const overlay = document.getElementById('pdp-modal-overlay');

    // --- Populate main image ---
    const mainImg = document.getElementById('pdp-main-img');
    mainImg.src = product.images[0];
    mainImg.alt = product.name;

    // --- Discount badge ---
    const discBadge = document.getElementById('pdp-discount-badge');
    if (product.discount > 0) {
        discBadge.textContent = `-${product.discount}% OFF`;
        discBadge.style.display = 'inline-block';
    } else {
        discBadge.style.display = 'none';
    }

    // --- Thumbnails ---
    const thumbsContainer = document.getElementById('pdp-thumbnails');
    thumbsContainer.innerHTML = product.images.map((img, idx) => `
        <div class="pdp-thumb ${idx === 0 ? 'active' : ''}" data-img="${img}">
            <img src="${img}" alt="Thumbnail ${idx + 1}">
        </div>
    `).join('');

    thumbsContainer.querySelectorAll('.pdp-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            mainImg.src = thumb.dataset.img;
            thumbsContainer.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // --- Category & Title ---
    document.getElementById('pdp-category').textContent = product.category;
    document.getElementById('pdp-title').textContent = product.name;

    // --- Rating ---
    document.getElementById('pdp-stars').innerHTML = renderStars(product.rating);
    document.getElementById('pdp-review-count').textContent = `${product.rating} · ${product.reviews} reviews`;

    // --- Price ---
    document.getElementById('pdp-price').textContent = `$${product.price.toFixed(2)}`;
    const origPriceEl = document.getElementById('pdp-original-price');
    const savingEl = document.getElementById('pdp-saving-badge');
    if (product.discount > 0) {
        origPriceEl.textContent = `$${product.originalPrice.toFixed(2)}`;
        origPriceEl.style.display = 'inline';
        const saving = (product.originalPrice - product.price).toFixed(2);
        savingEl.textContent = `You save $${saving}!`;
        savingEl.style.display = 'inline-block';
    } else {
        origPriceEl.style.display = 'none';
        savingEl.style.display = 'none';
    }

    // --- Stock ---
    const stockInfo = getStockInfo(product.stock);
    const stockBadge = document.getElementById('pdp-stock-badge');
    stockBadge.textContent = stockInfo.label;
    stockBadge.className = `pdp-stock-status ${stockInfo.cls}`;

    // --- Specs ---
    document.getElementById('pdp-spec-category').textContent = product.category;
    document.getElementById('pdp-spec-metal').textContent = product.metal;
    document.getElementById('pdp-spec-weight').textContent = product.weight;
    document.getElementById('pdp-spec-dimensions').textContent = product.dimensions;

    // --- Description ---
    document.getElementById('pdp-description').textContent = product.description;

    // --- Quantity ---
    document.getElementById('pdp-qty-val').textContent = 1;

    // --- Wishlist button state ---
    const wishlistBtn = document.getElementById('pdp-wishlist-btn');
    if (wishlistSet.has(product.id)) {
        wishlistBtn.classList.add('active');
        wishlistBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    } else {
        wishlistBtn.classList.remove('active');
        wishlistBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }

    // --- Populate PDP Reviews ---
    const reviewsList = document.getElementById('pdp-reviews-list');
    const allReviews = [...product.sampleReviews];
    // Merge any approved ECommerceDB reviews for this product
    ECommerceDB.reviews.filter(r => r.isApproved).slice(0, 2).forEach(r => {
        allReviews.push({ user: r.user, rating: r.rating, comment: r.comment });
    });
    reviewsList.innerHTML = allReviews.map(r => `
        <div class="pdp-review-card">
            <div class="pdp-review-header">
                <span class="pdp-reviewer-name">${r.user}</span>
                <span class="pdp-review-stars">${renderStars(r.rating)}</span>
            </div>
            <p class="pdp-review-text">"${r.comment}"</p>
        </div>
    `).join('');

    // --- Related Products (the other 2 products) ---
    const related = productCatalog.filter(p => p.id !== product.id);
    const relatedGrid = document.getElementById('pdp-related-grid');
    relatedGrid.innerHTML = related.map(p => `
        <div class="pdp-related-card" data-product-id="${p.id}">
            <img src="${p.images[0]}" alt="${p.name}">
            <div class="pdp-related-info">
                <h4>${p.name}</h4>
                <span>$${p.price.toFixed(2)}</span>
            </div>
        </div>
    `).join('');

    relatedGrid.querySelectorAll('.pdp-related-card').forEach(card => {
        card.addEventListener('click', () => {
            openPDP(card.dataset.productId);
            overlay.scrollTop = 0;
        });
    });

    // --- Show Modal ---
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePDP() {
    document.getElementById('pdp-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
    pdpCurrentProduct = null;
}

function initPDPModal() {
    // Bind "View Details" buttons on product cards
    document.querySelectorAll('.pdp-open-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            if (card) openPDP(card.dataset.id);
        });
    });

    // Bind quick wishlist buttons on product cards
    document.querySelectorAll('.product-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.dataset.product;
            toggleWishlist(productId, btn);
        });
    });

    // Close button
    document.getElementById('pdp-close-btn')?.addEventListener('click', closePDP);

    // Close on overlay backdrop click
    document.getElementById('pdp-modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('pdp-modal-overlay')) closePDP();
    });

    // Quantity +/-
    document.getElementById('pdp-qty-minus')?.addEventListener('click', () => {
        if (pdpQty > 1) {
            pdpQty--;
            document.getElementById('pdp-qty-val').textContent = pdpQty;
        }
    });

    document.getElementById('pdp-qty-plus')?.addEventListener('click', () => {
        const maxQty = pdpCurrentProduct ? pdpCurrentProduct.stock : 10;
        if (pdpQty < maxQty) {
            pdpQty++;
            document.getElementById('pdp-qty-val').textContent = pdpQty;
        }
    });

    // Wishlist button inside PDP
    document.getElementById('pdp-wishlist-btn')?.addEventListener('click', () => {
        if (!pdpCurrentProduct) return;
        const btn = document.getElementById('pdp-wishlist-btn');
        toggleWishlist(pdpCurrentProduct.id, btn);
    });

    // Add to Cart from PDP
    document.getElementById('pdp-add-to-cart-btn')?.addEventListener('click', () => {
        if (!pdpCurrentProduct) return;
        showToast(`✓ ${pdpCurrentProduct.name} added to cart!`);
        if (isLiveBackend && currentToken) {
            fetch(`${BACKEND_URL}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify({ productId: pdpCurrentProduct.id, quantity: pdpQty })
            }).catch(() => {});
        }
    });

    // Buy Now from PDP
    document.getElementById('pdp-buy-now-btn')?.addEventListener('click', () => {
        if (!pdpCurrentProduct) return;
        closePDP();
        // Pre-populate checkout with this product's price
        const total = (pdpCurrentProduct.price * pdpQty).toFixed(2);
        document.getElementById('chk-base-price').textContent = `$${total}`;
        document.getElementById('chk-additions-price').textContent = '$0.00';
        document.getElementById('chk-total-price').textContent = `$${total}`;
        document.getElementById('chk-discount-row').style.display = 'none';
        document.getElementById('chk-coupon-input').value = '';
        document.getElementById('chk-coupon-status').textContent = '';
        ECommerceDB.activeCoupon = null;
        document.getElementById('checkout-modal-overlay').classList.add('active');
    });
}

// Wishlist toggle function (used by both product cards and PDP modal)
async function toggleWishlist(productId, btn) {
    const isActive = wishlistSet.has(productId);

    if (isActive) {
        wishlistSet.delete(productId);
        btn.classList.remove('active');
        btn.innerHTML = btn.classList.contains('pdp-wishlist-heart-btn')
            ? '<i class="fa-regular fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';
        showToast('Removed from wishlist');
    } else {
        wishlistSet.add(productId);
        btn.classList.add('active');
        btn.innerHTML = btn.classList.contains('pdp-wishlist-heart-btn')
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-solid fa-heart"></i>';
        showToast('❤ Added to wishlist!');

        if (isLiveBackend && currentToken) {
            try {
                const product = productCatalog.find(p => p.id === productId);
                if (product) {
                    await fetch(`${BACKEND_URL}/api/wishlist`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                        body: JSON.stringify({ productId })
                    });
                }
            } catch (e) { console.error('Wishlist sync error:', e); }
        }
    }

    // Sync card wishlist button if PDP is open
    const cardBtn = document.querySelector(`.product-wishlist-btn[data-product="${productId}"]`);
    if (cardBtn && cardBtn !== btn) {
        cardBtn.classList.toggle('active', wishlistSet.has(productId));
        cardBtn.innerHTML = wishlistSet.has(productId)
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';
    }
}

// Toast notification utility
let toastTimer;
function showToast(message) {
    let toast = document.getElementById('wings-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'wings-toast';
        toast.style.cssText = `
            position: fixed; bottom: 110px; left: 50%; transform: translateX(-50%) translateY(20px);
            background: var(--dark-brown); color: white; padding: 12px 28px;
            border-radius: 50px; font-size: 0.85rem; font-weight: 600;
            z-index: 9999; opacity: 0; transition: all 0.35s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2); white-space: nowrap;
        `;
        document.body.appendChild(toast);
    }
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toastTimer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
}

// DOMContentLoaded load attachments
window.addEventListener('DOMContentLoaded', async () => {
    initCustomizer();
    initAuthModal();
    initPDPModal();
    await checkBackendConnection();
});
