import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';


const loadCartFromStorage = () => {
  try {
    const serialized = localStorage.getItem('shopverse_cart');
    if (!serialized) return undefined;
    return { cart: JSON.parse(serialized) };
  } catch {
    return undefined;
  }
};


const saveCartToStorage = (state) => {
  try {
    localStorage.setItem('shopverse_cart', JSON.stringify(state.cart));
  } catch {

  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
  },
  preloadedState: loadCartFromStorage(),
});


store.subscribe(() => {
  saveCartToStorage(store.getState());
});
