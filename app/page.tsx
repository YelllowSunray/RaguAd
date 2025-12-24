"use client";

import { useState } from "react";

interface ImageWithText {
  file: File | null;
  preview: string;
  text: string;
}

export default function Home() {
  const [imageItems, setImageItems] = useState<ImageWithText[]>([{ file: null as any, preview: "", text: "" }]);
  const [loading, setLoading] = useState(false);
  const [generatedAd, setGeneratedAd] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<Array<{ index: number; imageBase64: string | null }>>([]);
  const [error, setError] = useState<string>("");

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                file,
                preview: reader.result as string,
              }
            : item
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const addNewAd = () => {
    if (imageItems.length >= 10) {
      setError("Maximum 10 ads allowed");
      return;
    }
    setImageItems((prev) => [...prev, { file: null as any, preview: "", text: "" }]);
  };

  const removeImage = (index: number) => {
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateImageText = (index: number, text: string) => {
    setImageItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, text } : item))
    );
  };

  const handleGenerateAd = async () => {
    const validItems = imageItems.filter((item) => item.preview && item.text.trim());
    
    if (validItems.length === 0) {
      setError("Please upload at least one image and enter discount text");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedAd("");

    try {
      const formData = new FormData();
      
      // Send only valid images with text
      validItems.forEach((item) => {
        if (item.file) {
          formData.append("images", item.file);
          formData.append(`texts`, item.text || "");
        }
      });

      const response = await fetch("/api/generate-ad", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || "Failed to generate ad";
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setGeneratedAd(data.adText);
      setGeneratedImages(data.images || []);
      
      // Check if any images failed to generate
      const failedImages = data.images?.filter((img: any) => !img.imageBase64 && img.error);
      if (failedImages && failedImages.length > 0) {
        const failedErrors = failedImages.map((img: any) => `Ad ${img.index}: ${img.error}`).join("\n");
        setError(`Some ads failed to generate:\n${failedErrors}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const downloadAllAds = () => {
    if (generatedImages.length === 0) {
      alert("No ads to download");
      return;
    }

    generatedImages.forEach((item) => {
      if (item.imageBase64) {
        const link = document.createElement("a");
        link.href = `data:image/png;base64,${item.imageBase64}`;
        link.download = `ad-${item.index}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Small delay between downloads
        setTimeout(() => {}, 100);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          Ad Creator
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Upload images and enter discounts to generate AI-powered ads
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Create Ads (Up to 10)
          </h2>

          <div className="space-y-6">
            {imageItems.map((item, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ad {index + 1}
                  </h3>
                  {imageItems.length > 1 && (
                    <button
                      onClick={() => removeImage(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {item.preview ? (
                  <div className="relative group mb-3">
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full max-w-md mx-auto h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      onClick={() => {
                        setImageItems((prev) =>
                          prev.map((it, i) =>
                            i === index ? { ...it, file: null as any, preview: "" } : it
                          )
                        );
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-blue-900 dark:file:text-blue-300
                        dark:hover:file:bg-blue-800
                        cursor-pointer"
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Text (e.g., "3,50 for 2,95" or "19,95 for 17,95")
                  </label>
                  <input
                    type="text"
                    placeholder="Enter discount text for this image..."
                    value={item.text}
                    onChange={(e) => updateImageText(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {imageItems.length < 10 && (
            <button
              onClick={addNewAd}
              className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              + Add New Ad
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <button
            onClick={handleGenerateAd}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {loading ? "Generating Ad..." : "Generate Ad"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {generatedAd && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Generated Ads
            </h2>
            
            {/* Generated Ad Images */}
            {generatedImages.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Ad Images ({generatedImages.filter(img => img.imageBase64).length} ads)
                  </h3>
                  <button
                    onClick={downloadAllAds}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Download All Ads
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedImages.map((item) => (
                    item.imageBase64 && (
                      <div key={item.index} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                          Ad {item.index}
                        </h4>
                        <img
                          src={`data:image/png;base64,${item.imageBase64}`}
                          alt={`Generated Ad ${item.index}`}
                          className="w-full rounded-lg mb-3 border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Ad Text */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Ad Text
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-sans">
                  {generatedAd}
                </pre>
              </div>
            </div>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedAd);
                alert("Ad text copied to clipboard!");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Copy Text to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
