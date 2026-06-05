import { useRef, useState } from "react";
import { uploadAndSaveAvatar } from "@/features/auth/services/avatar.service";
import { supabase } from "@/shared/services/supabase";
export default function AvatarModal({
  open,
  onClose,
  userId,
  currentUrl,
  onUpdated,
  onDeleted,
}) {
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleUpload = async (file) => {
    try {
      setLoading(true);
      const url = await uploadAndSaveAvatar(file, userId);
      onUpdated(url);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("profiles")
        .update({ profile_pic: null })
        .eq("id", userId);

      if (error) throw error;

      onDeleted?.(); // UI update
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-80 space-y-3">
        <h2 className="text-sm font-semibold">Profile Picture</h2>

        <button
          className="w-full py-2 rounded-lg bg-dark-amethyst-600 text-white"
          onClick={() => fileRef.current.click()}
        >
          {loading ? "Uploading..." : "Upload / Change"}
        </button>

        <button
          className="w-full py-2 rounded-lg border text-red-500"
          onClick={handleDelete}
        >
          Remove
        </button>

        <button className="w-full py-2 text-sm text-gray-500" onClick={onClose}>
          Cancel
        </button>

        <input
          type="file"
          hidden
          ref={fileRef}
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files[0])}
        />
      </div>
    </div>
  );
}
