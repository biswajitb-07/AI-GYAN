import CategoryForm from "./CategoryForm";
import Dialog from "../shared/Dialog";

const EditCategoryDialog = ({ open, category, onClose, onUpdated }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit category"
      description="Update category naming, description, icon, or color classes through a focused dialog."
    >
      <CategoryForm
        mode="edit"
        initialData={category}
        onCompleted={() => {
          onUpdated();
          onClose();
        }}
        submitLabel="Save Changes"
      />
    </Dialog>
  );
};

export default EditCategoryDialog;
