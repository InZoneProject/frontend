<script setup lang="ts" generic="T">
import BaseInput from '@/components/BaseInput/BaseInput.vue'
import { Events } from '@/enums/events.enum'
import { LENGTH } from '@/constants/length.constants'
import { useDataTable } from '@/composables/useDataTable'
import type { DataTableProperties } from '@/interfaces/data-table-properties.interface'
import type { DataTableEmits } from '@/interfaces/data-table-emits.interface'
import './DataTable.css'

const props = defineProps<DataTableProperties<T>>()
const emit = defineEmits<DataTableEmits>()

const { tableWrapperRef, tableWrapperStyle, onScroll } = useDataTable(props, emit)
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
              :min-value="null"
              :max-value="null"
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

    <div class="table-shell" :class="{ 'is-drag-over': props.isDragOver }" :style="tableWrapperStyle">
      <div class="table-header-wrapper">
        <table class="main-table table-header-table">
          <thead>
          <slot name="header"></slot>
          </thead>
        </table>
      </div>

      <div
          ref="tableWrapperRef"
          class="table-wrapper"
          :class="{ 'data-table-interactive-rows': props.interactiveRows }"
          @scroll.passive="onScroll"
      >
        <table class="main-table">
          <thead class="table-measure-header" aria-hidden="true">
          <slot name="header"></slot>
          </thead>
          <tbody>
          <tr v-if="props.loading && props.items.length === 0">
            <td colspan="100" class="td-status">
              <div class="status-content">
                <div class="loader"></div>
                <span class="status-text">
                    {{ props.loadingText }}
                  </span>
              </div>
            </td>
          </tr>
          <template v-if="props.items.length > 0">
            <slot v-for="(item, index) in props.items" :key="index" :item="item"></slot>
          </template>
          <tr v-if="!props.loading && props.items.length === 0">
            <td colspan="100" class="td-status">
              <div class="status-content">
                <span class="status-text">
                  {{ props.emptyText }}
                </span>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
