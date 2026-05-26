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

    // Add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-design');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            triggerSparkle();
            const rect = addToCartBtn.getBoundingClientRect();
            triggerSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
            alert('Your bespoke jewellery design has been added to your shopping cart!');
        });
    }

    // Initial load sync and draw
    syncUIWithState();
    updateJewelryRender();
}

// Attach load handler
window.addEventListener('DOMContentLoaded', () => {
    initCustomizer();
});
