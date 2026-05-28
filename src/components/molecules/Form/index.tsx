import { forwardRef, type ForwardedRef, type ReactNode, useImperativeHandle } from 'react';
import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type Mode,
  type Resolver,
  type SubmitHandler,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { AnyObject, ObjectSchema } from 'yup';

export interface IFormHandle<T extends FieldValues = FieldValues> extends UseFormReturn<
  T,
  any,
  T
> {}

interface IFormProps<T extends FieldValues> {
  schema: ObjectSchema<AnyObject>;
  defaultValues?: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  id?: string;
  mode?: Mode;
  className?: string;
  children: ReactNode;
}

function FormInner<T extends FieldValues>(
  { schema, defaultValues, onSubmit, id, mode = 'all', className, children }: IFormProps<T>,
  ref: ForwardedRef<IFormHandle<T>>,
) {
  const methods = useForm<T>({
    resolver: yupResolver(schema) as unknown as Resolver<T>,
    defaultValues,
    mode,
  });
  useImperativeHandle(ref, () => ({ ...methods }), [methods]);
  return (
    <FormProvider {...methods}>
      <form id={id} className={className} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
}

export const Form = forwardRef(FormInner) as <T extends FieldValues>(
  props: IFormProps<T> & { ref?: React.Ref<IFormHandle<T>> },
) => React.ReactElement | null;
