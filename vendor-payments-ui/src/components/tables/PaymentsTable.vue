<template>
  <v-card elevation="2" class="table-card mt-4" rounded="lg">
    <v-card-title class="d-flex align-center py-4">
      <v-icon start color="info">mdi-table</v-icon>
      Spending Summarized by Agency & Category
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search groups"
        single-line
        hide-details
        density="compact"
        class="search-field"
      ></v-text-field>
    </v-card-title>
    
    <v-data-table
      :headers="headers"
      :items="store.groupedRows"
      :search="search"
      :loading="store.loading"
      hover
      class="elevation-0"
      @click:row="onRowClick"
      v-tooltip="'Select row to view vendors'"
    >
      <template #[`item.vendorCount`]="{ item }">
        <v-chip size="small" variant="tonal">
          {{ item.vendorCount }} Vendor{{ item.vendorCount > 1 ? 's' : ''}}
        </v-chip>
      </template>
      <template #[`item.amount`]="{ item }">
        <span class="font-weight-medium text-primary">
          {{ formatCurrency(item.amount) }}
        </span>
      </template>

      <!-- Empty State -->
      <template #no-data>
        <div class="pa-10 text-center">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-filter-off-outline</v-icon>
          <div class="text-h6 text-medium-emphasis">No matching records found</div>
          <div class="text-body-2 text-disabled mb-4">Try adjusting your filters or search terms</div>
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-refresh"
            rounded="xl"
            @click="store.resetAllAndParse()"
          >
            Reset All Filters
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Drill-down Dialog -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card rounded="xl" v-if="selectedGroup">
        <v-card-title class="pa-6 bg-grey-darken-4 d-flex align-center">
          <div>
            <div class="text-h5 font-weight-bold">{{ selectedGroup.agency }}</div>
            <div class="text-subtitle-1 text-primary">{{ selectedGroup.category }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialog = false"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-data-table
            :headers="detailHeaders"
            :items="selectedGroup.vendors"
            density="compact"
            class="elevation-0"
            :items-per-page="10"
          >
            <template #[`item.amount`]="{ item }">
              <span class="font-weight-bold">{{ formatCurrency(item.amount) }}</span>
            </template>
          </v-data-table>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <div class="text-h6">
            Total Group Spend: <span class="text-primary font-weight-bold">{{ formatCurrency(selectedGroup.amount) }}</span>
          </div>
          <v-spacer></v-spacer>
          <v-btn variant="tonal" rounded="xl" @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';

const store = useDashboardStore();
const search = ref('');
const dialog = ref(false);

interface GroupedRow {
    agency: string;
    category: string;
    vendorCount: number;
    amount: number;
    vendors: Array<{ name: string, amount: number }>;
}

const selectedGroup = ref<GroupedRow | null>(null);

const headers = [
  { title: 'Agency', key: 'agency', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Vendors', key: 'vendorCount', width: '150px', align: 'center' as const },
  { title: 'Total Amount', key: 'amount', align: 'end' as const, sortable: true },
];

const detailHeaders = [
  { title: 'Vendor Name', key: 'name', sortable: true },
  { title: 'Spend Amount', key: 'amount', align: 'end' as const, sortable: true },
];

const openDetails = (item: GroupedRow) => {
    selectedGroup.value = item;
    dialog.value = true;
};

const onRowClick = (_: any, { item }: { item: GroupedRow }) => {
    openDetails(item);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
</script>

<style scoped>
.search-field {
  max-width: 300px;
}
</style>