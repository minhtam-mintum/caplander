import type { RenderOptions } from '@testing-library/react';
import type { RootState } from 'app/store';

export type DeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends Array<infer Item>
    ? DeepPartial<Item>[]
    : T[Key] extends object
      ? DeepPartial<T[Key]>
      : T[Key];
};

export interface IRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: DeepPartial<RootState>;
  initialRoute?: string;
}
