<template>
  <v-row>
    <v-col cols="12" sm="6" md="3">
      <v-card class="stats-card" elevation="2" rounded="xl" variant="text" border>
        <v-card-text>
          <div class="text-overline mb-1">Total Spend</div>
          <div class="text-h4 font-weight-bold primary--text">
            {{ formatCurrency(store.totalSpend) }}
          </div>
          <v-icon class="card-icon" size="48" color="primary">mdi-cash-multiple</v-icon>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card class="stats-card" elevation="2" rounded="xl" variant="text" border>
        <v-card-text>
          <div class="text-overline mb-1">Total Records</div>
          <div class="text-h4 font-weight-bold secondary--text">
            {{ formatNumber(store.totalRecords) }}
          </div>
          <v-icon class="card-icon" size="48" color="secondary">mdi-file-document-outline</v-icon>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card class="stats-card" elevation="2" rounded="xl" variant="text" border>
        <v-card-text>
          <div class="text-overline mb-1">Total Agencies</div>
          <div class="text-h4 font-weight-bold accent--text">
            {{ store.agencies.size }}
          </div>
          <v-icon class="card-icon" size="48" color="accent">mdi-office-building</v-icon>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card class="stats-card" elevation="2" rounded="xl" variant="text" border>
        <v-card-text>
          <div class="text-overline mb-1">Total Vendors</div>
          <div class="text-h4 font-weight-bold info--text">
            {{ store.vendors.size }}
          </div>
          <v-icon class="card-icon" size="48" color="info">mdi-account-group</v-icon>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useDashboardStore } from '@/stores/dashboardStore';

const store = useDashboardStore();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value);
};
</script>

<style scoped>
.stats-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-4px);
}

.card-icon {
  position: absolute;
  right: -8px;
  bottom: -8px;
  opacity: 0.1;
  transform: rotate(-15deg);
}
</style>