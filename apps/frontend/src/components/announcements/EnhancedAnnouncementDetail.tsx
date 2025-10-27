"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Edit, 
  Trash2, 
  Archive, 
  MoreHorizontal, 
  Users,
  MessageSquare,
  Heart,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  ThumbsUp,
  Reply,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Announcement {
  id: number;
  title: string;
  content: string;
  summary?: string;
  type: string;
  priority: string;
  status: string;
  target_audience: string;
  requires_acknowledgment: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  published_at?: string;
  expires_at?: string;
  author_id?: number;
  featured_image?: string;
  tags?: string;
  view_count: number;
  read_count: number;
  acknowledged_count: number;
  comment_count: number;
  reaction_count: number;
  user_has_read: boolean;
  user_has_acknowledged: boolean;
  user_reactions: string[];
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    email: string;
    display_name?: string;
  };
  created_at: string;
  is_approved: boolean;
}

interface EnhancedAnnouncementDetailProps {
  announcementId: number;
  userRole: 'super_admin' | 'regional_admin';
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
  onArchive: (id: number) => void;
  onAcknowledge: (id: number) => void;
  onReact: (id: number, reactionType: string) => void;
  onBack: () => void;
}

const PRIORITY_COLORS = {
  low: 'bg-gray-500',
  normal: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-red-100 text-red-800'
};

const REACTION_TYPES = [
  { type: 'like', label: 'Like', icon: '👍' },
  { type: 'love', label: 'Love', icon: '❤️' },
  { type: 'dislike', label: 'Dislike', icon: '👎' },
  { type: 'angry', label: 'Angry', icon: '😠' },
  { type: 'sad', label: 'Sad', icon: '😢' },
  { type: 'wow', label: 'Wow', icon: '😮' }
];

export default function EnhancedAnnouncementDetail({
  announcementId,
  userRole,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onAcknowledge,
  onReact,
  onBack
}: EnhancedAnnouncementDetailProps) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch announcement details
  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/enhanced/announcements/${announcementId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/enhanced/announcements/${announcementId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Submit comment
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/v1/enhanced/announcements/${announcementId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment
        })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
        fetchAnnouncement(); // Refresh to update comment count
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  useEffect(() => {
    fetchAnnouncement();
    fetchComments();
  }, [announcementId]);

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Pengumuman tidak ditemukan</p>
            <Button onClick={onBack} className="mt-4">
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Kembali
        </Button>
        
        {userRole === 'super_admin' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onEdit(announcement.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {announcement.status === 'draft' && (
                  <DropdownMenuItem onClick={() => onPublish(announcement.id)}>
                    Publish
                  </DropdownMenuItem>
                )}
                {announcement.status === 'published' && (
                  <DropdownMenuItem onClick={() => onArchive(announcement.id)}>
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(announcement.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Announcement Content */}
      <Card className={cn(
        announcement.is_pinned && "border-l-4 border-l-blue-500",
        announcement.is_featured && "bg-gradient-to-r from-blue-50 to-indigo-50"
      )}>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(announcement.priority)}`} />
            <Badge className={getStatusColor(announcement.status)}>
              {announcement.status === 'draft' ? 'Draft' : 
               announcement.status === 'archived' ? 'Archived' :
               isExpired(announcement.expires_at) ? 'Expired' : 'Published'}
            </Badge>
            {announcement.is_pinned && (
              <Badge variant="secondary">📌 Pinned</Badge>
            )}
            {announcement.is_featured && (
              <Badge variant="secondary">⭐ Featured</Badge>
            )}
            {announcement.requires_acknowledgment && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Wajib Acknowledgment
              </Badge>
            )}
          </div>

          <CardTitle className="text-2xl font-bold">
            {announcement.title}
          </CardTitle>

          {announcement.summary && (
            <CardDescription className="text-lg">
              {announcement.summary}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {/* Featured Image */}
          {announcement.featured_image && (
            <div className="mb-6">
              <img 
                src={announcement.featured_image} 
                alt={announcement.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-slate max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />

          {/* Tags */}
          {announcement.tags && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {announcement.tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{announcement.read_count} reads</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span>{announcement.comment_count} comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-gray-500" />
                <span>{announcement.reaction_count} reactions</span>
              </div>
              {announcement.requires_acknowledgment && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                  <span>{announcement.acknowledged_count} acknowledged</span>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>Created: {formatDate(announcement.created_at)}</p>
              {announcement.published_at && (
                <p>Published: {formatDate(announcement.published_at)}</p>
              )}
              {announcement.expires_at && (
                <p>Expires: {formatDate(announcement.expires_at)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Actions for Regional Admin */}
      {userRole === 'regional_admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {/* Acknowledgment */}
              {announcement.requires_acknowledgment && (
                <div className="flex items-center gap-2">
                  {announcement.user_has_acknowledged ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acknowledged
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => onAcknowledge(announcement.id)}
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">React:</span>
                {REACTION_TYPES.map((reaction) => (
                  <Button
                    key={reaction.type}
                    variant="outline"
                    size="sm"
                    onClick={() => onReact(announcement.id, reaction.type)}
                    className={cn(
                      announcement.user_reactions.includes(reaction.type) && 
                      "bg-blue-50 border-blue-300"
                    )}
                  >
                    <span className="mr-1">{reaction.icon}</span>
                    {reaction.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Comment */}
          <div className="mb-6">
            <Textarea
              placeholder="Tulis komentar..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-3"
              rows={3}
            />
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submittingComment}
            >
              <Send className="h-4 w-4 mr-2" />
              {submittingComment ? 'Mengirim...' : 'Kirim Komentar'}
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Belum ada komentar
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-l-gray-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {comment.user.display_name || comment.user.email}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                        {!comment.is_approved && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Pending Approval
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
