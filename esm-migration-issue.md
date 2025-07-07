# Migrate power-doctest to ES Modules (ESM)

## Background

The power-doctest project is currently using CommonJS modules. To modernize the codebase and improve compatibility with modern JavaScript ecosystem, we should migrate to ES Modules (ESM).

## Current State Analysis

### Project Structure
- **Monorepo**: Lerna-based monorepo with multiple packages
- **Language**: TypeScript with CommonJS output
- **Build Target**: ES5 with CommonJS modules
- **Test Framework**: Mocha with ts-node

### Package Structure
The project contains the following packages:
- `packages/comment-to-assert/` - Core comment-to-assert functionality
- `packages/power-doctest/` - Main CLI package
- `packages/@power-doctest/core/` - Core library
- `packages/@power-doctest/types/` - Type definitions
- `packages/@power-doctest/asciidoctor/` - AsciiDoctor parser
- `packages/@power-doctest/markdown/` - Markdown parser  
- `packages/@power-doctest/tester/` - Test runner
- `packages/@power-doctest/javascript/` - JavaScript parser

### Current Module System Issues
1. **Mixed Import/Require Usage**: 
   - Most source files use ES6 imports
   - Some packages still use `require()` for dynamic imports
   - TypeScript compiles to CommonJS (`"module": "commonjs"`)

2. **Package.json Configuration**:
   - No `"type": "module"` field in any package.json
   - All packages use `"main"` field pointing to compiled `.js` files
   - Missing `"exports"` field for modern module resolution

3. **TypeScript Configuration**:
   - `"module": "commonjs"` in all tsconfig.json files
   - `"target": "es5"` (outdated)
   - `"moduleResolution": "node"` (should be "bundler" for ESM)

4. **Testing Setup**:
   - Uses `ts-node-test-register` for running TypeScript tests
   - Mocha configuration needs ESM support

## Migration Plan

### Phase 1: Preparation
- [ ] Update all TypeScript configurations to use ES2022+ target
- [ ] Audit all dependencies for ESM compatibility
- [ ] Create compatibility layer for mixed CJS/ESM during transition
- [ ] Set up automated testing for both CJS and ESM builds

### Phase 2: TypeScript Configuration Updates
- [ ] Update `tsconfig.json` files:
  - Change `"module"` from `"commonjs"` to `"esnext"`
  - Update `"target"` from `"es5"` to `"es2022"`
  - Add `"moduleResolution": "bundler"`
  - Enable `"allowSyntheticDefaultImports": true`
- [ ] Update test configurations to use ESM loader

### Phase 3: Package.json Updates
- [ ] Add `"type": "module"` to all package.json files
- [ ] Add `"exports"` field with proper ESM/CJS compatibility:
  ```json
  "exports": {
    ".": {
      "import": "./lib/index.js",
      "require": "./lib/index.cjs"
    }
  }
  ```
- [ ] Update `"engines"` field to require Node.js 16.17.0+ (current minimum supports ESM)

### Phase 4: Source Code Migration
- [ ] Convert remaining `require()` calls to dynamic `import()`
- [ ] Update file extensions where necessary (`.mjs` for pure ESM)
- [ ] Fix any module resolution issues
- [ ] Use tools like `eslint-cjs-to-esm` for automated conversion

### Phase 5: Build System Updates
- [ ] Configure TypeScript to output both ESM and CJS formats
- [ ] Update Lerna configuration for ESM support
- [ ] Modify build scripts to handle dual module formats
- [ ] Update test scripts to work with ESM

### Phase 6: Testing and Validation
- [ ] Run comprehensive tests on all packages
- [ ] Test CLI functionality with ESM
- [ ] Validate package imports in both CJS and ESM environments
- [ ] Test with different Node.js versions (16+)

### Phase 7: Documentation Updates
- [ ] Update README files with ESM usage examples
- [ ] Update API documentation
- [ ] Add migration guide for users
- [ ] Update examples and demos

## Tools and Dependencies

### ESM Migration Tools
- [`eslint-cjs-to-esm`](https://github.com/azu/eslint-cjs-to-esm) - Automated CJS to ESM conversion
- `@types/node` - Latest types with ESM support
- `tsx` - Modern TypeScript runner (alternative to ts-node)

### Dependencies to Audit
Need to verify ESM compatibility for:
- `@babel/core` and related Babel packages
- `mocha` (needs ESM loader configuration)
- `power-assert` ecosystem
- `concat-stream`
- `structured-source`
- `meow` (CLI framework)

## Breaking Changes

This migration will introduce breaking changes:
1. **Node.js Version**: Minimum Node.js 16.17.0 (already required)
2. **Import Syntax**: Users consuming the library will need to use ESM imports
3. **File Extensions**: Some internal file references may need `.js` extensions
4. **Dynamic Imports**: `require()` calls will become async `import()`

## Backward Compatibility

To maintain backward compatibility:
- Provide dual package exports (ESM + CJS)
- Keep current API surface unchanged
- Provide migration guide for existing users
- Consider deprecation timeline for CJS-only builds

## Success Criteria

- [ ] All packages successfully build as ESM
- [ ] All tests pass with ESM configuration
- [ ] CLI tools work correctly with ESM
- [ ] Backward compatibility maintained through dual exports
- [ ] Documentation updated with ESM examples
- [ ] CI/CD pipeline validates ESM builds

## Estimated Timeline

- **Phase 1-2**: 1-2 weeks (preparation and config updates)
- **Phase 3-4**: 2-3 weeks (package.json and source migration)
- **Phase 5-6**: 1-2 weeks (build system and testing)
- **Phase 7**: 1 week (documentation)

**Total Estimated Time**: 5-8 weeks

## Risks and Mitigation

### Risks
1. **Dependency Incompatibility**: Some dependencies may not support ESM
2. **Testing Framework Issues**: Mocha ESM support may have edge cases
3. **Dynamic Require Usage**: Complex require() patterns may be hard to migrate
4. **User Breaking Changes**: Existing users may face migration challenges

### Mitigation
1. **Dependency Audit**: Complete dependency analysis before starting
2. **Gradual Migration**: Phase-by-phase approach with validation at each step
3. **Dual Publishing**: Maintain CJS builds during transition period
4. **Comprehensive Testing**: Extensive testing in both module systems
5. **User Communication**: Clear migration guide and deprecation timeline

## Related Issues

- Consider creating separate issues for each phase
- Track dependency compatibility in separate issue
- Monitor ESM ecosystem developments

---

**Labels**: `enhancement`, `esm`, `modernization`, `breaking-change`
**Assignee**: TBD
**Milestone**: Next Major Version