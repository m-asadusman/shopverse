import { createSlice } from '@reduxjs/toolkit';
import { products } from '../../data/products';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: products,
    filteredItems: products,
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'default',
    loading: false,
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
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

function applyFilters(state) {
  let result = [...state.items];
  if (state.selectedCategory !== 'All') {
    result = result.filter(p => p.category === state.selectedCategory);
  }
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (state.sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (state.sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (state.sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
  return result;
}

export const { setCategory, setSearch, setSortBy, setLoading } = productsSlice.actions;
export default productsSlice.reducer;
