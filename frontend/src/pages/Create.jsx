import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { chatApi, weddingsApi, designsApi } from '../lib/api';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { 
  Send, 
  Sparkles, 
  Upload, 
  Image, 
  User, 
  Calendar,
  MapPin,
  Palette,
  Heart,
  Loader2,
  MessageCircle,
  FileEdit,
  X,
  Check
} from 'lucide-react';

const INITIAL_MESSAGE = `नमस्ते! 🙏
Hi! I'm your AI wedding card designer.

Tell me about your wedding in English, Hindi, or Hinglish - whatever feels comfortable!

You can write everything at once like:
"मेरी शादी June में है। नाम Priya और Rahul। Hindu wedding है। Traditional style चाहिए red and gold में।"

या step by step भी बता सकते हैं।

What are your wedding details? 😊`;

export function Create() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [weddingId, setWeddingId] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: INITIAL_MESSAGE }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const [couplePhoto, setCouplePhoto] = useState(null);
  const messagesEndRef = useRef(null);

  // Form state (for form tab)
  const [formData, setFormData] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    religion: 'Hindu',
    style: 'Traditional',
    colors: '',
    venue: '',
    parentsNames: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Photo upload dropzone
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
        toast.success('Photo uploaded! It will be added to your designs.');
      }
    }
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatApi.send(userMessage, weddingId);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
      
      if (response.extractedData) {
        setExtractedData(prev => ({ ...prev, ...response.extractedData }));
      }

      if (response.readyToGenerate) {
        // Create wedding if not exists
        if (!weddingId) {
          const weddingData = {
            bride_name: response.extractedData?.brideName || extractedData.brideName || 'Bride',
            groom_name: response.extractedData?.groomName || extractedData.groomName || 'Groom',
            wedding_date: response.extractedData?.date || extractedData.date || new Date().toISOString(),
            religion: response.extractedData?.religion || extractedData.religion || 'Hindu',
            style: response.extractedData?.style || extractedData.style || 'Traditional',
            colors: response.extractedData?.colors || extractedData.colors || '',
            venue: response.extractedData?.venue || extractedData.venue || '',
          };
          
          const result = await weddingsApi.create(weddingData);
          setWeddingId(result.id);
          
          // Generate designs
          await handleGenerateDesigns(result.id);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDesigns = async (wId) => {
    setIsGenerating(true);
    try {
      const result = await designsApi.generate(wId);
      toast.success(`${result.designs.length} designs created!`);
      navigate(`/results/${wId}`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate designs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.brideName || !formData.groomName || !formData.weddingDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    
    try {
      const weddingData = {
        bride_name: formData.brideName,
        groom_name: formData.groomName,
        wedding_date: formData.weddingDate,
        religion: formData.religion,
        style: formData.style,
        colors: formData.colors,
        venue: formData.venue,
        parents_names: formData.parentsNames,
      };
      
      const result = await weddingsApi.create(weddingData);
      await handleGenerateDesigns(result.id);
    } catch (error) {
      console.error('Form submit error:', error);
      toast.error('Failed to create wedding. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-2">
            Create Your Invitation
          </h1>
          <p className="font-outfit text-white/60">
            Chat with AI or fill out a form - your choice!
          </p>
        </div>

        {/* Method Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/5 rounded-full p-1">
            <TabsTrigger 
              value="chat" 
              className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600"
              data-testid="tab-chat"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with AI
            </TabsTrigger>
            <TabsTrigger 
              value="form" 
              className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600"
              data-testid="tab-form"
            >
              <FileEdit className="w-4 h-4 mr-2" />
              Fill Form
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {activeTab === 'chat' ? (
              /* Chat Interface */
              <Card className="glass-card border-white/10 overflow-hidden">
                <CardContent className="p-0">
                  {/* Messages */}
                  <div className="h-[500px] overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-white/60">
                              <Sparkles className="w-3 h-3" />
                              AI Assistant
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap font-outfit">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 px-4 py-3 rounded-2xl">
                          <Loader2 className="w-5 h-5 animate-spin text-white/60" />
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-white/10 p-4 bg-white/5">
                    <div className="flex gap-3">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="अपनी शादी के बारे में बताएं... Tell me about your wedding..."
                        className="flex-1 min-h-[60px] max-h-[120px] bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none rounded-xl"
                        disabled={isLoading || isGenerating}
                        data-testid="chat-input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading || isGenerating}
                        className="btn-primary-gradient rounded-xl px-6 self-end"
                        data-testid="chat-send-btn"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Form Interface */
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {/* Names */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Bride's Name *
                        </label>
                        <Input
                          value={formData.brideName}
                          onChange={(e) => setFormData(prev => ({ ...prev, brideName: e.target.value }))}
                          placeholder="दुल्हन का नाम"
                          className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                          data-testid="form-bride-name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Groom's Name *
                        </label>
                        <Input
                          value={formData.groomName}
                          onChange={(e) => setFormData(prev => ({ ...prev, groomName: e.target.value }))}
                          placeholder="दूल्हे का नाम"
                          className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                          data-testid="form-groom-name"
                          required
                        />
                      </div>
                    </div>

                    {/* Date and Venue */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Wedding Date *
                        </label>
                        <Input
                          type="date"
                          value={formData.weddingDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                          className="bg-black/30 border-white/10 text-white"
                          data-testid="form-date"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Venue
                        </label>
                        <Input
                          value={formData.venue}
                          onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                          placeholder="Wedding venue"
                          className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                          data-testid="form-venue"
                        />
                      </div>
                    </div>

                    {/* Religion and Style */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          <Heart className="w-4 h-4 inline mr-2" />
                          Religion/Community
                        </label>
                        <Select 
                          value={formData.religion} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, religion: value }))}
                        >
                          <SelectTrigger 
                            className="bg-black/30 border-white/10 text-white"
                            data-testid="form-religion"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#171717] border-white/10">
                            <SelectItem value="Hindu">Hindu</SelectItem>
                            <SelectItem value="Muslim">Muslim</SelectItem>
                            <SelectItem value="Sikh">Sikh</SelectItem>
                            <SelectItem value="Christian">Christian</SelectItem>
                            <SelectItem value="Jain">Jain</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          <Palette className="w-4 h-4 inline mr-2" />
                          Style Preference
                        </label>
                        <Select 
                          value={formData.style} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}
                        >
                          <SelectTrigger 
                            className="bg-black/30 border-white/10 text-white"
                            data-testid="form-style"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#171717] border-white/10">
                            <SelectItem value="Traditional">Traditional - Rich & Ornate</SelectItem>
                            <SelectItem value="Modern">Modern - Clean & Contemporary</SelectItem>
                            <SelectItem value="Fusion">Fusion - Best of Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Colors */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        <Palette className="w-4 h-4 inline mr-2" />
                        Preferred Colors (optional)
                      </label>
                      <Input
                        value={formData.colors}
                        onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
                        placeholder="e.g., Red & Gold, Pink & Green"
                        className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                        data-testid="form-colors"
                      />
                    </div>

                    {/* Parents Names */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Parents' Names (optional)
                      </label>
                      <Textarea
                        value={formData.parentsNames}
                        onChange={(e) => setFormData(prev => ({ ...prev, parentsNames: e.target.value }))}
                        placeholder="e.g., Mr. & Mrs. Sharma cordially invite you..."
                        className="bg-black/30 border-white/10 text-white placeholder:text-white/40 min-h-[80px]"
                        data-testid="form-parents"
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full btn-gold rounded-full py-6 text-lg"
                      data-testid="form-submit-btn"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Your Designs...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate My Invitation Cards
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Photo Upload */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#d4af37]" />
                  Couple Photo (Optional)
                </h3>
                
                {couplePhoto ? (
                  <div className="relative">
                    <img 
                      src={couplePhoto.preview} 
                      alt="Couple" 
                      className="w-full max-w-[300px] mx-auto rounded-xl border border-white/10"
                    />
                    <button
                      onClick={() => setCouplePhoto(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                      data-testid="remove-photo-btn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-center text-emerald-400 text-sm mt-3 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Photo will be added to your designs
                    </p>
                  </div>
                ) : (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-white/20 hover:border-white/40'
                    }`}
                    data-testid="photo-dropzone"
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-white/40 mx-auto mb-3" />
                    <p className="text-white/60 text-sm">
                      {isDragActive ? 'Drop your photo here' : 'Drag & drop your couple photo, or click to select'}
                    </p>
                    <p className="text-white/40 text-xs mt-2">
                      JPG, PNG, WebP • Max 10MB
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="glass-card border-white/10 overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-outfit font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#d4af37]" />
                  Live Preview
                </h3>
                
                {Object.keys(extractedData).length > 0 || formData.brideName ? (
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl paper-card p-6">
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      {/* Decorative top */}
                      <div className="text-[#d4af37] text-3xl mb-2">☙</div>
                      
                      {/* Names */}
                      <div className="font-anek text-2xl text-slate-800 mb-2">
                        {extractedData.brideName || formData.brideName || 'Bride'}
                      </div>
                      <div className="text-[#d4af37] text-2xl mb-2">❤</div>
                      <div className="font-anek text-2xl text-slate-800 mb-4">
                        {extractedData.groomName || formData.groomName || 'Groom'}
                      </div>
                      
                      {/* Date */}
                      <div className="text-sm text-slate-600 mb-2">
                        You are invited to celebrate
                      </div>
                      <div className="font-semibold text-slate-800">
                        {extractedData.date || formData.weddingDate || 'Wedding Date'}
                      </div>
                      
                      {/* Venue */}
                      {(extractedData.venue || formData.venue) && (
                        <div className="text-sm text-slate-600 mt-2">
                          {extractedData.venue || formData.venue}
                        </div>
                      )}
                      
                      {/* Style badge */}
                      <Badge className="mt-4 bg-[#d4af37]/20 text-[#8B6914] border-[#d4af37]/30">
                        {extractedData.religion || formData.religion || 'Hindu'} • {extractedData.style || formData.style || 'Traditional'}
                      </Badge>
                      
                      {/* Decorative bottom */}
                      <div className="text-[#d4af37] text-3xl mt-4">❧</div>
                    </div>
                    
                    <p className="text-xs text-slate-500 text-center mt-2">
                      ✨ Preview - Final designs will be stunning!
                    </p>
                  </div>
                ) : (
                  <div className="aspect-[3/4] rounded-xl bg-white/5 flex flex-col items-center justify-center text-center p-6">
                    <Sparkles className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/40 text-sm">
                      Preview appears as you chat or fill the form
                    </p>
                  </div>
                )}
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
            <h2 className="font-cinzel text-2xl text-white mb-2">Creating Your Designs</h2>
            <p className="text-white/60 font-outfit">
              AI is crafting beautiful invitation cards for you...
            </p>
            <p className="text-[#d4af37] text-sm mt-4 font-outfit">
              This usually takes 10-30 seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Create;
