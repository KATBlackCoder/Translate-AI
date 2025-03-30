   // src/composables/useAIProvider.ts
   import { storeToRefs } from 'pinia'
   import { useAIStore } from '@/stores/ai'

   export function useAIProvider() {
     const store = useAIStore()
     
     // Use storeToRefs to maintain reactivity
     const { 
       isReady, 
       isInitializing, 
       error, 
       config,
       currentProvider,
       providerMetadata
     } = storeToRefs(store)
     
     return {
       // State
       isReady,
       isInitializing,
       error,
       currentConfig: config,
       provider: currentProvider,
       metadata: providerMetadata,
       
       // Methods
       initialize: store.initializeProvider,
       reset: store.resetProvider,
       validateConfig: store.validateProviderConfig,
       getHealth: store.getProviderHealth
     }
   }