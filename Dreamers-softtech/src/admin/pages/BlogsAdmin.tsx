import { useState, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import AdminHeader from "../components/AdminHeader";
import BlogTable from "../components/BlogTable";
import StatCard from "../components/StatCard";
import Toast from "../components/Toast";
import CreateEditModal from "../components/modals/CreateEditModal";
import ViewModal from "../components/modals/ViewModal";
import DeleteModal from "../components/modals/DeleteModal";
import { blogApi } from "../../api/blogApi";
import type { BlogPost, ModalMode, FilterStatus } from "../types/blog.types";

const CATEGORIES = [
  "Engineering",
  "Design",
  "DevOps",
  "AI & ML",
  "Product",
  "Tutorial",
];

const EMPTY_FORM = {
  title: "",
  slug: "",
  author: "",
  category: CATEGORIES[0],
  tags: [] as string[],
  status: "draft" as BlogPost["status"],
  excerpt: "",
  content: "",
  coverImage: "",
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const inputCls =
  "w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#C89A3D]/60 focus:bg-white transition-all duration-200 placeholder:text-gray-400 text-gray-800";

const BlogsAdmin = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [tagInput, setTagInput] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      setLoading(true);
      const res = await blogApi.getAll();
      setPosts(res.data.data);
    } catch {
      showToast("Failed to fetch blogs", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openCreate() {
    setFormData({ ...EMPTY_FORM });
    setTagInput("");
    setModalMode("create");
  }

  function openEdit(post: BlogPost) {
    setFormData({
      title: post.title,
      slug: post.slug,
      author: post.author,
      category: post.category,
      tags: post.tags ? [...post.tags] : [],
      status: post.status,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
    });
    setSelectedPost(post);
    setTagInput("");
    setModalMode("edit");
  }

  function openView(post: BlogPost) {
    setSelectedPost(post);
    setModalMode("view");
  }
  function closeModal() {
    setModalMode(null);
    setSelectedPost(null);
  }

  async function handleSave() {
    if (!formData.title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    try {
      if (modalMode === "create") {
        const res = await blogApi.create({
          ...formData,
          slug: formData.slug || slugify(formData.title),
        });
        setPosts((p) => [res.data.data, ...p]);
        showToast("Post created successfully!");
      } else if (modalMode === "edit" && selectedPost) {
        const res = await blogApi.update(selectedPost.id, {
          ...formData,
          slug: formData.slug || slugify(formData.title),
        });
        setPosts((p) =>
          p.map((post) => (post.id === selectedPost.id ? res.data.data : post)),
        );
        showToast("Post updated successfully!");
      }
      closeModal();
    } catch {
      showToast("Something went wrong", "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await blogApi.delete(id);
      setPosts((p) => p.filter((post) => post.id !== id));
      setDeleteConfirmId(null);
      showToast("Post deleted.");
    } catch {
      showToast("Failed to delete post", "error");
    }
  }

  async function handleToggleStatus(post: BlogPost) {
    const next: BlogPost["status"] =
      post.status === "published" ? "draft" : "published";
    try {
      const res = await blogApi.update(post.id, { status: next });
      setPosts((p) => p.map((pr) => (pr.id === post.id ? res.data.data : pr)));
      showToast(`Marked as ${next}`);
    } catch {
      showToast("Failed to update status", "error");
    }
  }

  const filtered = posts.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)) &&
      (filterStatus === "all" || p.status === filterStatus) &&
      (filterCategory === "all" || p.category === filterCategory)
    );
  });

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    totalViews: posts.reduce((acc, p) => acc + p.views, 0),
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <AdminHeader
          title="Blog Posts"
          subtitle="Manage all blog content from one place"
        />

        <div className="flex-1 p-6 space-y-6 max-w-[1400px] w-full mx-auto">
          {/* Stats */}
          <div className="flex gap-4 flex-wrap">
            <StatCard label="Total Posts" value={stats.total} />
            <StatCard label="Published" value={stats.published} accent />
            <StatCard label="Drafts" value={stats.draft} />
            <StatCard
              label="Total Views"
              value={stats.totalViews.toLocaleString()}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts, authors..."
                className={`${inputCls} pl-9`}
              />
            </div>
            // Replace the filterStatus select with this
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as FilterStatus)
                }
                className={`${inputCls} w-36`}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              {/* New drafts badge */}
              {stats.draft > 0 && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium cursor-pointer"
                  onClick={() => setFilterStatus("draft")}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {stats.draft} draft{stats.draft !== 1 ? "s" : ""} pending
                </span>
              )}
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`${inputCls} w-40`}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400 hidden sm:block ml-auto">
              {filtered.length} post{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C89A3D] hover:bg-[#b78930] text-white font-semibold rounded-xl text-sm transition-all shadow hover:shadow-lg hover:shadow-[#C89A3D]/25"
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading blogs...</span>
              </div>
            </div>
          ) : (
            <BlogTable
              posts={filtered}
              onView={openView}
              onEdit={openEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>

      {/* Modals — outside main div so z-index works correctly */}
      {(modalMode === "create" || modalMode === "edit") && (
        <CreateEditModal
          modalMode={modalMode}
          formData={formData}
          selectedPostId={selectedPost?.id}
          tagInput={tagInput}
          setTagInput={setTagInput}
          setFormData={setFormData}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {modalMode === "view" && selectedPost && (
        <ViewModal post={selectedPost} onClose={closeModal} onEdit={openEdit} />
      )}

      {deleteConfirmId && (
        <DeleteModal
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
};

export default BlogsAdmin;
