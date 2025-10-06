'use client';

import { useTopics, useDeleteTopic } from '@/lib/hooks/useTopics';
import type { Topic } from '@/lib/schemas/curriculum';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from './shared/EmptyState';
import { ListFooter } from './shared/ListFooter';
import { ListItem } from './shared/ListItem';

interface TopicsListProps {
  curriculumId: string;
  selectedTopicId?: string | null;
  onTopicSelect?: (topic: Topic) => void;
  onCreateClick?: () => void;
  onEditClick?: (topic: Topic) => void;
}

export function TopicsList({
  curriculumId,
  selectedTopicId,
  onTopicSelect,
  onCreateClick,
  onEditClick,
}: TopicsListProps) {
  const { data: topics, isLoading, error } = useTopics(curriculumId);
  const { mutate: deleteTopic } = useDeleteTopic();
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);

  if (isLoading) {
    return <EmptyState message="Loading topics..." />;
  }

  if (error) {
    return <EmptyState message={`Error: ${error.message}`} />;
  }

  const hasTopics = topics && topics.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {hasTopics ? (
          topics.map((topic) => (
            <ListItem
              key={topic.id}
              id={topic.id}
              icon={BookOpen}
              title={topic.title.en}
              subtitle={topic.description?.en}
              isSelected={selectedTopicId === topic.id}
              onClick={() => onTopicSelect?.(topic)}
              onEdit={onEditClick ? () => onEditClick(topic) : undefined}
              onDelete={() => setTopicToDelete(topic)}
            />
          ))
        ) : (
          <EmptyState
            message="No topics yet"
            actionLabel={onCreateClick ? 'New Topic' : undefined}
            onAction={onCreateClick}
          />
        )}
      </div>

      <ListFooter show={hasTopics && !!onCreateClick} label="New Topic" onClick={onCreateClick!} />

      <ConfirmModal
        isOpen={!!topicToDelete}
        onClose={() => setTopicToDelete(null)}
        onConfirm={() => {
          if (topicToDelete) {
            deleteTopic({ curriculumId, topicId: topicToDelete.id });
          }
        }}
        title="Delete Topic?"
        message={`Are you sure you want to delete "${topicToDelete?.title.en}"?`}
        warningDetails={[
          'All lessons and activities inside this topic',
          'Student progress for this topic',
        ]}
      />
    </div>
  );
}
