"use client"

import { Button } from "@/components/ui/button"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (imageUrl: string) => void
  imageUrl: string
  onImageUrlChange: (url: string) => void
  onRandomImage: () => void
}

export function ImageModal({
  isOpen,
  onClose,
  onSave,
  imageUrl,
  onImageUrlChange,
  onRandomImage
}: ImageModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <h3 className="text-xl font-bold text-gray-800">Add Image URL</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="image-url"
                value={imageUrl}
                onChange={(e) => onImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the full URL of the image you want to attach to this article
              </p>
              
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800 mb-2 font-medium">
                  🚨 TESTING FEATURE - Will be removed in production
                </p>
                <Button
                  type="button"
                  onClick={onRandomImage}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium py-2 rounded"
                >
                  Use Random Test Image
                </Button>
              </div>
            </div>

            {imageUrl && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-full h-auto max-h-48 mx-auto rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2 break-all">
                    {imageUrl}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 shrink-0">
          <Button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(imageUrl)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Save Image
          </Button>
        </div>
      </div>
    </div>
  )
}