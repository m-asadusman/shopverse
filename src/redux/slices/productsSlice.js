import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProducts as fetchFromFirestore } from '../../firebase/firestore';
import { products as mockProducts } from '../../data/products';

// Async thunk — tries Firestore first, falls back to mock data
export const loadProducts = createAsyncThunk('products/load', async () => {
  try {
    const items = await fetchFromFirestore();
    if (items.length > 0) return items;
    return mockProducts;
  } catch {
    return mockProducts; 
  }
});

function applyFilters(state) {
  let result = [...state.items];
  if (state.selectedCategory !== 'All') {
    result = result.filter(p => p.category === state.selectedCategory);
  }
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }
  if (state.sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (state.sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (state.sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
  return result;
}

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    filteredItems: [],
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'default',
    loading: false,
    error: null,
  },
  reducers: {
    setCategory(state, action) {
      state.selectedCategory = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setSearch(state, action) {
      state.searchQuery = action.payload;
      state.filteredItems = applyFilters(state);
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
      state.filteredItems = applyFilters(state);
    },

    setItems(state, action) {
      state.items = action.payload;
      state.filteredItems = applyFilters(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.filteredItems = applyFilters(state);
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setCategory, setSearch, setSortBy, setItems } = productsSlice.actions;
export default productsSlice.reducer;
