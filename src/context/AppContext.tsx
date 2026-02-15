import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  selectedDistrict: null,
  propertyTypeFilter: 'all',
  yearRange: [2015, 2025],
  flyTo: null,
  compare: [null, null],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_DISTRICT':
      return { ...state, selectedDistrict: action.code, flyTo: null };
    case 'FLY_TO':
      return { ...state, selectedDistrict: action.district, flyTo: { lat: action.lat, lng: action.lng, zoom: action.zoom } };
    case 'SET_PROPERTY_FILTER':
      return { ...state, propertyTypeFilter: action.filter };
    case 'SET_YEAR_RANGE':
      return { ...state, yearRange: action.range };
    case 'ADD_TO_COMPARE': {
      const [a, b] = state.compare;
      if (!a) return { ...state, compare: [action.sale, null] };
      if (!b) return { ...state, compare: [a, action.sale] };
      // Both full — replace slot 1, shift old slot 2 out
      return { ...state, compare: [a, action.sale] };
    }
    case 'CLEAR_COMPARE':
      return { ...state, compare: [null, null] };
    default:
      return state;
  }
}

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
