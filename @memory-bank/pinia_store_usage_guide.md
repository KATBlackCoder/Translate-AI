## Quick Generic Example

Here's a very basic, self-contained example of a Setup Store and its usage:

```
const count = ref(0);

// Getter (Computed Property)
const doubleCount = computed(() => count.value * 2);

// Action
function increment() {
  count.value++;
}

// Optional: $reset method for Setup Stores
function $reset() {
  count.value = 0;
  // Reset other refs if any
}

return {
  count,
  doubleCount,
  increment,
  $reset, // Expose the reset method
};
```

By following these guidelines, we ensure that all Pinia stores are implemented consistently, making the codebase easier to understand, maintain, and scale.

## Resetting State in Setup Stores

While Option Stores have a built-in `$reset()` method, for Setup Stores, you need to create your own if desired. This typically involves defining a function within the store's setup scope that manually resets all relevant `ref` or `reactive` state properties to their initial values. This function should then be returned along with other state and actions.

Example (as shown in `stores/project.ts`):
```typescript
// In stores/project.ts
// ... other state properties ...

function $reset() {
  selectedProjectFolderPath.value = null;
  projectDetectionResult.value = null;
  isLoadingProjectFolder.value = false;
  // ... reset other state properties ...
  batchTranslationError.value = null;
}

return {
  // ... other state and actions ...
  $reset,
};
```
This provides a convenient way to revert a store to its default state. 