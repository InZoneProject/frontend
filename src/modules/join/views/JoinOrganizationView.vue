<script setup lang="ts">
import { computed, type Ref } from 'vue'
import ControlPanel from '@/components/ControlPanel/ControlPanel.vue'
import { useLanguageSwitcher } from '@/composables/useLanguageSwitcher'
import JoinOrganizationForm from '@/modules/join/components/JoinOrganizationForm/JoinOrganizationForm.vue'
import type { JoinOrganizationTranslations } from '@/modules/join/interfaces/join-organization-translations.interface'
import './JoinOrganizationView.css'

const { translations } = useLanguageSwitcher()
const joinTranslations = computed(() => translations.value.joinOrganization) as Ref<JoinOrganizationTranslations>
</script>

<template>
  <main class="join-page">
    <ControlPanel :show-logout="false" :show-notifications="false" :show-profile="false" />

    <section class="join-card">
      <JoinOrganizationForm :translations="joinTranslations" />
    </section>
  </main>
</template>
