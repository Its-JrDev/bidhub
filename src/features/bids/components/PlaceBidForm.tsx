'use client';


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { placeBidSchema, type PlaceBidFormValues } from './place-bid.schema';

// UI Kit components (../../../shared/components/ui)
// import { Button } from '../../../shared/components/ui/button';
// import { Input } from '../../../shared/components/ui/input';
// import { Label } from '../../../shared/components/ui/label';

export interface PlaceBidFormProps {
  defaultValues?: Partial<PlaceBidFormValues>;
  onSubmit?: (data: PlaceBidFormValues) => void | Promise<void>;
}

export function PlaceBidForm({ defaultValues, onSubmit }: PlaceBidFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlaceBidFormValues>({
    resolver: zodResolver(placeBidSchema),
    defaultValues: {
      title: '',
      description: '',
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (data: PlaceBidFormValues) => {
    if (onSubmit) {
      await onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="place-bid-title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Title
        </label>
        <input
          id="place-bid-title"
          type="text"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm font-medium text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="place-bid-description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Description
        </label>
        <textarea
          id="place-bid-description"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm font-medium text-destructive">{errors.description.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
