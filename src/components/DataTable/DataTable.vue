<script setup lang="ts" generic="T">
import { computed } from 'vue'
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import { Events } from '@/enums/events.enum'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import type { DataTableProperties } from '@/interfaces/data-table-properties.interface'
import type { DataTableEmits } from '@/interfaces/data-table-emits.interface'
import './DataTable.css'
import {LENGTH} from "@/constants/length.constants";

const props = defineProps<DataTableProperties<T>>()
defineEmits<DataTableEmits>()

const { translations } = useLanguageSwitcher()

const tableWrapperStyle = computed(() => ({
  '--table-max-height': props.maxHeight
}))
</script>

<template>
  <div class="data-table-container">
    <div class="table-controls">
      <BaseInput
          :model-value="props.searchQuery"
          @update:model-value="$emit(Events.UPDATE_SEARCH_QUERY, $event)"
          label=""
          type="text"
          :placeholder="props.placeholder"
          :max-length="LENGTH.MAX_SEARCH_LENGTH"
          :is-expandable="false"
          :disabled="false"
          class="table-search"
      >
        <template #prefix>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </template>
      </BaseInput>
    </div>

    <div
        class="table-wrapper"
        :class="{ 'data-table-interactive-rows': props.interactiveRows }"
        :style="tableWrapperStyle"
    >
      <table class="main-table">
        <thead>
        <slot name="header"></slot>
        </thead>
        <tbody>
        <tr v-if="props.loading || props.items.length === 0">
          <td colspan="100" class="td-status">
            <div class="status-content">
              <div v-if="props.loading" class="loader"></div>
              <span class="status-text">
                  {{ props.loading ? translations.globalAdmin.table.loading : translations.globalAdmin.table.empty }}
                </span>
            </div>
          </td>
        </tr>
        <template v-else>
          <slot v-for="(item, index) in props.items" :key="index" :item="item"></slot>
        </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
