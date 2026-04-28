import { useEffect, useMemo, useState } from "react";
import { useCreateToolMutation, useUpdateToolMutation } from "../../store/adminApi";
import Spinner from "../shared/Spinner";
import { useToast } from "../shared/ToastProvider";

const initialState = {
  name: "",
  description: "",
  longDescription: "",
  category: "",
  pricing: "Free Trial",
  websiteUrl: "",
  tags: "",
  featured: false,
};

const ToolForm = ({ categories = [], onCreated, mode = "create", initialData = null, submitLabel }) => {
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [createTool, { isLoading: creating }] = useCreateToolMutation();
  const [updateTool, { isLoading: updating }] = useUpdateToolMutation();
  const toast = useToast();
  const submitting = creating || updating;

  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories]);

  useEffect(() => {
    if (!initialData) {
      setForm(initialState);
      setFile(null);
      return;
    }

    setForm({
      name: initialData.name || "",
      description: initialData.description || "",
      longDescription: initialData.longDescription || "",
      category: initialData.category || "",
      pricing: initialData.pricing || "Free Trial",
      websiteUrl: initialData.websiteUrl || "",
      tags: Array.isArray(initialData.tags) ? initialData.tags.join(", ") : initialData.tags || "",
      featured: Boolean(initialData.featured),
    });
    setFile(null);
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (file) {
        formData.append("image", file);
      }

      if (mode === "edit" && initialData?._id) {
        formData.append("imageUrl", initialData.image?.url || "");
        formData.append("imagePublicId", initialData.image?.publicId || "");
        await updateTool({ id: initialData._id, formData }).unwrap();
        toast.success("Tool updated successfully");
      } else {
        await createTool(formData).unwrap();
        toast.success("Tool created successfully");
      }

      setForm(initialState);
      setFile(null);
      onCreated();
    } catch (error) {
      toast.error(error?.data?.message || "Unable to save tool");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{mode === "edit" ? "Edit tool" : "Add new tool"}</h3>
          <p className="mt-1 text-sm text-slate-300">
            {mode === "edit"
              ? "Update text fields or replace the image. Old Cloudinary image will only be deleted if a new image is uploaded."
              : "Upload an image, assign category, and publish to the directory."}
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : (
            submitLabel || (mode === "edit" ? "Update Tool" : "Save Tool")
          )}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tool name" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" required />
        <select name="category" value={form.category} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" required>
          <option value="">Select category</option>
          {categoryNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select name="pricing" value={form.pricing} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none">
          {["Free", "Free Trial", "Paid"].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} placeholder="https://example.com" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" required />
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="ai, automation, creator" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2" />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description" rows="3" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2" required />
        <textarea name="longDescription" value={form.longDescription} onChange={handleChange} placeholder="Detailed description" rows="4" className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2" />
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
          <span>{mode === "edit" ? "Replace image" : "Upload image"}</span>
          <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="text-xs text-slate-400" />
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
          <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="h-4 w-4" />
          Mark as featured
        </label>
      </div>
      {mode === "edit" && initialData?.image?.url ? (
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 p-2">
            <img src={initialData.image.url} alt={initialData.name} className="h-full w-full object-contain" />
          </div>
          <p className="text-sm text-slate-300">Current image will stay as-is unless you upload a replacement.</p>
        </div>
      ) : null}
    </form>
  );
};

export default ToolForm;
