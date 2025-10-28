// Modern Portfolio Website JavaScript
// Author: Prasiddh Naik

// Global variables
let todos = [];
let todosFilter = 'all';
let todoIdCounter = 1;

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeWebsite();
});

// Fade out and remove the loader once everything has loaded
window.addEventListener('load', () => {
    setTimeout(hidePageLoader, 250);
});

function hidePageLoader() {
    const loaderElement = document.getElementById('page-loader');
    if (!loaderElement) return;
    loaderElement.classList.add('hidden');
    setTimeout(() => {
        if (loaderElement && loaderElement.parentNode) {
            loaderElement.parentNode.removeChild(loaderElement);
        }
    }, 450);
}

// Main initialization function
function initializeWebsite() {
    // Initialize navigation
    initNavigation();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize animations
    initScrollAnimations();
    
    // Initialize skill bars
    initSkillBars();
    
    // Initialize particles background
    initParticles();
    
    // Initialize particle controls
    initParticleControls();
    
    // Initialize modals
    initModals();
    
    // Initialize projects filter
    initProjectsFilter();
    
    // Initialize todo app
    initTodoApp();
    
    // Initialize calculator
    initCalculator();

    // Initialize new mini apps
    initUnitConverter();
    initQuadraticSolver();
    initPercentageCalculator();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Update dynamic age across the site
    initDynamicAge();
    
    // Log successful initialization
    console.log('Portfolio website initialized successfully!');

    // Fire richer pageview event to backend analytics if available,
    // else fall back to free Supabase (if configured via window.__SUPABASE)
    (async function sendPageView() {
        const nav = navigator || {};
        const meta = {
            referrer: document.referrer || null,
            viewport: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio || 1 },
            tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || null),
            lang: (nav.language || (nav.languages && nav.languages[0]) || null),
            uaHints: (nav.userAgentData && nav.userAgentData.brands) ? nav.userAgentData.brands : null,
            platform: nav.platform || null,
            memoryGB: (nav.deviceMemory || null),
            cores: (nav.hardwareConcurrency || null)
        };

        const payload = {
            eventName: 'page_view',
            pagePath: location.pathname + location.search,
            pageTitle: document.title,
            meta
        };

        // Try backend first (only if available)
        try {
            const healthResponse = await fetch('/api/health');
            if (healthResponse.ok) {
                await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                throw new Error('Backend not available');
            }
        } catch (error) {
            console.log('Backend not available, using local storage only');
            // Fallback to local storage if backend is not available
            return;
        }

        // Fallback to Supabase if configured
        try {
            const client = await ensureSupabase();
            if (!client) return;
            await client.from('events').insert({
                event_name: payload.eventName,
                page_path: payload.pagePath,
                page_title: payload.pageTitle,
                meta: payload.meta
            });
        } catch (_) { /* no-op */ }
    })();
}

// Compute age from birthdate
function getAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }
    return age;
}

// Initialize dynamic age update
function initDynamicAge() {
    try {
        const attr = document.body ? document.body.getAttribute('data-birthdate') : null;
        const birthDateString = attr && attr.trim() ? attr.trim() : '2013-04-03';
        const birthDate = new Date(birthDateString);
        if (isNaN(birthDate.getTime())) return;
        const years = getAge(birthDate);
        document.querySelectorAll('.age-number').forEach(el => {
            el.textContent = years;
        });
    } catch (e) {
        // no-op
    }
}

// Contact form submission to backend
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('contact-status');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        status.textContent = 'Sending...';
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const message = document.getElementById('contact-message').value.trim();
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message })
            });
            const data = await res.json();
            if (data.ok) {
                status.textContent = 'Thanks! I will get back to you.';
                form.reset();
            } else {
                status.textContent = 'Failed to send. Try again later.';
            }
        } catch (err) {
            status.textContent = 'Server offline. Try again later.';
        }
    });
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Toggle mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Add navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 14, 39, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 14, 39, 0.95)';
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
    
    // Fallback: make all sections visible after 2 seconds if they're not already
    setTimeout(() => {
        document.querySelectorAll('.section:not(.visible)').forEach(section => {
            section.classList.add('visible');
        });
    }, 2000);
}

// Initialize skill bars animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target;
                const level = skillBar.getAttribute('data-level');
                setTimeout(() => {
                    skillBar.style.width = level + '%';
                }, 300);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
}

    // Advanced Particle System
function initParticles() {
    // particles disabled
    return;
}

// Initialize particle controls panel
function initParticleControls() {
    const controlsToggle = document.getElementById('controls-toggle');
    const controlsContent = document.getElementById('controls-content');
    let isCollapsed = false;
    
    if (controlsToggle && controlsContent) {
        controlsToggle.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            controlsContent.classList.toggle('collapsed', isCollapsed);
            controlsToggle.textContent = isCollapsed ? '+' : '?';
        });
        
        // Auto-collapse after 10 seconds on mobile
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                if (!isCollapsed) {
                    isCollapsed = true;
                    controlsContent.classList.add('collapsed');
                    controlsToggle.textContent = '+';
                }
            }, 10000);
        }
    }
}

class AdvancedParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.energyWaves = [];
        this.trails = [];
        this.mouse = { x: 0, y: 0, pressed: false };
        this.animationId = null;
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.time = 0;
        
        // Enhanced particle settings
        this.particleCount = 100;
        this.connectionDistance = 180;
        this.mouseRadius = 250;
        this.attractionMode = true;
        this.waveIntensity = 0;
        
        // Performance optimization
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        this.setupCanvas();
        this.setupInteractions();
        this.createParticles();
    }
    
    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
        position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        pointer-events: none;
            z-index: 1;
        `;
        
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    setupInteractions() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.container.addEventListener('mousedown', (e) => {
            this.mouse.pressed = true;
            this.createEnergyWave(this.mouse.x, this.mouse.y);
        });
        
        this.container.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });
        
        this.container.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
            this.mouse.pressed = false;
        });
        
        // Toggle attraction/repulsion with right click
        this.container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.attractionMode = !this.attractionMode;
        });
        
        // Double click to add particles
        this.container.addEventListener('dblclick', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.addParticleExplosion(x, y);
        });
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            const particleType = Math.random() < 0.8 ? 'normal' : 
                                Math.random() < 0.6 ? 'energy' : 'nebula';
            this.particles.push(new Particle(this.width, this.height, particleType));
        }
    }
    
    animate(currentTime = 0) {
        // FPS limiting for better performance
        if (currentTime - this.lastFrameTime < this.frameInterval) {
            this.animationId = requestAnimationFrame((time) => this.animate(time));
            return;
        }
        this.lastFrameTime = currentTime;
        this.time += 0.016;
        
        // Dynamic background gradient
        this.drawBackground();
        
        // Update particles with enhanced interactions
        this.particles.forEach((particle, index) => {
            particle.update(this.mouse, this.mouseRadius, this.width, this.height, 
                          this.attractionMode, this.time);
            
            // Add trail effect for energy particles
            if (particle.type === 'energy' && particle.velocity > 2) {
                this.addTrail(particle);
            }
        });
        
        // Update and draw trails
        this.updateTrails();
        
        // Update and draw energy waves
        this.updateEnergyWaves();
        
        // Draw enhanced connections with energy flow
        this.drawEnhancedConnections();
        
        // Draw particles with improved effects
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
        
        // Clean up expired effects
        this.cleanup();
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.max(this.width, this.height)
        );
        const intensity = Math.sin(this.time * 0.5) * 0.1 + 0.9;
        gradient.addColorStop(0, `rgba(10, 14, 39, ${intensity})`);
        gradient.addColorStop(1, `rgba(5, 8, 22, ${intensity})`);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawEnhancedConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.connectionDistance) {
                    const opacity = (1 - distance / this.connectionDistance) * 0.8;
                    const energy = (p1.energy + p2.energy) / 2;
                    
                    // All connections use blue colors
                    const connectionColor = 'rgba(0, 102, 204,';
                    
                    // Animated energy flow
                    const flowOffset = Math.sin(this.time * 3 + distance * 0.1) * 0.5 + 0.5;
                    const lineWidth = 1 + energy * 2;
                    
                    // Main connection line
                    this.ctx.strokeStyle = `${connectionColor} ${opacity})`;
                    this.ctx.lineWidth = lineWidth;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                    
                    // Energy flow effect
                    if (energy > 0.5) {
                        const midX = (p1.x + p2.x) / 2 + Math.sin(this.time * 2) * 2;
                        const midY = (p1.y + p2.y) / 2 + Math.cos(this.time * 2) * 2;
                        
                        this.ctx.fillStyle = `${connectionColor} ${opacity * flowOffset})`;
                        this.ctx.beginPath();
                        this.ctx.arc(midX, midY, 2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }
        }
    }
    
    createEnergyWave(x, y) {
        this.energyWaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: this.mouseRadius,
            opacity: 1,
            life: 0
        });
    }
    
    updateEnergyWaves() {
        this.energyWaves.forEach((wave, index) => {
            wave.life += 0.016;
            wave.radius += 8;
            wave.opacity = Math.max(0, 1 - wave.life * 2);
            
            // Draw energy wave
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.strokeStyle = `rgba(0, 150, 255, ${wave.opacity * 0.6})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Inner glow
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity * 0.3})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius * 0.8, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        });
    }
    
    addTrail(particle) {
        this.trails.push({
            x: particle.x,
            y: particle.y,
            opacity: 0.8,
            color: particle.color,
            size: particle.size * 0.5,
            life: 0
        });
    }
    
    updateTrails() {
        this.trails.forEach((trail, index) => {
            trail.life += 0.016;
            trail.opacity = Math.max(0, 0.8 - trail.life * 3);
            trail.size *= 0.98;
            
            if (trail.opacity > 0) {
                this.ctx.save();
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.fillStyle = `${trail.color} ${trail.opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
    }
    
    addParticleExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 50 + Math.random() * 100;
            const newX = x + Math.cos(angle) * distance;
            const newY = y + Math.sin(angle) * distance;
            
            if (newX > 0 && newX < this.width && newY > 0 && newY < this.height) {
                const particle = new Particle(this.width, this.height, 'energy');
                particle.x = newX;
                particle.y = newY;
                particle.baseX = newX;
                particle.baseY = newY;
                particle.energy = 1;
                this.particles.push(particle);
            }
        }
        
        // Limit total particles
        if (this.particles.length > this.particleCount * 1.5) {
            this.particles.splice(0, this.particles.length - this.particleCount);
        }
    }
    
    cleanup() {
        this.energyWaves = this.energyWaves.filter(wave => wave.opacity > 0.01);
        this.trails = this.trails.filter(trail => trail.opacity > 0.01);
    }
    
    init() {
        this.animate();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight, type = 'normal') {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.type = type;
        this.energy = Math.random() * 0.5 + 0.3;
        this.velocity = 0;
        
        // Type-specific properties
        this.setupParticleType();
        
        this.density = Math.random() * 20 + 5;
        this.opacity = Math.random() * 0.4 + 0.5;
        this.color = this.getRandomColor();
        
        // Enhanced effects
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.01 + Math.random() * 0.03;
        this.rotationAngle = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.life = 1;
        this.maxLife = 1;
        
        // Interaction properties
        this.attractionForce = 0;
        this.repulsionForce = 0;
    }
    
    setupParticleType() {
        switch(this.type) {
            case 'energy':
                this.size = Math.random() * 2 + 3;
                this.energy = Math.random() * 0.5 + 0.7;
                this.vx *= 1.5;
                this.vy *= 1.5;
                break;
            case 'nebula':
                this.size = Math.random() * 6 + 4;
                this.energy = Math.random() * 0.3 + 0.2;
                this.vx *= 0.5;
                this.vy *= 0.5;
                break;
            default: // normal
                this.size = Math.random() * 3 + 2;
                break;
        }
    }
    
    getRandomColor() {
        // All particles use blue variations only
        const colors = [
            'rgba(0, 102, 204,',      // Primary Blue
            'rgba(0, 150, 255,',      // Light Blue
            'rgba(51, 153, 255,',     // Sky Blue
            'rgba(0, 204, 255,',      // Cyan Blue
            'rgba(30, 144, 255,',     // Dodger Blue
            'rgba(70, 130, 180,',     // Steel Blue
            'rgba(100, 149, 237,',    // Cornflower Blue
            'rgba(65, 105, 225,',     // Royal Blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(mouse, mouseRadius, canvasWidth, canvasHeight, attractionMode = true, time = 0) {
        const oldX = this.x;
        const oldY = this.y;
        
        // Enhanced mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseRadius && distance > 0) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseRadius - distance) / mouseRadius;
            const forceMultiplier = this.density * 0.02;
            
            if (attractionMode) {
                // Attraction mode
                this.attractionForce = force;
                this.x += forceDirectionX * force * forceMultiplier;
                this.y += forceDirectionY * force * forceMultiplier;
                this.energy = Math.min(1, this.energy + 0.01);
            } else {
                // Repulsion mode
                this.repulsionForce = force;
                this.x -= forceDirectionX * force * forceMultiplier * 2;
                this.y -= forceDirectionY * force * forceMultiplier * 2;
            }
        } else {
            // Return to base position when not under mouse influence
            this.attractionForce *= 0.95;
            this.repulsionForce *= 0.95;
            
            const returnForce = 0.02;
            const baseDx = this.baseX - this.x;
            const baseDy = this.baseY - this.y;
            this.x += baseDx * returnForce;
            this.y += baseDy * returnForce;
        }
        
        // Calculate velocity for trail effects
        this.velocity = Math.sqrt((this.x - oldX) ** 2 + (this.y - oldY) ** 2);
        
        // Type-specific movement patterns
        switch(this.type) {
            case 'energy':
                // Erratic, fast movement
                this.vx += (Math.random() - 0.5) * 0.2;
                this.vy += (Math.random() - 0.5) * 0.2;
                this.vx *= 0.98;
                this.vy *= 0.98;
                break;
            case 'nebula':
                // Slow, drifting movement
                this.vx += Math.sin(time + this.pulsePhase) * 0.1;
                this.vy += Math.cos(time + this.pulsePhase) * 0.1;
                this.vx *= 0.995;
                this.vy *= 0.995;
                break;
            default:
                // Normal movement with slight drift
                this.vx *= 0.99;
                this.vy *= 0.99;
                break;
        }
        
        // Natural floating movement
        this.baseX += this.vx;
        this.baseY += this.vy;
        
        // Enhanced boundary interactions
        const margin = 20;
        if (this.baseX < margin) {
            this.vx = Math.abs(this.vx);
            this.baseX = margin;
        }
        if (this.baseX > canvasWidth - margin) {
            this.vx = -Math.abs(this.vx);
            this.baseX = canvasWidth - margin;
        }
        if (this.baseY < margin) {
            this.vy = Math.abs(this.vy);
            this.baseY = margin;
        }
        if (this.baseY > canvasHeight - margin) {
            this.vy = -Math.abs(this.vy);
            this.baseY = canvasHeight - margin;
        }
        
        // Update effects
        this.pulsePhase += this.pulseSpeed;
        this.rotationAngle += this.rotationSpeed;
        this.energy = Math.max(0.1, this.energy - 0.001);
        
        // Life and aging for spawned particles
        if (this.maxLife < 1) {
            this.life -= 0.01;
            this.opacity *= 0.999;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Enhanced pulsing with energy influence
        const pulse = Math.sin(this.pulsePhase) * 0.5 + 0.5;
        const energyPulse = this.energy * pulse;
        const currentSize = this.size + energyPulse * 3;
        const currentOpacity = Math.min(1, this.opacity + energyPulse * 0.4);
        
        // Rotation for energy and nebula particles
        if (this.type !== 'normal') {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotationAngle);
            ctx.translate(-this.x, -this.y);
        }
        
        // Type-specific rendering
        switch(this.type) {
            case 'energy':
                this.drawEnergyParticle(ctx, currentSize, currentOpacity, energyPulse);
                break;
            case 'nebula':
                this.drawNebulaParticle(ctx, currentSize, currentOpacity, pulse);
                break;
            default:
                this.drawNormalParticle(ctx, currentSize, currentOpacity, pulse);
                break;
        }
        
        ctx.restore();
    }
    
    drawEnergyParticle(ctx, currentSize, currentOpacity, energyPulse) {
        // Multiple layers for energy effect
        const glowSize = currentSize * (3 + energyPulse * 2);
        
        // Outer energy field
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const outerGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize
        );
        outerGradient.addColorStop(0, `${this.color} ${currentOpacity * 0.9})`);
        outerGradient.addColorStop(0.3, `${this.color} ${currentOpacity * 0.6})`);
        outerGradient.addColorStop(0.7, `${this.color} ${currentOpacity * 0.2})`);
        outerGradient.addColorStop(1, `${this.color} 0)`);
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Core with spikes
        ctx.fillStyle = `${this.color} ${currentOpacity})`;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8 + this.rotationAngle;
            const spikeLength = currentSize * (1 + energyPulse * 0.5);
            const x = this.x + Math.cos(angle) * spikeLength;
            const y = this.y + Math.sin(angle) * spikeLength;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawNebulaParticle(ctx, currentSize, currentOpacity, pulse) {
        // Diffuse, cloud-like appearance
        const cloudSize = currentSize * (2 + pulse);
        
        // Multiple overlapping clouds
        for (let i = 0; i < 3; i++) {
            const offset = i * 0.3;
            const cloudGradient = ctx.createRadialGradient(
                this.x + Math.sin(this.rotationAngle + offset) * currentSize * 0.5,
                this.y + Math.cos(this.rotationAngle + offset) * currentSize * 0.5,
                0,
                this.x, this.y, cloudSize * (1 - offset * 0.2)
            );
            cloudGradient.addColorStop(0, `${this.color} ${currentOpacity * (0.6 - offset * 0.2)})`);
            cloudGradient.addColorStop(0.5, `${this.color} ${currentOpacity * (0.3 - offset * 0.1)})`);
            cloudGradient.addColorStop(1, `${this.color} 0)`);
            
            ctx.fillStyle = cloudGradient;
            ctx.beginPath();
            ctx.arc(
                this.x + Math.sin(this.rotationAngle + offset) * currentSize * 0.3,
                this.y + Math.cos(this.rotationAngle + offset) * currentSize * 0.3,
                cloudSize * (1 - offset * 0.3), 0, Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    drawNormalParticle(ctx, currentSize, currentOpacity, pulse) {
        // Enhanced standard particle with better glow
        const glowSize = currentSize * 4;
        
        // Outer glow
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, glowSize
        );
        gradient.addColorStop(0, `${this.color} ${currentOpacity * 0.8})`);
        gradient.addColorStop(0.4, `${this.color} ${currentOpacity * 0.4})`);
        gradient.addColorStop(0.8, `${this.color} ${currentOpacity * 0.1})`);
        gradient.addColorStop(1, `${this.color} 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Core particle with rim lighting
        ctx.fillStyle = `${this.color} ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Rim light
        ctx.strokeStyle = `rgba(255, 255, 255, ${currentOpacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.7})`;
        ctx.beginPath();
        ctx.arc(
            this.x - currentSize * 0.3, 
            this.y - currentSize * 0.3, 
            currentSize * 0.3, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

// Modal functionality
function initModals() {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

// Supabase lightweight loader
async function ensureSupabase() {
    if (!window.__SUPABASE || !window.__SUPABASE.url || !window.__SUPABASE.anonKey) return null;
    if (window.__supabaseClient) return window.__supabaseClient;
    // lazy load only when needed
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    window.__supabaseClient = createClient(window.__SUPABASE.url, window.__SUPABASE.anonKey, {
        auth: { persistSession: false }
    });
    return window.__supabaseClient;
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = '';
}

// Helpers for showing modals from buttons
function openUnitConverter() { document.getElementById('unit-modal').style.display = 'flex'; document.body.style.overflow = 'hidden'; }
function openQuadraticSolver() { document.getElementById('quadratic-modal').style.display = 'flex'; document.body.style.overflow = 'hidden'; }
function openPercentageCalculator() { document.getElementById('percentage-modal').style.display = 'flex'; document.body.style.overflow = 'hidden'; }

// Projects filter functionality
function initProjectsFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// App opening functions
function openTodoApp() {
    document.getElementById('todo-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function openMathApp() {
    document.getElementById('math-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function showProjectDetails(projectId) {
    const modal = document.getElementById('project-modal');
    const title = document.getElementById('project-modal-title');
    const content = document.getElementById('project-modal-content');
    
    if (projectId === 'warhammer') {
        title.textContent = 'Warhammer 40K Game Details';
        content.innerHTML = `
            <div class="project-details">
                <h3>Warhammer 40K: Heroes of the Imperium</h3>
                <p>A comprehensive turn-based strategy game set in the grim darkness of the Warhammer 40K universe.</p>
                
                <h4>Features:</h4>
                <ul>
                    <li><strong>Turn-Based Combat:</strong> Strategic grid-based battles with unique unit abilities</li>
                    <li><strong>Campaign Mode:</strong> Progress through an engaging narrative campaign</li>
                    <li><strong>Multiple Factions:</strong> Choose from various Warhammer 40K factions</li>
                    <li><strong>Unit Customization:</strong> Upgrade and customize your army units</li>
                    <li><strong>Tactical Gameplay:</strong> Deep strategic mechanics for experienced players</li>
                </ul>
                
                <h4>Technologies Used:</h4>
                <div class="tech-stack">
                    <span class="tech-tag">Python</span>
                    <span class="tech-tag">Pygame</span>
                    <span class="tech-tag">Game Design</span>
                </div>
                
                <h4>Development Highlights:</h4>
                <p>This project showcases my ability to create complex game systems, implement AI for enemy units, 
                and design engaging user interfaces. The game features a complete combat system with different 
                unit types, terrain effects, and strategic depth.</p>
                
                <div class="project-actions" style="margin-top: 20px;">
                    <a href="assets/warhammer40k_game.zip" class="btn btn-primary" download>
                        <i class="fas fa-download"></i> Download Game
                    </a>
                </div>
            </div>
        `;
    }
    
    openModal('project-modal');
}

// Todo App functionality
function initTodoApp() {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');
    const todoFilters = document.querySelectorAll('.todo-filters .filter-btn');
    const clearCompleted = document.getElementById('clear-completed');
    const todoCount = document.getElementById('todo-count');
    
    if (!todoInput || !addBtn) return;
    
    // Add task event listeners
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    // Filter event listeners
    todoFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            todoFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            todosFilter = filter.getAttribute('data-filter');
            renderTodos();
        });
    });
    
    // Clear completed tasks
    if (clearCompleted) {
        clearCompleted.addEventListener('click', () => {
            todos = todos.filter(todo => !todo.completed);
            renderTodos();
        });
    }
    
    // Initial render
    renderTodos();
}

function addTodo() {
    const todoInput = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('todo-priority');
    const text = todoInput.value.trim();
    
    if (!text) return;
    
    const todo = {
        id: todoIdCounter++,
        text: text,
        completed: false,
        priority: prioritySelect ? prioritySelect.value : 'medium',
        createdAt: new Date()
    };
    
    todos.unshift(todo);
    todoInput.value = '';
    renderTodos();
    
    // Scroll to top of todo list
    const todoListContainer = document.querySelector('.todo-list-container');
    if (todoListContainer) {
        todoListContainer.scrollTop = 0;
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    const todoCount = document.getElementById('todo-count');
    
    if (!todoList) return;
    
    // Filter todos
    let filteredTodos = todos;
    if (todosFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (todosFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    
    // Render todos
    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''} ${todo.priority}">
            <input type="checkbox" class="todo-checkbox" 
                   ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </li>
    `).join('');
    
    // Update count
    const activeTodos = todos.filter(todo => !todo.completed).length;
    if (todoCount) {
        todoCount.textContent = activeTodos + ' task' + (activeTodos !== 1 ? 's' : '') + ' remaining';
    }
}

// Calculator functionality
function initCalculator() {
    const display = document.getElementById('calc-display');
    const history = document.getElementById('calc-history');
    
    // Initialize display
    if (display) {
        display.value = '0';
    }
}

let calculatorState = {
    display: '0',
    previousValue: null,
    operation: null,
    waitingForNewValue: false
};

function appendToDisplay(value) {
    const display = document.getElementById('calc-display');
    if (!display) return;
    
    if (calculatorState.waitingForNewValue) {
        calculatorState.display = value;
        calculatorState.waitingForNewValue = false;
    } else {
        calculatorState.display = calculatorState.display === '0' ? value : calculatorState.display + value;
    }
    
    display.value = calculatorState.display;
}

function clearCalculator() {
    const display = document.getElementById('calc-display');
    const history = document.getElementById('calc-history');
    
    calculatorState = {
        display: '0',
        previousValue: null,
        operation: null,
        waitingForNewValue: false
    };
    
    if (display) display.value = '0';
    if (history) history.textContent = '';
}

function deleteLast() {
    const display = document.getElementById('calc-display');
    if (!display) return;
    
    if (calculatorState.waitingForNewValue) return;
    
    calculatorState.display = calculatorState.display.length > 1 
        ? calculatorState.display.slice(0, -1) 
        : '0';
    
    display.value = calculatorState.display;
}

function calculateResult() {
    const display = document.getElementById('calc-display');
    const history = document.getElementById('calc-history');
    if (!display) return;
    
    try {
        // Simple expression evaluation (be careful with eval in production)
        const expression = calculatorState.display;
        let result = Function('"use strict"; return (' + expression.replace(/×/g, '*').replace(/÷/g, '/') + ')')();
        
        // Handle division by zero
        if (!isFinite(result)) {
            result = 'Error';
        } else {
            result = parseFloat(result.toFixed(10)); // Limit decimal places
        }
        
        if (history) {
            history.textContent = expression + ' =';
        }
        
        calculatorState.display = result.toString();
        calculatorState.waitingForNewValue = true;
        display.value = calculatorState.display;
        
    } catch (error) {
        display.value = 'Error';
        calculatorState.display = '0';
        calculatorState.waitingForNewValue = true;
    }
}

// Unit Converter
function initUnitConverter() {
    const categoryEl = document.getElementById('unit-category');
    const fromEl = document.getElementById('unit-from');
    const toEl = document.getElementById('unit-to');
    const swapBtn = document.getElementById('unit-swap');
    const convertBtn = document.getElementById('unit-convert');
    const inputEl = document.getElementById('unit-input');
    const outputEl = document.getElementById('unit-output');
    if (!categoryEl || !fromEl || !toEl || !swapBtn || !convertBtn || !inputEl || !outputEl) return;

    const UNITS = {
        length: {
            base: 'm',
            units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 }
        },
        weight: {
            base: 'kg',
            units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523125 }
        },
        temperature: {
            base: 'C',
            units: { C: 'C', F: 'F', K: 'K' }
        }
    };

    function fillUnits(category) {
        const cat = UNITS[category];
        if (!cat) return;
        const keys = Object.keys(cat.units);
        fromEl.innerHTML = keys.map(u => `<option value="${u}">${u}</option>`).join('');
        toEl.innerHTML = keys.map(u => `<option value="${u}">${u}</option>`).join('');
        toEl.value = keys[1] || keys[0];
    }

    function convert() {
        const category = categoryEl.value;
        const value = parseFloat(inputEl.value);
        const from = fromEl.value;
        const to = toEl.value;
        if (isNaN(value)) { outputEl.textContent = 'Enter a number'; return; }
        if (category === 'temperature') {
            const c = from === 'C' ? value : from === 'F' ? (value - 32) * 5/9 : value - 273.15;
            const result = to === 'C' ? c : to === 'F' ? (c * 9/5 + 32) : c + 273.15;
            outputEl.textContent = `${value} ${from} = ${roundSmart(result)} ${to}`;
        } else {
            const cat = UNITS[category];
            const toBase = value * cat.units[from];
            const result = toBase / cat.units[to];
            outputEl.textContent = `${value} ${from} = ${roundSmart(result)} ${to}`;
        }
    }

    function swap() { const temp = fromEl.value; fromEl.value = toEl.value; toEl.value = temp; convert(); }

    categoryEl.addEventListener('change', () => { fillUnits(categoryEl.value); convert(); });
    swapBtn.addEventListener('click', swap);
    convertBtn.addEventListener('click', convert);
    inputEl.addEventListener('input', debounce(convert, 200));

    fillUnits(categoryEl.value);
}

// Quadratic Solver
function initQuadraticSolver() {
    const aEl = document.getElementById('quad-a');
    const bEl = document.getElementById('quad-b');
    const cEl = document.getElementById('quad-c');
    const solveBtn = document.getElementById('quad-solve');
    const resultEl = document.getElementById('quad-result');
    if (!aEl || !bEl || !cEl || !solveBtn || !resultEl) return;

    function solve() {
        const a = parseFloat(aEl.value);
        const b = parseFloat(bEl.value);
        const c = parseFloat(cEl.value);
        if ([a, b, c].some(v => isNaN(v))) { resultEl.textContent = 'Enter all coefficients'; return; }
        if (a === 0) { resultEl.textContent = 'a must not be 0'; return; }
        const D = b*b - 4*a*c;
        if (D > 0) {
            const r1 = (-b + Math.sqrt(D)) / (2*a);
            const r2 = (-b - Math.sqrt(D)) / (2*a);
            resultEl.textContent = `Discriminant ${roundSmart(D)} > 0. Two real roots: x1 = ${roundSmart(r1)}, x2 = ${roundSmart(r2)}`;
        } else if (D === 0) {
            const r = (-b) / (2*a);
            resultEl.textContent = `Discriminant 0. One real repeated root: x = ${roundSmart(r)}`;
        } else {
            const real = (-b) / (2*a);
            const imag = Math.sqrt(-D) / (2*a);
            resultEl.textContent = `Discriminant ${roundSmart(D)} < 0. Complex roots: x1 = ${roundSmart(real)} + ${roundSmart(imag)}i, x2 = ${roundSmart(real)} - ${roundSmart(imag)}i`;
        }
    }

    solveBtn.addEventListener('click', solve);
}

// Percentage Calculator
function initPercentageCalculator() {
    const numEl = document.getElementById('perc-number');
    const pctEl = document.getElementById('perc-percent');
    const ofBtn = document.getElementById('perc-of');
    const incBtn = document.getElementById('perc-inc');
    const decBtn = document.getElementById('perc-dec');
    const resultEl = document.getElementById('perc-result');
    if (!numEl || !pctEl || !ofBtn || !incBtn || !decBtn || !resultEl) return;

    function parseVals() { return { n: parseFloat(numEl.value), p: parseFloat(pctEl.value) }; }
    function ensure() { const { n, p } = parseVals(); return !(isNaN(n) || isNaN(p)); }

    ofBtn.addEventListener('click', () => {
        if (!ensure()) { resultEl.textContent = 'Enter number and percent'; return; }
        const { n, p } = parseVals();
        const val = n * (p/100);
        resultEl.textContent = `${p}% of ${n} = ${roundSmart(val)}`;
    });
    incBtn.addEventListener('click', () => {
        if (!ensure()) { resultEl.textContent = 'Enter number and percent'; return; }
        const { n, p } = parseVals();
        const val = n * (1 + p/100);
        resultEl.textContent = `${n} increased by ${p}% = ${roundSmart(val)}`;
    });
    decBtn.addEventListener('click', () => {
        if (!ensure()) { resultEl.textContent = 'Enter number and percent'; return; }
        const { n, p } = parseVals();
        const val = n * (1 - p/100);
        resultEl.textContent = `${n} decreased by ${p}% = ${roundSmart(val)}`;
    });
}

function roundSmart(num) {
    if (!isFinite(num)) return 'Error';
    const abs = Math.abs(num);
    if (abs === 0) return '0';
    if (abs >= 1e6 || abs < 1e-3) return num.toExponential(3);
    return parseFloat(num.toFixed(6)).toString();
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

// Add some fun interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-title .name');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid #0066cc';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                // Remove cursor after typing
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
    
    // Add hover effects to interest cards
    document.querySelectorAll('.interest-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) rotate(2deg) scale(1.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotate(0deg) scale(1)';
        });
    });
    
    // Add click effects to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', (e) => {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: translate(-50%, -50%) scale(0);
                animation: ripple ${Math.random() * 0.5 + 0.25}s ease-out;
            `;
            
            button.appendChild(ripple);
            
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });

            // Brief gradient feedback class
            button.classList.add('clicked');
            setTimeout(() => button.classList.remove('clicked'), 220);
        });
    });
    
    // Initialize Pomodoro Timer
    initPomodoroTimer();
    
    // Initialize Quick Notes
    initQuickNotes();
    
    // Load saved tasks
    loadTasks();
    
    // Pomodoro Timer initialization
    function initPomodoroTimer() {
        const timerModes = document.querySelectorAll('.timer-mode');
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const resetBtn = document.getElementById('reset-timer');
        const minutesDisplay = document.getElementById('timer-minutes');
        const secondsDisplay = document.getElementById('timer-seconds');
        const progressBar = document.querySelector('.progress-bar');
        const pomodoroCount = document.getElementById('pomodoro-count');
        const totalMinutes = document.getElementById('pomodoro-minutes');
        
        let timerRunning = false;
        let currentMode = 'pomodoro';
        let timeLeft = 25 * 60; // 25 minutes in seconds
        let initialTime = timeLeft;
        let completedPomodoros = 0;
        let minutesTracked = 0;
        let endTime = 0;
        
        // Load timer state from localStorage
        function loadTimerState() {
            const timerState = JSON.parse(localStorage.getItem('pomodoro-timer-state') || '{}');
            if (timerState.running) {
                timerRunning = true;
                currentMode = timerState.mode || 'pomodoro';
                endTime = timerState.endTime;
                initialTime = timerState.initialTime || (25 * 60);
                
                // Calculate time left based on end time
                const now = Date.now();
                timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                
                // Update UI to show timer is running
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                
                // Set active mode button
                timerModes.forEach(mode => {
                    if (mode.getAttribute('data-mode') === currentMode) {
                        mode.classList.add('active');
                    } else {
                        mode.classList.remove('active');
                    }
                });
                
                // Start the timer
                startTimer();
            }
            
            // Load stats
            const savedStats = JSON.parse(localStorage.getItem('pomodoro-stats') || '{"count":0,"minutes":0}');
            completedPomodoros = savedStats.count || 0;
            minutesTracked = savedStats.minutes || 0;
            
            pomodoroCount.textContent = completedPomodoros;
            totalMinutes.textContent = minutesTracked;
            
            // Update display
            updateTimerDisplay();
            updateProgressBar();
        }
        
        // Save timer state to localStorage
        function saveTimerState() {
            const timerState = {
                running: timerRunning,
                mode: currentMode,
                endTime: endTime,
                initialTime: initialTime
            };
            localStorage.setItem('pomodoro-timer-state', JSON.stringify(timerState));
        }
        
        // Set timer mode
        timerModes.forEach(mode => {
            mode.addEventListener('click', function() {
                // Only allow changing mode when timer is not running
                if (timerRunning) return;
                
                // Update active mode
                timerModes.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                // Set timer based on mode
                currentMode = this.getAttribute('data-mode');
                
                switch (currentMode) {
                    case 'pomodoro':
                        timeLeft = 25 * 60;
                        break;
                    case 'short-break':
                        timeLeft = 5 * 60;
                        break;
                    case 'long-break':
                        timeLeft = 15 * 60;
                        break;
                }
                
                initialTime = timeLeft;
                updateTimerDisplay();
                updateProgressBar();
            });
        });
        
        // Update timer display
        function updateTimerDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            minutesDisplay.textContent = minutes < 10 ? '0' + minutes : minutes;
            secondsDisplay.textContent = seconds < 10 ? '0' + seconds : seconds;
        }
        
        // Update progress bar
        function updateProgressBar() {
            const progress = (timeLeft / initialTime) * 100;
            progressBar.style.width = progress + '%';
        }
        
        // Timer update function that runs every 100ms
        function updateTimer() {
            // Calculate time left based on end time
            const now = Date.now();
            timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
            
            // Update UI
            updateTimerDisplay();
            updateProgressBar();
            
            // Check if timer has finished
            if (timeLeft <= 0) {
                timerCompleted();
            }
        }
        
        // Timer completed function
        function timerCompleted() {
            timerRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            
            // Clear the interval
            clearInterval(window.pomodoroInterval);
            
            // Update localStorage
            localStorage.removeItem('pomodoro-timer-state');
            
            // Update stats if it was a pomodoro
            if (currentMode === 'pomodoro') {
                completedPomodoros++;
                minutesTracked += Math.floor(initialTime / 60);
                
                pomodoroCount.textContent = completedPomodoros;
                totalMinutes.textContent = minutesTracked;
                
                // Save stats
                localStorage.setItem('pomodoro-stats', JSON.stringify({
                    count: completedPomodoros,
                    minutes: minutesTracked
                }));
                
                // Play notification sound
                playRoboticSound('notification');
                
                // Show notification if possible
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Pomodoro Completed', {
                        body: 'Time to take a break!',
                        icon: 'channels4_profile.png'
                    });
                } else if ('Notification' in window && Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }
                
                // Alert if the user is on the page
                if (document.visibilityState === 'visible') {
                    alert('Pomodoro completed! Take a break.');
                }
            }
        }
        
        // Start the timer
        function startTimer() {
            // Clear any existing interval
            clearInterval(window.pomodoroInterval);
            
            // Set end time
            endTime = Date.now() + (timeLeft * 1000);
            
            // Save state
            saveTimerState();
            
            // Start interval that updates every 100ms
            window.pomodoroInterval = setInterval(updateTimer, 100);
        }
        
        // Start timer button
        startBtn.addEventListener('click', function() {
            if (timerRunning) return;
            
            timerRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            startTimer();
        });
        
        // Pause timer button
        pauseBtn.addEventListener('click', function() {
            if (!timerRunning) return;
            
            clearInterval(window.pomodoroInterval);
            timerRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            
            // Remove from localStorage when paused
            localStorage.removeItem('pomodoro-timer-state');
        });
        
        // Reset timer button
        resetBtn.addEventListener('click', function() {
            clearInterval(window.pomodoroInterval);
            timerRunning = false;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            
            // Reset to current mode's initial time
            switch (currentMode) {
                case 'pomodoro':
                    timeLeft = 25 * 60;
                    break;
                case 'short-break':
                    timeLeft = 5 * 60;
                    break;
                case 'long-break':
                    timeLeft = 15 * 60;
                    break;
            }
            
            initialTime = timeLeft;
            updateTimerDisplay();
            updateProgressBar();
            
            // Remove from localStorage when reset
            localStorage.removeItem('pomodoro-timer-state');
        });
        
        // Check timer status when page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible' && timerRunning) {
                // Refresh the timer display when tab becomes visible again
                updateTimer();
            }
        });
        
        // Initialize timer state
        loadTimerState();
    }
    
    // Quick Notes initialization
    function initQuickNotes() {
        const notesTextarea = document.getElementById('quick-notes');
        const saveBtn = document.getElementById('save-notes');
        const clearBtn = document.getElementById('clear-notes');
        const savedStatus = document.getElementById('notes-saved');
        
        // Load saved notes
        const savedNotes = localStorage.getItem('quick-notes');
        if (savedNotes) {
            notesTextarea.value = savedNotes;
        }
        
        // Track changes
        let notesSaved = true;
        
        notesTextarea.addEventListener('input', function() {
            notesSaved = false;
            savedStatus.textContent = 'Unsaved changes';
            savedStatus.classList.add('unsaved');
        });
        
        // Save notes
        saveBtn.addEventListener('click', function() {
            localStorage.setItem('quick-notes', notesTextarea.value);
            notesSaved = true;
            savedStatus.textContent = 'All changes saved';
            savedStatus.classList.remove('unsaved');
            
            // Play sound
            playRoboticSound('click');
        });
        
        // Clear notes
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all notes?')) {
                notesTextarea.value = '';
                localStorage.removeItem('quick-notes');
                notesSaved = true;
                savedStatus.textContent = 'Notes cleared';
                savedStatus.classList.remove('unsaved');
            }
        });
        
        // Auto-save on tab change
        document.querySelectorAll('.todo-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                if (!notesSaved && document.getElementById('notes-tab').classList.contains('active')) {
                    localStorage.setItem('quick-notes', notesTextarea.value);
                    savedStatus.textContent = 'Auto-saved';
                    notesSaved = true;
                }
            });
        });
    }
});

// Function to show the Todo App
function showTodoApp() {
    console.log('Showing Todo App');
    const modal = document.getElementById('todo-app-modal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error('Todo App modal not found');
    }
}

// Add Todo App to project modals
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Todo App structure
    initTodoApp();
    
    // Directly add event listener to Todo App button
    const todoAppCards = document.querySelectorAll('.project-card h3');
    todoAppCards.forEach(heading => {
        if (heading.textContent.includes('Todo App')) {
            const todoProjectCard = heading.closest('.project-card');
            const viewButton = todoProjectCard.querySelector('.view-project-btn');
            
            if (viewButton) {
                viewButton.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log("Todo App button clicked directly");
                    showTodoApp();
                });
            }
        }
    });
});

// Project details data
const projectDetails = {
    'Warhammer 40K Game': {
        icon: 'fa-dragon',
        description: 'A comprehensive turn-based strategy game set in the grim darkness of the Warhammer 40K universe.',
        features: [
            'Turn-based tactical combat system',
            'Multiple playable factions',
            'Rich storyline and campaign mode',
            'Unit customization and upgrades',
            'Strategic gameplay mechanics'
        ],
        technologies: ['Python', 'Pygame', 'Game Design'],
        demoLink: '#',
        codeLink: 'https://github.com/PrasiddhNaik'
    },
    'Todo App': {
        icon: 'fa-tasks',
        description: 'A modern task management application with intuitive interface and powerful features.',
        features: [
            'Task creation and management',
            'Priority levels and categories',
            'Progress tracking',
            'Local storage persistence',
            'Responsive design'
        ],
        technologies: ['HTML5', 'CSS3', 'JavaScript'],
        demoLink: '#',
        codeLink: 'https://github.com/PrasiddhNaik'
    }
};

// Update the openProjectModal function to handle the Todo App
function openProjectModal(projectTitle) {
    console.log('Opening project: ' + projectTitle);
    
    // For Todo App, open the todo app modal
    if (projectTitle === 'Todo App' || projectTitle === 'Simple Todo App') {
        showTodoApp();
        return; // Exit early
    }

    // For Warhammer 40K Game, scroll to the game showcase section instead of opening modal
    if (projectTitle === 'Warhammer 40K Game') {
        const gameShowcaseSection = document.querySelector('.game-showcase');
        if (gameShowcaseSection) {
            // Scroll to the game showcase section with smooth animation
            gameShowcaseSection.scrollIntoView({ behavior: 'smooth' });
            // Add a visual highlight effect to make it clear where to look
            gameShowcaseSection.classList.add('highlight-section');
            // Remove the highlight effect after 2 seconds
            setTimeout(() => {
                gameShowcaseSection.classList.remove('highlight-section');
            }, 2000);
            return; // Exit the function early
        }
    }
    
    // Password Manager code removed as requested
    
    const project = projectDetails[projectTitle];
    if (!project) {
        console.error("Project details not found for:", projectTitle);
        return;
    }
    
    // Create modal content
    const content = 
        '<div class="project-modal-header">' +
            '<div class="project-modal-icon">' +
                '<i class="fas ' + project.icon + '"></i>' +
            '</div>' +
            '<h2 class="project-modal-title">' + projectTitle + '</h2>' +
        '</div>' +
        '<div class="project-modal-description">' +
            project.description +
        '</div>' +
        '<div class="project-modal-features">' +
            '<h4>Key Features</h4>' +
            '<ul>' +
                project.features.map(feature => '<li>' + feature + '</li>').join('') +
            '</ul>' +
        '</div>' +
        '<div class="project-modal-tech">' +
            '<h4>Technologies Used</h4>' +
            '<div class="project-modal-tech-list">' +
                project.technologies.map(tech => '<span class="tech-tag">' + tech + '</span>').join('') +
            '</div>' +
        '</div>' +
        '<div class="project-modal-buttons">' +
            '<a href="' + project.demoLink + '" class="project-modal-btn" target="_blank">' +
                '<i class="fas fa-external-link-alt"></i> View Demo' +
            '</a>' +
            '<a href="' + project.codeLink + '" class="project-modal-btn secondary" target="_blank">' +
                '<i class="fas fa-code"></i> View Code' +
            '</a>' +
        '</div>';
    
    // Set modal content
    const modalContent = document.getElementById('project-modal-content');
    const projectModal = document.getElementById('project-modal');
    
    if (!modalContent || !projectModal) {
        console.error("Modal elements not found");
        return;
    }
    
    modalContent.innerHTML = content;
    
    // Show modal with animation
    projectModal.style.display = 'block';
    const modalElement = projectModal.querySelector('.modal-content');
    modalElement.style.opacity = '0';
    modalElement.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        modalElement.style.opacity = '1';
        modalElement.style.transform = 'translateY(0)';
    }, 50);
}

// Function to update the current date
function updateCurrentDate() {
    const currentDate = new Date();
    
    // Format date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = year + '-' + month + '-' + day;
    
    // Insert the date into the HTML comment
    const headerElement = document.querySelector('header');
    const headerHTML = headerElement.innerHTML;
    const updatedHTML = headerHTML.replace(
        /<!-- CLAUDE_DATE_INFO: <span id="current-date">.*?<\/span> -->/,
        '<!-- CLAUDE_DATE_INFO: <span id="current-date">' + formattedDate + '</span> -->'
    );
    headerElement.innerHTML = updatedHTML;
}