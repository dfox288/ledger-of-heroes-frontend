<template>
  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <h1 class="text-4xl font-bold mb-8">Color Configuration Test</h1>

    <div class="space-y-8">
      <!-- Buttons with color="primary" should be AMBER -->
      <div>
        <h2 class="text-2xl font-semibold mb-4">Primary Color (Should be Amber)</h2>
        <div class="flex gap-4">
          <UButton color="primary">Primary Button</UButton>
          <UButton color="primary" variant="outline">Primary Outline</UButton>
          <UButton color="primary" variant="ghost">Primary Ghost</UButton>
        </div>
        <div class="mt-4 flex gap-2">
          <UBadge color="primary">Primary Badge</UBadge>
          <UBadge color="primary" variant="subtle">Primary Subtle</UBadge>
        </div>
      </div>

      <!-- Success should be GREEN (default) -->
      <div>
        <h2 class="text-2xl font-semibold mb-4">Success Color (Should be Green)</h2>
        <div class="flex gap-4">
          <UButton color="success">Success Button</UButton>
          <UBadge color="success">Success Badge</UBadge>
        </div>
      </div>

      <!-- Neutral should be STONE GRAY -->
      <div>
        <h2 class="text-2xl font-semibold mb-4">Neutral Color (Should be Stone Gray)</h2>
        <div class="flex gap-4">
          <UButton color="neutral">Neutral Button</UButton>
          <UBadge color="neutral">Neutral Badge</UBadge>
        </div>
        <p class="mt-4 text-neutral-600 dark:text-neutral-400">
          This text should be stone gray (warmer than slate)
        </p>
      </div>
    </div>
  </div>
</template>
