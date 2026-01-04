'use client';

/**
 * FormRenderer - Auto-generate forms from FormModel
 */

import { useState, FormEvent } from 'react';
import { FormField } from '@/lib/contracts';

interface FormRendererProps {
  fields: FormField[];
  onSubmit: (values: Record<string, unknown>) => void;
  isSubmitting?: boolean;
}

export default function FormRenderer({ fields, onSubmit, isSubmitting = false }: FormRendererProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      }
    });
    return initial;
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const handleChange = (name: string, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  if (fields.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No parameters required for this endpoint
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.kind === 'string' && (
            <input
              type="text"
              id={field.name}
              name={field.name}
              required={field.required}
              value={(values[field.name] as string) || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              minLength={field.minLength}
              maxLength={field.maxLength}
              pattern={field.pattern}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {field.kind === 'number' && (
            <input
              type="number"
              id={field.name}
              name={field.name}
              required={field.required}
              value={(values[field.name] as number) || ''}
              onChange={(e) => handleChange(field.name, parseFloat(e.target.value))}
              min={field.minimum}
              max={field.maximum}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          {field.kind === 'boolean' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={field.name}
                name={field.name}
                checked={(values[field.name] as boolean) || false}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {field.label}
              </span>
            </div>
          )}

          {field.kind === 'enum' && field.options && (
            <select
              id={field.name}
              name={field.name}
              required={field.required}
              value={(values[field.name] as string) || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {field.kind === 'json' && (
            <textarea
              id={field.name}
              name={field.name}
              required={field.required}
              value={(values[field.name] as string) || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={8}
              placeholder='{"key": "value"}'
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Running...' : 'Run'}
      </button>
    </form>
  );
}
