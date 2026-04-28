import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen xl:flex xl:h-screen xl:overflow-hidden">
      <Sidebar />
      <div className="flex-1 xl:h-screen xl:overflow-y-auto">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
