/**
 * Premium UI Utilities - Toast Notifications, Confetti, and Helper Functions
 * For Atashinchi Study App
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🔔 TOAST NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

const TOAST_TYPES = {
    success: { icon: '✓', class: 'toast-success' },
    error: { icon: '✕', class: 'toast-error' },
    warning: { icon: '⚠', class: 'toast-warning' },
    info: { icon: 'ℹ', class: 'toast-info' }
};

const TOAST_DURATION = 4000; // 4 seconds
let toastContainer = null;

/**
 * Initialize toast container
 */
function initToastContainer() {
    if (toastContainer) return;

    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
}

/**
 * Show a toast notification
 * @param {Object} options - Toast options
 * @param {string} options.title - Toast title
 * @param {string} options.message - Toast message
 * @param {'success'|'error'|'warning'|'info'} options.type - Toast type
 * @param {number} options.duration - Duration in ms (default: 4000)
 * @param {Function} options.onClick - Click callback
 */
export function showToast({ title, message, type = 'info', duration = TOAST_DURATION, onClick = null }) {
    initToastContainer();

    const toastType = TOAST_TYPES[type] || TOAST_TYPES.info;

    const toast = document.createElement('div');
    toast.className = `toast ${toastType.class}`;
    toast.innerHTML = `
        <div class="toast-icon">${toastType.icon}</div>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close" aria-label="閉じる">✕</button>
    `;

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeToast(toast);
    });

    // Click handler
    if (onClick) {
        toast.style.cursor = 'pointer';
        toast.addEventListener('click', onClick);
    }

    toastContainer.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => removeToast(toast), duration);

    return toast;
}

/**
 * Remove a toast with animation
 */
function removeToast(toast) {
    if (!toast || !toast.parentElement) return;

    toast.classList.add('toast-exit');
    setTimeout(() => {
        toast.remove();
    }, 300);
}

/**
 * Convenience methods for different toast types
 */
export function toastSuccess(message, title = '成功') {
    return showToast({ title, message, type: 'success' });
}

export function toastError(message, title = 'エラー') {
    return showToast({ title, message, type: 'error' });
}

export function toastWarning(message, title = '警告') {
    return showToast({ title, message, type: 'warning' });
}

export function toastInfo(message, title = 'お知らせ') {
    return showToast({ title, message, type: 'info' });
}


// ═══════════════════════════════════════════════════════════════════════════
// 🎊 CONFETTI CELEBRATION EFFECT
// ═══════════════════════════════════════════════════════════════════════════

const CONFETTI_COLORS = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#22c55e', // Green
];

/**
 * Create and trigger a confetti celebration
 * @param {Object} options - Confetti options
 * @param {number} options.count - Number of confetti pieces (default: 100)
 * @param {number} options.duration - Animation duration in ms (default: 3000)
 * @param {string[]} options.colors - Array of colors to use
 */
export function triggerConfetti({ count = 100, duration = 3000, colors = CONFETTI_COLORS } = {}) {
    // Create container
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    // Create confetti pieces
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        // Random properties
        const left = Math.random() * 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 6;
        const animDuration = Math.random() * 2 + 2;
        const delay = Math.random() * 0.5;
        const shape = Math.random() > 0.5 ? 'circle' : 'square';

        piece.style.cssText = `
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: ${shape === 'circle' ? '50%' : '2px'};
            animation-duration: ${animDuration}s;
            animation-delay: ${delay}s;
        `;

        container.appendChild(piece);
    }

    // Remove container after animation
    setTimeout(() => {
        container.remove();
    }, duration);
}

/**
 * Trigger a mini celebration (for small achievements)
 */
export function miniCelebration() {
    triggerConfetti({ count: 30, duration: 2000 });
    toastSuccess('お見事！🎉', '');
}

/**
 * Trigger a big celebration (for major achievements)
 */
export function bigCelebration(message = '素晴らしい成果です！') {
    triggerConfetti({ count: 150, duration: 4000 });
    toastSuccess(message, '🎊 おめでとうございます！');
}


// ═══════════════════════════════════════════════════════════════════════════
// 💀 SKELETON LOADING UI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a skeleton card HTML
 * @param {Object} options - Options
 * @param {boolean} options.hasAvatar - Include avatar skeleton
 * @param {number} options.lines - Number of text lines
 */
export function createSkeletonCard({ hasAvatar = true, lines = 3 } = {}) {
    const linesHTML = Array(lines).fill(0).map((_, i) => {
        const widthClass = i === 0 ? '' : i === lines - 1 ? 'skeleton-line-xs' : 'skeleton-line-short';
        return `<div class="skeleton-line ${widthClass}"></div>`;
    }).join('');

    return `
        <div class="skeleton-card">
            <div class="flex gap-4 items-start">
                ${hasAvatar ? '<div class="skeleton-avatar"></div>' : ''}
                <div class="flex-1">
                    <div class="flex gap-2 mb-3">
                        <div class="skeleton-badge"></div>
                        <div class="skeleton-badge" style="width: 60px;"></div>
                    </div>
                    ${linesHTML}
                </div>
            </div>
        </div>
    `;
}

/**
 * Create multiple skeleton cards
 */
export function createSkeletonGrid(count = 6) {
    return `
        <div class="card-grid">
            ${Array(count).fill(0).map(() => createSkeletonCard()).join('')}
        </div>
    `;
}


// ═══════════════════════════════════════════════════════════════════════════
// ⌨️ KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════

const shortcuts = new Map();
let shortcutsEnabled = true;

/**
 * Register a keyboard shortcut
 * @param {string} key - Key combination (e.g., 'ctrl+s', 'escape', 'h')
 * @param {Function} callback - Callback function
 * @param {string} description - Description for help display
 */
export function registerShortcut(key, callback, description = '') {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
    shortcuts.set(normalizedKey, { callback, description });
}

/**
 * Unregister a keyboard shortcut
 */
export function unregisterShortcut(key) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
    shortcuts.delete(normalizedKey);
}

/**
 * Enable/disable shortcuts
 */
export function setShortcutsEnabled(enabled) {
    shortcutsEnabled = enabled;
}

/**
 * Get all registered shortcuts
 */
export function getShortcuts() {
    return Array.from(shortcuts.entries()).map(([key, { description }]) => ({
        key,
        description
    }));
}

// Keyboard event listener
document.addEventListener('keydown', (e) => {
    if (!shortcutsEnabled) return;

    // Don't trigger shortcuts when typing in input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
    }

    // Build key string
    let keyStr = '';
    if (e.ctrlKey || e.metaKey) keyStr += 'ctrl+';
    if (e.altKey) keyStr += 'alt+';
    if (e.shiftKey) keyStr += 'shift+';
    keyStr += e.key.toLowerCase();

    const shortcut = shortcuts.get(keyStr);
    if (shortcut) {
        e.preventDefault();
        shortcut.callback(e);
    }
});


// ═══════════════════════════════════════════════════════════════════════════
// 📊 PROGRESS ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Animate a number counting up
 * @param {HTMLElement} element - Element to update
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Suffix to append (e.g., '%', '件')
 */
export function animateCounter(element, target, duration = 1000, suffix = '') {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);

        element.textContent = current + suffix;
        element.classList.add('counter-animate');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('counter-animate');
        }
    }

    requestAnimationFrame(update);
}

/**
 * Animate a progress bar fill
 * @param {HTMLElement} element - Progress bar fill element
 * @param {number} percentage - Target percentage (0-100)
 * @param {number} duration - Animation duration in ms
 */
export function animateProgress(element, percentage, duration = 800) {
    element.style.transition = `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
}


// ═══════════════════════════════════════════════════════════════════════════
// 🎭 PAGE TRANSITION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply page enter animation
 * @param {HTMLElement} element - Element to animate
 */
export function pageEnter(element) {
    element.classList.remove('page-exit');
    element.classList.add('page-enter');
}

/**
 * Apply page exit animation
 * @param {HTMLElement} element - Element to animate
 * @returns {Promise} Resolves when animation completes
 */
export function pageExit(element) {
    return new Promise((resolve) => {
        element.classList.remove('page-enter');
        element.classList.add('page-exit');
        setTimeout(resolve, 300);
    });
}


// ═══════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Debounce function
 */
export function debounce(func, wait) {
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

/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copy text to clipboard with toast notification
 */
export async function copyToClipboard(text, successMessage = 'コピーしました') {
    try {
        await navigator.clipboard.writeText(text);
        toastSuccess(successMessage, '');
        return true;
    } catch (err) {
        toastError('コピーに失敗しました');
        return false;
    }
}

/**
 * Format relative time (e.g., "3分前", "昨日")
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;

    return new Date(date).toLocaleDateString('ja-JP');
}


// ═══════════════════════════════════════════════════════════════════════════
// 🌙 DARK MODE TOGGLE
// ═══════════════════════════════════════════════════════════════════════════

const DARK_MODE_KEY = 'atashinchi-dark-mode';

/**
 * Get current dark mode preference
 */
export function isDarkMode() {
    const saved = localStorage.getItem(DARK_MODE_KEY);
    if (saved !== null) {
        return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Toggle dark mode
 */
export function toggleDarkMode() {
    const newValue = !isDarkMode();
    setDarkMode(newValue);
    return newValue;
}

/**
 * Set dark mode explicitly
 */
export function setDarkMode(enabled) {
    localStorage.setItem(DARK_MODE_KEY, String(enabled));
    document.body.classList.toggle('dark-mode', enabled);
}

/**
 * Initialize dark mode on page load
 */
export function initDarkMode() {
    setDarkMode(isDarkMode());
}


// ═══════════════════════════════════════════════════════════════════════════
// 📣 GLOBAL EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Expose to window for use without import
if (typeof window !== 'undefined') {
    window.PremiumUI = {
        showToast,
        toastSuccess,
        toastError,
        toastWarning,
        toastInfo,
        triggerConfetti,
        miniCelebration,
        bigCelebration,
        createSkeletonCard,
        createSkeletonGrid,
        registerShortcut,
        unregisterShortcut,
        animateCounter,
        animateProgress,
        copyToClipboard,
        formatRelativeTime,
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
        initDarkMode
    };
}

console.log('✨ Premium UI Utilities loaded');
