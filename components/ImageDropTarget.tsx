import { useState, DragEvent } from 'react';
import { PexelsPhoto } from '../lib/types/pexels';

const ImageDropTarget: React.FC = () => {
  const [droppedImages, setDroppedImages] = useState<PexelsPhoto[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const imageData: PexelsPhoto = JSON.parse(e.dataTransfer.getData('text/plain'));
      setDroppedImages(prev => [...prev, imageData]);
    } catch (error) {
      console.error('Error parsing dropped data:', error);
    }
  };

  const removeImage = (index: number): void => {
    setDroppedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`drop-target ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="drop-area">
        {droppedImages.length === 0 ? (
          <div className="drop-placeholder">
            Drop images here from the search results
          </div>
        ) : (
          <div className="dropped-images">
            {droppedImages.map((image, index) => (
              <div key={`${image.id}-${index}`} className="dropped-image-item">
                <img
                  src={image.src.medium}
                  alt={image.alt || 'Dropped image'}
                  className="dropped-image"
                />
                <button
                  className="remove-button"
                  onClick={() => removeImage(index)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .drop-target {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 40px 20px;
          margin: 20px 0;
          transition: all 0.2s ease;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drag-over {
          border-color: #0070f3;
          background-color: #f0f8ff;
        }

        .drop-area {
          width: 100%;
          text-align: center;
        }

        .drop-placeholder {
          color: #666;
          font-size: 18px;
        }

        .dropped-images {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .dropped-image-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .dropped-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          display: block;
        }

        .remove-button {
          position: absolute;
          top: 5px;
          right: 5px;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

export default ImageDropTarget;