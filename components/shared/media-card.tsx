'use client';

import { useState } from 'react';
import { Play, Pause, Trash2, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  type: 'image' | 'audio' | 'word';
  id: string;
  name: string;
  displayName: string;
  previewUrl?: string;
  tags?: string[];
  category?: string;
  isSelected?: boolean;
  selectable?: boolean;
  deletable?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  duration?: number;
  audioUrl?: string;
  className?: string;
}

export function MediaCard({
  type,
  displayName,
  previewUrl,
  tags = [],
  category,
  isSelected = false,
  selectable = false,
  deletable = false,
  onSelect,
  onDelete,
  duration,
  audioUrl,
  className,
}: MediaCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect();
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--:--';
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        'relative group overflow-hidden transition-all',
        selectable && 'cursor-pointer hover:scale-[1.02]',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDeleting && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <div className="aspect-square bg-muted flex items-center justify-center relative">
        {type === 'image' &&
          (imageError ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <span className="text-3xl mb-1">🖼️</span>
              <span className="text-xs">Failed to load</span>
            </div>
          ) : (
            <img
              src={previewUrl}
              alt={displayName}
              className="w-full h-full object-contain p-2"
              onError={() => setImageError(true)}
            />
          ))}

        {type === 'audio' && (
          <div className="flex flex-col items-center">
            <Button
              variant={isPlaying ? 'default' : 'outline'}
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            {duration && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {formatDuration(duration)}
              </span>
            )}
          </div>
        )}

        {type === 'word' && (
          <div className="text-center">
            <span className="text-4xl font-arabic">{displayName}</span>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
            <Check className="h-4 w-4" />
          </div>
        )}

        {deletable && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {type}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{displayName}&quot;?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <CardContent className="p-3">
        <p className="text-sm font-medium truncate" title={displayName}>
          {displayName}
        </p>
        {category && (
          <p className="text-xs text-muted-foreground mt-0.5">{category}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
