import { useState, useRef, DragEvent } from 'react';
import { PexelsPhoto } from '../lib/types/pexels';

interface ImageSearchProps {
  onImageSelect?: (image: PexelsPhoto) => void;
}

const ImageSearch: React.FC<ImageSearchProps> = ({ onImageSelect }) => {
  const [query, setQuery] = useState<string>('');
  const [images, setImages] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const dragItem = useRef<PexelsPhoto | null>(null);

  const searchImages = async (searchQuery: string, page: number = 1): Promise<void> => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/pexels/search?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=15`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.photos || []);
    } catch (err) {
      setError('Error fetching images. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    searchImages(query);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, image: PexelsPhoto): void => {
    dragItem.current = image;
    e.dataTransfer.setData('text/plain', JSON.stringify(image));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = (): void => {
    dragItem.current = null;
  };

  return (
    <div className="image-search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images..."
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-button">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="image-grid">
        {images.map((image) => (
          <div
            key={image.id}
            className="image-item"
            draggable
            onDragStart={(e) => handleDragStart(e, image)}
            onDragEnd={handleDragEnd}
            onClick={() => onImageSelect && onImageSelect(image)}
          >
            <img
              src={image.src.medium}
              alt={image.alt || 'Pexels image'}
              className="search-image"
              loading="lazy"
            />
            <div className="image-overlay">
              <span>Drag me or Click</span>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && !loading && query && (
        <div className="no-results">No images found. Try a different search term.</div>
      )}

      <style jsx>{`
        .image-search-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .search-form {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .search-button {
          padding: 10px 20px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .search-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          color: #e00;
          margin-bottom: 20px;
          padding: 10px;
          background: #ffe6e6;
          border-radius: 4px;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .image-item {
          position: relative;
          cursor: grab;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .image-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .image-item:active {
          cursor: grabbing;
        }

        .search-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px;
          font-size: 12px;
          text-align: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .image-item:hover .image-overlay {
          opacity: 1;
        }

        .no-results {
          text-align: center;
          color: #666;
          margin-top: 40px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default ImageSearch;