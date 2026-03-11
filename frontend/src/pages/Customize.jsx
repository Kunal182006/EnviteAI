import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { weddingsApi, designsApi } from '../lib/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowLeft,
  Sparkles, 
  Upload, 
  User, 
  Calendar,
  MapPin,
  Languages,
  Video,
  Layers,
  Loader2,
  X,
  Check,
  Crown,
  Heart
} from 'lucide-react';

// Languages supported
const LANGUAGES = [
  { id: 'tamil', label: 'தமிழ் (Tamil)', script: 'Tamil' },
  { id: 'hindi', label: 'हिन्दी (Hindi)', script: 'Devanagari' },
  { id: 'english', label: 'English', script: 'Latin' },
  { id: 'telugu', label: 'తెలుగు (Telugu)', script: 'Telugu' },
  { id: 'kannada', label: 'ಕನ್ನಡ (Kannada)', script: 'Kannada' },
  { id: 'malayalam', label: 'മലയാളം (Malayalam)', script: 'Malayalam' },
  { id: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)', script: 'Gurmukhi' },
  { id: 'gujarati', label: 'ગુજરાતી (Gujarati)', script: 'Gujarati' },
  { id: 'marathi', label: 'मराठी (Marathi)', script: 'Devanagari' },
  { id: 'bengali', label: 'বাংলা (Bengali)', script: 'Bengali' },
  { id: 'urdu', label: 'اردو (Urdu)', script: 'Arabic' },
];

// Video templates
const VIDEO_TEMPLATES = [
  {
    id: 'traditional',
    name: 'Traditional Animation',
    description: 'Mandala spins open, names fade in, petals falling, gold shimmer effects',
    preview: '🕉️',
    music: 'Classical Indian'
  },
  {
    id: 'romantic',
    name: 'Modern Romantic',
    description: 'Soft transitions, watercolor effects, heart animations, photo slideshow',
    preview: '💕',
    music: 'Romantic'
  },
  {
    id: 'festive',
    name: 'Festive Celebration',
    description: 'Fireworks animation, dancing diyas, colorful confetti, upbeat transitions',
    preview: '🎉',
    music: 'Celebration'
  },
];

// Template data (same as Templates.jsx)
const TEMPLATES = {
  'royal-gold': {
    name: 'Royal Gold',
    category: 'traditional',
    tagline: 'Best for Hindu Traditional',
    gradient: 'from-red-900 via-red-800 to-amber-900',
    preview: 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=600&h=900&fit=crop',
  },
  'sacred-ganesha': {
    name: 'Sacred Ganesha',
    category: 'traditional',
    tagline: 'Traditional Hindu',
    gradient: 'from-rose-900 via-rose-800 to-amber-100',
    preview: 'https://images.unsplash.com/photo-1604608672516-f1b9b1e6c8e1?w=600&h=900&fit=crop',
  },
  'bismillah-elegance': {
    name: 'Bismillah Elegance',
    category: 'traditional',
    tagline: 'Muslim Nikaah',
    gradient: 'from-emerald-900 via-emerald-700 to-emerald-500',
    preview: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=900&fit=crop',
  },
  'khanda-glory': {
    name: 'Khanda Glory',
    category: 'traditional',
    tagline: 'Sikh Wedding',
    gradient: 'from-orange-500 via-orange-600 to-blue-900',
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=900&fit=crop',
  },
  'blush-romance': {
    name: 'Blush Romance',
    category: 'modern',
    tagline: 'Modern Fusion',
    gradient: 'from-pink-200 via-pink-300 to-rose-300',
    preview: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=600&h=900&fit=crop',
  },
  'minimalist-chic': {
    name: 'Minimalist Chic',
    category: 'modern',
    tagline: 'Contemporary',
    gradient: 'from-white via-gray-50 to-amber-50',
    preview: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=900&fit=crop',
  },
  'geometric-fusion': {
    name: 'Geometric Fusion',
    category: 'modern',
    tagline: 'Modern Traditional',
    gradient: 'from-blue-900 via-indigo-900 to-slate-900',
    preview: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=900&fit=crop',
  },
  'elegant-ivory': {
    name: 'Elegant Ivory',
    category: 'modern',
    tagline: 'Classic Modern',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    preview: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=900&fit=crop',
  },
  'lotus-bloom': {
    name: 'Lotus Bloom',
    category: 'floral',
    tagline: 'Divine Lotus',
    gradient: 'from-pink-300 via-pink-400 to-rose-400',
    preview: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=900&fit=crop',
  },
  'rose-garden': {
    name: 'Rose Garden',
    category: 'floral',
    tagline: 'Romantic Roses',
    gradient: 'from-red-100 via-rose-100 to-pink-100',
    preview: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=900&fit=crop',
  },
  'jasmine-garland': {
    name: 'Jasmine Garland',
    category: 'floral',
    tagline: 'South Indian Classic',
    gradient: 'from-green-50 via-white to-yellow-50',
    preview: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&h=900&fit=crop',
  },
  'marigold-joy': {
    name: 'Marigold Joy',
    category: 'floral',
    tagline: 'Festive Celebration',
    gradient: 'from-orange-300 via-amber-300 to-yellow-300',
    preview: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=900&fit=crop',
  },
  'south-indian-heritage': {
    name: 'South Indian Heritage',
    category: 'regional',
    tagline: 'Tamil/Telugu Traditional',
    gradient: 'from-green-700 via-green-600 to-amber-600',
    preview: 'https://images.unsplash.com/photo-1601121141461-0ac0e6a47e53?w=600&h=900&fit=crop',
  },
  'punjabi-celebration': {
    name: 'Punjabi Celebration',
    category: 'regional',
    tagline: 'Vibrant Punjab',
    gradient: 'from-orange-500 via-yellow-400 to-green-500',
    preview: 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=600&h=900&fit=crop',
  },
  'bengali-classic': {
    name: 'Bengali Classic',
    category: 'regional',
    tagline: 'Traditional Bengal',
    gradient: 'from-red-600 via-red-500 to-white',
    preview: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=900&fit=crop',
  },
  'rajasthani-royal': {
    name: 'Rajasthani Royal',
    category: 'regional',
    tagline: 'Desert Royalty',
    gradient: 'from-amber-600 via-orange-500 to-rose-500',
    preview: 'https://images.unsplash.com/photo-1544085311-11a028465b03?w=600&h=900&fit=crop',
  },
};

export function Customize() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const template = TEMPLATES[templateId];
  
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venue: '',
    language: 'hindi',
    addEnglish: false,
    addVideo: false,
    videoStyle: 'traditional',
    generateAllCards: false,
  });
  
  const [couplePhoto, setCouplePhoto] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Redirect if template not found
  useEffect(() => {
    if (!template) {
      navigate('/templates');
    }
  }, [template, navigate]);

  // Photo upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setCouplePhoto({
            file,
            preview: reader.result
          });
        };
        reader.readAsDataURL(file);
        toast.success('Photo uploaded!');
      }
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    let total = 0;
    if (formData.addVideo) total += 299;
    if (formData.generateAllCards) total += 200;
    return total;
  };

  const handleGenerate = async () => {
    if (!formData.brideName || !formData.groomName || !formData.weddingDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    try {
      // Create wedding
      const weddingData = {
        bride_name: formData.brideName,
        groom_name: formData.groomName,
        wedding_date: formData.weddingDate,
        venue: formData.venue,
        religion: template?.category === 'traditional' ? 'Hindu' : 'Other',
        style: template?.category || 'Traditional',
        colors: '',
        template_id: templateId,
        language: formData.language,
        add_english: formData.addEnglish,
        add_video: formData.addVideo,
        video_style: formData.videoStyle,
        generate_all_cards: formData.generateAllCards,
      };

      const result = await weddingsApi.create(weddingData);
      
      // Generate designs
      await designsApi.generate(result.id);
      
      toast.success('Invitation created!');
      navigate(`/results/${result.id}`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to create invitation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) {
    return null;
  }

  const selectedLanguage = LANGUAGES.find(l => l.id === formData.language);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/templates')}
          variant="ghost"
          className="mb-6 text-white/60 hover:text-white hover:bg-white/5"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>

        <div className="grid lg:grid-cols-[1fr_450px] gap-8">
          {/* Live Preview (Left) */}
          <div className="order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                Live Preview
              </h3>
              
              <Card className="glass-card border-white/10 overflow-hidden">
                <div className={`aspect-[3/4] relative bg-gradient-to-br ${template.gradient}`}>
                  <img 
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover mix-blend-overlay opacity-60"
                  />
                  
                  {/* Preview Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    {/* Decorative top */}
                    <div className="text-white/80 text-4xl mb-4">☙</div>
                    
                    {/* Names */}
                    <div className="font-anek text-3xl text-white mb-2 drop-shadow-lg">
                      {formData.brideName || 'Bride Name'}
                    </div>
                    <div className="text-white text-3xl mb-2">
                      <Heart className="w-6 h-6 inline fill-current" />
                    </div>
                    <div className="font-anek text-3xl text-white mb-6 drop-shadow-lg">
                      {formData.groomName || 'Groom Name'}
                    </div>
                    
                    {/* Language indicator */}
                    {selectedLanguage && selectedLanguage.id !== 'english' && (
                      <Badge className="bg-white/20 text-white border-white/30 mb-4">
                        {selectedLanguage.label}
                        {formData.addEnglish && ' + English'}
                      </Badge>
                    )}
                    
                    {/* Date */}
                    <div className="text-white/80 text-sm mb-2 drop-shadow">
                      You are cordially invited
                    </div>
                    <div className="font-semibold text-white text-lg drop-shadow-lg">
                      {formData.weddingDate 
                        ? new Date(formData.weddingDate).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })
                        : 'Wedding Date'}
                    </div>
                    
                    {/* Venue */}
                    {formData.venue && (
                      <div className="text-white/70 text-sm mt-2 drop-shadow">
                        {formData.venue}
                      </div>
                    )}
                    
                    {/* Photo placeholder */}
                    {couplePhoto && (
                      <div className="mt-6 w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden">
                        <img 
                          src={couplePhoto.preview} 
                          alt="Couple" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Decorative bottom */}
                    <div className="text-white/80 text-4xl mt-6">❧</div>
                  </div>
                </div>
              </Card>
              
              <p className="text-center text-white/40 text-xs mt-3">
                Preview updates as you type
              </p>
            </div>
          </div>

          {/* Customization Form (Right) */}
          <div className="order-1 lg:order-2">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                {/* Template Info */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <Badge className="bg-[#d4af37]/20 text-[#fcf6ba] border-[#d4af37]/30 mb-2">
                    {template.tagline}
                  </Badge>
                  <h2 className="font-cinzel text-2xl font-bold text-white">
                    {template.name}
                  </h2>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {/* Bride Name */}
                  <div>
                    <Label className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Bride's Name *
                    </Label>
                    <Input
                      value={formData.brideName}
                      onChange={(e) => handleInputChange('brideName', e.target.value)}
                      placeholder="Enter bride's name"
                      className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-bride-name"
                    />
                  </div>

                  {/* Groom Name */}
                  <div>
                    <Label className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Groom's Name *
                    </Label>
                    <Input
                      value={formData.groomName}
                      onChange={(e) => handleInputChange('groomName', e.target.value)}
                      placeholder="Enter groom's name"
                      className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-groom-name"
                    />
                  </div>

                  {/* Wedding Date */}
                  <div>
                    <Label className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Wedding Date *
                    </Label>
                    <Input
                      type="date"
                      value={formData.weddingDate}
                      onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                      className="bg-black/30 border-white/10 text-white"
                      data-testid="input-date"
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <Label className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Venue (Optional)
                    </Label>
                    <Input
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                      placeholder="Wedding venue"
                      className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                      data-testid="input-venue"
                    />
                  </div>

                  {/* Language Selector */}
                  <div className="pt-4 border-t border-white/10">
                    <Label className="text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Card Language
                    </Label>
                    <Select 
                      value={formData.language} 
                      onValueChange={(value) => handleInputChange('language', value)}
                    >
                      <SelectTrigger 
                        className="bg-black/30 border-white/10 text-white"
                        data-testid="select-language"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#171717] border-white/10 max-h-[300px]">
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Add English checkbox */}
                    {formData.language !== 'english' && (
                      <div className="flex items-center gap-3 mt-3">
                        <Checkbox
                          id="addEnglish"
                          checked={formData.addEnglish}
                          onCheckedChange={(checked) => handleInputChange('addEnglish', checked)}
                          className="border-white/30 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                          data-testid="checkbox-add-english"
                        />
                        <Label htmlFor="addEnglish" className="text-white/60 text-sm cursor-pointer">
                          Add English translation (bilingual card)
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Photo Upload */}
                  <div className="pt-4 border-t border-white/10">
                    <Label className="text-white/80 text-sm font-medium mb-2 block">
                      Couple Photo (Optional)
                    </Label>
                    
                    {couplePhoto ? (
                      <div className="relative inline-block">
                        <img 
                          src={couplePhoto.preview} 
                          alt="Couple" 
                          className="w-24 h-24 rounded-xl object-cover border border-white/10"
                        />
                        <button
                          onClick={() => setCouplePhoto(null)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                          data-testid="remove-photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                          isDragActive ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/20 hover:border-white/40'
                        }`}
                        data-testid="photo-dropzone"
                      >
                        <input {...getInputProps()} />
                        <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">
                          Drop photo here or click to upload
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Premium Upgrades */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#d4af37]" />
                      Premium Upgrades
                    </h4>
                    
                    {/* Video Option */}
                    <div className="glass-card border-white/10 p-4 rounded-xl mb-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="addVideo"
                          checked={formData.addVideo}
                          onCheckedChange={(checked) => handleInputChange('addVideo', checked)}
                          className="mt-1 border-white/30 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                          data-testid="checkbox-video"
                        />
                        <div className="flex-1">
                          <Label htmlFor="addVideo" className="text-white font-medium cursor-pointer flex items-center gap-2">
                            <Video className="w-4 h-4 text-purple-400" />
                            Add 30-sec Video Invitation
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                              +₹299
                            </Badge>
                          </Label>
                          <p className="text-white/50 text-xs mt-1">
                            Animated video perfect for WhatsApp sharing
                          </p>
                          
                          {formData.addVideo && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {VIDEO_TEMPLATES.map(video => (
                                <button
                                  key={video.id}
                                  onClick={() => handleInputChange('videoStyle', video.id)}
                                  className={`p-3 rounded-lg text-center transition-all ${
                                    formData.videoStyle === video.id
                                      ? 'bg-purple-500/20 border border-purple-500/50'
                                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                  }`}
                                  data-testid={`video-style-${video.id}`}
                                >
                                  <div className="text-2xl mb-1">{video.preview}</div>
                                  <div className="text-white text-xs font-medium">{video.name.split(' ')[0]}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* All Cards Option */}
                    <div className="glass-card border-white/10 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="allCards"
                          checked={formData.generateAllCards}
                          onCheckedChange={(checked) => handleInputChange('generateAllCards', checked)}
                          className="mt-1 border-white/30 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                          data-testid="checkbox-all-cards"
                        />
                        <div className="flex-1">
                          <Label htmlFor="allCards" className="text-white font-medium cursor-pointer flex items-center gap-2">
                            <Layers className="w-4 h-4 text-emerald-400" />
                            Generate All 4 Card Types
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                              +₹200
                            </Badge>
                          </Label>
                          <p className="text-white/50 text-xs mt-1">
                            Save Date, Mehendi, Wedding & Reception cards
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total & Generate Button */}
                  <div className="pt-6 border-t border-white/10">
                    {calculateTotal() > 0 && (
                      <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg">
                        <span className="text-white/60 text-sm">Premium add-ons:</span>
                        <span className="text-[#d4af37] font-bold">+₹{calculateTotal()}</span>
                      </div>
                    )}
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full btn-gold rounded-full py-6 text-lg"
                      data-testid="generate-btn"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate My Invitation
                        </>
                      )}
                    </Button>
                    
                    <p className="text-center text-white/40 text-xs mt-3">
                      Free tier: Low-res with watermark<br />
                      Upgrade for ₹299: High-res, no watermark
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Generating Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-[#d4af37] mx-auto mb-6" />
            <h2 className="font-cinzel text-2xl text-white mb-2">Creating Your Invitation</h2>
            <p className="text-white/60 font-outfit">
              Applying {template.name} template with your details...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customize;
