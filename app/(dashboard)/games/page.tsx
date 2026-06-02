'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGames, useDeleteGame, useUpdateGame } from '@/lib/hooks/useGames';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import type { Game } from '@/lib/api/games';

const difficultyLabels: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

const difficultyColors: Record<number, string> = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800',
};

export default function GamesPage() {
  const router = useRouter();
  const { data: games, isLoading } = useGames();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<Game | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { mutate: deleteGame, isPending: isDeleting } = useDeleteGame();
  const { mutate: updateGame } = useUpdateGame();

  const handleDeleteClick = (game: Game, e: React.MouseEvent) => {
    e.stopPropagation();
    setGameToDelete(game);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!gameToDelete) return;

    deleteGame(gameToDelete.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setGameToDelete(null);
      },
    });
  };

  const handleToggleActive = (game: Game, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(game.id);

    updateGame(
      { gameId: game.id, data: { is_active: !game.is_active } },
      {
        onSettled: () => setTogglingId(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mini-Games</h2>
        <button
          onClick={() => router.push('/games/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Create Game
        </button>
      </div>

      {!games || games.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No games found. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => router.push(`/games/${game.id}`)}
              className={`
                bg-white rounded-lg shadow overflow-hidden cursor-pointer
                hover:shadow-lg transition-shadow
                ${!game.is_active ? 'opacity-60' : ''}
              `}
            >
              {/* Cover Image */}
              <div className="aspect-video bg-gray-100 relative">
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Cover
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  <span
                    className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${game.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                    `}
                  >
                    {game.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {/* Premium badge */}
                {game.is_premium && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Premium
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                  {game.title}
                </h3>
                {game.title_ar && (
                  <p className="text-gray-600 text-sm mb-2 truncate" dir="rtl">
                    {game.title_ar}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      difficultyColors[game.difficulty_level]
                    }`}
                  >
                    {difficultyLabels[game.difficulty_level]}
                  </span>
                  <span className="text-gray-500 text-xs font-mono">
                    {game.game_key}
                  </span>
                  {game.price > 0 && (
                    <span className="text-gray-500 text-xs">
                      {game.price} coins
                    </span>
                  )}
                </div>

                {/* Target skills */}
                {game.target_skills && game.target_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {game.target_skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {game.target_skills.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{game.target_skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <button
                    onClick={(e) => handleToggleActive(game, e)}
                    disabled={togglingId === game.id}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${game.is_active ? 'bg-green-500' : 'bg-gray-300'}
                      ${togglingId === game.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                    `}
                    title={game.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                        ${game.is_active ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>

                  <button
                    onClick={(e) => handleDeleteClick(game, e)}
                    className="text-red-600 hover:text-red-700 text-sm"
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setGameToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Game"
        message={`Are you sure you want to delete "${gameToDelete?.title || 'this game'}"? This will also delete all availability rules. This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </main>
  );
}
