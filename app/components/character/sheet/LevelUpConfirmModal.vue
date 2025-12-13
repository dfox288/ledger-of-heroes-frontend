<!-- app/components/character/sheet/LevelUpConfirmModal.vue -->
<script setup lang="ts">
/**
 * Level Up Confirmation Modal
 *
 * Asks for confirmation before navigating to the level up wizard.
 * Prevents accidental level ups.
 */

const props = defineProps<{
  characterPublicId: string
  currentLevel: number
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
}>()

const router = useRouter()

/**
 * Handle confirmation - navigate to level up page
 */
function handleConfirm() {
  open.value = false
  router.push(`/characters/${props.characterPublicId}/level-up`)
  emit('confirm')
}

/**
 * Handle cancel - just close the modal
 */
function handleCancel() {
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-arrow-trending-up"
              class="w-5 h-5 text-primary-500"
            />
            <span class="font-semibold">Level Up Character?</span>
          </div>
        </template>

        <p class="text-gray-600 dark:text-gray-400">
          Your character is currently <strong>level {{ currentLevel }}</strong>.
          Leveling up will advance them to <strong>level {{ currentLevel + 1 }}</strong>.
        </p>

        <p class="mt-3 text-sm text-gray-500 dark:text-gray-500">
          This will start the level up wizard where you can choose new features, spells, and ability score improvements.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="handleCancel"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              icon="i-heroicons-arrow-trending-up"
              @click="handleConfirm"
            >
              Level Up
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
