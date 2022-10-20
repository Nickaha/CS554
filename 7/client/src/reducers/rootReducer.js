import { combineReducers } from 'redux';
import selectedReducer from './selectedReducer';
import trainerReducer from './trainerReducer';
const rootReducer = combineReducers({
  selected: selectedReducer,
  trainers: trainerReducer
});

export default rootReducer;