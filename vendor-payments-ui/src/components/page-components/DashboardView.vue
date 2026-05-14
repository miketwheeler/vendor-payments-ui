<template>
  <v-container fluid class="px-0 pb-6 pt-0 dashboard-container">
    <v-row class="mb-4 px-6 py-3 align-center elevation-8" style="position: sticky; top: 0px; z-index: 1000; background-color: rgba(var(--v-theme-background));">
      <v-col>
        <div class="text-h4 font-weight-bold d-flex align-center">
          <v-icon size="40" color="primary" class="mr-3">mdi-view-dashboard-outline</v-icon>
          WA State Vendor Payments Dashboard
        </div>
        <div class="text-subtitle-1 text-medium-emphasis ml-13">
          Financial years 2021-2023 Analysis
        </div>
      </v-col>
      <v-col cols="auto" class="d-flex ga-3">
        <v-btn
              label="Profile"
              icon="mdi-account"
              href="https://miketwheeler.github.io"
              target="_blank"
              color="text"
              variant="text"
              size="large"
              density="compact"
              v-tooltip="'View my profile'"
            />
        <v-btn
              label="GitHub"
              icon="mdi-github"
              href="https://github.com/mikeytwheeler/provn-vendor-payments-ui"
              target="_blank"
              color="text"
              variant="text"
              size="large"
              density="compact"
              v-tooltip="'View GitHub repo'"
            />
        <v-divider vertical thickness="2" color="white"></v-divider>
        <v-btn
          variant="text"
          prepend-icon="mdi-refresh"
          :loading="store.loading"
          rounded="xl"
          v-tooltip="'Reset all filters and reload data'"
          @click="store.resetAllAndParse()"
        >
          Reset All
        </v-btn>
      </v-col>
    </v-row>
    <v-container class="w-100 px-6" max-width="none">

      <v-row>
        <!-- Sidebar Filters -->
        <v-col cols="12" lg="3" style="position: sticky; top: 120px; height: 100%;">
          <v-card elevation="2" rounded="lg" variant="text" border>
            <DashboardFilters />
          </v-card>
        </v-col>

        <!-- Main Content -->
        <v-col cols="12" lg="9">
          <!-- KPI Row -->
          <StatsCards class="mb-6" />

          <!-- Charts Row -->
          <v-row>
            <v-col cols="12" md="7">
              <AgencySpendChart />
            </v-col>
            <v-col cols="12" md="5">
              <CategoryBreakdownChart />
            </v-col>
          </v-row>

          <!-- Table Row -->
          <v-row>
            <v-col cols="12">
              <PaymentsTable />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Loading Overlay -->
      <v-overlay
        :model-value="store.loading && store.totalRecords === 0"
        class="align-center justify-center"
        persistent
      >
        <v-card class="pa-6 text-center" width="300">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <div class="text-h6">Loading...</div>
          <div class="text-caption">Processing fiscal records</div>
        </v-card>
      </v-overlay>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';
import { parseCSV } from '@/services/csvService';
import DashboardFilters from '@/components/filters/DashboardFilters.vue';
import StatsCards from '@/components/stats/StatsCards.vue';
import AgencySpendChart from '@/components/charts/AgencySpendChart.vue';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart.vue';
import PaymentsTable from '@/components/tables/PaymentsTable.vue';

const store = useDashboardStore();

const loadData = async () => {
    if (store.loading || store.initialized) return;
    store.resetData(false);
    await parseCSV();
    store.initialized = true;
};

onMounted(() => {
    if (store.totalRecords === 0) {
        loadData();
    }
});
</script>

<style scoped>
.dashboard-container {
  /* background-color: #f5f7fa; */
  min-height: 100vh;
}
</style>