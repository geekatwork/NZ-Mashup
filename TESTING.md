# Testing Strategy Documentation

This document outlines the comprehensive testing strategy implemented for the NZ-Mashup application.

## Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
                    ┌─────────────────────────────┐
                    │     E2E & Visual Tests      │ ← Fewer, Slower, Expensive
                    │   (Critical User Journeys)  │
                    └─────────────────────────────┘
                  ┌───────────────────────────────────┐
                  │        Integration Tests          │ ← Medium Coverage
                  │    (API, Component Integration)   │
                  └───────────────────────────────────┘
              ┌─────────────────────────────────────────────┐
              │              Unit Tests                     │ ← Many, Fast, Cheap
              │   (Components, Hooks, Utilities, Services)  │
              └─────────────────────────────────────────────┘
```

## 1. Unit Testing (Jest + React Testing Library)

### Configuration
- **Framework**: Jest with React Testing Library
- **Configuration**: `jest.config.js`
- **Setup**: `src/setupTests.js`
- **Coverage Target**: 50%+ (building toward 80%)

### What We Test
- **Components**: React components with proper mocking of dependencies
- **Hooks**: Custom hooks with comprehensive scenarios
- **Utilities**: Pure functions and helper methods
- **Services**: API clients and data processing

### Example Test Structure
```javascript
// src/components/__tests__/ComponentName.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Current Coverage
- **ErrorBoundary**: 100% coverage
- **GravelRoadsControl**: Partial coverage (focuses on React integration)
- **useGeoJsonData**: 100% coverage (all scenarios including error handling)
- **useMapFilteredZones**: 95.55% coverage (comprehensive feature filtering tests)

## 2. End-to-End Testing (Playwright)

### Configuration
- **Framework**: Playwright Test
- **Configuration**: `playwright.config.js`
- **Test Directory**: `tests/e2e/`

### Browser Support
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

### Test Scenarios
- Map loading and interaction
- Layer toggling functionality
- Responsive design validation
- Performance benchmarks

## 3. Cross-Browser Testing (WebDriverIO)

### Configuration
- **Framework**: WebDriverIO with Mocha
- **Configuration**: `wdio.conf.js`
- **Test Directory**: `tests/wdio/`

### Features
- Cross-browser compatibility validation
- Viewport size testing
- JavaScript execution validation
- Basic functionality verification

## 4. Testing Infrastructure

### Mocking Strategy
- **Leaflet**: Comprehensive mocks for map interactions
- **React-Leaflet**: Mocked hooks and components
- **API Calls**: Fetch mocking with configurable responses
- **Environment Variables**: Test-specific environment setup

### Continuous Integration
- **GitHub Actions**: Automated test execution
- **Coverage Reporting**: Integrated with Codecov
- **Parallel Execution**: Tests run in parallel for efficiency
- **Artifact Collection**: Test reports and screenshots

## 5. Test Commands

```bash
# Unit Tests
npm run test              # Run all Jest tests
npm run test:unit         # Run unit tests only
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report

# E2E Tests
npm run test:e2e          # Run Playwright tests
npm run test:e2e:headed   # Run Playwright tests with browser UI

# Cross-Browser Tests
npm run test:wdio         # Run WebDriverIO tests

# All Tests
npm run test:all          # Run all test suites
```

## 6. Current Test Coverage

As of the latest implementation:

```
-----------------------------------|---------|----------|---------|---------|
File                               | % Stmts | % Branch | % Funcs | % Lines |
-----------------------------------|---------|----------|---------|---------|
All files                          |   12.62 |     6.41 |    14.4 |   12.16 |
 src/components                    |    4.62 |      1.8 |    6.66 |    4.89 |
  ErrorBoundary.jsx                |     100 |      100 |     100 |     100 |
  GravelRoadsControl.jsx           |   27.27 |        0 |   42.85 |   27.27 |
 src/hooks                         |   95.55 |       95 |     100 |   97.36 |
  useGeoJsonData.js                |     100 |      100 |     100 |     100 |
  useMapFilteredZones.js           |   93.54 |    93.75 |     100 |   96.15 |
```

## 7. Future Enhancements

### Planned Additions
- [ ] Visual regression testing with Percy/Chromatic
- [ ] Accessibility testing with axe-core
- [ ] Performance testing benchmarks
- [ ] API integration tests
- [ ] Component interaction tests
- [ ] Mobile-specific test scenarios

### Coverage Goals
- [ ] Increase overall coverage to 80%
- [ ] Add tests for all major components
- [ ] Implement service layer testing
- [ ] Add integration test scenarios

## 8. Best Practices

### Writing Tests
1. **Descriptive Names**: Test names should clearly describe what is being tested
2. **Arrange-Act-Assert**: Follow the AAA pattern for test structure
3. **Mock Dependencies**: Mock external dependencies to isolate units
4. **Test Edge Cases**: Include error scenarios and boundary conditions
5. **Keep Tests Fast**: Unit tests should run quickly

### Maintenance
1. **Update Tests with Features**: New features should include corresponding tests
2. **Refactor Tests**: Keep tests maintainable and reduce duplication
3. **Monitor Coverage**: Regularly review coverage reports
4. **Fix Failing Tests**: Address test failures promptly

## 9. Troubleshooting

### Common Issues
- **Import.meta errors**: Use proper mocking in setupTests.js
- **Leaflet DOM issues**: Ensure proper mocking of Leaflet components
- **Async operations**: Use proper async/await patterns in tests
- **Environment variables**: Verify test environment configuration

### Debug Commands
```bash
# Run specific test file
npm test -- path/to/test.js

# Run tests with verbose output
npm test -- --verbose

# Debug failing tests
npm test -- --detectOpenHandles
```