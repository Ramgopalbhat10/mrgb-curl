# Zod Validation Schemas

## Overview
All data validation in the application uses Zod schemas for type safety and runtime validation. This ensures data integrity across the application layers.

## Core Schemas

### HTTP Method Schema
```typescript
import { z } from 'zod';

export const HttpMethodSchema = z.enum([
  'GET',
  'POST', 
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
  'OPTIONS'
]);

export type HttpMethod = z.infer<typeof HttpMethodSchema>;
```

### URL Validation Schema
```typescript
export const UrlSchema = z.string().url().min(1, 'URL is required').max(2048);

// Enhanced URL validation with protocol restrictions
export const SecureUrlSchema = z.string()
  .min(1, 'URL is required')
  .max(2048, 'URL too long')
  .regex(/^https?:\/\//, 'URL must start with http:// or https://')
  .refine(
    (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid URL format' }
  );
```

### Headers Schema
```typescript
export const HeaderKeySchema = z.string()
  .min(1, 'Header name is required')
  .max(100, 'Header name too long')
  .regex(/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/, 'Invalid header name format');

export const HeaderValueSchema = z.string()
  .max(8192, 'Header value too long');

export const HeadersSchema = z.record(HeaderKeySchema, HeaderValueSchema);

// Common headers validation
export const ContentTypeSchema = z.enum([
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'text/html',
  'application/xml',
  'text/xml'
]);

export const AcceptSchema = z.string().optional();
```

### Request Body Schema
```typescript
export const BodyTypeSchema = z.enum(['json', 'text', 'form-data', 'raw']);

export const JsonBodySchema = z.string()
  .refine(
    (json) => {
      try {
        JSON.parse(json);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid JSON format' }
  );

export const TextBodySchema = z.string().max(1048576, 'Body too large (1MB limit)');

export const FormDataBodySchema = z.record(z.string(), z.string());

export const RawBodySchema = z.string().max(1048576, 'Body too large (1MB limit)');

export const BodySchema = z.object({
  type: BodyTypeSchema,
  content: z.string().optional(),
  formData: FormDataBodySchema.optional(),
}).refine(
  (body) => {
    switch (body.type) {
      case 'json':
        return body.content && JsonBodySchema.safeParse(body.content).success;
      case 'text':
      case 'raw':
        return body.content !== undefined;
      case 'form-data':
        return body.formData !== undefined;
      default:
        return false;
    }
  },
  { message: 'Invalid body content for selected type' }
);
```

### Query Parameters Schema
```typescript
export const QueryParamKeySchema = z.string()
  .min(1, 'Parameter name is required')
  .max(100, 'Parameter name too long');

export const QueryParamValueSchema = z.string().max(1000, 'Parameter value too long');

export const QueryParamsSchema = z.record(QueryParamKeySchema, QueryParamValueSchema);
```

### Complete Request Schema
```typescript
export const RequestSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Request name is required').max(100),
  method: HttpMethodSchema,
  url: SecureUrlSchema,
  headers: HeadersSchema,
  body: BodySchema.optional(),
  queryParams: QueryParamsSchema,
  collectionId: z.string().uuid().optional(),
  isDraft: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSentAt: z.date().optional(),
});

export type Request = z.infer<typeof RequestSchema>;
```

## Response Schemas

### HTTP Response Schema
```typescript
export const ResponseStatusSchema = z.number().int().min(100).max(599);

export const ResponseStatusTextSchema = z.string().max(100);

export const ResponseHeadersSchema = z.record(z.string(), z.string());

export const ResponseBodySchema = z.string().max(10485760, 'Response too large (10MB limit)');

export const CookieSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
  domain: z.string().optional(),
  path: z.string().optional(),
  expires: z.date().optional(),
  httpOnly: z.boolean().optional(),
  secure: z.boolean().optional(),
  sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
});

export const ResponseSchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
  status: ResponseStatusSchema,
  statusText: ResponseStatusTextSchema,
  headers: ResponseHeadersSchema,
  body: ResponseBodySchema,
  contentType: z.string(),
  size: z.number().int().nonnegative(),
  time: z.number().int().nonnegative(), // milliseconds
  cookies: z.array(CookieSchema),
  timestamp: z.date(),
});

export type Response = z.infer<typeof ResponseSchema>;
```

## Collection Schemas

### Collection Schema
```typescript
export const CollectionNameSchema = z.string()
  .min(1, 'Collection name is required')
  .max(50, 'Collection name too long');

export const CollectionDescriptionSchema = z.string()
  .max(200, 'Description too long')
  .optional();

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  name: CollectionNameSchema,
  description: CollectionDescriptionSchema,
  requests: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Collection = z.infer<typeof CollectionSchema>;
```

## Validation Utilities

### Request Validation
```typescript
import { RequestSchema, HttpMethodSchema, BodyTypeSchema } from './schemas';

export const validateRequest = (data: unknown) => {
  return RequestSchema.safeParse(data);
};

export const validateMethod = (method: unknown) => {
  return HttpMethodSchema.safeParse(method);
};

export const validateBodyType = (bodyType: unknown) => {
  return BodyTypeSchema.safeParse(bodyType);
};

// Method-body compatibility validation
export const validateMethodBodyCompatibility = (
  method: HttpMethod,
  bodyType: string
) => {
  const methodsWithoutBody = ['GET', 'HEAD', 'OPTIONS'];
  const bodyTypesRequiringContent = ['json', 'text', 'form-data', 'raw'];
  
  if (methodsWithoutBody.includes(method) && bodyTypesRequiringContent.includes(bodyType)) {
    return {
      valid: false,
      error: `${method} requests cannot have body content`
    };
  }
  
  return { valid: true };
};
```

### URL Validation
```typescript
export const validateUrl = (url: unknown) => {
  return SecureUrlSchema.safeParse(url);
};

export const validateAndFormatUrl = (url: string, method: HttpMethod) => {
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  const result = SecureUrlSchema.safeParse(url);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || 'Invalid URL'
    };
  }
  
  return { valid: true, url: result.data };
};
```

### Headers Validation
```typescript
export const validateHeaders = (headers: unknown) => {
  return HeadersSchema.safeParse(headers);
};

export const validateHeaderValue = (key: string, value: unknown) => {
  const keyResult = HeaderKeySchema.safeParse(key);
  if (!keyResult.success) {
    return { valid: false, error: 'Invalid header name' };
  }
  
  const valueResult = HeaderValueSchema.safeParse(value);
  if (!valueResult.success) {
    return { valid: false, error: 'Invalid header value' };
  }
  
  return { valid: true };
};
```

## Error Handling

### Validation Error Types
```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timeout after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}
```

### Error Formatting
```typescript
export const formatZodError = (error: z.ZodError) => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
};

export const createValidationError = (field: string, message: string) => {
  return new ValidationError(message, field);
};
```

## React Hook Integration

### useValidation Hook
```typescript
import { useState, useCallback } from 'react';
import { z } from 'zod';

export const useValidation = <T extends z.ZodSchema>(
  schema: T,
  initialValues: z.infer<T>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: z.infer<T>) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      const errorMap = formattedErrors.reduce((acc, error) => {
        if (error.field) {
          acc[error.field] = error.message;
        }
        return acc;
      }, {} as Record<string, string>);
      setErrors(errorMap);
      return false;
    }
    setErrors({});
    return true;
  }, [schema]);

  const setValue = useCallback((field: string, value: any) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    
    // Validate field on change
    const fieldSchema = schema.shape[field as keyof typeof schema.shape];
    if (fieldSchema) {
      const fieldResult = fieldSchema.safeParse(value);
      if (!fieldResult.success) {
        setErrors(prev => ({
          ...prev,
          [field]: fieldResult.error.issues[0]?.message
        }));
      } else {
        setErrors(prev => {
          const { [field]: removed, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [values, schema]);

  return {
    values,
    errors,
    setValue,
    validate,
    setValues,
    hasErrors: Object.keys(errors).length > 0,
  };
};
```

## TanStack Query Integration

### Query Validation
```typescript
export const useValidatedMutation = <TData, TVariables>(
  schema: z.ZodSchema,
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // Validate input
      const result = schema.safeParse(variables);
      if (!result.success) {
        throw new ValidationError('Invalid input', undefined, 'VALIDATION_ERROR');
      }
      
      return mutationFn(result.data);
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        // Handle validation errors
        console.error('Validation error:', error.message);
      }
    },
  });
};
```

## Performance Considerations

### Schema Compilation
```typescript
// Pre-compile frequently used schemas for better performance
export const CompiledRequestSchema = RequestSchema;
export const CompiledHeadersSchema = HeadersSchema;
export const CompiledUrlSchema = SecureUrlSchema;

// Use superstruct for complex nested validation if needed
// import { object, string, assert } from 'superstruct';
```

### Debounced Validation
```typescript
import { debounce } from 'lodash-es';

export const useDebouncedValidation = <T extends z.ZodSchema>(
  schema: T,
  delay: number = 300
) => {
  const [validationResult, setValidationResult] = useState<z.SafeParseSuccess<T> | null>(null);
  
  const debouncedValidate = useCallback(
    debounce((data: unknown) => {
      const result = schema.safeParse(data);
      if (result.success) {
        setValidationResult(result);
      }
    }, delay),
    [schema, delay]
  );
  
  return { validationResult, debouncedValidate };
};
```

## Testing Utilities

### Mock Data Generation
```typescript
import { faker } from '@faker-js/faker';

export const generateMockRequest = (): Request => {
  return {
    id: faker.datatype.uuid(),
    name: faker.lorem.words(3),
    method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
    url: faker.internet.url(),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: {
      type: 'json',
      content: JSON.stringify({ message: faker.lorem.sentence() }),
    },
    queryParams: {
      'limit': '10',
      'offset': '0',
    },
    isDraft: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
};

export const generateMockResponse = (requestId: string): Response => {
  return {
    id: faker.datatype.uuid(),
    requestId,
    status: faker.helpers.arrayElement([200, 201, 400, 404, 500]),
    statusText: faker.helpers.arrayElement(['OK', 'Created', 'Bad Request', 'Not Found', 'Internal Server Error']),
    headers: {
      'Content-Type': 'application/json',
      'Server': 'nginx/1.18.0',
    },
    body: JSON.stringify({ data: faker.lorem.paragraph() }),
    contentType: 'application/json',
    size: faker.datatype.number({ min: 100, max: 10000 }),
    time: faker.datatype.number({ min: 50, max: 500 }),
    cookies: [],
    timestamp: faker.date.recent(),
  };
};
```

## Best Practices

1. **Always validate external data** - Never trust API responses or user input
2. **Use specific error messages** - Help users understand what went wrong
3. **Validate early** - Validate at the input level, not just before sending
4. **Handle edge cases** - Empty strings, null values, malformed data
5. **Performance matters** - Pre-compile schemas, debounce validation
6. **Type safety** - Use inferred types throughout the application
7. **Test validation** - Unit test all validation logic with edge cases
