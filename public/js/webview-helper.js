// ============================================
//  WebView / In-App Browser Detection & Helpers
// ============================================

const InAppBrowser = {
    /**
     * Detect if page is running inside an in-app browser (WebView)
     * Returns the name of the app (or null if normal browser)
     */
    detect() {
        const ua = navigator.userAgent || '';
        const patterns = [
            { name: 'LINE',        re: /Line\// },
            { name: 'Facebook',    re: /FBAN|FBAV|FB_IAB|FB4A/ },
            { name: 'Messenger',   re: /Messenger|MessengerLite/ },
            { name: 'Instagram',   re: /Instagram/ },
            { name: 'TikTok',      re: /TikTok|BytedanceWebview/ },
            { name: 'Twitter/X',   re: /Twitter|TwitterAndroid/ },
            { name: 'WeChat',      re: /MicroMessenger/ },
            { name: 'LinkedIn',    re: /LinkedInApp/ },
            { name: 'Snapchat',    re: /Snapchat/ },
            { name: 'KakaoTalk',   re: /KAKAOTALK/i }
        ];
        for (const p of patterns) {
            if (p.re.test(ua)) return p.name;
        }
        return null;
    },

    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    },

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },

    /**
     * Try to open the current URL in the real system browser
     * Works best on Android (intent:// scheme launches Chrome directly)
     */
    openInExternalBrowser() {
        const currentUrl = window.location.href;
        const ua = navigator.userAgent;

        if (/Android/i.test(ua)) {
            // Android: use intent:// to launch Chrome
            const host = window.location.host;
            const pathAndQuery = window.location.pathname + window.location.search + window.location.hash;
            const intentUrl =
                `intent://${host}${pathAndQuery}` +
                `#Intent;scheme=https;` +
                `package=com.android.chrome;` +
                `action=android.intent.action.VIEW;` +
                `S.browser_fallback_url=${encodeURIComponent(currentUrl)};` +
                `end;`;
            window.location.href = intentUrl;
        } else if (/iPad|iPhone|iPod/.test(ua)) {
            // iOS: best we can do is copy link + show instructions
            // (no reliable way to force Safari open from in-app)
            navigator.clipboard.writeText(currentUrl).then(() => {
                alert('คัดลอกลิงก์แล้ว\n\nกรุณา:\n1. กดที่ ... (จุดสามจุด) มุมขวาบน\n2. เลือก "Open in Safari"\n\nหรือเปิด Safari แล้ววางลิงก์');
            }).catch(() => {
                alert('กรุณากดที่ ⋯ มุมขวาบน → เลือก "Open in Safari" หรือ "เปิดใน Safari"');
            });
        }
    },

    /**
     * Test if canvas.toBlob download will likely work
     * Returns true if probably works (real browser), false if probably fails (WebView)
     */
    canDownloadFile() {
        // ส่วนใหญ่ in-app browser จะไม่รองรับ
        if (this.detect() && this.isAndroid()) return false;
        return true;
    },

    /**
     * Test if Web Share API is available
     */
    canShare() {
        return typeof navigator.share === 'function';
    },

    /**
     * Test if Web Share API can share files (Level 2)
     */
    canShareFiles() {
        try {
            return typeof navigator.canShare === 'function' &&
                   typeof navigator.share === 'function';
        } catch {
            return false;
        }
    }
};

// Auto-tag body with in-app class
document.addEventListener('DOMContentLoaded', () => {
    const app = InAppBrowser.detect();
    if (app) {
        document.body.classList.add('is-in-app-browser');
        document.body.dataset.inApp = app;
        if (InAppBrowser.isAndroid()) {
            document.body.classList.add('is-android-webview');
        }
        if (InAppBrowser.isIOS()) {
            document.body.classList.add('is-ios-webview');
        }
    }
});

window.InAppBrowser = InAppBrowser;
