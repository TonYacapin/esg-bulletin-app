# ESG Bulletin App - Architecture Guide

## Overview

This document outlines the clean architecture and best practices implemented in the ESG Bulletin Generator application.

## Project Structure

\`\`\`
├── app/
│   ├── api/                          # API routes (Next.js App Router)
│   │   ├── generate-bulletin-content/
│   │   ├── generate-article-summary/
│   │   └── generate-summary/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── bulletin-generator.tsx        # Main orchestrator component
│   ├── bulletin-form.tsx             # Form component
│   ├── bulletin-output.tsx           # Output component
│   ├── article-selector.tsx          # Article selection component
│   ├── error-boundary.tsx            # Error boundary
│   └── [other components]/
│
├── lib/
│   ├── types/
│   │   └── index.ts                  # Centralized type definitions
│   ├── services/
│   │   ├── content-generation.service.ts  # AI content generation
│   │   ├── news-api.service.ts            # Backend API communication
│   │   └── validation.service.ts          # Form validation
│   ├── utils/
│   │   ├── error-handler.ts          # Error handling utilities
│   │   ├── async-handler.ts          # Async operation utilities
│   │   └── [other utilities]/
│   ├── actions.ts                    # Server actions
│   └── utils.ts                      # General utilities
│
├── public/                           # Static assets
├── styles/                           # Additional styles
└── [config files]
\`\`\`

## Architecture Principles

### 1. Separation of Concerns

- **Components**: Handle UI rendering and user interactions only
- **Services**: Contain business logic, API communication, and data processing
- **Types**: Define data structures and interfaces
- **Utils**: Provide reusable helper functions

### 2. Type Safety

- Comprehensive TypeScript interfaces for all data structures
- Enums for fixed value sets (themes, content types, etc.)
- Strict type checking throughout the application
- No `any` types without explicit justification

### 3. Error Handling

- Centralized error handling in `error-handler.ts`
- Error boundary component for React errors
- Graceful fallbacks for API failures
- User-friendly error messages

### 4. Validation

- Centralized validation service with reusable functions
- Frontend validation before API calls
- Clear validation error messages
- Field-level error tracking

### 5. API Communication

- Service layer abstracts API details from components
- Consistent error handling across all API calls
- Environment variable management for credentials
- Request/response type safety

## Key Files and Their Responsibilities

### Type Definitions (`lib/types/index.ts`)

Defines all TypeScript interfaces and enums:
- `BulletinTheme`, `ContentType`, `JurisdictionEnum` - Enums for fixed values
- `Article`, `BulletinConfig`, `BulletinData` - Core data structures
- `FetchNewsParams`, `GenerateContentRequest` - API request types
- `ValidationError`, `BackendError` - Error types
- Component props interfaces

### Services

#### Content Generation Service (`lib/services/content-generation.service.ts`)

Handles AI-powered content generation:
- Prompt building for different content types
- Article truncation and formatting
- OpenAI API integration
- Fallback content generation
- Timeout management

#### News API Service (`lib/services/news-api.service.ts`)

Manages backend API communication:
- News fetching with filters
- Article detail retrieval
- Credential validation
- Error handling and logging

#### Validation Service (`lib/services/validation.service.ts`)

Provides form validation:
- Individual field validators
- Complete form validation
- Error message generation
- Reusable validation functions

### Components

#### BulletinGenerator (`components/bulletin-generator.tsx`)

Main orchestrator component:
- Manages multi-step workflow
- Coordinates between form, selector, and output
- Handles article fetching
- State management for the entire flow

#### BulletinForm (`components/bulletin-form.tsx`)

Form component with validation:
- User input collection
- Real-time validation
- Error display
- Advanced filter support

#### ErrorBoundary (`components/error-boundary.tsx`)

React error boundary:
- Catches component errors
- Displays error UI
- Provides recovery options

### Utilities

#### Error Handler (`lib/utils/error-handler.ts`)

Error management utilities:
- Error classification (recoverable, network, etc.)
- Error formatting for logging
- User-friendly error messages
- Retry logic with exponential backoff

#### Async Handler (`lib/utils/async-handler.ts`)

Safe async operation wrappers:
- Error handling wrapper
- Fallback value support
- Timeout management

## Data Flow

### Article Fetching Flow

\`\`\`
User Input (BulletinForm)
    ↓
Validation (validation.service.ts)
    ↓
Server Action (fetchNewsAction)
    ↓
News API Service (news-api.service.ts)
    ↓
Backend API
    ↓
Response → BulletinGenerator → ArticleSelector
\`\`\`

### Content Generation Flow

\`\`\`
User Request (BulletinOutput)
    ↓
API Route (/api/generate-bulletin-content)
    ↓
Content Generation Service (content-generation.service.ts)
    ↓
OpenAI API
    ↓
Response → Component Display
\`\`\`

## Best Practices Implemented

### TypeScript

- ✅ Strict mode enabled
- ✅ No implicit `any` types
- ✅ Comprehensive interface definitions
- ✅ Enum usage for fixed values
- ✅ Generic types for reusable functions

### React

- ✅ Functional components with hooks
- ✅ Server components where appropriate
- ✅ Client components only when needed
- ✅ Proper dependency arrays in useEffect
- ✅ Error boundaries for error handling

### Next.js

- ✅ App Router conventions
- ✅ Server actions for data fetching
- ✅ API routes for external integrations
- ✅ Environment variable management
- ✅ Proper error handling in routes

### Code Organization

- ✅ Single responsibility principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Clear naming conventions
- ✅ Comprehensive documentation
- ✅ Logical folder structure

### Error Handling

- ✅ Try-catch blocks in async operations
- ✅ Error boundary for React errors
- ✅ Graceful fallbacks
- ✅ User-friendly error messages
- ✅ Error logging for debugging

### Validation

- ✅ Frontend validation before submission
- ✅ Backend validation in API routes
- ✅ Clear error messages
- ✅ Field-level error tracking
- ✅ Reusable validation functions

## Adding New Features

### Adding a New Content Type

1. Add enum value to `ContentGenerationType` in `lib/types/index.ts`
2. Add prompt builder case in `content-generation.service.ts`
3. Add token limit and temperature in service constants
4. Add fallback content in `generateFallbackContent`
5. Update API route if needed

### Adding a New Validation Rule

1. Create validator function in `validation.service.ts`
2. Add to `validateBulletinForm` if form-level
3. Use in component with `getFieldError`
4. Add error message to validation function

### Adding a New Service

1. Create file in `lib/services/`
2. Define types in `lib/types/index.ts`
3. Implement service functions with error handling
4. Export from service file
5. Use in components or server actions

## Testing Considerations

- Services are easily testable due to separation of concerns
- Mock API responses in tests
- Test validation functions independently
- Test error handling paths
- Test component integration with services

## Performance Optimization

- Lazy load components where appropriate
- Memoize expensive computations
- Use server components for data fetching
- Implement proper caching strategies
- Monitor API response times

## Security Considerations

- Environment variables for sensitive data
- Input validation on frontend and backend
- Error messages don't expose sensitive info
- CORS headers properly configured
- API authentication with tokens

## Maintenance Guidelines

- Keep types updated when data structures change
- Update validation when requirements change
- Add comments for complex logic
- Keep services focused and single-purpose
- Regular code reviews for consistency
