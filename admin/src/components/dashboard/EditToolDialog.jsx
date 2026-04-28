import ToolForm from "./ToolForm";
import Dialog from "../shared/Dialog";

const EditToolDialog = ({ open, tool, categories, onClose, onUpdated }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit tool"
      description="Update text fields, pricing, category, or replace the image. Existing image stays if you only edit text."
    >
      <ToolForm
        mode="edit"
        categories={categories}
        initialData={tool}
        onCreated={() => {
          onUpdated();
          onClose();
        }}
        submitLabel="Save Changes"
      />
    </Dialog>
  );
};

export default EditToolDialog;
