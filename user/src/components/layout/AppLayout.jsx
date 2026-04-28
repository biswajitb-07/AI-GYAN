import AiChatWidget from "../shared/AiChatWidget";
import Footer from "./Footer";
import Navbar from "./Navbar";

const AppLayout = ({ children, stats }) => {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer stats={stats} />
      <AiChatWidget />
    </div>
  );
};

export default AppLayout;
