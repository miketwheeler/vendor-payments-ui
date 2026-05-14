<template>
  <v-card elevation="2" rounded="lg" class="h-100">
    <v-card-title class="d-flex align-center">
      <v-icon start color="primary">mdi-chart-donut</v-icon>
      Spend by Category
    </v-card-title>
    <v-card-text class="position-relative" style="min-height: 350px;">
      <apexchart
        v-if="store.categoryChartData.length > 0"
        type="donut"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>

      <!-- Empty State -->
      <div v-else class="fill-height d-flex flex-column align-center justify-center text-center pa-10 py-16">
        <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-chart-pie-off</v-icon>
        <div class="text-body-1 text-medium-emphasis">No breakdown available</div>
        <div class="text-caption text-disabled">No categories match current filters</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';

const store = useDashboardStore();

const series = computed(() => store.categoryChartData.map(d => d.total));

const chartOptions = computed(() => ({
  chart: {
    type: 'donut',
  },
  labels: store.categoryChartData.map(d => d.name),
  legend: {
    position: 'bottom',
    labels: {
      colors: 'white'
      
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val.toFixed(1) + "%"
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(val)
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200,
      },
      legend: {
        position: 'bottom',
      }
    }
  }]
}));
</script>

<style scoped>
</style>