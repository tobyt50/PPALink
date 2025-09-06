import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../config/axios';

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

const useFetch = <T>(url: string | null) => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!url) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState((prevState) => ({ ...prevState, isLoading: true, error: null }));
    try {
      const response = await apiClient.get(url);
      setState({ data: response.data.data, isLoading: false, error: null });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch data.';
      toast.error(errorMessage);
      setState({ data: null, isLoading: false, error: errorMessage });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Expose the state AND the refetch function
  return { ...state, refetch: fetchData };
};

export default useFetch;