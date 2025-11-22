# Cloudflare Turnstile Security Implementation

## Overview

This project now includes **Cloudflare Turnstile** as a standard security layer to protect against bots and automated attacks. Turnstile is a privacy-friendly CAPTCHA alternative that provides seamless user verification.

## What is Cloudflare Turnstile?

Cloudflare Turnstile is a smart CAPTCHA replacement that:
- ✅ Protects against bots and automated attacks
- ✅ Provides better user experience (often invisible)
- ✅ Privacy-focused (no personal data collection)
- ✅ Free for unlimited use
- ✅ Works on all devices and browsers

## Implementation Details

### 1. Site Key Configuration

**Development (Current Setup):**
- Using Cloudflare's test site key: `1x00000000000000000000AA`
- This key **always passes** verification
- Works on any domain including `localhost`, `127.0.0.1`, etc.
- No Cloudflare dashboard configuration needed

**Your Production Site Key:** `0x4AAAAAABe3cRiTdtHdktvC`

**To Switch to Production:**

1. **Add your domain to Cloudflare Turnstile:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to Turnstile
   - Select your site
   - Under "Domains", add your production domain (e.g., `kalkulator-pajak.pages.dev`)
   - Optionally add `localhost` for local testing with production key

2. **Update the site key in code:**
   ```typescript
   // In components/SplashScreen.tsx
   const TURNSTILE_SITE_KEY = '0x4AAAAAABe3cRiTdtHdktvC'; // Your production key
   ```

3. **Or use environment variables (recommended):**
   ```typescript
   const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
   ```

### Available Test Keys

Cloudflare provides these test keys for development:

| Site Key | Behavior |
|----------|----------|
| `1x00000000000000000000AA` | Always passes ✅ |
| `2x00000000000000000000AB` | Always blocks ❌ |
| `3x00000000000000000000FF` | Forces interactive challenge 🔄 |

### 2. Integration Points

**Files Modified:**
- `index.html` - Added Turnstile script tag
- `components/SplashScreen.tsx` - Integrated Turnstile widget
- `.env.example` - Documented site key configuration
- `package.json` - Added `@marsidev/react-turnstile` dependency

### 3. User Flow

1. User visits the application
2. Splash screen appears with branding animation
3. Turnstile widget loads (dark theme, normal size)
4. User completes verification (usually automatic)
5. On success, app proceeds to main interface
6. On failure, user can retry

### 4. Security Features

- **Bot Protection**: Prevents automated scraping and abuse
- **Rate Limiting**: Works with Cloudflare's edge network
- **Privacy-First**: No tracking or data collection
- **Accessibility**: Fully accessible and screen-reader friendly

## Configuration Options

### Theme Options
```typescript
options={{
  theme: 'dark',      // 'light' | 'dark' | 'auto'
  size: 'normal',     // 'normal' | 'compact'
}}
```

### Advanced Configuration

To customize Turnstile behavior, edit `components/SplashScreen.tsx`:

```typescript
<Turnstile
  siteKey={TURNSTILE_SITE_KEY}
  onSuccess={handleTurnstileSuccess}
  onError={handleTurnstileError}
  options={{
    theme: 'dark',
    size: 'normal',
    action: 'login',              // Optional: action name
    cData: 'custom-data',         // Optional: custom data
    retry: 'auto',                // 'auto' | 'never'
    retryInterval: 8000,          // Retry interval in ms
    refreshExpired: 'auto',       // 'auto' | 'manual' | 'never'
  }}
/>
```

## Testing

### Development Testing

During development, Turnstile will work normally. To test:

1. Start the dev server: `pnpm dev`
2. Open the application in your browser
3. The Turnstile widget should appear on the splash screen
4. Complete the verification
5. Check browser console for success message

### Production Testing

For production deployment:

1. Ensure your domain is registered in Cloudflare Turnstile dashboard
2. Update the site key if using a different domain
3. Test on multiple devices and browsers
4. Monitor Cloudflare analytics for verification metrics

## Troubleshooting

### Widget Not Appearing

**Possible causes:**
- Script not loaded (check network tab)
- Invalid site key
- Domain not whitelisted

**Solutions:**
1. Check browser console for errors
2. Verify site key in Cloudflare dashboard
3. Ensure script tag is in `index.html`

### Verification Failing

**Possible causes:**
- Network connectivity issues
- Cloudflare service disruption
- Bot-like behavior detected

**Solutions:**
1. Check Cloudflare status page
2. Try different network/browser
3. Clear browser cache and cookies

### Development Issues

If you encounter issues during development:

```bash
# Clear node modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Vite cache
rm -rf .vite
pnpm dev
```

## Security Best Practices

### 1. Server-Side Validation (Recommended)

While client-side verification is implemented, for production applications, you should validate the Turnstile token on your backend:

```javascript
// Example backend validation (Node.js)
const verifyTurnstile = async (token) => {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: 'YOUR_SECRET_KEY',
      response: token,
    }),
  });
  
  const data = await response.json();
  return data.success;
};
```

### 2. Secret Key Management

- **Never** commit your secret key to version control
- Store secret keys in environment variables
- Use different keys for development and production
- Rotate keys periodically

### 3. Domain Whitelisting

In your Cloudflare Turnstile dashboard:
- Add all production domains
- Add localhost for development
- Remove unused domains

## Cloudflare Dashboard

Access your Turnstile configuration at:
👉 https://dash.cloudflare.com/

### Key Management

1. Navigate to **Turnstile** in the Cloudflare dashboard
2. Select your site
3. View analytics and metrics
4. Manage site keys and domains
5. Configure security settings

## Analytics & Monitoring

Cloudflare provides detailed analytics:
- Total verifications
- Success/failure rates
- Geographic distribution
- Device types
- Bot detection metrics

## Removing Turnstile

If you need to remove Turnstile:

1. Remove from `index.html`:
```html
<!-- Remove this line -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

2. Revert `SplashScreen.tsx` to auto-proceed after animation

3. Uninstall package:
```bash
pnpm remove @marsidev/react-turnstile
```

## Additional Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [React Turnstile Library](https://github.com/marsidev/react-turnstile)
- [Turnstile Dashboard](https://dash.cloudflare.com/)
- [Privacy Policy](https://www.cloudflare.com/privacypolicy/)

## Support

For issues related to:
- **Turnstile Service**: Contact Cloudflare Support
- **Integration Issues**: Check GitHub issues or create new one
- **Application Issues**: Contact project maintainer

---

**Last Updated**: November 22, 2025  
**Version**: 1.0.0  
**Status**: ✅ Active
