<script setup lang="ts">
import BaseButton from '@/components/BaseButton/BaseButton.vue'
import BaseTimer from '@/components/BaseTimer/BaseTimer.vue'
import CopyButton from '@/components/CopyButton/CopyButton.vue'
import { Events } from '@/enums/events.enum'
import type { InviteGeneratorProperties } from '@/interfaces/invite-generator-properties.interface'
import type { InviteGeneratorEmits } from '@/interfaces/invite-generator-emits.interface'
import './InviteGenerator.css'

const properties = defineProps<InviteGeneratorProperties>()
const emit = defineEmits<InviteGeneratorEmits>()
</script>

<template>
  <div class="invite-generator-card" :class="{ 'is-loading': properties.initialLoading }">
    <template v-if="!properties.initialLoading">
      <div class="invite-left-side">
        <div class="invite-status-icon" :class="{ 'is-active': properties.inviteLink !== '' }">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                v-if="properties.inviteLink === ''"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
            <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div class="invite-header-text">
          <h3>
            {{ properties.inviteLink !== '' ? properties.translations.activeTitle : properties.translations.title }}
          </h3>
          <p class="invite-description">
            {{ properties.inviteLink !== '' ? properties.translations.activeDescription : properties.translations.description }}
          </p>
        </div>
      </div>

      <div class="invite-right-side">
        <BaseButton
            v-if="properties.inviteLink === ''"
            type="button"
            :disabled="properties.loading"
            :loading="properties.loading"
            variant="primary"
            class="main-generate-btn"
            @click="emit(Events.GENERATE)"
        >
          {{ properties.translations.generateBtn }}
        </BaseButton>

        <div v-else class="invite-active-layout">
          <div class="link-capsule">
            <span class="link-url">{{ properties.inviteLink }}</span>
            <CopyButton @click="emit(Events.COPY)" />
          </div>

          <BaseTimer
              v-if="properties.expiresAt !== ''"
              :label="properties.translations.expiresIn"
              :value="properties.expiresAt"
              @finish="emit(Events.CLEAR)"
          />
        </div>
      </div>
    </template>

    <div v-else class="invite-skeleton">
      <div class="skeleton-icon"></div>
      <div class="skeleton-text">
        <div class="skeleton-title"></div>
        <div class="skeleton-desc"></div>
      </div>
    </div>
  </div>
</template>