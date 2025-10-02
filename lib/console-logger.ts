/**
 * Beautiful console logger utility for displaying page-specific messages with favicon
 */

export const logPageVisit = (pageName: string, customMessage?: string) => {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  const faviconUrl = "/favicon.ico";
  const defaultMessage = `Welcome to ${pageName}`;
  const message = customMessage || defaultMessage;

  // Create a styled console log with the favicon
  const styles = [
    "color: #6366f1",
    "font-size: 16px",
    "font-weight: bold",
    "text-shadow: 1px 1px 2px rgba(0,0,0,0.3)",
    "padding: 10px",
    "border: 2px solid #6366f1",
    "border-radius: 8px",
    "background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "margin: 10px 0",
  ].join(";");

  // Log the beautiful header
  console.log(
    `%c
    🎌 ===== ${pageName} Console Log =====
    
    ${message}
    
    ===================================
    `,
    styles
  );

  // Display favicon using multiple methods for better browser compatibility
  try {
    // Method 1: Try to display as background image (works in Chrome/Edge)
    console.log(
      "%c🎌 FAVICON",
      `font-size: 12px; 
       font-weight: bold;
       color: #6366f1;
       padding: 20px 40px; 
       background-image: url("${faviconUrl}"); 
       background-size: 32px 32px; 
       background-repeat: no-repeat; 
       background-position: left center;
       background-color: #f8fafc;
       border: 2px solid #6366f1;
       border-radius: 8px;
       margin: 4px 0;
       padding-left: 50px;`
    );

    // Method 2: Create a clickable link to view the favicon
    console.log(`🖼️ View Favicon: ${window.location.origin}${faviconUrl}`);

    // Method 3: ASCII art representation
    console.log(`
    ┌─────────────────┐
    │   🎌 FAVICON    │
    │                 │
    │   ${faviconUrl} │
    └─────────────────┘
    `);

    // Method 4: Load and try to display the actual image
    const img = new Image();
    img.onload = () => {
      // Try console.image if available (Firefox) - use type assertion for non-standard method
      const consoleAny = console as any;
      if (typeof consoleAny.image === "function") {
        consoleAny.image(faviconUrl);
      } else {
        // Fallback: Create a data URL and log it
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = 32;
          canvas.height = 32;
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(0, 0, 32, 32);
          ctx.drawImage(img, 0, 0, 32, 32);

          console.log(
            "%c ",
            `font-size: 1px; 
             line-height: 32px;
             padding: 16px 16px; 
             background-image: url("${canvas.toDataURL()}"); 
             background-size: 32px 32px; 
             background-repeat: no-repeat;
             border: 1px solid #6366f1;`
          );
        }
      }
    };
    img.onerror = () => {
      console.log("⚠️ Favicon not found at:", faviconUrl);
    };
    img.src = faviconUrl;
  } catch (error) {
    console.log("🎌 Stataku Favicon (Display method not supported)");
  }

  // Additional page info
  console.log(`📍 Current URL: ${window.location.href}`);
  console.log(`⏰ Loaded at: ${new Date().toLocaleString()}`);
  console.log(`🌐 User Agent: ${navigator.userAgent.split(" ")[0]}`);

  // Add a separator
  console.log("━".repeat(50));
};

// Page-specific messages
export const PAGE_MESSAGES = {
  Home: "Track, vote and share beautiful rating cards for your favorite anime & manga! 🎌",
  Dashboard:
    "Welcome to your personal dashboard! Manage your profile and discover new content. 📊",
  Browse: "Discover thousands of anime, manga, manwha, and manhua titles! 🔍",
  Discovery: "Find your next favorite series with our discovery features! ✨",
  "Sign In": "Sign in to access your personalized experience! 🔐",
  "Sign Up": "Join the Stataku community and start your journey! 🚀",
  "Create Username": "Choose your unique username to complete your profile! 👤",
  Settings: "Customize your Stataku experience! ⚙️",
  "Account Settings": "Manage your account preferences and security! 🔒",
  "Profile Settings": "Customize your profile information and appearance! 👤",
  "Appearance Settings": "Personalize your theme and visual preferences! 🎨",
  "Privacy Policy": "Learn about how we protect your privacy! 🛡️",
  "Terms of Service": "Review our terms and conditions! 📋",
  "Email Confirmation": "Please check your email to confirm your account! 📧",
  "Auth Code Error": "Authentication error occurred. Please try again! ❌",
  "Confirm Email": "Confirming your email address... ✅",
  "Profile Page": "Viewing user profile and their amazing content! 👀",
  "Not Found": "Oops! The page you're looking for doesn't exist! 🔍",
  Error: "Something went wrong, but we're on it! 🚨",
} as const;
