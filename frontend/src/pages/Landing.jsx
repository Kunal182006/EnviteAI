import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { statsApi } from '../lib/api';
import { 
  Sparkles, 
  MessageCircle, 
  Palette, 
  Zap, 
  Check, 
  Star,
  ArrowRight,
  Crown,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Portfolio gallery images - Indian wedding invitations
const GALLERY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1722952934708-749c22eb2e58?w=600&h=800&fit=crop', type: 'Hindu', style: 'Traditional' },
  { url: 'https://images.unsplash.com/photo-1665960213508-48f07086d49c?w=600&h=800&fit=crop', type: 'Hindu', style: 'Modern' },
  { url: 'https://plus.unsplash.com/premium_photo-1682092632793-c7d75b23718e?w=600&h=800&fit=crop', type: 'Hindu', style: 'Mehendi' },
  { url: 'https://plus.unsplash.com/premium_photo-1754759085353-d4ef2feb53c5?w=600&h=800&fit=crop', type: 'Hindu', style: 'Traditional' },
  { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=800&fit=crop', type: 'Christian', style: 'Elegant' },
  { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=800&fit=crop', type: 'Reception', style: 'Modern' },
  { url: 'https://images.unsplash.com/photo-1601121141461-0ac0e6a47e53?w=600&h=800&fit=crop', type: 'Hindu', style: 'Fusion' },
  { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=800&fit=crop', type: 'Reception', style: 'Elegant' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Better than ₹5,000 designer! Made my Mehendi card in 2 minutes. Family loved it!',
    avatar: 'PS'
  },
  {
    name: 'Rahul Kapoor',
    location: 'Delhi',
    rating: 5,
    text: 'My parents approved immediately! Traditional Ganesha design looked so authentic.',
    avatar: 'RK'
  },
  {
    name: 'Anita Menon',
    location: 'Bangalore',
    rating: 5,
    text: 'AI understood my requirements perfectly in Hindi. Stunning results!',
    avatar: 'AM'
  },
];

export function Landing() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCouples: 1247, foundingMembersRemaining: 67, rating: 4.9 });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    statsApi.get().then(setStats).catch(console.error);
  }, []);

  // Auto-rotate gallery
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/create');
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 royal-mesh mandala-pattern">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-6">
            <Badge className="bg-gradient-to-r from-[#bf953f]/20 to-[#b38728]/20 border border-[#d4af37]/30 text-[#fcf6ba] px-4 py-1.5 text-sm font-outfit">
              <Crown className="w-4 h-4 mr-2 inline" />
              {stats.foundingMembersRemaining > 0 
                ? `Only ${stats.foundingMembersRemaining} Founding Member spots left!`
                : 'Join 1,000+ happy couples'}
            </Badge>
          </div>

          {/* Hindi Headline */}
          <h1 className="font-rozha text-4xl sm:text-5xl lg:text-6xl text-white mb-4 animate-slide-up">
            5 मिनट में शादी के कार्ड बनाएं
          </h1>

          {/* English Headline */}
          <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up text-gold-gradient" style={{ animationDelay: '0.1s' }}>
            Beautiful Wedding Invitations
          </h2>

          {/* Subheadline */}
          <p className="font-outfit text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8 animate-slide-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            India's first AI that truly understands your culture. Chat about your wedding in 
            <span className="text-[#d4af37]"> Hindi, English, or Hinglish</span> — 
            we'll create stunning cards with authentic mandalas, mehendi art, and religious symbols.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-white/60 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>100% FREE to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>{stats.totalCouples.toLocaleString()}+ couples trust us</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
              <span>{stats.rating}/5 rating</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button 
              onClick={handleGetStarted}
              className="btn-gold text-lg px-8 py-6 rounded-full font-bold animate-pulse-gold"
              data-testid="hero-cta-btn"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              शुरू करें | Start Creating FREE
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="text-white/40 text-sm mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            No credit card required • Create unlimited invitations
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose InviteAI?
            </h2>
            <p className="font-outfit text-white/60 text-lg max-w-2xl mx-auto">
              Create professional wedding invitations that your family will love
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {/* Feature 1 */}
            <Card className="glass-card border-white/10 hover-lift p-1" data-testid="feature-card-1">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="font-outfit text-xl font-semibold text-white mb-3">
                  Your Way, Your Pace
                </h3>
                <p className="font-outfit text-white/60">
                  Chat naturally in Hindi, English, or Hinglish. Our AI understands everything!
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="glass-card border-white/10 hover-lift p-1" data-testid="feature-card-2">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#d4af37]/20 to-[#b38728]/20 flex items-center justify-center">
                  <Palette className="w-8 h-8 text-[#d4af37]" />
                </div>
                <h3 className="font-outfit text-xl font-semibold text-white mb-3">
                  Culturally Authentic
                </h3>
                <p className="font-outfit text-white/60">
                  Real mandalas, henna art, and religious symbols. Made for Indian weddings.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="glass-card border-white/10 hover-lift p-1" data-testid="feature-card-3">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-outfit text-xl font-semibold text-white mb-3">
                  Instant Results
                </h3>
                <p className="font-outfit text-white/60">
                  4 beautiful cards in 2 minutes. WhatsApp-ready, print-ready, share-ready!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0a15]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
              See What Others Created
            </h2>
            <p className="font-outfit text-white/60 text-lg">
              Beautiful designs made in minutes, not hours
            </p>
          </div>

          {/* Gallery Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 25}%)` }}
              >
                {GALLERY_IMAGES.concat(GALLERY_IMAGES).map((img, idx) => (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 w-1/2 md:w-1/4 p-2"
                  >
                    <div className="relative group overflow-hidden rounded-xl aspect-[3/4]">
                      <img 
                        src={img.url} 
                        alt={`${img.type} ${img.style} wedding invitation`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-[#d4af37]/90 text-black text-xs">
                            {img.type}
                          </Badge>
                          <p className="text-white text-sm mt-2">{img.style} Style</p>
                          <p className="text-white/60 text-xs">Made in 3 min</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            <button 
              onClick={() => setCurrentSlide((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              data-testid="gallery-prev-btn"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % GALLERY_IMAGES.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              data-testid="gallery-next-btn"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">
              Simple Pricing
            </Badge>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
              Start Free, Upgrade Anytime
            </h2>
            <p className="font-outfit text-white/60 text-lg">
              No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {/* Free Tier */}
            <Card className="glass-card border-white/10 hover-lift overflow-hidden" data-testid="pricing-free">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="font-outfit text-xl font-bold text-white mb-2">FREE</h3>
                  <div className="text-4xl font-bold text-white">₹0</div>
                  <p className="text-white/60 text-sm">Forever free</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited invitations',
                    'All 4 card types',
                    '2 design variations',
                    'Hindi + English',
                    'WhatsApp quality (1920×1080)',
                    'Small watermark'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/80 text-sm">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleGetStarted}
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/5 rounded-full"
                  data-testid="pricing-free-btn"
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Early Bird Tier */}
            <Card className="glass-card border-[#d4af37]/30 hover-lift overflow-hidden relative z-10" data-testid="pricing-earlybird">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] z-0" />
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Badge className="bg-[#d4af37]/20 text-[#fcf6ba] border-[#d4af37]/30 mb-2">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                  <h3 className="font-outfit text-xl font-bold text-white mb-2">EARLY BIRD</h3>
                  <div className="text-4xl font-bold text-gold-gradient">₹299</div>
                  <p className="text-white/60 text-sm">One-time payment</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in FREE +',
                    'Remove watermark',
                    'High-res PNG (4000×3000)',
                    'Print-ready PDF',
                    '4 design variations',
                    '7-day revision window',
                    'Priority generation'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/80 text-sm">
                      <Check className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleGetStarted}
                  className="w-full btn-gold rounded-full"
                  data-testid="pricing-earlybird-btn"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Get Early Bird
                </Button>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="glass-card border-purple-500/30 hover-lift overflow-hidden relative z-10" data-testid="pricing-premium">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-0" />
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Best Value
                  </Badge>
                  <h3 className="font-outfit text-xl font-bold text-white mb-2">PREMIUM</h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">₹599</div>
                  <p className="text-white/60 text-sm">One-time payment</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Early Bird +',
                    '6 design variations',
                    'WhatsApp video invitation',
                    'Animated GIF cards',
                    'Instagram Story format',
                    'Multiple photo uploads',
                    '14-day revision window'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/80 text-sm">
                      <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleGetStarted}
                  className="w-full btn-primary-gradient rounded-full"
                  data-testid="pricing-premium-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Founding Member Banner */}
          {stats.foundingMembersRemaining > 0 && (
            <div className="mt-12 glass-card border-[#d4af37]/30 p-6 rounded-2xl text-center">
              <Badge className="bg-[#d4af37]/20 text-[#fcf6ba] border-[#d4af37]/30 mb-3">
                <Crown className="w-4 h-4 mr-1" />
                Founding Member Offer
              </Badge>
              <h3 className="font-outfit text-xl font-bold text-white mb-2">
                First 100 Users Get Premium FREE Forever!
              </h3>
              <p className="text-white/60 mb-4">
                No watermark, high-res, unlimited - lifetime access to all features!
              </p>
              <p className="text-[#d4af37] font-semibold">
                Only {stats.foundingMembersRemaining} spots remaining
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#0a0a0a] to-[#0f0a15]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by Couples
            </h2>
            <p className="font-outfit text-white/60 text-lg">
              Real reviews from real weddings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Card key={idx} className="glass-card border-white/10 hover-lift" data-testid={`testimonial-${idx}`}>
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#d4af37] fill-[#d4af37]" />
                    ))}
                  </div>
                  <p className="font-outfit text-white/80 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#bf953f] to-[#b38728] flex items-center justify-center text-black font-bold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-outfit font-semibold text-white text-sm">{testimonial.name}</p>
                      <p className="font-outfit text-white/60 text-xs">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-[#0a0a0a] mandala-pattern">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Dream Invitation?
          </h2>
          <p className="font-outfit text-white/60 text-lg mb-8">
            Join thousands of couples who trusted InviteAI for their special day
          </p>
          <Button 
            onClick={handleGetStarted}
            className="btn-gold text-lg px-10 py-6 rounded-full font-bold"
            data-testid="cta-final-btn"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your Invitation Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#b38728] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="font-cinzel font-bold text-lg text-white">InviteAI</span>
            </div>
            
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
            </div>
            
            <p className="text-white/40 text-sm">
              © 2026 InviteAI. Made with love for Indian weddings.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
