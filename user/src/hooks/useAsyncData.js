import { useCallback, useEffect, useState } from "react";

export const useAsyncData = (asyncFn, dependencies = []) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: "",
  });

  const run = useCallback(async () => {
    try {
      setState((current) => ({ ...current, loading: true, error: "" }));
      const data = await asyncFn();
      setState({ data, loading: false, error: "" });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.message || error.message || "Request failed",
      });
    }
  }, dependencies);

  useEffect(() => {
    run();
  }, [run]);

  return {
    ...state,
    refetch: run,
  };
};
