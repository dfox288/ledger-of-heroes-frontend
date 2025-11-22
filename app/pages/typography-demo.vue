<script setup lang="ts">
useHead({
  title: 'Typography Demo - Crimson Pro',
  meta: [
    {
      name: 'description',
      content: 'Typography demonstration page showcasing Crimson Pro font family'
    }
  ]
})

const colorMode = useColorMode()

// Sample spell data for real-world demo
const sampleSpell = {
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.'
}
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-5xl" style="font-family: 'Crimson Pro', Georgia, 'Times New Roman', serif;">
    <!-- Header with Color Mode Toggle -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <UiBackLink to="/" label="Back to Home" />
      </div>
      <UButton
        :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
        color="neutral"
        variant="ghost"
        @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
      >
        {{ colorMode.value === 'dark' ? 'Light' : 'Dark' }} Mode
      </UButton>
    </div>

    <!-- Hero Section -->
    <div class="mb-16 text-center">
      <h1 class="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Typography Demo
      </h1>
      <h2 class="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
        Crimson Pro — Modern Classicism
      </h2>
      <p class="text-xl leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        A contemporary serif typeface designed for digital reading. Elegant without being decorative,
        sophisticated without fantasy overkill. Perfect for a D&D reference compendium.
      </p>
    </div>

    <!-- Headings Hierarchy -->
    <section class="mb-16">
      <h2 class="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
        Headings Hierarchy
      </h2>

      <div class="space-y-6">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">h1 - text-5xl font-bold</p>
          <h1 class="text-5xl font-bold text-gray-900 dark:text-gray-100">
            The Fellowship of the Ring
          </h1>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">h2 - text-4xl font-semibold</p>
          <h2 class="text-4xl font-semibold text-gray-900 dark:text-gray-100">
            Chapter One: A Long-Expected Party
          </h2>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">h3 - text-3xl font-semibold</p>
          <h3 class="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            The Shire in Spring
          </h3>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">h4 - text-2xl font-semibold</p>
          <h4 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Bag End at Evening
          </h4>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">h5 - text-xl font-semibold</p>
          <h5 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            A Visitor Arrives
          </h5>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">h6 - text-lg font-semibold</p>
          <h6 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            The Unexpected Journey Begins
          </h6>
        </div>
      </div>
    </section>

    <!-- Body Text Samples -->
    <section class="mb-16">
      <h2 class="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
        Body Text
      </h2>

      <div class="space-y-8">
        <!-- Regular Paragraph -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-3 font-mono">Regular paragraph - text-base leading-relaxed (1.7)</p>
          <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends
            of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to
            eat: it was a hobbit-hole, and that means comfort. It had a perfectly round door like a porthole,
            painted green, with a shiny yellow brass knob in the exact middle.
          </p>
        </div>

        <!-- Large Paragraph -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-3 font-mono">Large paragraph - text-lg leading-relaxed</p>
          <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            The Road goes ever on and on, down from the door where it began. Now far ahead the Road has gone,
            and I must follow, if I can, pursuing it with eager feet, until it joins some larger way
            where many paths and errands meet. And whither then? I cannot say.
          </p>
        </div>

        <!-- Small Text -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-3 font-mono">Small text - text-sm</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            This is smaller text, typically used for captions, metadata, or secondary information.
            Notice how Crimson Pro remains readable even at reduced sizes thanks to its high x-height.
          </p>
        </div>

        <!-- Text with Emphasis -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-3 font-mono">Text with emphasis</p>
          <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            Here is <strong class="font-bold">bold text</strong> for emphasis,
            and <em class="italic">italic text</em> for subtle distinction.
            You can also combine them: <strong class="font-bold italic">bold italic</strong>.
          </p>
        </div>

        <!-- Links -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-3 font-mono">Links</p>
          <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            This paragraph contains <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">a regular link</a> and
            <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline font-semibold">a semibold link</a> for comparison.
          </p>
        </div>

        <!-- Lists -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-3 font-mono">Bulleted list</p>
          <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Strength governs physical power and melee attacks</li>
            <li>Dexterity affects agility, armor class, and ranged attacks</li>
            <li>Constitution determines hit points and stamina</li>
            <li>Intelligence influences spellcasting for wizards</li>
          </ul>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-3 font-mono">Numbered list</p>
          <ol class="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Roll for initiative at the start of combat</li>
            <li>Take your turn: move and take an action</li>
            <li>Resolve attacks and saving throws</li>
            <li>End turn and begin next round</li>
          </ol>
        </div>
      </div>
    </section>

    <!-- UI Components -->
    <section class="mb-16">
      <h2 class="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
        UI Components
      </h2>

      <div class="space-y-8">
        <!-- Buttons -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-4 font-mono">Buttons</p>
          <div class="flex flex-wrap gap-3">
            <UButton color="primary">Primary Button</UButton>
            <UButton color="neutral">Neutral Button</UButton>
            <UButton color="success">Success Button</UButton>
            <UButton color="error">Error Button</UButton>
            <UButton variant="outline" color="primary">Outline Button</UButton>
            <UButton variant="ghost" color="neutral">Ghost Button</UButton>
          </div>
        </div>

        <!-- Badges -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-4 font-mono">Badges</p>
          <div class="flex flex-wrap gap-2">
            <UBadge color="primary" variant="solid">3rd Level</UBadge>
            <UBadge color="info" variant="solid">Evocation</UBadge>
            <UBadge color="success" variant="subtle">Common</UBadge>
            <UBadge color="warning" variant="subtle">Uncommon</UBadge>
            <UBadge color="error" variant="solid">Legendary</UBadge>
            <UBadge color="neutral" variant="outline">PHB</UBadge>
          </div>
        </div>

        <!-- Cards -->
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-4 font-mono">Card with text</p>
          <UCard class="max-w-2xl">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Wizard Class Features
            </h3>
            <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
              As a wizard, you gain the following class features. You have proficiency with daggers, darts,
              slings, quarterstaffs, and light crossbows. Your spellcasting ability is Intelligence.
            </p>
            <div class="flex gap-2">
              <UBadge color="error" variant="solid">d6 Hit Die</UBadge>
              <UBadge color="primary" variant="solid">Intelligence</UBadge>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- Real Content Example -->
    <section class="mb-16">
      <h2 class="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
        Real Content Example
      </h2>

      <div class="max-w-2xl">
        <UCard>
          <!-- Spell Header -->
          <div class="mb-4">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {{ sampleSpell.name }}
            </h3>
            <div class="flex gap-2">
              <UBadge color="primary" variant="solid">{{ sampleSpell.level }}rd Level</UBadge>
              <UBadge color="info" variant="solid">{{ sampleSpell.school }}</UBadge>
            </div>
          </div>

          <!-- Spell Stats -->
          <div class="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Casting Time</p>
              <p class="text-base text-gray-900 dark:text-gray-100">1 action</p>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Range</p>
              <p class="text-base text-gray-900 dark:text-gray-100">150 feet</p>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Duration</p>
              <p class="text-base text-gray-900 dark:text-gray-100">Instantaneous</p>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Description
            </h4>
            <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300">
              {{ sampleSpell.description }}
            </p>
          </div>

          <!-- Damage -->
          <div class="mb-4">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Damage
            </h4>
            <div class="flex gap-2">
              <UBadge color="error" variant="subtle">8d6 Fire</UBadge>
              <UBadge color="neutral" variant="outline">Dexterity Save</UBadge>
            </div>
          </div>

          <!-- Source -->
          <div class="pt-3 border-t border-gray-200 dark:border-gray-800">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Source: <span class="font-semibold">Player's Handbook</span> (PHB)
            </p>
          </div>
        </UCard>
      </div>
    </section>

    <!-- Font Weights Showcase -->
    <section class="mb-16">
      <h2 class="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-8 border-b border-gray-200 dark:border-gray-800 pb-3">
        Font Weights
      </h2>

      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">font-normal (400) - Body text</p>
          <p class="text-2xl font-normal text-gray-900 dark:text-gray-100">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">font-semibold (600) - Headings, UI</p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>

        <div>
          <p class="text-sm text-gray-500 dark:text-gray-500 mb-2 font-mono">font-bold (700) - Strong emphasis</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>
    </section>

    <!-- Performance Note -->
    <section class="mb-8">
      <UCard>
        <div class="flex items-start gap-4">
          <div class="text-3xl">⚡</div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Performance Optimized
            </h3>
            <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300">
              This font is loaded via <code class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">@nuxt/fonts</code> with automatic
              optimization: preloading, font-display swap, and subsetting. Variable font technology means
              all three weights (400, 600, 700) are delivered in a single optimized file.
            </p>
          </div>
        </div>
      </UCard>
    </section>

    <!-- Back to Top -->
    <div class="text-center pt-8">
      <UiBackLink to="/" label="Back to Home" />
    </div>
  </div>
</template>
