import Dialog from "../shared/Dialog";
import Spinner from "../shared/Spinner";

const DeleteToolDialog = ({ open, tool, deleting, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Delete tool"
      description="Deleting this tool will remove it from MongoDB and delete its Cloudinary image as well."
    >
      <div className="space-y-6">
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
          <p className="text-lg font-semibold text-white">{tool?.name}</p>
          <p className="mt-2 text-sm text-slate-300">{tool?.category}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
          >
            {deleting ? (
              <>
                <Spinner size="sm" />
                Deleting...
              </>
            ) : (
              "Delete Tool"
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteToolDialog;
