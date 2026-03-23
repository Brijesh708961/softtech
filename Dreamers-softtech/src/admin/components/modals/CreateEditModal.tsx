import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import type { BlogPost, ModalMode } from "../../types/blog.types";
import TagBadge from "../TagBadge";

const CATEGORIES = [
  "Engineering",
  "Design",
  "DevOps",
  "AI & ML",
  "Product",
  "Tutorial",
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link"],
    [{ align: [] }],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "code-block",
  "link",
  "align",
];

interface FormData {
  title: string;
  slug: string;
  author: string;
  category: string;
  tags: string[];
  status: BlogPost["status"];
  excerpt: string;
  content: string;
  coverImage: string;
}

interface Props {
  modalMode: ModalMode;
  formData: FormData;
  selectedPostId?: string;
  tagInput: string;
  setTagInput: (v: string) => void;
  setFormData: (fn: (f: FormData) => FormData) => void;
  onSave: () => void;
  onClose: () => void;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const inputCls =
  "w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C89A3D]/60 focus:bg-white transition-all duration-200 placeholder:text-gray-400 text-gray-800";
const labelCls =
  "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const CreateEditModal = ({
  modalMode,
  formData,
  selectedPostId,
  tagInput,
  setTagInput,
  setFormData,
  onSave,
  onClose,
}: Props) => {
  const tagRef = useRef<HTMLInputElement>(null);

  function addTag() {
    const t = tagInput.trim();
    if (t && !formData.tags.includes(t))
      setFormData((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
    tagRef.current?.focus();
  }

  return (
    <>
      <style>{`
        .ql-toolbar.ql-snow { border-radius: 12px 12px 0 0 !important; border-color: #e5e7eb !important; background: #f9fafb !important; padding: 8px 12px !important; }
        .ql-container.ql-snow { border-radius: 0 0 12px 12px !important; border-color: #e5e7eb !important; font-size: 0.9rem !important; min-height: 220px !important; }
        .ql-editor { min-height: 220px !important; color: #1a1a1a !important; line-height: 1.8 !important; padding: 14px 16px !important; }
        .ql-editor.ql-blank::before { color: #9ca3af !important; font-style: normal !important; }
        .ql-toolbar button:hover .ql-stroke, .ql-toolbar button.ql-active .ql-stroke { stroke: #C89A3D !important; }
        .ql-toolbar button:hover .ql-fill, .ql-toolbar button.ql-active .ql-fill { fill: #C89A3D !important; }
        .ql-toolbar .ql-picker-label:hover, .ql-toolbar .ql-picker-label.ql-active { color: #C89A3D !important; }
        .ql-editor h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem; }
        .ql-editor h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.4rem; }
        .ql-editor h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.3rem; }
        .ql-editor p { margin-bottom: 0.6rem; }
        .ql-editor ul, .ql-editor ol { padding-left: 1.2rem; margin-bottom: 0.6rem; }
        .ql-editor blockquote { border-left: 3px solid #C89A3D; padding-left: 1rem; color: #555; margin: 0.8rem 0; }
        .ql-editor pre { background: #0f1117; color: #e8e8e8; border-radius: 8px; padding: 1rem; font-size: 0.85rem; }
      `}</style>

      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-[#C89A3D]" />
              <h2 className="text-lg font-bold text-gray-900">
                {modalMode === "create" ? "Create New Post" : "Edit Post"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="px-7 py-6 grid grid-cols-2 gap-5">
            {/* Title */}
            <div className="col-span-2">
              <label className={labelCls}>Title *</label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: slugify(e.target.value),
                  }))
                }
                placeholder="Enter post title..."
                className={inputCls}
              />
            </div>

            {/* Slug */}
            <div className="col-span-2">
              <label className={labelCls}>Slug</label>
              <input
                value={formData.slug}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, slug: e.target.value }))
                }
                placeholder="auto-generated-from-title"
                className={inputCls}
              />
            </div>

            {/* Author */}
            <div>
              <label className={labelCls}>Author</label>
              <input
                value={formData.author}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, author: e.target.value }))
                }
                placeholder="Author name"
                className={inputCls}
              />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, category: e.target.value }))
                }
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    status: e.target.value as BlogPost["status"],
                  }))
                }
                className={inputCls}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Cover Image */}
            <div>
              <label className={labelCls}>Cover Image</label>
              <CoverImageUpload
                value={formData.coverImage}
                onChange={(url) =>
                  setFormData((f) => ({ ...f, coverImage: url }))
                }
              />
            </div>

            {/* Tags */}
            <div className="col-span-2">
              <label className={labelCls}>Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.tags.map((t) => (
                  <TagBadge
                    key={t}
                    tag={t}
                    onRemove={() =>
                      setFormData((f) => ({
                        ...f,
                        tags: f.tags.filter((x) => x !== t),
                      }))
                    }
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={tagRef}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  placeholder="Add tag and press Enter"
                  className={`${inputCls} flex-1`}
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:border-[#C89A3D]/40 hover:text-[#C89A3D] transition-all text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Excerpt */}
            <div className="col-span-2">
              <label className={labelCls}>Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, excerpt: e.target.value }))
                }
                rows={2}
                placeholder="Short description shown in listings..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Content */}
            <div className="col-span-2">
              <label className={labelCls}>Content</label>
              <p className="text-[11px] text-gray-400 mb-2">
                Use the toolbar to add headings, bold text, lists, code blocks,
                and more.
              </p>
              <ReactQuill
                key={modalMode + (selectedPostId ?? "new")}
                theme="snow"
                value={formData.content}
                onChange={(val) => setFormData((f) => ({ ...f, content: val }))}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Write your full blog post here..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-3xl">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C89A3D] hover:bg-[#b78930] text-white font-semibold rounded-xl text-sm transition-all shadow hover:shadow-lg hover:shadow-[#C89A3D]/25"
            >
              {modalMode === "create" ? "Create Post" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const CoverImageUpload = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onChange(data.url);
    } catch (err: any) {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
          <img src={value} alt="Cover" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload button */}
      {!value && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#C89A3D]/50 hover:bg-[#C89A3D]/5 transition-all cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-[#C89A3D] animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400" />
          )}
          <span className="text-xs text-gray-400">
            {uploading ? "Uploading..." : "Click to upload image"}
          </span>
          <span className="text-[10px] text-gray-300">
            PNG, JPG, WEBP up to 5MB
          </span>
        </button>
      )}

      {/* Change button when image exists */}
      {value && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full py-2 border border-gray-200 rounded-xl text-xs text-gray-500 hover:border-[#C89A3D]/40 hover:text-[#C89A3D] transition-all"
        >
          {uploading ? "Uploading..." : "Change image"}
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
};

export default CreateEditModal;
