import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  selectedDistrict: null,
  colorMode: 'price',
  propertyTypeFilter: 'all',
  yearRange: [2015, 2025],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_DISTRICT':
      return { ...state, selectedDistrict: action.code };
    case 'SET_COLOR_MODE':
      return { ...state, colorMode: action.mode };
    case 'SET_PROPERTY_FILTER':
      return { ...state, propertyTypeFilter: action.filter };
    case 'SET_YEAR_RANGE':
      return { ...state, yearRange: action.range };
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
