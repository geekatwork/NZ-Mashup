import { render } from '@testing-library/react';
import { jest } from '@jest/globals';
import GravelRoadsControl from '../GravelRoadsControl';

// Mock react-leaflet useMap hook
const mockMap = {
  addControl: jest.fn(),
  removeControl: jest.fn(),
};

jest.mock('react-leaflet', () => ({
  useMap: jest.fn(() => mockMap),
}));

describe('GravelRoadsControl', () => {
  const mockSetShowGravelRoads = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <GravelRoadsControl 
        showGravelRoads={false} 
        setShowGravelRoads={mockSetShowGravelRoads} 
      />
    );
    
    // Component returns null, so container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('adds control to map on mount', () => {
    render(
      <GravelRoadsControl 
        showGravelRoads={false} 
        setShowGravelRoads={mockSetShowGravelRoads} 
      />
    );
    
    // Verify that addControl was called on the map
    expect(mockMap.addControl).toHaveBeenCalledTimes(1);
    expect(mockMap.addControl).toHaveBeenCalledWith(expect.any(Object));
  });

  it('removes control from map on unmount', () => {
    const { unmount } = render(
      <GravelRoadsControl 
        showGravelRoads={false} 
        setShowGravelRoads={mockSetShowGravelRoads} 
      />
    );
    
    // Clear the mock to verify unmount behavior
    jest.clearAllMocks();
    
    // Unmount the component
    unmount();
    
    // Verify that removeControl was called
    expect(mockMap.removeControl).toHaveBeenCalledTimes(1);
  });

  it('updates control when showGravelRoads prop changes', () => {
    const { rerender } = render(
      <GravelRoadsControl 
        showGravelRoads={false} 
        setShowGravelRoads={mockSetShowGravelRoads} 
      />
    );
    
    // Clear initial mount calls
    jest.clearAllMocks();
    
    // Re-render with different prop
    rerender(
      <GravelRoadsControl 
        showGravelRoads={true} 
        setShowGravelRoads={mockSetShowGravelRoads} 
      />
    );
    
    // Should remove old control and add new one
    expect(mockMap.removeControl).toHaveBeenCalledTimes(1);
    expect(mockMap.addControl).toHaveBeenCalledTimes(1);
  });

  it('has correct prop types validation', () => {
    expect(GravelRoadsControl.propTypes).toBeDefined();
    expect(GravelRoadsControl.propTypes.showGravelRoads).toBeDefined();
    expect(GravelRoadsControl.propTypes.setShowGravelRoads).toBeDefined();
  });
});