import { useState } from "react";
import { uploadFilesToPropertyBucket } from "../../scripts/firebaseUtils";

// Helper to generate low-res preview
const createPreview = (file, maxWidth = 200, maxHeight = 200) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize proportionally
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", 0.7)); // 70% quality
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function PhotoUploadClient({
                                            propertyId,
                                            privacyConsent,
                                            onUploadStart,
                                            onUploadComplete,
                                            onUploadError,
                                            onUploadStatusChange
                                          }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  let batchFolderName;

  // Notify parent when upload status changes
  const updateUploadStatus = (hasFilesWaiting, isCurrentlyUploading) => {
    onUploadStatusChange?.({
      hasPendingFiles: hasFilesWaiting,
      isUploading: isCurrentlyUploading
    });
  };

  const handleFileChange = async (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return false;
      }
      return true;
    });

    const uniqueFiles = validFiles.filter(
        (newFile) => !files.some((f) => f.name === newFile.name)
    );

    if (uniqueFiles.length > 0) {
      setError("");
      const updatedFiles = [...files, ...uniqueFiles];
      setFiles(updatedFiles);

      // Generate low-res previews
      const newPreviews = await Promise.all(
          uniqueFiles.map((file) => createPreview(file))
      );
      setPreviews((prev) => [...prev, ...newPreviews]);

      // Notify parent that there are pending files
      updateUploadStatus(true, false);
    }
  };

  const handleRemoveFile = (fileName) => {
    const index = files.findIndex((f) => f.name === fileName);
    if (index === -1) return;
    const updatedFiles = files.filter((f) => f.name !== fileName);
    setFiles(updatedFiles);
    setPreviews((prev) => prev.filter((_, i) => i !== index));

    // Update status - if no files left, notify parent
    if (updatedFiles.length === 0) {
      updateUploadStatus(false, false);
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setError("");
    onUploadStart?.();
    updateUploadStatus(false, true);

    try {
      const newUploaded = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const { url, folderName } = await uploadFilesToPropertyBucket(
              file,
              propertyId,
              (fileProgress) => {
                const overallProgress = ((i + fileProgress / 100) / files.length) * 100;
                setProgress(overallProgress);
              },
              batchFolderName // reuse folder name
          );

          // Save the folder name for the first file
          if (!batchFolderName) batchFolderName = folderName;

          newUploaded.push({ file, url });
        } catch (err) {
          console.error("Upload error:", err);
          setError(`Error uploading ${file.name}`);
          onUploadError?.();
        }
      }

      setUploadedFiles((prev) => [...prev, ...newUploaded]);
      setProgress(100);

      setTimeout(() => {
        setFiles([]);
        setPreviews([]);
        setProgress(0);
        setUploading(false);
        updateUploadStatus(false, false);
        onUploadComplete?.();
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload photos");
      setUploading(false);
      updateUploadStatus(files.length > 0, false);
      onUploadError?.();
    }
  };

  return (
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
              {error}
            </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
              type="button"
              onClick={handleUpload}
              disabled={!files.length || uploading || !privacyConsent}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          <div className="flex-1">
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-gray-700
             file:mr-4 file:py-2 file:px-4
             file:rounded-lg file:border-0
             file:text-sm file:font-medium
             file:bg-gray-200 file:text-gray-800
             hover:file:bg-gray-300
             cursor-pointer
             disabled:opacity-50 disabled:cursor-not-allowed
             transition"
            />
          </div>
        </div>

        {(files.length > 0 || uploading) && (
            <div className="my-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress.toFixed(0)}%` }}
                ></div>
              </div>
              {uploading && <p className="text-sm text-gray-600 mt-1">{progress.toFixed(0)}%</p>}
            </div>
        )}

        {previews.length > 0 && (
            <div>
              <h4 className="font-semibold my-2">Selected Photos: {previews.length}</h4>
              <ul className="flex flex-wrap gap-2">
                {previews.map((src, idx) => (
                    <li key={idx} className="w-24 h-24 relative">
                      <img
                          src={src}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded border border-gray-300"
                      />
                      <button
                          type="button"
                          onClick={() => handleRemoveFile(files[idx].name)}
                          disabled={uploading}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                      >
                        &times;
                      </button>
                    </li>
                ))}
              </ul>
            </div>
        )}

        {uploadedFiles.length > 0 && (
            <div>
              <h4 className="font-semibold my-2">Uploaded Photos: {uploadedFiles.length}</h4>
              <ul className="flex flex-wrap gap-2">
                {uploadedFiles.map(({ file }, idx) => (
                    <li key={idx}>
                      <img
                          src={URL.createObjectURL(file)}
                          alt="Uploaded"
                          className="w-24 h-24 object-cover rounded border border-gray-300"
                      />
                    </li>
                ))}
              </ul>
            </div>
        )}
      </div>
  );
}