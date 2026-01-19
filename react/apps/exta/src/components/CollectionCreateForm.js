import { useEffect } from '@wordpress/element';
import { useForm } from 'react-hook-form';

const CollectionCreateForm = ({ onSubmit: onSubmitProp, isSubmitting }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      key: '',
    }
  });

  const titleValue = watch('title');

  // Auto-generate key from title
  useEffect(() => {
    if (titleValue) {
      const generatedKey = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setValue('key', generatedKey);
    }
  }, [titleValue, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmitProp)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter collection title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
          Key
        </label>
        <input
          id="key"
          type="text"
          {...register('key', { required: 'Key is required' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          placeholder="Auto-generated from title"
          readOnly
        />
        {errors.key && (
          <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating...' : 'Create Collection'}
      </button>
    </form>
  );
};

export default CollectionCreateForm;
