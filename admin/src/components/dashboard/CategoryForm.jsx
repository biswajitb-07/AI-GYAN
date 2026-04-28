import { useEffect, useState } from "react";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "../../store/adminApi";
import Spinner from "../shared/Spinner";
import { useToast } from "../shared/ToastProvider";

const emptyForm = {
  name: "",
  description: "",
  icon: "Sparkles",
  color: "from-sky-500 to-cyan-400",
};

const CategoryForm = ({ mode = "create", initialData = null, onCompleted, submitLabel }) => {
  const [form, setForm] = useState(emptyForm);
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const toast = useToast();
  const submitting = creating || updating;

  useEffect(() => {
    if (!initialData) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: initialData.name || "",
      description: initialData.description || "",
      icon: initialData.icon || "Sparkles",
      color: initialData.color || "from-sky-500 to-cyan-400",
    });
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (mode === "edit" && initialData?._id) {
        await updateCategory({ id: initialData._id, payload: form }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(form).unwrap();
        toast.success("Category created successfully");
      }

      setForm(emptyForm);
      onCompleted();
    } catch (error) {
      toast.error(error?.data?.message || "Unable to save category");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{mode === "edit" ? "Edit category" : "Add category"}</h3>
          <p className="mt-1 text-sm text-slate-300">Create or update category details used across the directory.</p>
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
            submitLabel || (mode === "edit" ? "Save Changes" : "Create Category")
          )}
        </button>
      </div>
      <div className="space-y-4">
        <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" required />
        <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Short category description" rows="4" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" required />
        <input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} placeholder="Lucide icon name" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
        <input value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} placeholder="Tailwind gradient classes" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none" />
      </div>
    </form>
  );
};

export default CategoryForm;
