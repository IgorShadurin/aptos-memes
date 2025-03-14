# Development Guidelines for Meme News Factor

This document outlines the development rules and standards for the Meme News Factor project.

## Code Style and Standards

1. **Mobile Compatibility**

   - All UI features must be responsive and display correctly on mobile devices
   - Use responsive utility classes (e.g., `md:`, `lg:`) to adjust layouts for different screen sizes
   - Test on multiple screen sizes during development

2. **TypeScript Conventions**

   - Use the name `error` for error variables in catch blocks:
     ```typescript
     try {
       // Some code
     } catch (error) {
       console.error(error);
     }
     ```
   - Use `Number()` conversion instead of `parseInt()` when needed:

     ```typescript
     // Good
     const value = Number(someString);

     // Avoid
     const value = parseInt(someString, 10);
     ```

3. **Documentation**

   - Create JSDoc documentation for every function:
     ```typescript
     /**
      * Description of what the function does
      * @param param1 - Description of param1
      * @returns Description of return value
      */
     function myFunction(param1) {
       // ...
     }
     ```

4. **Code Quality**
   - Run linting before committing code: `npm run lint`
   - Follow the formatting rules set in the project configuration

## Project Structure

1. **Backend Code**

   - All backend code should be placed in the `/backend` directory
   - Database migrations should be created using `npm run migrate:make` not directly with npx knex

2. **Frontend Components**
   - UI components should be in `/src/components`
   - Page components should be in `/src/app`
   - Utility functions should be in `/src/lib`

## Meme Generator

1. **Templates**

   - Meme templates are stored in `/public/meme-templates`
   - Template metadata is defined in `/public/meme-templates/templates.json`
   - Each template must include: id, name, path, width, and height

2. **Features**
   - Template selection from available options
   - Text input for top and bottom of the meme
   - AI text generation functionality
   - Client-side image saving as JPG

## GitHub Workflow

1. **Issues**
   - Default repository for issues: `dappykit/web4-apps`
   - Do not include implementation details or time estimations in issues
   - Use appropriate labels for categorization

## Commands

- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test` (when available)
- Format check: `npm run format:check` (when available)

**Important Note:** Do not run `npm run dev` in production or CI/CD pipelines.
