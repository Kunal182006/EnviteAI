# InviteAI - Product Requirements Document

## Original Problem Statement
Building InviteAI - an AI-powered wedding invitation platform specifically for INDIAN/SOUTH ASIAN weddings. Think "Gamma.app but for wedding invitations instead of presentations."

## Target Market
Indian couples planning weddings - Hindu, Muslim, Sikh, Christian communities. Mobile-first (70% mobile users), WhatsApp-centric sharing. Must work in Hindi + English.

## Architecture
- **Frontend**: React 19 with Tailwind CSS, shadcn/ui components
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: Emergent-managed Google OAuth + JWT-based custom auth
- **Payments**: Razorpay (mock for now, ready for real integration)

## User Personas
1. **Priya & Rahul** - Young urban couple, want modern designs with traditional elements
2. **Parents** - Traditional, want authentic religious symbols (Ganesha, mandalas)
3. **Tech-savvy NRI** - Wants quick, professional results, shares via WhatsApp

## Core Requirements (Static)
- Bilingual Hindi/English support
- 4 card types: Save the Date, Mehendi, Wedding, Reception
- Cultural authenticity (mandalas, religious symbols, gold accents)
- WhatsApp-optimized sharing
- Freemium pricing model

## What's Been Implemented ✅

### Date: January 10, 2026

**Landing Page**
- [x] Bilingual hero (Hindi + English)
- [x] Gold gradient "Beautiful Wedding Invitations" heading
- [x] Founding member badge (100 spots)
- [x] Trust indicators (1,247+ couples, 4.9/5 rating)
- [x] Gold CTA button ("शुरू करें | Start Creating FREE")
- [x] Features section (3 cards)
- [x] Gallery carousel with Indian wedding images
- [x] Pricing section (Free ₹0, Early Bird ₹299, Premium ₹599)
- [x] Testimonials section
- [x] Final CTA section
- [x] Footer

**Authentication**
- [x] Google OAuth via Emergent Auth
- [x] Session management with cookies
- [x] Protected routes
- [x] Founding member detection (first 100 users)

**Navigation**
- [x] Sticky navbar with glass effect
- [x] Logo + brand name
- [x] Navigation links (Features, Pricing, Gallery)
- [x] User dropdown menu (authenticated)
- [x] Mobile responsive menu

**Create Page**
- [x] Two methods: Chat with AI OR Fill Form
- [x] Tab switching
- [x] Chat interface with mock AI responses
- [x] Form with all wedding details
- [x] Photo upload (drag & drop)
- [x] Live preview panel
- [x] Design generation trigger

**Results Page**
- [x] Tabs for 4 card types
- [x] Design gallery grid
- [x] Selection indicator
- [x] Download button
- [x] WhatsApp share button
- [x] Preview modal
- [x] Refinement textarea
- [x] Regenerate button
- [x] Payment upgrade banner (free tier)
- [x] Payment modal with tier selection

**Dashboard**
- [x] User profile card with tier badge
- [x] Wedding list with cards
- [x] Create new invitation button
- [x] View/Delete wedding actions
- [x] Empty state

**Backend APIs**
- [x] Auth endpoints (me, session, logout)
- [x] Wedding CRUD endpoints
- [x] Chat endpoint (mock AI)
- [x] Design generation (mock)
- [x] Design selection
- [x] Payment order creation (mock Razorpay)
- [x] Payment verification
- [x] Stats endpoint

## MOCKED Components (For Later Integration)
- **AI Chat**: Currently returns pre-defined responses
- **Design Generation**: Uses placeholder Indian wedding images
- **Razorpay**: Mock payment flow, ready for real keys

## Prioritized Backlog

### P0 - Critical (Required for Launch)
- [ ] Real AI integration (Claude for chat, DALL-E for designs)
- [ ] Real Razorpay payment integration
- [ ] Image storage (S3/Cloudflare R2)
- [ ] Photo overlay on generated designs

### P1 - Important
- [ ] Email notifications
- [ ] Watermark system for free tier
- [ ] High-res vs low-res download logic
- [ ] WhatsApp video invitation (Premium tier)

### P2 - Nice to Have
- [ ] Multiple photo uploads
- [ ] Instagram Story format
- [ ] GIF animations
- [ ] PDF generation with bleed marks
- [ ] Revision history

## Next Tasks
1. Integrate Claude API for intelligent chat
2. Integrate DALL-E 3 for design generation
3. Add real Razorpay keys
4. Set up image storage
5. Implement watermark logic
