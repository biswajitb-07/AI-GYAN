import { useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import Spinner from "../components/shared/Spinner";
import { useLoginAdminMutation } from "../store/adminApi";
import { selectIsAuthenticated, setCredentials } from "../store/authSlice";
import { useAppSelector } from "../store/hooks";
import { useToast } from "../components/shared/ToastProvider";

const LoginPage = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [loginAdmin, { isLoading: submitting }] = useLoginAdminMutation();
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const session = await loginAdmin(form).unwrap();
      dispatch(
        setCredentials({
          token: session.token,
          admin: {
            email: session.email,
            role: session.role,
          },
        })
      );
      toast.success("Admin login successful");
    } catch (requestError) {
      const message = requestError?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Ai Gyan Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Login to control center</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">Use your admin credentials to manage tools, categories, and analytics.</p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Admin email"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Admin password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            required
          />
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Spinner size="sm" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
