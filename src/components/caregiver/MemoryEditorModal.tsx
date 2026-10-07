import React, { useState } from 'react';
import { X, Image, Check, Upload, Loader2 } from 'lucide-react';
import { MemoryItem } from '../../types.ts';
import { sound } from '../../utils/audio.ts';
import { storageService } from '../../services/firebase/storageService.ts';

interface MemoryEditorModalProps {
  isOpen: boolean;
  onSave: (memory: MemoryItem) => void;
  onClose: () => void;
}

export const MemoryEditorModal: React.FC<MemoryEditorModalProps> = ({
  isOpen,
  onSave,
  onClose,
}) => {
  const [personName, setPersonName] = useState('');
  const [relationshipEn, setRelationshipEn] = useState('');
  const [relationshipAs, setRelationshipAs] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [captionAs, setCaptionAs] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBHhF3l4uGI9Li0CiSCv_f9gzh9NxMepXqDtU7caxQuR3FQ2901hGbIJRd4IlGk2_VuknOoa6NJSm6bdnrP5_QjDYdTB6QMfLpr7KAV4jAKsrK7LOFTYUycEytJ6T0BdBekJIW3mG4fTf0PHdSZtqLqY6qTBm2oVayfMt48wjQrKzTA6ObtXsv7YWpG6y40CPgcqEHC-ZatWyeaWBNm_Vk_uXL1msskwYZmY2zp0Gd9-CXFxtr2EH2KAA'
  );
  const [isEligible, setIsEligible] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await storageService.uploadMemoryPhoto('circle-aita-family', file);
      setPhotoUrl(result.downloadUrl);
      sound.playChime('success');
    } catch (err) {
      sound.playChime('alert');
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName) return;

    sound.playChime('success');
    const newMemory: MemoryItem = {
      id: 'mem-' + Date.now(),
      personName,
      relationshipEn: relationshipEn || 'Family Member',
      relationshipAs: relationshipAs || 'পৰিয়ালৰ সদস্য',
      captionEn: captionEn || 'Cherished family memory',
      captionAs: captionAs || 'ঘৰৰ সোণোৱালী স্মৃতি',
      photoUrl,
      isEligibleForRecall: isEligible,
    };

    onSave(newMemory);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-[#E2DCD5] dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2DCD5] dark:border-slate-700 flex items-center justify-between bg-[#FBF9F5] dark:bg-slate-850">
          <div>
            <h3 className="font-bold text-lg text-[#1E293B] dark:text-slate-100">
              Add Family Memory (C-10)
            </h3>
            <p className="text-xs text-[#475569] dark:text-slate-400">
              Used in Aita's Photo Recall activity
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3.5">
          {/* Photo Preview & URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Photo URL
            </label>
            <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 mb-2 border border-slate-200 dark:border-slate-700 relative flex items-center justify-center">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-xs text-[#00524d] dark:text-[#5eead4] font-medium">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Uploading to Firebase Storage...</span>
                </div>
              ) : (
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <label className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Memory Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {uploadError && (
              <p className="text-[11px] text-red-600 dark:text-red-400 mb-2">
                {uploadError}
              </p>
            )}

            <input
              type="url"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Or enter photo URL..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Person's Name (e.g. Minu, Rahul)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. মিনু / Minu"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Relationship (EN)
              </label>
              <input
                type="text"
                placeholder="e.g. Granddaughter"
                value={relationshipEn}
                onChange={(e) => setRelationshipEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                সম্পৰ্ক (AS)
              </label>
              <input
                type="text"
                placeholder="e.g. মৰমৰ নাতিনী"
                value={relationshipAs}
                onChange={(e) => setRelationshipAs(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Caption / Story
            </label>
            <input
              type="text"
              placeholder="e.g. Morning tea together on the front porch"
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-750 text-xs"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-750 rounded-xl">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Eligible for Photo Recall Activity
            </span>
            <input
              type="checkbox"
              checked={isEligible}
              onChange={(e) => setIsEligible(e.target.checked)}
              className="w-5 h-5 accent-[#00524d] rounded cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00524d] hover:bg-[#1e6b65] text-white text-xs font-bold shadow-sm"
            >
              Save Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
