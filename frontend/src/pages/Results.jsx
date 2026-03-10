import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { weddingsApi, designsApi, paymentApi } from '../lib/api';
import { toast } from 'sonner';
import { useRazorpay } from 'react-razorpay';
import { 
  Download, 
  RefreshCw, 
  Share2, 
  Check, 
  Crown, 
  Sparkles, 
  Loader2,
  Calendar,
  Heart,
  PartyPopper,
  GlassWater,
  X,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';

const CARD_TYPES = [
  { id: 'saveTheDate', label: 'Save the Date', icon: Calendar },
  { id: 'mehendi', label: 'Mehendi/Sangeet', icon: Heart },
  { id: 'wedding', label: 'Wedding', icon: Sparkles },
  { id: 'reception', label: 'Reception', icon: GlassWater },
];

export function Results() {
  const { weddingId } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [Razorpay] = useRazorpay();
  
  const [wedding, setWedding] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wedding');
  const [selectedDesigns, setSelectedDesigns] = useState({});
  const [refinementText, setRefinementText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [previewDesign, setPreviewDesign] = useState(null);

  useEffect(() => {
    loadData();
  }, [weddingId]);

  const loadData = async () => {
    try {
      const [weddingData, designsData] = await Promise.all([
        weddingsApi.getOne(weddingId),
        designsApi.getAll(weddingId)
      ]);
      
      setWedding(weddingData);
      setDesigns(designsData);
      
      // Set initially selected designs
      const selected = {};
      designsData.forEach(d => {
        if (d.is_selected) {
          selected[d.card_type] = d.id;
        }
      });
      setSelectedDesigns(selected);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDesign = async (designId, cardType) => {
    setSelectedDesigns(prev => ({ ...prev, [cardType]: designId }));
    
    try {
      await designsApi.select(designId);
    } catch (error) {
      console.error('Failed to select design:', error);
    }
  };

  const handleRefine = async () => {
    if (!refinementText.trim()) return;
    
    setIsRefining(true);
    toast.info('Refinement feature coming soon! In the meantime, try regenerating.');
    setIsRefining(false);
    setRefinementText('');
  };

  const handleRegenerate = async () => {
    setIsRefining(true);
    try {
      const result = await designsApi.generate(weddingId);
      setDesigns(result.designs);
      toast.success(`${result.designs.length} new designs created!`);
    } catch (error) {
      console.error('Failed to regenerate:', error);
      toast.error('Failed to regenerate designs');
    } finally {
      setIsRefining(false);
    }
  };

  const initiatePayment = async (tier) => {
    setSelectedTier(tier);
    setIsProcessingPayment(true);
    
    try {
      const orderData = await paymentApi.createOrder(tier, weddingId);
      
      if (orderData.mock) {
        // Handle mock payment
        toast.success('Mock payment successful! (Demo mode)');
        
        await paymentApi.verify({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          wedding_id: weddingId
        });
        
        await refreshUser();
        setShowPaymentModal(false);
        toast.success(`Upgraded to ${tier === 'earlybird' ? 'Early Bird' : 'Premium'}!`);
        return;
      }
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'InviteAI',
        description: tier === 'earlybird' ? 'Early Bird Package' : 'Premium Package',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#9333ea'
        },
        handler: async (response) => {
          try {
            await paymentApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              wedding_id: weddingId
            });
            
            await refreshUser();
            setShowPaymentModal(false);
            toast.success(`Upgraded to ${tier === 'earlybird' ? 'Early Bird' : 'Premium'}!`);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          }
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDownload = (design) => {
    if (user?.tier === 'free') {
      setShowPaymentModal(true);
      return;
    }
    
    // For paid users, trigger download
    const link = document.createElement('a');
    link.href = design.high_res_url;
    link.download = `${wedding?.bride_name}_${wedding?.groom_name}_${design.card_type}.jpg`;
    link.click();
    toast.success('Download started!');
  };

  const handleShare = async (design) => {
    const shareText = `${wedding?.bride_name} & ${wedding?.groom_name} की शादी में आपको सादर आमंत्रित किया जाता है! 💒✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wedding Invitation',
          text: shareText,
          url: design.whatsapp_url
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback to WhatsApp
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + design.whatsapp_url)}`, '_blank');
        }
      }
    } else {
      // Direct WhatsApp share
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + design.whatsapp_url)}`, '_blank');
    }
  };

  const getDesignsByType = (cardType) => {
    return designs.filter(d => d.card_type === cardType);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mx-auto mb-4" />
          <p className="text-white/60 font-outfit">Loading your designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">
            <PartyPopper className="w-4 h-4 mr-1" />
            Designs Ready!
          </Badge>
          <h1 className="font-rozha text-3xl md:text-4xl text-white mb-2">
            यहाँ हैं आपके Wedding Cards! 🎉
          </h1>
          <h2 className="font-cinzel text-2xl text-gold-gradient">
            {wedding?.bride_name} & {wedding?.groom_name}
          </h2>
        </div>

        {/* Tier Banner */}
        {user?.tier === 'free' && (
          <Card className="glass-card border-[#d4af37]/30 mb-8">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    You're on FREE tier
                  </p>
                  <p className="text-white/60 text-xs">
                    Designs have watermark • Low resolution
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowPaymentModal(true)}
                className="btn-gold rounded-full"
                data-testid="upgrade-banner-btn"
              >
                <Zap className="w-4 h-4 mr-2" />
                Remove Watermark - ₹299
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Design Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 rounded-xl p-1 h-auto">
            {CARD_TYPES.map(type => (
              <TabsTrigger 
                key={type.id}
                value={type.id}
                className="rounded-lg py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 flex flex-col sm:flex-row items-center gap-1 sm:gap-2"
                data-testid={`tab-${type.id}`}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{type.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {CARD_TYPES.map(type => (
            <TabsContent key={type.id} value={type.id} className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getDesignsByType(type.id).map((design, idx) => (
                  <Card 
                    key={design.id} 
                    className={`glass-card overflow-hidden transition-all cursor-pointer hover-lift ${
                      selectedDesigns[type.id] === design.id 
                        ? 'border-[#d4af37] ring-2 ring-[#d4af37]/20' 
                        : 'border-white/10'
                    }`}
                    onClick={() => handleSelectDesign(design.id, type.id)}
                    data-testid={`design-card-${type.id}-${idx}`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img 
                        src={design.preview_url} 
                        alt={`${type.label} design ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Selection indicator */}
                      {selectedDesigns[type.id] === design.id && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-[#d4af37] rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-black" />
                        </div>
                      )}
                      
                      {/* Free watermark indicator */}
                      {user?.tier === 'free' && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white/80 text-xs px-2 py-1 rounded">
                          Watermarked
                        </div>
                      )}
                      
                      {/* AI Generated badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-black/70 text-white/90 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Generated (MOCK)
                        </Badge>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDesign(design);
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white"
                          data-testid={`preview-btn-${design.id}`}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(design);
                          }}
                          className="btn-gold"
                          data-testid={`download-btn-${design.id}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(design);
                          }}
                          className="whatsapp-green"
                          data-testid={`share-btn-${design.id}`}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <p className="text-white font-medium text-sm">
                        Design {design.variation_number}
                      </p>
                      <p className="text-white/60 text-xs">
                        Click to select
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Actions */}
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <h3 className="font-outfit font-semibold text-white mb-4">What's next?</h3>
            
            {/* Refinement */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm mb-2">
                Want to refine your designs? Tell us what to change:
              </label>
              <div className="flex gap-3">
                <Textarea
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  placeholder="e.g., 'More gold accents', 'Change peacock to lotus', 'Make it more traditional'"
                  className="flex-1 bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                  data-testid="refinement-input"
                />
              </div>
              <Button
                onClick={handleRefine}
                disabled={!refinementText.trim() || isRefining}
                className="mt-3 btn-primary-gradient rounded-lg"
                data-testid="refine-btn"
              >
                {isRefining ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Refine Designs
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleRegenerate}
                disabled={isRefining}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 rounded-full"
                data-testid="regenerate-btn"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate All
              </Button>
              
              <Button
                onClick={() => {
                  const selected = designs.find(d => selectedDesigns[activeTab] === d.id);
                  if (selected) handleDownload(selected);
                }}
                className="btn-gold rounded-full"
                data-testid="download-selected-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Selected
              </Button>
              
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/5"
                data-testid="go-dashboard-btn"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-[#171717] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl text-white text-center">
              Upgrade Your Plan
            </DialogTitle>
            <DialogDescription className="text-white/60 text-center">
              Remove watermarks and get high-resolution downloads
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Early Bird */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedTier === 'earlybird' 
                  ? 'border-[#d4af37] bg-[#d4af37]/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelectedTier('earlybird')}
              data-testid="tier-earlybird"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-[#d4af37]/20 text-[#fcf6ba] border-[#d4af37]/30 mb-2">
                      Most Popular
                    </Badge>
                    <h4 className="text-white font-semibold">Early Bird</h4>
                    <p className="text-white/60 text-sm">Remove watermark + Print quality</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gold-gradient">₹299</p>
                    <p className="text-white/40 text-xs">One-time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card 
              className={`cursor-pointer transition-all ${
                selectedTier === 'premium' 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onClick={() => setSelectedTier('premium')}
              data-testid="tier-premium"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-2">
                      Best Value
                    </Badge>
                    <h4 className="text-white font-semibold">Premium</h4>
                    <p className="text-white/60 text-sm">Everything + Video invitation</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">₹599</p>
                    <p className="text-white/40 text-xs">One-time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => selectedTier && initiatePayment(selectedTier)}
              disabled={!selectedTier || isProcessingPayment}
              className="w-full btn-gold rounded-full py-6"
              data-testid="pay-now-btn"
            >
              {isProcessingPayment ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Crown className="w-5 h-5 mr-2" />
              )}
              {selectedTier 
                ? `Pay ₹${selectedTier === 'earlybird' ? '299' : '599'} Now`
                : 'Select a Plan'}
            </Button>
            
            <p className="text-white/40 text-xs text-center">
              Secure payment via Razorpay • UPI, Cards, NetBanking accepted
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewDesign} onOpenChange={() => setPreviewDesign(null)}>
        <DialogContent className="bg-[#171717] border-white/10 max-w-3xl p-0 overflow-hidden">
          <div className="relative">
            <img 
              src={previewDesign?.preview_url} 
              alt="Design preview"
              className="w-full"
            />
            <button
              onClick={() => setPreviewDesign(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
              data-testid="close-preview-btn"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-3">
              <Button
                onClick={() => previewDesign && handleDownload(previewDesign)}
                className="btn-gold"
                data-testid="preview-download-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => previewDesign && handleShare(previewDesign)}
                className="whatsapp-green"
                data-testid="preview-share-btn"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Results;
