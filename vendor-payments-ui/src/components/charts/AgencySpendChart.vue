<template>
  <v-card elevation="2" class="chart-card" rounded="lg">
    <v-card-title class="d-flex align-center">
      <v-icon start color="primary">mdi-chart-bar</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text class="position-relative" style="min-height: 350px;">
      <apexchart
        v-if="store.agencyChartData.length > 0"
        type="bar"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>
      
      <!-- Empty State -->
      <div v-else class="fill-height d-flex flex-column align-center justify-center text-center pa-10 py-16">
        <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-chart-bar-off</v-icon>
        <div class="text-body-1 text-medium-emphasis">No data to display</div>
        <div class="text-caption text-disabled">Adjust filters to see agency totals</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';

const store = useDashboardStore();

const series = computed(() => [{
  name: 'Spend',
  data: store.agencyChartData.map(d => d.total)
}]);

const title = ref("Top 10 Agencies by Spend")

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      horizontal: true,
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: store.agencyChartData.map(d => d.name),
    labels: {
      formatter: (val: number) => `$${(val / 1e6)}M`,
      style: {
        colors: 'white'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: 'white'
      }
    }
  },
  tooltip: {
    y: {
      formatter: (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(val),
      
    },
    theme: 'dark',
  },
  colors: ['#1867C0']
}));

watch(() => store.agencyChartData, () => {
  if (store.agencyChartData.length === 0) {
    title.value = 'Top 10 Agencies by Spend';
  } else if (store.agencyChartData.length === 1) {
    title.value = `Viewing ${store.agencyChartData.length} Agency`;
  } else {
    title.value = `Viewing ${store.agencyChartData.length} Agencies`;
  }
});
  
</script>

<style scoped>
</style>