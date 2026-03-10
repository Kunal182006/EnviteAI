import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { weddingsApi } from '../lib/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Calendar, 
  Trash2, 
  Eye, 
  Sparkles, 
  Crown, 
  Loader2,
  Heart,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [weddings, setWeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadWeddings();
  }, []);

  const loadWeddings = async () => {
    try {
      const data = await weddingsApi.getAll();
      setWeddings(data);
    } catch (error) {
      console.error('Failed to load weddings:', error);
      toast.error('Failed to load your weddings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await weddingsApi.delete(deleteId);
      setWeddings(prev => prev.filter(w => w.id !== deleteId));
      toast.success('Wedding deleted');
    } catch (error) {
      console.error('Failed to delete wedding:', error);
      toast.error('Failed to delete wedding');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mx-auto mb-4" />
          <p className="text-white/60 font-outfit">Loading your weddings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-cinzel text-3xl font-bold text-white mb-1">
              नमस्ते, {user?.name?.split(' ')[0]}! 🙏
            </h1>
            <p className="text-white/60 font-outfit">
              Manage your wedding invitations
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/create')}
            className="btn-gold rounded-full px-6"
            data-testid="new-wedding-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Invitation
          </Button>
        </div>

        {/* User Tier Card */}
        <Card className="glass-card border-white/10 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-2 border-[#d4af37]/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-white font-semibold text-lg">{user?.name}</h2>
                  <p className="text-white/60 text-sm">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {user?.is_founding_member ? (
                      <Badge className="bg-gradient-to-r from-[#bf953f] to-[#b38728] text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Founding Member
                      </Badge>
                    ) : (
                      <Badge className={
                        user?.tier === 'premium' 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : user?.tier === 'earlybird'
                          ? 'bg-[#d4af37]/20 text-[#fcf6ba] border-[#d4af37]/30'
                          : 'bg-white/10 text-white/60 border-white/20'
                      }>
                        {user?.tier === 'premium' ? 'Premium' : user?.tier === 'earlybird' ? 'Early Bird' : 'Free Tier'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {user?.tier === 'free' && !user?.is_founding_member && (
                <Button 
                  onClick={() => navigate('/create')}
                  variant="outline"
                  className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37]/10"
                  data-testid="upgrade-btn"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Remove Watermark
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weddings List */}
        {weddings.length === 0 ? (
          <Card className="glass-card border-white/10">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="font-outfit text-xl font-semibold text-white mb-2">
                No invitations yet
              </h3>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Create your first wedding invitation in minutes with our AI-powered designer
              </p>
              <Button 
                onClick={() => navigate('/create')}
                className="btn-gold rounded-full px-8"
                data-testid="create-first-btn"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your First Invitation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((wedding) => (
              <Card 
                key={wedding.id} 
                className="glass-card border-white/10 hover-lift overflow-hidden"
                data-testid={`wedding-card-${wedding.id}`}
              >
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-indigo-900/50 relative overflow-hidden">
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 mandala-pattern opacity-20" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="font-anek text-2xl text-white mb-1">
                        {wedding.bride_name}
                      </p>
                      <Heart className="w-5 h-5 text-[#d4af37] mx-auto" />
                      <p className="font-anek text-2xl text-white mt-1">
                        {wedding.groom_name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={
                      wedding.status === 'designs_ready'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }>
                      {wedding.status === 'designs_ready' ? 'Designs Ready' : 'Creating...'}
                    </Badge>
                  </div>
                  
                  {/* Menu */}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#171717] border-white/10">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/results/${wedding.id}`)}
                          className="cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/5"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Designs
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteId(wedding.id)}
                          className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(wedding.wedding_date)}</span>
                    <span className="text-white/30">•</span>
                    <span>{wedding.religion}</span>
                  </div>
                  
                  <Button
                    onClick={() => navigate(`/results/${wedding.id}`)}
                    className="w-full btn-primary-gradient rounded-lg"
                    data-testid={`view-designs-${wedding.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Designs
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#171717] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Wedding?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete this wedding and all its designs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="confirm-delete-btn"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Dashboard;
