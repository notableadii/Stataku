/**
 * Email Templates for Stataku
 * Beautiful HTML email templates with black background and white text
 */

/**
 * Generate the welcome email template for profile completion
 */
export function generateWelcomeEmailTemplate(
  username: string,
  displayName?: string,
  profileUrl?: string
): string {
  const name = displayName || username;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const logoUrl = "https://app.oceanflo.xyz/logo.png";
  const profileLink = profileUrl || `${siteUrl}/settings/profile`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Welcome to Stataku - Complete Your Profile</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #000000 !important;
            color: #ffffff !important;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        
        /* Force dark theme - prevent email clients from overriding */
        [data-ogsc] {
            background-color: #000000 !important;
            color: #ffffff !important;
        }
        
        [data-ogsb] {
            background-color: #000000 !important;
            color: #ffffff !important;
        }
        
        /* Prevent dark mode overrides */
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #000000 !important;
                color: #ffffff !important;
            }
        }
        
        @media (prefers-color-scheme: light) {
            body {
                background-color: #000000 !important;
                color: #ffffff !important;
            }
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #000000 !important;
            padding: 0;
        }
        
        .header {
            text-align: center;
            padding: 50px 30px 40px;
            background-color: #000000 !important;
            border-bottom: 2px solid #1a1a1a;
        }
        
        .logo {
            width: 140px;
            height: auto;
            margin-bottom: 25px;
            filter: brightness(1.1);
        }
        
        .brand-name {
            font-size: 36px;
            font-weight: 800;
            color: #ffffff !important;
            margin: 15px 0;
            letter-spacing: 3px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .tagline {
            font-size: 18px;
            color: #cccccc !important;
            margin-bottom: 0;
            font-weight: 300;
        }
        
        .main-content {
            padding: 50px 40px;
            background-color: #000000 !important;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .greeting {
            font-size: 28px;
            font-weight: 700;
            color: #ffffff !important;
            margin-bottom: 30px;
            text-align: center;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .welcome-message {
            font-size: 18px;
            color: #ffffff !important;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.7;
            font-weight: 400;
        }
        
        .username-highlight {
            color: #6366f1;
            font-weight: 600;
            background-color: #1a1a1a;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        
        .description {
            font-size: 16px;
            color: #e0e0e0 !important;
            margin-bottom: 40px;
            text-align: center;
            line-height: 1.6;
        }
        
        .cta-container {
            text-align: center;
            margin: 45px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: #ffffff;
            color: #000000;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            border: 2px solid #ffffff;
            cursor: pointer;
        }
        
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
            background: #f0f0f0;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #333333 20%, #6366f1 50%, #333333 80%, transparent 100%);
            margin: 50px 0;
            border-radius: 1px;
        }
        
        .features-section {
            margin: 40px 0;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .features-title {
            font-size: 22px;
            font-weight: 600;
            color: #ffffff !important;
            text-align: center;
            margin-bottom: 35px;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            margin: 20px 0;
            padding: 15px 0;
            border-bottom: 1px solid #1a1a1a;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .feature-item:last-child {
            border-bottom: none;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-right: 20px;
            width: 40px;
            text-align: center;
            background-color: #1a1a1a;
            padding: 8px;
            border-radius: 8px;
        }
        
        .feature-text {
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 400;
        }
        
        .final-message {
            font-size: 18px;
            color: #ffffff !important;
            margin: 40px 0;
            text-align: center;
            font-weight: 500;
        }
        
        .footer {
            text-align: center;
            padding: 50px 30px;
            background-color: #000000 !important;
            border-top: 2px solid #1a1a1a;
        }
        
        .footer-brand {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff !important;
            margin-bottom: 10px;
        }
        
        .footer-tagline {
            font-size: 16px;
            color: #cccccc !important;
            margin-bottom: 30px;
        }
        
        .footer-links {
            margin: 30px 0;
        }
        
        .footer-link {
            display: inline-block;
            margin: 0 15px;
            color: #6366f1;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
        }
        
        .footer-link:hover {
            color: #8b5cf6;
        }
        
        .footer-disclaimer {
            font-size: 14px;
            color: #888888;
            margin-top: 30px;
            line-height: 1.5;
            border-top: 1px solid #1a1a1a;
            padding-top: 20px;
        }

        @media (max-width: 600px) {
            .header {
                padding: 40px 20px 30px;
            }
            
            .main-content {
                padding: 40px 25px;
            }
            
            .brand-name {
                font-size: 32px;
            }
            
            .greeting {
                font-size: 24px;
            }
            
            .welcome-message {
                font-size: 16px;
            }
            
            .cta-button {
                padding: 16px 32px;
                font-size: 16px;
            }
            
            .feature-item {
                flex-direction: column;
                text-align: center;
            }
            
            .feature-icon {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <img src="${logoUrl}" alt="Stataku Logo" class="logo">
            <div class="brand-name">STATAKU</div>
            <div class="tagline">Track, Rate & Share Your Anime Journey</div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <div class="greeting">
                Welcome to Stataku, ${name}!
            </div>
            
            <div class="welcome-message">
                We're thrilled to have you join our community of anime and manga enthusiasts! 
                Your account <span class="username-highlight">@${username}</span> has been created successfully.
            </div>
            
            <div class="description">
                Your journey starts here! To get the most out of your Stataku experience, 
                here are your next steps to personalize your profile and start tracking your anime journey.
            </div>
            
            <!-- Call to Action -->
            <div class="cta-container">
                <a href="${profileLink}" class="cta-button">
                    Complete Your Profile
                </a>
            </div>
            
            <div class="divider"></div>
            
            <!-- Features -->
            <div class="features-section">
                <div class="features-title">What You Can Do</div>
                
                <div class="feature-item">
                    <span class="feature-icon">👤</span>
                    <span class="feature-text">Customize your username, display name, and bio</span>
                </div>
                
                <div class="feature-item">
                    <span class="feature-icon">🖼️</span>
                    <span class="feature-text">Upload your avatar and banner images</span>
                </div>
                
                <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    <span class="feature-text">Track and rate your favorite anime & manga</span>
                </div>
                
                <div class="feature-item">
                    <span class="feature-icon">🌟</span>
                    <span class="feature-text">Share beautiful rating cards with the community</span>
                </div>
            </div>
            
            <div class="final-message">
                <strong>Ready to dive in?</strong> Click the button above to personalize your profile and start your anime tracking journey!
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-brand">Stataku Team</div>
            <div class="footer-tagline">Connect, Share, and Discover with the Community</div>
            
            <div class="footer-links">
                <a href="${siteUrl}" class="footer-link">Visit Website</a>
                <a href="${siteUrl}/privacy" class="footer-link">Privacy Policy</a>
                <a href="${siteUrl}/terms" class="footer-link">Terms of Service</a>
            </div>
            
            <div class="footer-disclaimer">
                This email was sent to you because you created an account on Stataku.<br>
                If you didn't create this account, please ignore this email.
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text version of the welcome email (fallback)
 */
export function generateWelcomeEmailText(
  username: string,
  displayName?: string,
  profileUrl?: string
): string {
  const name = displayName || username;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const profileLink = profileUrl || `${siteUrl}/settings/profile`;

  return `
Welcome to Stataku, ${name}!

We're thrilled to have you join our community of anime and manga enthusiasts! 
Your account @${username} has been created successfully.

Your journey starts here! To get the most out of your Stataku experience, 
here are your next steps to personalize your profile and start tracking your anime journey.

Complete Your Profile: ${profileLink}

What you can do:
👤 Customize your username, display name, and bio
🖼️ Upload your avatar and banner images  
📊 Track and rate your favorite anime & manga
🌟 Share beautiful rating cards with the community

Ready to dive in? Click the link above to personalize your profile and start your anime tracking journey!

---
Stataku Team
Connect, Share, and Discover with the Community

Website: ${siteUrl}
Privacy Policy: ${siteUrl}/privacy
Terms of Service: ${siteUrl}/terms

This email was sent to you because you created an account on Stataku.
If you didn't create this account, please ignore this email.
  `.trim();
}
