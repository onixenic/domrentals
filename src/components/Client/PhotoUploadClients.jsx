import { useState } from "react";
import { uploadPhoto } from "../../scripts/firebaseUtils";

export default function PhotoUploadClient({ propertyId }) {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleUpload = async () => {
    if (!files.length) return;

    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadPhoto(file, propertyId, (fileProgress) => {
          const overallProgress =
              (i + fileProgress / 100) / files.length * 100;
          setProgress(overallProgress);
        });
        urls.push(url);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setUploadedUrls(urls);
    setProgress(100);
    setFiles([]); // clear selected files
  };

  return (
      <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
        <label className="block mb-2 font-semibold text-gray-700">Upload Photos</label>

        {/* Drag & Drop / File Input */}
        <div className="mb-4">
          <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
              className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-600 file:text-white
                     hover:file:bg-blue-700 cursor-pointer"
          />
        </div>

        {/* Upload Button */}
        <button
            onClick={handleUpload}
            disabled={!files.length}
            className={`mb-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition ${
                !files.length ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          Upload
        </button>

        {/* Overall Progress */}
        {files.length > 0 && (
            <div className="mb-4 w-full bg-gray-200 rounded-full h-2">
              <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress.toFixed(0)}%` }}
              ></div>
            </div>
        )}

        {/* Preview Selected Files */}
        {files.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Selected Photos:</h4>
              <ul className="flex flex-wrap gap-2">
                {files.map((file) => (
                    <li key={file.name} className="w-24 h-24 relative">
                      <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-24 h-24 object-cover rounded border border-gray-300"
                      />
                    </li>
                ))}
              </ul>
            </div>
        )}

        {/* Uploaded Photos */}
        {uploadedUrls.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Uploaded Photos:</h4>
              <ul className="flex flex-wrap gap-2">
                {uploadedUrls.map((url) => (
                    <li key={url}>
                      <img
                          src={url}
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
