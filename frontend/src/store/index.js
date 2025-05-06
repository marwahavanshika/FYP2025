import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import complaintsReducer from './complaintsSlice';
import assetsReducer from './assetsSlice';
import communityReducer from './communitySlice';
import roomsReducer from './roomsSlice';
import messReducer from './messSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintsReducer,
    assets: assetsReducer,
    community: communityReducer,
    rooms: roomsReducer,
    mess: messReducer,
  },
});

export default store;
