'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooks, useDeleteBook, useUpdateBook } from '@/lib/hooks/useBooks';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import type { Book } from '@/lib/api/books';

const difficultyLabels: Record<number, string> = {
  1: 'Beginner',
  2: 'Intermediate',
  3: 'Advanced',
};

const difficultyColors: Record<number, string> = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800',
};

export default function BooksPage() {
  const router = useRouter();
  const { data: books, isLoading } = useBooks();

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Toggling state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Hooks
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();
  const { mutate: updateBook } = useUpdateBook();

  const handleDeleteClick = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookToDelete(book);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!bookToDelete) return;

    deleteBook(bookToDelete.id, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setBookToDelete(null);
      },
    });
  };

  const handleToggleActive = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(book.id);

    updateBook(
      { bookId: book.id, data: { is_active: !book.is_active } },
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
        <h2 className="text-2xl font-bold">Storytime Books</h2>
        <button
          onClick={() => router.push('/books/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Create Book
        </button>
      </div>

      {!books || books.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No books found. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => router.push(`/books/${book.id}`)}
              className={`
                bg-white rounded-lg shadow overflow-hidden cursor-pointer
                hover:shadow-lg transition-shadow
                ${!book.is_active ? 'opacity-60' : ''}
              `}
            >
              {/* Cover Image */}
              <div className="aspect-[3/4] bg-gray-100 relative">
                {book.image_url ? (
                  <img
                    src={book.image_url}
                    alt={book.title}
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
                      ${book.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                    `}
                  >
                    {book.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {/* Premium badge */}
                {book.is_premium && (
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
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 truncate" dir="rtl">
                  {book.title_ar}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      difficultyColors[book.difficulty_level]
                    }`}
                  >
                    {difficultyLabels[book.difficulty_level]}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {book.page_count} pages
                  </span>
                  {book.price > 0 && (
                    <span className="text-gray-500 text-xs">
                      {book.price} coins
                    </span>
                  )}
                </div>

                {/* Target letters */}
                {book.target_letters && book.target_letters.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {book.target_letters.slice(0, 5).map((letter) => (
                      <span
                        key={letter}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-sm"
                        dir="rtl"
                      >
                        {letter}
                      </span>
                    ))}
                    {book.target_letters.length > 5 && (
                      <span className="text-gray-500 text-xs">
                        +{book.target_letters.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <button
                    onClick={(e) => handleToggleActive(book, e)}
                    disabled={togglingId === book.id}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${book.is_active ? 'bg-green-500' : 'bg-gray-300'}
                      ${togglingId === book.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                    `}
                    title={book.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                        ${book.is_active ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>

                  <button
                    onClick={(e) => handleDeleteClick(book, e)}
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
          setBookToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Book"
        message={`Are you sure you want to delete "${bookToDelete?.title || 'this book'}"? This will also delete all pages and availability rules. This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </main>
  );
}
