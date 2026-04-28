import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import Loader from "../shared/Loader";
import { useGetAdminSessionQuery } from "../../store/adminApi";
import { clearAuth, selectAdmin, selectAuthToken, setAdminSession } from "../../store/authSlice";
import { useAppSelector } from "../../store/hooks";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const admin = useAppSelector(selectAdmin);
  const token = useAppSelector(selectAuthToken);
  const {
    data: session,
    isLoading,
    isFetching,
    isError,
  } = useGetAdminSessionQuery(undefined, { skip: !token });

  useEffect(() => {
    if (session) {
      dispatch(setAdminSession(session));
    }
  }, [dispatch, session]);

  useEffect(() => {
    if (token && isError) {
      dispatch(clearAuth());
    }
  }, [dispatch, isError, token]);

  if (token && !admin && (isLoading || isFetching)) {
    return <Loader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
