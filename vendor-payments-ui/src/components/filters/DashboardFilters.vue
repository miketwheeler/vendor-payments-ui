<template>
  <v-list class="pa-4 bg-transparent">
    <div class="text-h6 mb-4">Filters</div>
    
    <v-autocomplete
      v-model="store.filters.agency"
      :items="store.agencyOptions"
      label="Agencies"
      multiple
      chips
      closable-chips
      clearable
      density="comfortable"
      class="mb-2"
      id="agency-selection"
    ></v-autocomplete>

    <v-autocomplete
      v-model="store.filters.category"
      :items="store.categoryOptions"
      label="Categories"
      multiple
      chips
      closable-chips
      clearable
      density="comfortable"
      class="mb-2"
      id="category-selection"
    ></v-autocomplete>

    <v-autocomplete
      v-model="store.filters.vendor"
      :items="store.vendorOptions"
      label="Vendors"
      multiple
      chips
      closable-chips
      clearable
      density="comfortable"
      class="mb-2"
      id="vendor-selection"
    ></v-autocomplete>

    <v-divider class="my-4"></v-divider>

    <v-btn
      block
      color="primary"
      variant="elevated"
      prepend-icon="mdi-filter-check"
      :loading="store.loading"
      rounded="xl"
      @click="applyFilters"
      v-tooltip="'Apply active filters to the dashboard'"
    >
      Apply Filters
    </v-btn>

    <v-btn
      block
      variant="text"
      class="mt-3"
      prepend-icon="mdi-refresh"
      @click="store.resetAllAndParse()"
      rounded="xl"
      v-tooltip="'Reset all filters and reload data'"
    >
      Reset All
    </v-btn>
  </v-list>
</template>

<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboardStore';
import { parseCSV } from '@/services/csvService';
import { nextTick } from 'vue';

const store = useDashboardStore();

const applyFilters = async () => {
    if (store.loading) return;
    const filters = { ...store.filters };
    
    // Show loading state first
    store.resetData(true);
    store.setLoading(true);
    
    // Yield to browser to show overlay
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    await parseCSV(filters);
};
</script>

<style scoped>
</style>