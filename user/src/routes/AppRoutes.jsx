import { Route, Routes } from "react-router-dom";
import AboutPage from "../pages/AboutPage";
import CategoryDetailPage from "../pages/CategoryDetailPage";
import CompareToolsPage from "../pages/CompareToolsPage";
import ContactPage from "../pages/ContactPage";
import HomePage from "../pages/HomePage";
import PricingPage from "../pages/PricingPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import SearchResultsPage from "../pages/SearchResultsPage";
import TermsPage from "../pages/TermsPage";
import ToolDetailPage from "../pages/ToolDetailPage";
import ToolsPage from "../pages/ToolsPage";

const AppRoutes = ({ stats }) => {
  return (
    <Routes>
      <Route path="/" element={<HomePage stats={stats} />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/categories/:slug" element={<CategoryDetailPage />} />
      <Route path="/compare" element={<CompareToolsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/tools/:slug" element={<ToolDetailPage />} />
      <Route path="/pricing" element={<PricingPage />} />
    </Routes>
  );
};

export default AppRoutes;
