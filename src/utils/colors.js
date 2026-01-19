import * as THREE from 'three';

/**
 * Generate a random HSL color
 * @returns {THREE.Color} Random color in HSL space
 */
export function generateHSLColor() {
    const hue = Math.random();
    const saturation = 0.7 + Math.random() * 0.3;
    const lightness = 0.4 + Math.random() * 0.4;
    return new THREE.Color().setHSL(hue, saturation, lightness);
}

/**
 * Generate a color from a palette
 * @param {string[]} palette - Array of hex color strings
 * @param {number} index - Index in palette (optional, random if not provided)
 * @returns {THREE.Color} Color from palette
 */
export function generateColor(palette, index) {
    if (!palette || palette.length === 0) {
        return generateHSLColor();
    }
    
    const colorIndex = index !== undefined ? index : Math.floor(Math.random() * palette.length);
    return new THREE.Color(palette[colorIndex]);
}

/**
 * Create a color palette from HSL range
 * @param {number} count - Number of colors in palette
 * @param {number} hueStart - Starting hue (0-1)
 * @param {number} hueRange - Hue range (0-1)
 * @returns {string[]} Array of hex color strings
 */
export function createHSLPalette(count, hueStart = 0, hueRange = 1) {
    const palette = [];
    for (let i = 0; i < count; i++) {
        const hue = (hueStart + (hueRange * i / count)) % 1;
        const saturation = 0.7 + Math.random() * 0.2;
        const lightness = 0.5 + Math.random() * 0.2;
        const color = new THREE.Color().setHSL(hue, saturation, lightness);
        palette.push('#' + color.getHexString());
    }
    return palette;
}

/**
 * Convert hex color to HSL object
 * @param {string} hex - Hex color string
 * @returns {{h: number, s: number, l: number}} HSL object
 */
export function hexToHSL(hex) {
    const color = new THREE.Color(hex);
    const hsl = { h: 0, s: 0, l: 0 };
    color.getHSL(hsl);
    return hsl;
}

/**
 * Convert HSL object to hex string
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {string} Hex color string
 */
export function hslToHex(h, s, l) {
    const color = new THREE.Color().setHSL(h, s, l);
    return '#' + color.getHexString();
}

/**
 * Create a gradient color between two colors
 * @param {string} color1 - Starting hex color
 * @param {string} color2 - Ending hex color
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string} Interpolated hex color
 */
export function interpolateColor(color1, color2, t) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return '#' + c1.lerp(c2, t).getHexString();
}

/**
 * Popular color palettes for generative art
 */
export const PALETTES = {
    // Lygia Clark inspired (organic, earthy)
    EARTH: ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F5DEB3'],
    
    // Vibrant artistic palette
    VIBRANT: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
    
    // Monochromatic with variation
    MONO: ['#1a1a1a', '#4a4a4a', '#7a7a7a', '#aaaaaa', '#dadada'],
    
    // Sunset colors
    SUNSET: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
    
    // Ocean depths
    OCEAN: ['#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef'],
    
    // Forest greens
    FOREST: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2'],
    
    // Neon cyberpunk
    NEON: ['#ff00ff', '#00ffff', '#ff00aa', '#00ff00', '#ffff00'],
    
    // Pastel dream
    PASTEL: ['#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff', '#cdb4db'],
    
    // Warm fire
    FIRE: ['#ff0000', '#ff4500', '#ff8c00', '#ffa500', '#ffd700'],
    
    // Cool ice
    ICE: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da'],
};

/**
 * Get a random palette
 * @returns {string[]} Random color palette
 */
export function getRandomPalette() {
    const keys = Object.keys(PALETTES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return PALETTES[randomKey];
}

/**
 * Create a custom palette based on theme
 * @param {string} theme - Theme name (earth, vibrant, mono, etc.)
 * @returns {string[]} Color palette
 */
export function getPalette(theme = 'vibrant') {
    const lowerTheme = theme.toLowerCase();
    if (PALETTES[lowerTheme.toUpperCase()]) {
        return PALETTES[lowerTheme.toUpperCase()];
    }
    return PALETTES.VIBRANT; // Default fallback
}