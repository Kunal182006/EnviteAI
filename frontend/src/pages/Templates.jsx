import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Sparkles, 
  Crown,
  Heart,
  Flower2,
  MapPin,
  Star
} from 'lucide-react';

// Template data with categories and styling
const TEMPLATES = [
  // TRADITIONAL (4)
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    category: 'traditional',
    religion: 'hindu',
    tagline: 'Best for Hindu Traditional',
    description: 'Deep red with heavy gold ornate borders and Ganesha silhouette',
    colors: ['#8B0000', '#FFD700', '#FFFDD0'],
    gradient: 'from-red-900 via-red-800 to-amber-900',
    preview: 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=400&h=600&fit=crop',
    features: ['Ganesha motif', 'Mandala patterns', 'Gold borders'],
    popular: true
  },
  {
    id: 'sacred-ganesha',
    name: 'Sacred Ganesha',
    category: 'traditional',
    religion: 'hindu',
    tagline: 'Traditional Hindu',
    description: 'Maroon and cream with large Ganesha illustration and lotus border',
    colors: ['#800020', '#FFFDD0', '#FFD700'],
    gradient: 'from-rose-900 via-rose-800 to-amber-100',
    preview: 'https://images.unsplash.com/photo-1604608672516-f1b9b1e6c8e1?w=400&h=600&fit=crop',
    features: ['Large Ganesha', 'Lotus border', 'Classic layout'],
    popular: false
  },
  {
    id: 'bismillah-elegance',
    name: 'Bismillah Elegance',
    category: 'traditional',
    religion: 'muslim',
    tagline: 'Muslim Nikaah',
    description: 'Emerald green gradient with Islamic geometric patterns',
    colors: ['#046307', '#FFD700', '#FFFDD0'],
    gradient: 'from-emerald-900 via-emerald-700 to-emerald-500',
    preview: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=600&fit=crop',
    features: ['Bismillah calligraphy', 'Geometric patterns', 'Crescent moon'],
    popular: true
  },
  {
    id: 'khanda-glory',
    name: 'Khanda Glory',
    category: 'traditional',
    religion: 'sikh',
    tagline: 'Sikh Wedding',
    description: 'Saffron and royal blue with Khanda symbol and Phulkari patterns',
    colors: ['#FF9933', '#000080', '#FFD700'],
    gradient: 'from-orange-500 via-orange-600 to-blue-900',
    preview: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop',
    features: ['Khanda symbol', 'Phulkari embroidery', 'Bold colors'],
    popular: false
  },

  // MODERN (4)
  {
    id: 'blush-romance',
    name: 'Blush Romance',
    category: 'modern',
    religion: 'all',
    tagline: 'Modern Fusion',
    description: 'Soft pink rose gold with watercolor flowers and minimalist gold accents',
    colors: ['#FFB6C1', '#B76E79', '#FFD700'],
    gradient: 'from-pink-200 via-pink-300 to-rose-300',
    preview: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=400&h=600&fit=crop',
    features: ['Watercolor flowers', 'Rose gold accents', 'Romantic vibe'],
    popular: true
  },
  {
    id: 'minimalist-chic',
    name: 'Minimalist Chic',
    category: 'modern',
    religion: 'all',
    tagline: 'Contemporary',
    description: 'Clean white with gold borders and subtle elegant patterns',
    colors: ['#FFFFFF', '#FFD700', '#000000'],
    gradient: 'from-white via-gray-50 to-amber-50',
    preview: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=600&fit=crop',
    features: ['Clean typography', 'Minimal design', 'Sophisticated'],
    popular: false
  },
  {
    id: 'geometric-fusion',
    name: 'Geometric Fusion',
    category: 'modern',
    religion: 'all',
    tagline: 'Modern Traditional',
    description: 'Navy blue and gold with modern geometric patterns in art deco style',
    colors: ['#000080', '#FFD700', '#FFFFFF'],
    gradient: 'from-blue-900 via-indigo-900 to-slate-900',
    preview: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=600&fit=crop',
    features: ['Geometric patterns', 'Art deco style', 'Navy & gold'],
    popular: true
  },
  {
    id: 'elegant-ivory',
    name: 'Elegant Ivory',
    category: 'modern',
    religion: 'all',
    tagline: 'Classic Modern',
    description: 'Cream and gold with sophisticated understated elegance',
    colors: ['#FFFFF0', '#FFD700', '#8B7355'],
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    preview: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=600&fit=crop',
    features: ['Ivory elegance', 'Gold accents', 'Timeless'],
    popular: false
  },

  // FLORAL (4)
  {
    id: 'lotus-bloom',
    name: 'Lotus Bloom',
    category: 'floral',
    religion: 'hindu',
    tagline: 'Divine Lotus',
    description: 'Pink gradient with beautiful lotus illustrations and delicate borders',
    colors: ['#FFB6C1', '#FF69B4', '#FFD700'],
    gradient: 'from-pink-300 via-pink-400 to-rose-400',
    preview: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=600&fit=crop',
    features: ['Lotus flowers', 'Pink gradient', 'Delicate borders'],
    popular: true
  },
  {
    id: 'rose-garden',
    name: 'Rose Garden',
    category: 'floral',
    religion: 'all',
    tagline: 'Romantic Roses',
    description: 'Red roses with romantic vibe and lush floral arrangements',
    colors: ['#DC143C', '#228B22', '#FFD700'],
    gradient: 'from-red-100 via-rose-100 to-pink-100',
    preview: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=600&fit=crop',
    features: ['Red roses', 'Romantic feel', 'Lush florals'],
    popular: false
  },
  {
    id: 'jasmine-garland',
    name: 'Jasmine Garland',
    category: 'floral',
    religion: 'hindu',
    tagline: 'South Indian Classic',
    description: 'White jasmine chains with traditional South Indian aesthetic',
    colors: ['#FFFFFF', '#228B22', '#FFD700'],
    gradient: 'from-green-50 via-white to-yellow-50',
    preview: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400&h=600&fit=crop',
    features: ['Jasmine garlands', 'South Indian', 'Pure white'],
    popular: true
  },
  {
    id: 'marigold-joy',
    name: 'Marigold Joy',
    category: 'floral',
    religion: 'hindu',
    tagline: 'Festive Celebration',
    description: 'Orange marigolds with festive, bright celebratory feel',
    colors: ['#FF8C00', '#FFD700', '#8B0000'],
    gradient: 'from-orange-300 via-amber-300 to-yellow-300',
    preview: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=600&fit=crop',
    features: ['Marigold flowers', 'Festive colors', 'Bright & cheerful'],
    popular: false
  },

  // REGIONAL (4)
  {
    id: 'south-indian-heritage',
    name: 'South Indian Heritage',
    category: 'regional',
    religion: 'hindu',
    tagline: 'Tamil/Telugu Traditional',
    description: 'Banana leaves, Kolam patterns, and temple gopuram elements',
    colors: ['#228B22', '#FFD700', '#8B0000'],
    gradient: 'from-green-700 via-green-600 to-amber-600',
    preview: 'https://images.unsplash.com/photo-1601121141461-0ac0e6a47e53?w=400&h=600&fit=crop',
    features: ['Kolam patterns', 'Banana leaves', 'Temple motifs'],
    popular: true
  },
  {
    id: 'punjabi-celebration',
    name: 'Punjabi Celebration',
    category: 'regional',
    religion: 'sikh',
    tagline: 'Vibrant Punjab',
    description: 'Bright colors with Phulkari embroidery and wheat stalk motifs',
    colors: ['#FF6600', '#FFD700', '#008000'],
    gradient: 'from-orange-500 via-yellow-400 to-green-500',
    preview: 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?w=400&h=600&fit=crop',
    features: ['Phulkari patterns', 'Wheat stalks', 'Vibrant colors'],
    popular: false
  },
  {
    id: 'bengali-classic',
    name: 'Bengali Classic',
    category: 'regional',
    religion: 'hindu',
    tagline: 'Traditional Bengal',
    description: 'Red and white with Alpana borders and traditional Bengali elements',
    colors: ['#FF0000', '#FFFFFF', '#FFD700'],
    gradient: 'from-red-600 via-red-500 to-white',
    preview: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=600&fit=crop',
    features: ['Alpana borders', 'Red & white', 'Bengali tradition'],
    popular: false
  },
  {
    id: 'rajasthani-royal',
    name: 'Rajasthani Royal',
    category: 'regional',
    religion: 'hindu',
    tagline: 'Desert Royalty',
    description: 'Palace architecture, desert sunset colors, and camel motifs',
    colors: ['#DAA520', '#8B4513', '#FF4500'],
    gradient: 'from-amber-600 via-orange-500 to-rose-500',
    preview: 'https://images.unsplash.com/photo-1544085311-11a028465b03?w=400&h=600&fit=crop',
    features: ['Palace architecture', 'Desert colors', 'Royal aesthetic'],
    popular: true
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: Sparkles },
  { id: 'traditional', label: 'Traditional', icon: Crown },
  { id: 'modern', label: 'Modern', icon: Star },
  { id: 'floral', label: 'Floral', icon: Flower2 },
  { id: 'regional', label: 'Regional', icon: MapPin },
];

const RELIGIONS = [
  { id: 'all', label: 'All' },
  { id: 'hindu', label: 'Hindu' },
  { id: 'muslim', label: 'Muslim' },
  { id: 'sikh', label: 'Sikh' },
  { id: 'christian', label: 'Christian' },
];

export function Templates() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeReligion, setActiveReligion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(template => {
      const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
      const matchesReligion = activeReligion === 'all' || template.religion === activeReligion || template.religion === 'all';
      const matchesSearch = searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesReligion && matchesSearch;
    });
  }, [activeCategory, activeReligion, searchQuery]);

  const handleSelectTemplate = (templateId) => {
    if (user) {
      navigate(`/customize/${templateId}`);
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-3">
            Choose Your Template
          </h1>
          <p className="font-outfit text-lg text-white/60 max-w-2xl mx-auto">
            Pick a style, we'll customize with your details. All templates support 11 Indian languages!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full h-12"
              data-testid="template-search"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-outfit text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              data-testid={`category-${cat.id}`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Religion Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {RELIGIONS.map(rel => (
            <button
              key={rel.id}
              onClick={() => setActiveReligion(rel.id)}
              className={`px-4 py-1.5 rounded-full font-outfit text-xs font-medium transition-all ${
                activeReligion === rel.id
                  ? 'bg-[#d4af37] text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
              data-testid={`religion-${rel.id}`}
            >
              {rel.label}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id}
              className="glass-card border-white/10 overflow-hidden group hover-lift cursor-pointer"
              onClick={() => handleSelectTemplate(template.id)}
              data-testid={`template-${template.id}`}
            >
              {/* Preview Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-80`} />
                <img 
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-cinzel text-xl font-bold text-white mb-1 drop-shadow-lg">
                    {template.name}
                  </h3>
                  <p className="text-white/80 text-sm font-outfit drop-shadow">
                    {template.tagline}
                  </p>
                </div>

                {/* Popular badge */}
                {template.popular && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[#d4af37] text-black text-xs font-semibold">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button className="btn-gold rounded-full px-6" data-testid={`use-template-${template.id}`}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Use This Template
                  </Button>
                </div>
              </div>

              {/* Card Footer */}
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {template.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-white/5 text-white/60 px-2 py-0.5 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <p className="text-white/50 text-xs font-outfit line-clamp-2">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Search className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="font-outfit text-xl font-semibold text-white mb-2">
              No templates found
            </h3>
            <p className="text-white/60 mb-6">
              Try adjusting your filters or search query
            </p>
            <Button 
              onClick={() => {
                setActiveCategory('all');
                setActiveReligion('all');
                setSearchQuery('');
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/40 text-sm font-outfit mb-4">
            Can't find what you're looking for?
          </p>
          <Button 
            onClick={() => navigate('/create')}
            variant="outline"
            className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10 rounded-full"
            data-testid="custom-design-btn"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Create Custom Design with AI Chat
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Templates;
