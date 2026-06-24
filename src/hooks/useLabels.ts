import { useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from 'app/store';
import { fetchLabelsThunk, addLabelThunk, type ILabel } from 'app/store/slices/labelSlice';

export type { ILabel, ILabelInput } from 'app/store/slices/labelSlice';

export function useLabels() {
  const dispatch = useAppDispatch();
  const labels = useAppSelector((s) => s.labels.items);
  const isLoading = useAppSelector((s) => s.labels.loading);

  useEffect(() => {
    dispatch(fetchLabelsThunk());
  }, [dispatch]);

  const addLabel = useCallback(
    async (label: Parameters<typeof addLabelThunk>[0]): Promise<ILabel> => {
      const result = await dispatch(addLabelThunk(label));
      if (addLabelThunk.fulfilled.match(result)) return result.payload;
      throw result.error;
    },
    [dispatch],
  );

  return { labels, addLabel, isLoading };
}
