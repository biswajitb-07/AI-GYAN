import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Loader from "../components/shared/Loader";

const AboutPage = lazy(() => import("../pages/AboutPage"));
const BlogPage = lazy(() => import("../pages/BlogPage"));
const CategoryDetailPage = lazy(() => import("../pages/CategoryDetailPage"));
const ContactPage = lazy(() => import("../pages/ContactPage"));
const HomePage = lazy(() => import("../pages/HomePage"));
const PricingPage = lazy(() => import("../pages/PricingPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicyPage"));
const SearchResultsPage = lazy(() => import("../pages/SearchResultsPage"));
const TermsPage = lazy(() => import("../pages/TermsPage"));
const ToolDetailPage = lazy(() => import("../pages/ToolDetailPage"));
const ToolsPage = lazy(() => import("../pages/ToolsPage"));

const AppRoutes = ({ stats }) => {
  return (
    <Suspense fallback={<Loader label="Loading page..." />}>
      <Routes>
        <Route path="/" element={<HomePage stats={stats} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/categories/:slug" element={<CategoryDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:slug" element={<ToolDetailPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
